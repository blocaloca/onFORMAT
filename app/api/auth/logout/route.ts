import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    return handleLogout(request);
}

export async function GET(request: Request) {
    return handleLogout(request);
}

async function handleLogout(request: Request) {
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
            // Nuke it on current domain
            cookieStore.set({
                name: cookie.name,
                value: '',
                expires: new Date(0),
                path: '/',
                maxAge: 0
            });

            // Nuke it on root domain (dot-prefixed) just in case
            // Note: We can't easily know the exact root domain dynamically in all envs without parsing host,
            // but we can try setting it if the environment variable hints at it or just robustly attempting standard variations.
            // For localhost, domain is ignored usually. for production, it matters.
            // We will assume standard clearing is enough for now unless we receive specific domain info.
        }
    })

    return NextResponse.redirect(new URL('/login', request.url), {
        status: 303,
    })
}
