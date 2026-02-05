'use server'

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function forceLogout() {
    const cookieStore = await cookies()

    // 1. Create a server client to officially sign out
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
                    } catch (error) {
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                    }
                },
            },
        }
    )

    await supabase.auth.signOut()

    // 2. Aggressively delete all known Supabase cookies manualy
    // The default cookie name format is `sb-[projectId]-auth-token`
    // We will iterate through all cookies and delete anything starting with sb- or supabase-
    const allCookies = cookieStore.getAll()

    allCookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
            cookieStore.set({
                name: cookie.name,
                value: '',
                expires: new Date(0),
                path: '/'
            })
        }
    })
}
