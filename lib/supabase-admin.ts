import { createClient } from '@supabase/supabase-js'

// Note: This client uses the SERVICE_ROLE_KEY and bypasses Row Level Security.
// Use strictly in server-side API routes or Webhooks.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
