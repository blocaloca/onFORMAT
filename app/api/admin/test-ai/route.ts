import { NextResponse } from 'next/server'
import { callAI } from '@/lib/ai-providers'

export async function POST(request: Request) {
  try {
    const { provider, message } = await request.json()

    if (!provider || !message) {
      return NextResponse.json(
        { error: 'Provider and message are required' },
        { status: 400 }
      )
    }

    const response = await callAI(
      [{ role: 'user', content: message }],
      'You are a helpful assistant. Respond briefly.',
      provider
    )

    return NextResponse.json({
      success: true,
      response: response.message,
      provider: response.provider,
      usage: response.usage
    })
  } catch (error: any) {
    console.error('AI test failed:', error)
    return NextResponse.json(
      { error: error.message || 'AI test failed' },
      { status: 500 }
    )
  }
}
