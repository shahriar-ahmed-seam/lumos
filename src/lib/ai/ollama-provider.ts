interface OllamaConfig {
  baseURL?: string;
}

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaStreamResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export function createOllamaModel(
  modelId: string,
  config: OllamaConfig = {}
) {
  const baseURL = config.baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  return {
    specificationVersion: "v2" as const,
    
    provider: "ollama",
    modelId,
    
    defaultObjectGenerationMode: undefined,
    
    supportsStructuredOutputs: false,
    
    async doStream(options: {
      prompt: Array<{
        role: string;
        content: string | Array<{ type: string; text?: string }>;
      }>;
      temperature?: number;
      maxTokens?: number;
    }) {
      const messages = buildMessages(options.prompt);
      
      const response = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelId,
          messages,
          stream: true,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.maxTokens ?? 4096,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body from Ollama");
      }

      const decoder = new TextDecoder();
      let completionTokens = 0;
      let promptTokens = 0;

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.enqueue({
                  type: "finish" as const,
                  finishReason: "stop" as const,
                  usage: {
                    promptTokens,
                    completionTokens,
                  },
                });
                controller.close();
                break;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim()) continue;
                
                try {
                  const data: OllamaStreamResponse = JSON.parse(line);
                  
                  if (data.prompt_eval_count) {
                    promptTokens = data.prompt_eval_count;
                  }
                  
                  if (data.message?.content) {
                    completionTokens++;
                    controller.enqueue({
                      type: "text-delta" as const,
                      textDelta: data.message.content,
                    });
                  }
                  
                  if (data.done) {
                    if (data.eval_count) {
                      completionTokens = data.eval_count;
                    }
                    controller.enqueue({
                      type: "finish" as const,
                      finishReason: "stop" as const,
                      usage: {
                        promptTokens,
                        completionTokens,
                      },
                    });
                    controller.close();
                    return;
                  }
                } catch {
                }
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        },
      });

      return {
        stream,
        rawCall: {
          rawPrompt: messages,
          rawSettings: { model: modelId },
        },
        warnings: [],
        rawResponse: {
          headers: {},
        },
      };
    },

    async doGenerate(options: {
      prompt: Array<{
        role: string;
        content: string | Array<{ type: string; text?: string }>;
      }>;
      temperature?: number;
      maxTokens?: number;
    }) {
      const messages = buildMessages(options.prompt);

      const response = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelId,
          messages,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.maxTokens ?? 4096,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      const data: OllamaStreamResponse = await response.json();

      return {
        text: data.message?.content || "",
        finishReason: "stop" as const,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
        },
        rawCall: {
          rawPrompt: messages,
          rawSettings: { model: modelId },
        },
        rawResponse: {
          headers: {},
        },
        warnings: [],
      };
    },
  };
}

function buildMessages(
  prompt: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string }>;
  }>
): OllamaMessage[] {
  const messages: OllamaMessage[] = [];
  
  for (const item of prompt) {
    let content = "";
    
    if (typeof item.content === "string") {
      content = item.content;
    } else if (Array.isArray(item.content)) {
      content = item.content
        .map((c) => (c.type === "text" ? c.text || "" : ""))
        .join("");
    }
    
    if (item.role === "system") {
      messages.push({ role: "system", content });
    } else if (item.role === "user") {
      messages.push({ role: "user", content });
    } else if (item.role === "assistant") {
      messages.push({ role: "assistant", content });
    }
  }
  
  return messages;
}
