import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const email = searchParams.get('email');

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // 1. Bypass RLS to allow onset mobile clients to fetch project data.
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("[Onset Project API] Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Resolve Role Server-Side to Bypass RLS
        let role = null;
        if (email) {
            const { data: crew } = await supabaseAdmin
                .from('crew_membership')
                .select('role')
                .eq('project_id', id)
                .ilike('user_email', email)
                .maybeSingle();
            
            if (crew) {
                role = crew.role;
            }
        }

        return NextResponse.json({ data, _roleFromDB: role });
    } catch (e: any) {
        console.error("[Onset Project API] Exception:", e);
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
    }
}
