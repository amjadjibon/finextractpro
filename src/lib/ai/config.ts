/**
 * AI Provider Configuration
 * 
 * Supports multiple AI providers (OpenAI, Google Gemini, Groq)
 * configured via environment variables
 */

import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

export type AIProvider = 'openai' | 'google' | 'groq'

export interface AIConfig {
  provider: AIProvider
  model: string
  apiKey: string
}

// Default models for each provider
const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  google: 'gemini-1.5-flash',
  groq: 'llama-3.1-70b-versatile'
} as const

// Get AI configuration from environment variables
export function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider
  const model = process.env.AI_MODEL || DEFAULT_MODELS[provider]
  
  let apiKey: string
  
  switch (provider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY || ''
      break
    case 'google':
      apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
      break
    case 'groq':
      apiKey = process.env.GROQ_API_KEY || ''
      break
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
  
  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}. Please set ${provider === 'google' ? 'GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY' : `${provider.toUpperCase()}_API_KEY`} environment variable.`)
  }
  
  return { provider, model, apiKey }
}

// Get the AI SDK instance based on configuration
export function getAIProvider() {
  const config = getAIConfig()
  
  switch (config.provider) {
    case 'openai':
      const openaiClient = createOpenAI({
        apiKey: config.apiKey
      })
      return openaiClient(config.model)
    case 'google':
      const googleClient = createGoogleGenerativeAI({
        apiKey: config.apiKey
      })
      return googleClient(config.model)
    case 'groq':
      const groqClient = createGroq({
        apiKey: config.apiKey
      })
      return groqClient(config.model)
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

// Provider-specific configurations
export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] as const,
    supportsVision: true,
    maxTokens: 4096,
    costPerToken: 0.0001 // Approximate
  },
  google: {
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'] as const,
    supportsVision: true,
    maxTokens: 8192,
    costPerToken: 0.0001 // Approximate
  },
  groq: {
    name: 'Groq',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] as const,
    supportsVision: false,
    maxTokens: 8192,
    costPerToken: 0.00001 // Much cheaper
  }
} as const

export function validateAIConfig(): { isValid: boolean; error?: string; config?: AIConfig } {
  try {
    const config = getAIConfig()
    const providerConfig = PROVIDER_CONFIGS[config.provider]
    
    // Check if model is supported by the provider
    const supportedModels = providerConfig.models as readonly string[]
    if (!supportedModels.includes(config.model)) {
      return {
        isValid: false,
        error: `Model ${config.model} is not supported by provider ${config.provider}. Supported models: ${supportedModels.join(', ')}`,
        config
      }
    }
    
    // Additional validation - check if API key looks valid
    if (config.apiKey.length < 10) {
      return {
        isValid: false,
        error: `API key for ${config.provider} appears to be too short or invalid`,
        config
      }
    }
    
    return { isValid: true, config }
  } catch (error) {
    const provider = process.env.AI_PROVIDER || 'openai'
    let debugInfo = `Provider: ${provider}`
    
    // Add specific debugging for each provider
    switch (provider) {
      case 'google':
        debugInfo += `, Google API Key set: ${!!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)}`
        break
      case 'openai':
        debugInfo += `, OpenAI API Key set: ${!!process.env.OPENAI_API_KEY}`
        break
      case 'groq':
        debugInfo += `, Groq API Key set: ${!!process.env.GROQ_API_KEY}`
        break
    }
    
    return {
      isValid: false,
      error: `${error instanceof Error ? error.message : 'Unknown configuration error'}. Debug: ${debugInfo}`
    }
  }
}
