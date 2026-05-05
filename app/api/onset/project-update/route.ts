import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, data, email } = body;

        if (!id || !data) {
            return NextResponse.json({ error: 'Project ID and Data are required' }, { status: 400 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Verify the caller is a crew member of this project before allowing the write.
        // OnSet users have no JWT session (soft login via QR code), so RLS cannot protect
        // server-side writes. This crew_membership check is the security gate.
        const { data: membership } = await supabaseAdmin
            .from('crew_membership')
            .select('role')
            .eq('project_id', id)
            .ilike('user_email', email)
            .maybeSingle();

        if (!membership) {
            return NextResponse.json({ error: 'Forbidden: not a crew member of this project' }, { status: 403 });
        }

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
