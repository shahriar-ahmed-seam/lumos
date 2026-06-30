import { groq, createGroq } from "@ai-sdk/groq";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllamaModel } from "./ollama-provider";

export type AIProvider = "groq" | "openai" | "anthropic" | "google" | "local";
export type ModelSize = "large" | "small";

export interface ModelConfig {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  description: string;
  maxTokens: number;
  isFree: boolean;
}

export const MODELS: Record<string, ModelConfig> = {
  "groq-large": {
    provider: "groq",
    modelId: process.env.GROQ_MODEL_LARGE || "llama-3.3-70b-versatile",
    displayName: "Llama 3.3 70B",
    description: "Best for initial complex generation (FREE)",
    maxTokens: 8192,
    isFree: true,
  },
  "groq-small": {
    provider: "groq",
    modelId: process.env.GROQ_MODEL_SMALL || "llama-3.1-8b-instant",
    displayName: "Llama 3.1 8B",
    description: "Fast iterations & edits (FREE, 5x more tokens)",
    maxTokens: 8192,
    isFree: true,
  },
  openai: {
    provider: "openai",
    modelId: process.env.OPENAI_MODEL || "gpt-4o",
    displayName: "GPT-4o",
    description: "OpenAI's flagship model",
    maxTokens: 4096,
    isFree: false,
  },
  anthropic: {
    provider: "anthropic",
    modelId: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    description: "Excellent for structured code",
    maxTokens: 8192,
    isFree: false,
  },
  google: {
    provider: "google",
    modelId: process.env.GOOGLE_MODEL || "gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash Lite",
    description: "Fast and efficient (FREE tier available)",
    maxTokens: 8192,
    isFree: true,
  },
  local: {
    provider: "local",
    modelId: process.env.LOCAL_MODEL || "gemma3:4b",
    displayName: "Gemma 3 4B (Local)",
    description: "Unlimited, runs on your machine via Ollama",
    maxTokens: 4096,
    isFree: true,
  },
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export interface ProviderOverrides {
  keys?: Partial<Record<AIProvider, string>>;
  ollamaBaseURL?: string;
}

export function getModel(modelKey: string = "groq-large", overrides: ProviderOverrides = {}) {
  const config = MODELS[modelKey];

  if (!config) {
    console.warn(`Unknown model key: ${modelKey}, falling back to groq-large`);
    return groq("llama-3.3-70b-versatile");
  }

  const key = overrides.keys?.[config.provider];

  switch (config.provider) {
    case "groq":
      return key ? createGroq({ apiKey: key })(config.modelId) : groq(config.modelId);
    case "openai":
      return key ? createOpenAI({ apiKey: key })(config.modelId) : openai(config.modelId);
    case "anthropic":
      return key ? createAnthropic({ apiKey: key })(config.modelId) : anthropic(config.modelId);
    case "google":
      return key
        ? createGoogleGenerativeAI({ apiKey: key })(config.modelId)
        : google(config.modelId);
    case "local":
      return createOllamaModel(config.modelId, {
        baseURL: overrides.ollamaBaseURL || OLLAMA_BASE_URL,
      });
    default:
      return groq("llama-3.3-70b-versatile");
  }
}

export function getModelForTask(
  task: "generate" | "iterate",
  preferredProvider: AIProvider = "groq",
  overrides: ProviderOverrides = {}
): ReturnType<typeof getModel> {
  if (preferredProvider === "groq") {
    return task === "generate"
      ? getModel("groq-large", overrides)
      : getModel("groq-small", overrides);
  }

  return getModel(preferredProvider, overrides);
}

export function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case "groq":
      return !!process.env.GROQ_API_KEY;
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "google":
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case "local":
      return true;
    default:
      return false;
  }
}

export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ["groq", "google", "openai", "anthropic", "local"];
  return providers.filter(isProviderConfigured);
}

export function getDefaultProvider(): AIProvider {
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER as AIProvider;
  
  if (defaultProvider && isProviderConfigured(defaultProvider)) {
    return defaultProvider;
  }
  
  const fallbackOrder: AIProvider[] = ["groq", "google", "local", "openai", "anthropic"];
  
  for (const provider of fallbackOrder) {
    if (isProviderConfigured(provider)) {
      return provider;
    }
  }
  
  return "groq";
}
