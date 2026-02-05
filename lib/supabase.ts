import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Standard Singleton Pattern for Client Components
// The "Hard Reload" in Phase 4.1 protects against session leakage.
// We restore this to ensure connection reliability.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Also export a helper for cases demanding a fresh instance (like unit tests or sensitive auth ops)
export const getClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)
