import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isFounder } from '@/lib/permissions';

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!isFounder(user?.email)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Join with profiles to get email if possible, or just raw
    // Note: 'profiles' table join requires FK relationship in Supabase.
    // Our migration added FK to auth.users. Profiles also links to auth.users.
    // We can join if we set up the relation or just fetch raw.
    // Let's fetch raw and maybe profiles separately if needed, or rely on Supabase detection.
    // Actually, user_id is FK to auth.users. We can't join auth.users easily directly via standard client sometimes.
    // We'll rely on profiles table which should share ID.

    const { data, error } = await supabaseAdmin
        .from('feedback')
        .select(`
            *,
            profiles:user_id (
                email,
                full_name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        // Fallback if profiles relation not detected
        const { data: rawData, error: rawError } = await supabaseAdmin
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (rawError) return NextResponse.json({ error: rawError.message }, { status: 500 });
        return NextResponse.json(rawData);
    }

    return NextResponse.json(data);
}

export async function PUT(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!isFounder(user?.email)) return new NextResponse("Unauthorized", { status: 401 });

    const { id, status } = await req.json();

    const { error } = await supabaseAdmin
        .from('feedback')
        .update({ status })
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
