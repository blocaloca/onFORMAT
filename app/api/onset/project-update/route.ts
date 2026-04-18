import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, data, email } = body;

        if (!id || !data) {
            return NextResponse.json({ error: 'Project ID and Data are required' }, { status: 400 });
        }

        // Optional: Could verify that the email is in crew_membership here for security.
        // For now, we trust the client logic as it was prior to RLS.

        // Bypass RLS to allow onset mobile clients to update project data.
        const { data: updatedProject, error } = await supabaseAdmin
            .from('projects')
            .update({ data })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error("[Onset Project Update API] Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ project: updatedProject });
    } catch (e: any) {
        console.error("[Onset Project Update API] Exception:", e);
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
    }
}
