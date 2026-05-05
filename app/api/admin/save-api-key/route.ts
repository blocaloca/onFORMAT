import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { isFounder } from '@/lib/permissions'

async function requireFounder(request: Request): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )

  const { data: { user }, error } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''))
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isFounder(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return null
}

export async function POST(request: Request) {
  const authError = await requireFounder(request)
  if (authError) return authError

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
      // Just append at the end
      envContent += `\n# OpenAI\nOPENAI_API_KEY=${apiKey}\n`
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
