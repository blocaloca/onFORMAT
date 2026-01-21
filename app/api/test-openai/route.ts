import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: 'offline',
      error: 'OPENROUTER_API_KEY not configured in environment variables'
    }, { status: 200 })
  }

  try {
    // Test OpenRouter/OpenAI Compatible API connection
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://onformat.com',
        'X-Title': 'onFORMAT',
      },
    })

    // Simple test - list models (fast and cheap)
    const models = await client.models.list()

    console.log('✅ OpenRouter Test Success. Models found:', models.data.length)

    // Check for OpenRouter specific response details if available in the raw response
    // (The OpenAI client hides headers, but successful return implies connection)

    return NextResponse.json({
      status: 'online',
      message: 'AI API (OpenRouter) is working',
      provider_check: 'Connected to https://openrouter.ai/api/v1',
      model_count: models.data.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('AI test failed:', error.message)

    return NextResponse.json({
      status: 'offline',
      error: error.message || 'Failed to connect to AI API'
    }, { status: 200 })
  }
}
