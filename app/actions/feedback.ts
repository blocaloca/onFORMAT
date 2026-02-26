'use server'

import { createClient } from '@/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Action: Submit Feedback
export async function submitFeedback(message: string, type: 'bug' | 'feature' | 'other', context: any = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use admin client to bypass RLS for inserting feedback (needed for unauthenticated onset users)
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
        .from('feedback_messages')
        .insert({
            user_id: user?.id || null, // Allow null for onset mobile users
            user_email: user?.email || context?.email || 'onset-user@anonymous',
            message: message,
            type: type,
            context: context,
            status: 'new'
        });

    if (error) throw new Error(error.message);
    return { success: true };
}
