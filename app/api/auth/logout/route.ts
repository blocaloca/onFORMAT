import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const cookieStore = await cookies()

    // 1. Create Server Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) { }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) { }
                },
            },
        }
    )

    // 2. Official Sign Out
    await supabase.auth.signOut()

    // 3. Atomic Cookie Nuke
    // Manually iterate and expire all supabase-related cookies
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
            cookieStore.set({
                name: cookie.name,
                value: '',
                expires: new Date(0),
                path: '/',
                maxAge: 0
            })
        }
    })

    return NextResponse.json({ success: true })
}
