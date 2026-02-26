import { NextResponse } from 'next/server';
import { getClient } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = getClient();

        // Find projects where the user is listed in crew_membership
        const { data: memberships, error: memberError } = await supabase
            .from('crew_membership')
            .select('project_id, role, is_online')
            .ilike('user_email', email);

        if (memberError) {
            console.error("Membership error:", memberError);
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }

        if (!memberships || memberships.length === 0) {
            return NextResponse.json({ projects: [] });
        }

        const projectIds = memberships.map(m => m.project_id);

        // Fetch actual project details
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id, name')
            .in('id', projectIds);

        if (projectError) {
            return NextResponse.json({ error: projectError.message }, { status: 500 });
        }

        return NextResponse.json({ projects: projects || [] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
    }
}
