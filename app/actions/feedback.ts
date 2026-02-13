'use server'

import { createClient } from '@/lib/supabase-server';

// Action: Submit Feedback
export async function submitFeedback(message: string, type: 'bug' | 'feature' | 'other', context: any = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Must be logged in to submit feedback");

    const { error } = await supabase
        .from('feedback_messages')
        .insert({
            user_id: user.id,
            user_email: user.email,
            message: message,
            type: type,
            context: context,
            status: 'new'
        });

    if (error) throw new Error(error.message);
    return { success: true };
}
