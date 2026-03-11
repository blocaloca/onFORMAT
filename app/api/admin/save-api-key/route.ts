import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Provider and API key are required'
      }, { status: 400 })
    }

    // Only allow openai for now (anthropic is already configured)
    if (provider !== 'openai') {
      return NextResponse.json({
        success: false,
        error: 'Only OpenAI key updates are supported'
      }, { status: 400 })
    }

    // Validate OpenAI key format
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OpenAI API key format. Keys should start with "sk-"'
      }, { status: 400 })
    }

    // Path to .env.local
    const envPath = join(process.cwd(), '.env.local')

    // Read current .env.local
    let envContent = await fs.readFile(envPath, 'utf-8')

    // Check if OPENAI_API_KEY already exists
    const openaiKeyRegex = /^OPENAI_API_KEY=.*$/m
    const commentedOpenaiKeyRegex = /^# OPENAI_API_KEY=.*$/m

    if (openaiKeyRegex.test(envContent)) {
      // Replace existing key
      envContent = envContent.replace(openaiKeyRegex, `OPENAI_API_KEY=${apiKey}`)
    } else if (commentedOpenaiKeyRegex.test(envContent)) {
      // Replace commented key
      envContent = envContent.replace(commentedOpenaiKeyRegex, `OPENAI_API_KEY=${apiKey}`)
    } else {
      // Add new key after Anthropic section
      const anthropicSectionRegex = /(# Anthropic\nANTHROPIC_API_KEY=.*\n)/
      if (anthropicSectionRegex.test(envContent)) {
        envContent = envContent.replace(
          anthropicSectionRegex,
          `$1\n# OpenAI\nOPENAI_API_KEY=${apiKey}\n`
        )
      } else {
        // Just append at the end
        envContent += `\n# OpenAI\nOPENAI_API_KEY=${apiKey}\n`
      }
    }

    // Write back to .env.local
    await fs.writeFile(envPath, envContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully. Please restart the dev server.'
    })

  } catch (error: any) {
    console.error('Error saving API key:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save API key'
    }, { status: 500 })
  }
}
