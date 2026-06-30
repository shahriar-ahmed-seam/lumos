import { streamText } from "ai";
import { z } from "zod";
import {
  getModel,
  getModelForTask,
  getNextProvider,
  isRateLimitError,
  SYSTEM_PROMPT_GENERATE,
  SYSTEM_PROMPT_ITERATE,
  buildGenerationPrompt,
  buildIterationPrompt,
  type AIProvider,
} from "@/lib/ai";

// Runtime check to ensure the model package is compatible
type AnyLanguageModel = ReturnType<typeof getModel>;

// Request schema
const RequestSchema = z.object({
  prompt: z.string().min(1),
  currentCode: z.string().optional(),
  modelKey: z.string().optional(),
  provider: z.enum(["groq", "openai", "anthropic", "google", "local"]).optional(),
  isIteration: z.boolean().optional(),
  keys: z.record(z.string()).optional(),
  ollamaBaseURL: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, currentCode, modelKey, provider, isIteration, keys, ollamaBaseURL } =
      RequestSchema.parse(body);

    const overrides = {
      keys: keys as Partial<Record<AIProvider, string>> | undefined,
      ollamaBaseURL,
    };

    // Determine which model to use
    let model;
    let currentProvider: AIProvider = provider || "groq";

    if (modelKey) {
      // Use specific model if provided
      model = getModel(modelKey, overrides);
    } else if (isIteration && currentCode) {
      // Use smaller model for iterations (saves tokens)
      model = getModelForTask("iterate", currentProvider, overrides);
    } else {
      // Use larger model for initial generation
      model = getModelForTask("generate", currentProvider, overrides);
    }

    // Build the appropriate prompt
    const systemPrompt = isIteration ? SYSTEM_PROMPT_ITERATE : SYSTEM_PROMPT_GENERATE;
    const userPrompt = isIteration && currentCode
      ? buildIterationPrompt(currentCode, prompt)
      : buildGenerationPrompt(prompt);

    // Attempt generation with auto-fallback
    try {
      console.log(`[Generate] Using provider: ${currentProvider}, isIteration: ${isIteration}`);
      
      // Add timeout for Ollama since it can be slow
      const generatePromise = streamText({
        model: model as any,
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: isIteration ? 2048 : 4096,
        temperature: 0.7,
      } as any);

      // For local Ollama, set a 60 second timeout
      // For cloud providers, 30 seconds is enough
      const timeoutMs = currentProvider === "local" ? 60000 : 30000;
      
      const result = await Promise.race([
        generatePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs/1000}s`)), timeoutMs)
        )
      ]) as Awaited<typeof generatePromise>;

      console.log(`[Generate] Success with ${currentProvider}`);
      return result.toTextStreamResponse();
    } catch (error) {
      // Handle rate limiting with auto-fallback
      if (isRateLimitError(error)) {
        const fallback = getNextProvider(currentProvider);
        
        if (fallback) {
          console.log(`Rate limited on ${currentProvider}, falling back to ${fallback.provider}`);
          
          const fallbackModel = getModelForTask(
            isIteration ? "iterate" : "generate",
            fallback.provider,
            overrides
          );

          const retryResult = await streamText({
            model: fallbackModel as any, // Type cast needed due to ollama-ai-provider using older model version
            system: systemPrompt,
            prompt: userPrompt,
            maxTokens: isIteration ? 2048 : 4096,
            temperature: 0.7,
          } as any);

          // Add header to indicate fallback was used
          const response = retryResult.toTextStreamResponse();
          response.headers.set("X-Loomos-Fallback", fallback.provider);
          response.headers.set("X-Loomos-Fallback-Reason", fallback.reason || "Rate limited");
          
          return response;
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Generation error:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (isRateLimitError(error)) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          message: "All providers are rate limited. Please wait a moment and try again.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Generation failed", message: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
