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

type AnyLanguageModel = ReturnType<typeof getModel>;

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

    let model;
    let currentProvider: AIProvider = provider || "groq";

    if (modelKey) {
      model = getModel(modelKey, overrides);
    } else if (isIteration && currentCode) {
      model = getModelForTask("iterate", currentProvider, overrides);
    } else {
      model = getModelForTask("generate", currentProvider, overrides);
    }

    const systemPrompt = isIteration ? SYSTEM_PROMPT_ITERATE : SYSTEM_PROMPT_GENERATE;
    const userPrompt = isIteration && currentCode
      ? buildIterationPrompt(currentCode, prompt)
      : buildGenerationPrompt(prompt);

    try {
      console.log(`[Generate] Using provider: ${currentProvider}, isIteration: ${isIteration}`);
      
      const generatePromise = streamText({
        model: model as any,
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: isIteration ? 2048 : 4096,
        temperature: 0.7,
      } as any);

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
            model: fallbackModel as any,
            system: systemPrompt,
            prompt: userPrompt,
            maxTokens: isIteration ? 2048 : 4096,
            temperature: 0.7,
          } as any);

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
