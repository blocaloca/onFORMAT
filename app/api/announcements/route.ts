import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Client for Admin Operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing!");
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function GET(req: NextRequest) {
    try {
        const { data, error } = await adminSupabase
            .from('announcements')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching announcement:', error);
            return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
        }

        return NextResponse.json(data || null);
    } catch (e: any) {
        console.error("GET Announcement Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { media_url, message, userId } = body;

        // 1. Verify Auth Token manually using Anon client + Token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization Header' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user) {
            console.error("Auth Error:", authError);
            return NextResponse.json({ error: 'Unauthorized: Invalid Session' }, { status: 401 });
        }

        // 2. Founder Bypass Check (Robust)
        // Check email directly from Auth Token to avoid "Profile not found" blocking the founder
        if (user.email === 'casteelio@gmail.com') {
            console.log("Announcement: Founder bypass authorized for", user.email);
            // Proceed without profile check
        } else {
            // 3. Admin Check (Standard)
            const { data: profile, error: profileError } = await adminSupabase
                .from('profiles')
                .select('email, is_admin')
                .eq('id', user.id)
                .single();

            if (profileError || !profile?.is_admin) {
                console.warn(`Unauthorized announcement attempt by ${user.email}`);
                return NextResponse.json({ error: 'Forbidden: Not a founder/admin' }, { status: 403 });
            }
        }

        // 3. Logic: Deactivate previous
        await adminSupabase.from('announcements').update({ active: false }).eq('active', true);

        // 4. Insert New
        const { data, error } = await adminSupabase
            .from('announcements')
            .insert({
                user_id: user.id, // Explicitly use user.id from token, not body
                media_url,
                message,
                active: true
            })
            .select()
            .single();

        if (error) {
            console.error("Insert Error:", error);
            throw error;
        }

        return NextResponse.json(data);

    } catch (e: any) {
        console.error('Error creating announcement:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
