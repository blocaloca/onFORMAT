'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Admin Client (Service Role)
const adminSupabase = createClient(
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
    // 1. Fetch Profiles
    const { data: profiles, error: profilesError } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profilesError) throw new Error(profilesError.message);

    // 2. Fetch Active Subscriptions Map
    const { data: subs } = await adminSupabase
        .from('subscriptions')
        .select('user_id, status, tier, updated_at')
        .in('status', ['active', 'trialing']);

    const subMap: any = {};
    subs?.forEach((s: any) => {
        subMap[s.user_id] = s;
    });

    // 3. Fetch Project Counts (Grouped)
    // Supabase doesn't support GROUP BY well in simple API, let's fetch essential project metadata
    // Or just fetch all projects (might be heavy later, but okay for start)
    const { data: projects } = await adminSupabase
        .from('projects')
        .select('user_id, id');

    const projectCounts: any = {};
    projects?.forEach((p: any) => {
        projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
    });

    // Combine Data
    return profiles.map(p => ({
        ...p,
        subscription: subMap[p.id] || null,
        project_count: projectCounts[p.id] || 0
    }));
}

// Check if Current User is Admin
export async function verifyAdmin(userId: string) {
    // Hardcoded safety check + DB check
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('email, is_admin')
        .eq('id', userId)
        .single();

    // Allow if is_admin OR specific email (Founder)
    const isAuthorized = profile?.is_admin || ['casteelio@gmail.com'].includes(profile?.email?.toLowerCase() || '');

    return isAuthorized;
}

// Action: Toggle Manual Pro Override
export async function toggleProOverride(userId: string, currentState: boolean) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await verifyAdmin(user.id))) {
        throw new Error("Unauthorized");
    }

    const { error } = await adminSupabase
        .from('profiles')
        .update({ manual_pro_override: !currentState })
        .eq('id', userId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

// Action: Toggle Beta User
export async function toggleBetaUser(userId: string, currentState: boolean) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await verifyAdmin(user.id))) {
        throw new Error("Unauthorized");
    }

    const { error } = await adminSupabase
        .from('profiles')
        .update({ is_beta_user: !currentState })
        .eq('id', userId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

// Action: Update Subscription Tier Manually (in Subscriptions table)
export async function manualUpdateTier(userId: string, tier: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await verifyAdmin(user.id))) {
        throw new Error("Unauthorized");
    }

    // Determine status based on tier
    // If 'scout', we might remove or set to canceled/inactive?
    // If 'pro', set to active.

    // This is a manual override, so we create a 'manual' subscription record if none exists
    const status = 'active';

    const { error } = await adminSupabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            status: status,
            tier: tier,
            price_id: 'manual_override',
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }); // Assuming user_id unique for active sub or handle appropriately

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
        // Table might not exist yet if migration hasn't run
        console.warn("Feedback table error (likely migration pending):", error.message);
        return [];
    }
    return data;
}

// Action: Mark Feedback as Read
export async function markFeedbackRead(id: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await verifyAdmin(user.id))) {
        throw new Error("Unauthorized");
    }

    const { error } = await adminSupabase
        .from('feedback_messages')
        .update({ status: 'READ' })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

// Action: Delete Feedback
export async function deleteFeedback(id: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await verifyAdmin(user.id))) {
        throw new Error("Unauthorized");
    }

    const { error } = await adminSupabase
        .from('feedback_messages')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

