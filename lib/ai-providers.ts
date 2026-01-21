// AI Provider Abstraction Layer
// Supports multiple AI providers with unified interface

import OpenAI from 'openai'

// CONFIGURATION: Set the Active Provider here
export type AIProvider = 'openai' | 'anthropic' // kept for type compatibility
const ACTIVE_PROVIDER: AIProvider = 'openai'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  message: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  provider: AIProvider
}

/**
 * Call OpenAI's GPT-4 API
 */
/**
 * Call OpenRouter API (using OpenAI client compatibility)
 */
async function callOpenAI(
  messages: AIMessage[],
  systemPrompt: string
): Promise<AIResponse> {
  // SWITCHED TO OPENROUTER
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY is missing from environment variables')
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  // DEBUG LOGGING
  console.log('🔗 Connecting to OpenRouter...')
  console.log('🔑 API Key present:', apiKey.startsWith('sk-or-') ? 'Yes (starts with sk-or-)' : 'Yes (Unknown format)')
  console.log('📡 Base URL:', 'https://openrouter.ai/api/v1')
  console.log('🧠 Model:', 'deepseek/deepseek-chat')

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://onformat.com', // Required for OpenRouter rankings
      'X-Title': 'onFORMAT', // Required for OpenRouter rankings
    },
  })

  const response = await client.chat.completions.create({
    model: 'deepseek/deepseek-chat', // Default model per requirements
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))
    ],
    // OpenRouter specific: ensuring stream handling is compatible if we were streaming (we're not yet, but good practice)
  })

  const message = response.choices[0]?.message?.content || ''

  return {
    message,
    usage: {
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
      total_tokens: response.usage?.total_tokens
    },
    // We still call it 'openai' internally for provider compatibility in the rest of the app, 
    // or we could change this string if strictly needed. Keeping 'openai' to minimize breaking changes elsewhere.
    provider: 'openai'
  }
}

/**
 * Main function to call AI
 * NOW: Single Provider Mode (OpenAI Only)
 * FUTURE: To switch, update ACTIVE_PROVIDER constant or add logic here.
 */
export async function callAI(
  messages: AIMessage[],
  systemPrompt: string,
  preferredProvider: AIProvider = ACTIVE_PROVIDER // Default to Config
): Promise<AIResponse> {
  console.log('🤖 Calling AI with provider:', preferredProvider)

  // Enforce OpenAI for now, ignoring preferredProvider if needed, 
  // or allow switching if other functions are restored.
  // For strict "OpenAI Only" compliance requested by user:

  return await callOpenAI(messages, systemPrompt)
}

/**
 * Test if a specific provider is available
 */
export async function testProvider(provider: AIProvider): Promise<{
  available: boolean
  error?: string
}> {
  try {
    const testMessages: AIMessage[] = [
      { role: 'user', content: 'Say "OK" if you can read this.' }
    ]

    if (provider === 'openai') {
      await callOpenAI(testMessages, 'You are a helpful assistant.')
      return { available: true }
    }

    // Stub for removed providers
    return { available: false, error: 'Provider not implemented' }

  } catch (error: any) {
    return { available: false, error: error.message }
  }
}

/**
 * Get available providers
 */
export async function getAvailableProviders(): Promise<{
  anthropic: boolean
  openai: boolean
}> {
  const openaiTest = await testProvider('openai')

  return {
    anthropic: false, // Disabled
    openai: openaiTest.available
  }
}
