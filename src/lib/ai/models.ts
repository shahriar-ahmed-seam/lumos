/**
 * Loomos AI Provider Configuration
 * 
 * This module provides a unified interface for switching between AI providers:
 * - Groq (FREE tier - Llama 3.3 70B / 3.1 8B)
 * - OpenAI (GPT-4o)
 * - Anthropic (Claude 3.5 Sonnet)
 * - Local Ollama (Llama 3.1)
 */

import { groq, createGroq } from "@ai-sdk/groq";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllamaModel } from "./ollama-provider";

// Provider types
export type AIProvider = "groq" | "openai" | "anthropic" | "google" | "local";
export type ModelSize = "large" | "small";

// Model configuration interface
export interface ModelConfig {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  description: string;
  maxTokens: number;
  isFree: boolean;
}

// Available models configuration
export const MODELS: Record<string, ModelConfig> = {
  // Groq Models (FREE)
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
  // OpenAI Models
  openai: {
    provider: "openai",
    modelId: process.env.OPENAI_MODEL || "gpt-4o",
    displayName: "GPT-4o",
    description: "OpenAI's flagship model",
    maxTokens: 4096,
    isFree: false,
  },
  // Anthropic Models
  anthropic: {
    provider: "anthropic",
    modelId: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    description: "Excellent for structured code",
    maxTokens: 8192,
    isFree: false,
  },
  // Google Gemini Models
  google: {
    provider: "google",
    modelId: process.env.GOOGLE_MODEL || "gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash Lite",
    description: "Fast and efficient (FREE tier available)",
    maxTokens: 8192,
    isFree: true,
  },
  // Local Ollama
  local: {
    provider: "local",
    modelId: process.env.LOCAL_MODEL || "gemma3:4b",
    displayName: "Gemma 3 4B (Local)",
    description: "Unlimited, runs on your machine via Ollama",
    maxTokens: 4096,
    isFree: true,
  },
};

// Ollama base URL
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

/**
 * Optional per-request overrides supplied by the client (Bring-Your-Own-Key).
 * When a key is present for a provider it is used instead of the server env var.
 * Keys are sent same-origin and only ever forwarded to the chosen AI provider.
 */
export interface ProviderOverrides {
  /** Map of provider -> API key, e.g. { openai: "sk-..." } */
  keys?: Partial<Record<AIProvider, string>>;
  /** Custom Ollama base URL for local generation. */
  ollamaBaseURL?: string;
}

/**
 * Get the AI model instance based on provider and model key.
 * Optional `overrides` allow per-request API keys / Ollama URL.
 */
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

/**
 * Get model for specific use case
 * - "generate": Use large model for initial complex generation
 * - "iterate": Use small model for quick edits (saves tokens)
 */
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

  // For other providers, use the same model for both tasks
  return getModel(preferredProvider, overrides);
}

/**
 * Check if a provider is configured (has API key)
 */
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
      return true; // Ollama doesn't need a key
    default:
      return false;
  }
}

/**
 * Get all available (configured) providers
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ["groq", "google", "openai", "anthropic", "local"];
  return providers.filter(isProviderConfigured);
}

/**
 * Get the default provider based on environment
 */
export function getDefaultProvider(): AIProvider {
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER as AIProvider;
  
  if (defaultProvider && isProviderConfigured(defaultProvider)) {
    return defaultProvider;
  }
  
  // Fallback priority: groq -> google -> local -> openai -> anthropic
  const fallbackOrder: AIProvider[] = ["groq", "google", "local", "openai", "anthropic"];
  
  for (const provider of fallbackOrder) {
    if (isProviderConfigured(provider)) {
      return provider;
    }
  }
  
  return "groq"; // Default even if not configured
}
