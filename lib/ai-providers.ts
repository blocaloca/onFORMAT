// AI Provider Abstraction Layer
// Supports multiple AI providers with unified interface

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type AIProvider = 'anthropic' | 'openai'

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
 * Call Anthropic's Claude API
 */
async function callAnthropic(
  messages: AIMessage[],
  systemPrompt: string
): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  })

  const textContent = response.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n')

  return {
    message: textContent,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens
    },
    provider: 'anthropic'
  }
}

/**
 * Call OpenAI's GPT-4 API
 */
async function callOpenAI(
  messages: AIMessage[],
  systemPrompt: string
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))
    ]
  })

  const message = response.choices[0]?.message?.content || ''

  return {
    message,
    usage: {
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
      total_tokens: response.usage?.total_tokens
    },
    provider: 'openai'
  }
}

/**
 * Main function to call AI with automatic provider fallback
 */
export async function callAI(
  messages: AIMessage[],
  systemPrompt: string,
  preferredProvider: AIProvider = 'openai'
): Promise<AIResponse> {
  console.log('🤖 Calling AI with provider:', preferredProvider)

  // Try preferred provider first
  try {
    if (preferredProvider === 'anthropic') {
      return await callAnthropic(messages, systemPrompt)
    } else {
      return await callOpenAI(messages, systemPrompt)
    }
  } catch (error: any) {
    console.error(`❌ ${preferredProvider} failed:`, error.message)

    // Fallback to other provider
    const fallbackProvider: AIProvider = preferredProvider === 'anthropic' ? 'openai' : 'anthropic'
    console.log(`🔄 Falling back to ${fallbackProvider}...`)

    try {
      if (fallbackProvider === 'anthropic') {
        return await callAnthropic(messages, systemPrompt)
      } else {
        return await callOpenAI(messages, systemPrompt)
      }
    } catch (fallbackError: any) {
      console.error(`❌ ${fallbackProvider} also failed:`, fallbackError.message)
      throw new Error(`Both AI providers failed. Anthropic: ${error.message}, OpenAI: ${fallbackError.message}`)
    }
  }
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

    if (provider === 'anthropic') {
      await callAnthropic(testMessages, 'You are a helpful assistant.')
    } else {
      await callOpenAI(testMessages, 'You are a helpful assistant.')
    }

    return { available: true }
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
  const [anthropicTest, openaiTest] = await Promise.all([
    testProvider('anthropic'),
    testProvider('openai')
  ])

  return {
    anthropic: anthropicTest.available,
    openai: openaiTest.available
  }
}
