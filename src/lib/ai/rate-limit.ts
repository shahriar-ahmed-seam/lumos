/**
 * Loomos Rate Limit Handler
 * 
 * Manages rate limiting, auto-fallback, and token monitoring
 * for the free tier constraints.
 */

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

/**
 * Fallback order when a provider hits rate limits
 */
const FALLBACK_ORDER: AIProvider[] = ["groq", "google", "local", "openai", "anthropic"];

/**
 * Get the next available provider when current one is rate limited
 */
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

/**
 * Parse rate limit headers from Groq API response
 */
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

/**
 * Check if an error is a rate limit error (429)
 */
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

/**
 * Calculate wait time based on rate limit reset
 */
export function getWaitTime(resetTime?: Date): number {
  if (!resetTime) {
    return 60000; // Default 60 seconds
  }
  
  const now = new Date();
  const waitMs = resetTime.getTime() - now.getTime();
  return Math.max(waitMs, 0);
}

/**
 * Format remaining tokens for display
 */
export function formatTokensRemaining(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

/**
 * Estimate token count from text (rough approximation)
 * ~4 characters per token for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if we have enough tokens for a request
 */
export function hasEnoughTokens(
  remainingTokens: number,
  estimatedUsage: number,
  safetyMargin: number = 0.1
): boolean {
  const required = estimatedUsage * (1 + safetyMargin);
  return remainingTokens >= required;
}
