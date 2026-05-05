import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isFounder } from '@/lib/permissions'
import { callAI } from '@/lib/ai-providers'

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
