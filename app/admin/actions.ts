'use server'

import { createClient as createRawClient } from '@supabase/supabase-js';
import { createClient as createNextClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// Admin Client (Service Role) - Uses Raw Client to bypass RLS for admin edits
const adminSupabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Fetch All Users (Profiles + Subscriptions + Project Counts)
export async function fetchAdminUsers() {
    const { data: profiles, error: profilesError } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profilesError) throw new Error(profilesError.message);

    const { data: subs } = await adminSupabase
        .from('subscriptions')
        .select('user_id, status, tier, updated_at')
        .in('status', ['active', 'trialing']);

    const subMap: any = {};
    subs?.forEach((s: any) => {
        subMap[s.user_id] = s;
    });

    const { data: projects } = await adminSupabase
        .from('projects')
        .select('user_id, id');

    const projectCounts: any = {};
    projects?.forEach((p: any) => {
        projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
    });

    return profiles.map(p => ({
        ...p,
        subscription: subMap[p.id] || null,
        project_count: projectCounts[p.id] || 0
    }));
}

// Check if Current User is Admin
export async function verifyAdmin(userId: string) {
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('email, is_admin')
        .eq('id', userId)
        .single();

    return profile?.is_admin || ['casteelio@gmail.com'].includes(profile?.email?.toLowerCase() || '');
}

