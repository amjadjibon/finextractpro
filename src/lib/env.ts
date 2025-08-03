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
} as const