import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Client for Admin Operations (Bypass RLS for writing if needed, but standard auth is better if policy allows)
// We'll use service role strictly for administrative POSTs if necessary, or just rely on the user's session.
// For now, let's use the standard client pattern but maybe elevate if the user proves to be admin.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        // Fetch the latest active announcement
        const { data, error } = await adminSupabase
            .from('announcements')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error('Error fetching announcement:', error);
            return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
        }

        return NextResponse.json(data || null); // Return null if no active announcement
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { media_url, message, userId } = body;

        // Simple Admin Check (Hardcoded for now as requested/planned)
        // Ideally we check the user's role in 'profiles' table via DB first
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('email, is_admin')
            .eq('id', userId)
            .single();

        // Allow if is_admin OR specific email
        const isAdmin = profile?.is_admin || profile?.email === 'davidcasteel@gmail.com' || profile?.email === 'casteelio@gmail.com'; // Adjust email as needed

        if (!isAdmin) {
            console.warn(`Unauthorized announcement attempt by ${userId}`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Deactivate previous active announcements? 
        // Or just let the latest one be the "active" one by sort order.
        // Let's set previous ones to inactive to be clean.
        await adminSupabase.from('announcements').update({ active: false }).eq('active', true);

        // Insert new announcement
        const { data, error } = await adminSupabase
            .from('announcements')
            .insert({
                media_url,
                message,
                active: true
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);

    } catch (e: any) {
        console.error('Error creating announcement:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
