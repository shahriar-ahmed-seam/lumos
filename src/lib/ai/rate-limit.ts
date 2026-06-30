import { AIProvider, isProviderConfigured } from "./models";

interface RateLimitInfo {
  remainingRequests?: number;
  remainingTokens?: number;
  resetTime?: Date;
  isLimited: boolean;
}

interface FallbackResult {
  provider: AIProvider;
  reason?: string;
}

const FALLBACK_ORDER: AIProvider[] = ["groq", "google", "local", "openai", "anthropic"];

export function getNextProvider(
  currentProvider: AIProvider,
  excludeProviders: AIProvider[] = []
): FallbackResult | null {
  const currentIndex = FALLBACK_ORDER.indexOf(currentProvider);
  const toCheck = [
    ...FALLBACK_ORDER.slice(currentIndex + 1),
    ...FALLBACK_ORDER.slice(0, currentIndex),
  ];

  for (const provider of toCheck) {
    if (!excludeProviders.includes(provider) && isProviderConfigured(provider)) {
      return {
        provider,
        reason: `Switched from ${currentProvider} to ${provider} due to rate limiting`,
      };
    }
  }

  return null;
}

export function parseGroqRateLimitHeaders(headers: Headers): RateLimitInfo {
  const remainingRequests = headers.get("x-ratelimit-remaining-requests");
  const remainingTokens = headers.get("x-ratelimit-remaining-tokens");
  const resetRequests = headers.get("x-ratelimit-reset-requests");

  return {
    remainingRequests: remainingRequests ? parseInt(remainingRequests, 10) : undefined,
    remainingTokens: remainingTokens ? parseInt(remainingTokens, 10) : undefined,
    resetTime: resetRequests ? new Date(resetRequests) : undefined,
    isLimited:
      (remainingRequests !== null && parseInt(remainingRequests, 10) <= 0) ||
      (remainingTokens !== null && parseInt(remainingTokens, 10) <= 0),
  };
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("429") ||
      error.message.toLowerCase().includes("rate limit") ||
      error.message.toLowerCase().includes("too many requests")
    );
  }
  return false;
}

export function getWaitTime(resetTime?: Date): number {
  if (!resetTime) {
    return 60000;
  }
  
  const now = new Date();
  const waitMs = resetTime.getTime() - now.getTime();
  return Math.max(waitMs, 0);
}

export function formatTokensRemaining(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function hasEnoughTokens(
  remainingTokens: number,
  estimatedUsage: number,
  safetyMargin: number = 0.1
): boolean {
  const required = estimatedUsage * (1 + safetyMargin);
  return remainingTokens >= required;
}
