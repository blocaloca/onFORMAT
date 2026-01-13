import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: 'offline',
      error: 'OPENAI_API_KEY not configured in environment variables'
    }, { status: 200 })
  }

  try {
    // Test OpenAI API connection
    const client = new OpenAI({ apiKey })

    // Simple test - list models (fast and cheap)
    const models = await client.models.list()

    return NextResponse.json({
      status: 'online',
      message: 'OpenAI API is working',
      modelsAvailable: models.data.length
    })
  } catch (error: any) {
    console.error('OpenAI test failed:', error.message)

    return NextResponse.json({
      status: 'offline',
      error: error.message || 'Failed to connect to OpenAI API'
    }, { status: 200 })
  }
}
