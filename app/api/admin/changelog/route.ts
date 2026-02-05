import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isFounder } from '@/lib/permissions';

export async function GET(req: Request) {
    const { data, error } = await supabaseAdmin
        .from('changelog')
        .select('*')
        .order('date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!isFounder(user?.email)) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json(); // { version, notes, date }

    const { error } = await supabaseAdmin
        .from('changelog')
        .insert(body);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
