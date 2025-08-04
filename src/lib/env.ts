/**
 * Environment configuration utilities
 */

export const env = {
  /**
   * Whether we're in development mode
   */
  isDevelopment: process.env.NODE_ENV === 'development',
  
  /**
   * Whether we're in production mode
   */
  isProduction: process.env.NODE_ENV === 'production',
  
  /**
   * AI Provider Configuration
   */
  ai: {
    provider: (process.env.AI_PROVIDER || 'openai') as 'openai' | 'google' | 'groq',
    model: process.env.AI_MODEL || undefined,
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      groq: process.env.GROQ_API_KEY
    }
  }
} as const