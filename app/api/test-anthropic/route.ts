import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: 'offline',
      error: 'ANTHROPIC_API_KEY not configured in environment variables'
    }, { status: 200 })
  }

  try {
    // Test Anthropic API connection
    const client = new Anthropic({ apiKey })

    // Simple test message (minimal cost)
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    })

    return NextResponse.json({
      status: 'online',
      message: 'Anthropic API is working',
      model: 'claude-3-haiku-20240307'
    })
  } catch (error: any) {
    console.error('Anthropic test failed:', error.message)

    return NextResponse.json({
      status: 'offline',
      error: error.message || 'Failed to connect to Anthropic API'
    }, { status: 200 })
  }
}