// Action: Toggle Manual Pro Override
export async function toggleProOverride(userIdOrFormData: string | FormData, currentState?: boolean) {
    let userId: string;
    let state: boolean;

    if (userIdOrFormData instanceof FormData) {
        userId = userIdOrFormData.get('userId') as string;
        state = userIdOrFormData.get('currentState') === 'true';
    } else {
        userId = userIdOrFormData as string;
        state = currentState!;
    }

    console.log(`SERVER ACTION: Toggling Pro Override for ${userId} (Target State: ${!state})`);

    try {
        const { error } = await adminSupabase
            .from('profiles')
            .update({ manual_pro_override: !state })
            .eq('id', userId);

        if (error) {
            console.error("Pro Toggle Error:", error.message);
            throw error;
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Pro Toggle Error:", error.message);
        return { success: false, error: error.message };
    }
}

// Action: Toggle Beta User
export async function toggleBetaUser(userIdOrFormData: string | FormData, currentState?: boolean) {
    let userId: string;
    let state: boolean;

    if (userIdOrFormData instanceof FormData) {
        userId = userIdOrFormData.get('userId') as string;
        state = userIdOrFormData.get('currentState') === 'true';
    } else {
        userId = userIdOrFormData as string;
        state = currentState!;
    }

    console.log(`SERVER ACTION: Toggling Beta for ${userId} (Target State: ${!state})`);

    try {
        const { error } = await adminSupabase
            .from('profiles')
            .update({ is_beta_user: !state })
            .eq('id', userId);

        if (error) {
            console.error("Beta Toggle Error:", error.message);
            throw error;
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Beta Toggle Error:", error.message);
        return { success: false, error: error.message };
    }
}

// Action: Update Subscription Tier Manually
export async function manualUpdateTier(userId: string, tier: string) {
    const supabase = await createNextClient(); // Uses Next.js cookies
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await verifyAdmin(user.id))) throw new Error("Unauthorized");

    const { error } = await adminSupabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            status: 'active',
            tier: tier,
            price_id: 'manual_override',
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

// Action: Fetch Feedback Messages
export async function fetchFeedback() {
    const { data, error } = await adminSupabase
        .from('feedback_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.warn("Feedback table error:", error.message);
        return [];
    }
    return data;
}

// Action: Mark Feedback as Read
export async function markFeedbackRead(requestId: string | FormData) {
    try {
        const id = typeof requestId === 'string' ? requestId : requestId.get("id") as string;
        if (!id) return { success: false, error: "Missing ID" };

        console.log("SERVER ACTION: Marking read for ID", id);

        const { error } = await adminSupabase
            .from('feedback_messages')
            .update({ status: 'read' })
            .eq('id', id);

        if (error) throw error;
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Database update error:", error.message);
        return { success: false, error: error.message };
    }
}

// Action: Delete Feedback
export async function deleteFeedback(requestId: string | FormData) {
    try {
        const id = typeof requestId === 'string' ? requestId : requestId.get("id") as string;
        if (!id) return { success: false, error: "Missing ID" };

        console.log("SERVER ACTION: Deleting ID", id);

        const { error } = await adminSupabase
            .from('feedback_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Database delete error:", error.message);
        return { success: false, error: error.message };
    }
}
// Action: Fetch Beta Requests
export async function fetchBetaRequests() {
    const { data, error } = await adminSupabase
        .from('beta_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.warn("Beta requests table error:", error.message);
        return [];
    }
    return data;
}

import { sendEmail } from '@/lib/resend';

// Action: Approve Beta Request
export async function approveBetaRequest(requestId: string) {
    try {
        const { data: request, error: fetchError } = await adminSupabase
            .from('beta_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError) throw fetchError;

        // 1. Mark request as approved
        await adminSupabase
            .from('beta_requests')
            .update({ status: 'approved' })
            .eq('id', requestId);

        // 2. Notify via Email
        try {
            await sendEmail({
                to: request.email,
                subject: '🎨 Access Granted: Welcome to the onFORMAT Private Beta',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
                        <h1 style="color: #4F46E5; letter-spacing: -0.02em;">Welcome to the Pioneer Phase.</h1>
                        <p>Hello,</p>
                        <p>We've reviewed your application and are excited to invite you to the <strong>onFORMAT Private Beta</strong>.</p>
                        <div style="background: #f4f4f5; padding: 24px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin-top: 0;"><strong>Next Steps:</strong></p>
                            <p>You can now create your account and claim your <strong>30-day trial Solo Tier</strong>.</p>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Initialize Workspace</a>
                        </div>
                        <p>Welcome to the future of tactical production.</p>
                        <br/>
                        <p>Best regards,<br/>The onFORMAT Team</p>
                    </div>
                `
            });
            console.log("✅ Beta Approval email dispatched to", request.email);
        } catch (emailErr) {
            console.warn("⚠️ Failed to send approval email:", emailErr);
        }

        // 3. If user already exists in profiles, grant beta access and 30-day solo tier
        const { data: existingProfile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('email', request.email)
            .single();

        if (existingProfile) {
            await adminSupabase
                .from('profiles')
                .update({ 
                    is_beta_user: true
                })
                .eq('id', existingProfile.id);
            
            // Grant 30-day solo tier (Scout)
            await adminSupabase
                .from('subscriptions')
                .upsert({
                    user_id: existingProfile.id,
                    status: 'active',
                    tier: 'scout',
                    price_id: 'beta_grant_30d',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Approve Beta Error:", error.message);
        return { success: false, error: error.message };
    }
}

// Action: Delete Beta Request
export async function deleteBetaRequest(requestId: string) {
    try {
        const id = typeof requestId === 'string' ? requestId : (requestId as any).get?.('id');
        if (!id) return { success: false, error: "Missing ID" };

        await adminSupabase
            .from('beta_requests')
            .delete()
            .eq('id', id);

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Beta Request Error:", error.message);
        return { success: false, error: error.message };
    }
}

// Action: Send Test Email
export async function sendTestEmailAction() {
    try {
        console.log("SERVER ACTION: Sending test email to casteelio@gmail.com");
        
        const result = await sendEmail({
            to: 'casteelio@gmail.com',
            subject: '🧪 onFORMAT: Resend Connection Test',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h2 style="color: #4F46E5;">Resend Integration: Online</h2>
                    <p>This is a diagnostic email triggered from the <strong>Dev Center</strong>.</p>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px;">
                        Status: SUCCESS<br/>
                        Timestamp: ${new Date().toISOString()}<br/>
                        environment: ${process.env.NODE_ENV}
                    </div>
                    <p style="margin-top: 20px; font-size: 13px; color: #666;">
                        If you are seeing this, your Resend API connection is correctly configured and dispatching transactional mail.
                    </p>
                </div>
            `
        });

        if (result.error) throw result.error;

        return { success: true };
    } catch (error: any) {
        console.error("Test Email Error:", error.message);
        return { success: false, error: error.message };
    }
}
