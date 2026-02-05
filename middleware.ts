import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Check if we are visiting Login or Signup pages
    // If so, we want to ensure we don't accidentally refresh an old session
    // unless the user intends to stay logged in. 
    // BUT since the user is explicitly visiting /login or /signup, we might want to forcefully clear session OR redirect to dashboard if logged in.
    // The issue "new user accessing founder account" implies the session persists.

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 2. Setup Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // 3. Refresh Session
    // GUARD: Do NOT refresh session if we are simply visiting public auth pages.
    // This prevents "Zombie Sessions" from being re-validated when a user is trying to switch accounts.
    const path = request.nextUrl.pathname;
    if (!path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/auth/logout')) {
        await supabase.auth.getUser()
    }

    // 4. Force Redirect to Dashboard if Logged In and visiting Login/Signup?
    // Usually good practice, but in this specific "switch account" case, it causes confusion.
    // If I am logged in and go to /signup, I probably want to create a new account.
    // So the /signup page MUST handle the logout itself. which we tried.

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
