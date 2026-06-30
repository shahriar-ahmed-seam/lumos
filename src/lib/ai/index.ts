/**
 * Loomos AI Module
 * 
 * Central export for all AI-related functionality
 */

// Models and providers
export {
  getModel,
  getModelForTask,
  getAvailableProviders,
  getDefaultProvider,
  isProviderConfigured,
  MODELS,
  type AIProvider,
  type ModelSize,
  type ModelConfig,
} from "./models";

// Prompts
export {
  SYSTEM_PROMPT_GENERATE,
  SYSTEM_PROMPT_ITERATE,
  SYSTEM_PROMPT_STRUCTURED,
  buildIterationPrompt,
  buildGenerationPrompt,
  PRESET_PROMPTS,
} from "./prompts";

// Rate limiting
export {
  getNextProvider,
  parseGroqRateLimitHeaders,
  isRateLimitError,
  getWaitTime,
  formatTokensRemaining,
  estimateTokens,
  hasEnoughTokens,
} from "./rate-limit";
