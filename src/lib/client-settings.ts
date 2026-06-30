/**
 * Client-side settings for Lumos (Bring-Your-Own-Key).
 *
 * API keys and preferences live in the browser's localStorage and are sent
 * with each generation request to the same-origin /api/generate endpoint.
 * They are never persisted on the server and are only forwarded to the AI
 * provider the user selects. When no client key is set, the server falls back
 * to its own environment variables.
 */

import type { AIProvider } from "@/lib/ai/models";

export type KeyProvider = Exclude<AIProvider, "local">;

export interface LumosSettings {
  keys: Partial<Record<KeyProvider, string>>;
  ollamaBaseURL: string;
  autoFallback: boolean;
  smallModelForIterations: boolean;
}

const STORAGE_KEY = "lumos.settings.v1";

export const DEFAULT_SETTINGS: LumosSettings = {
  keys: {},
  ollamaBaseURL: "http://localhost:11434",
  autoFallback: true,
  smallModelForIterations: true,
};

export const PROVIDER_META: Record<
  KeyProvider,
  { label: string; placeholder: string; getKeyUrl: string }
> = {
  groq: {
    label: "Groq",
    placeholder: "gsk_...",
    getKeyUrl: "https://console.groq.com/keys",
  },
  openai: {
    label: "OpenAI",
    placeholder: "sk-...",
    getKeyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Anthropic",
    placeholder: "sk-ant-...",
    getKeyUrl: "https://console.anthropic.com/",
  },
  google: {
    label: "Google Gemini",
    placeholder: "AIza...",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
  },
};

export function loadSettings(): LumosSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<LumosSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      keys: { ...(parsed.keys ?? {}) },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: LumosSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Build the override payload sent to /api/generate. Empty keys are stripped.
 */
export function getProviderOverrides(): {
  keys: Partial<Record<KeyProvider, string>>;
  ollamaBaseURL: string;
} {
  const { keys, ollamaBaseURL } = loadSettings();
  const cleaned: Partial<Record<KeyProvider, string>> = {};
  (Object.keys(keys) as KeyProvider[]).forEach((provider) => {
    const value = keys[provider]?.trim();
    if (value) cleaned[provider] = value;
  });
  return { keys: cleaned, ollamaBaseURL };
}
