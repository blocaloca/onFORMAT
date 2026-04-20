'use server'

import { createClient } from '@/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';

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

    // 2. Notify Admin via Email
    try {
        await sendEmail({
            to: 'casteelio@gmail.com', // Founder Email
            subject: `🚨 New ${type.toUpperCase()} Report: onFORMAT Beta`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
                    <h2 style="color: #4F46E5;">New Feedback Received</h2>
                    <div style="background: #f4f4f5; padding: 20px; border-radius: 8px;">
                        <p><strong>From:</strong> ${user?.email || context?.email || 'Anonymous'}</p>
                        <p><strong>Type:</strong> ${type.toUpperCase()}</p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="border-left: 4px solid #4F46E5; padding-left: 16px; font-style: italic;">
                            ${message}
                        </blockquote>
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">
                        View details in the <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Admin Dashboard</a>.
                    </p>
                </div>
            `
        });
    } catch (emailErr) {
        console.warn("⚠️ Admin notification failed:", emailErr);
    }

    return { success: true };
}
