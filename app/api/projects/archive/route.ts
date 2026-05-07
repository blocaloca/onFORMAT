import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ADMIN_EMAILS = ['casteelio@gmail.com', 'davidcasteel@gmail.com'];

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function authenticateRequest(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return { user: null };

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: { user }, error } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) return { user: null };

    return { user };
}

async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const { data: project } = await supabaseAdmin
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

    if (!project) return false;
    if (project.user_id === userId) return true;

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_admin, email')
        .eq('id', userId)
        .single();

    return !!(profile?.is_admin || ADMIN_EMAILS.includes(profile?.email?.toLowerCase() ?? ''));
}

export async function POST(req: Request) {
    try {
        const { user } = await authenticateRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        if (!(await canAccessProject(user.id, id))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('projects')
            .update({ status: 'ARCHIVED' })
            .eq('id', id);

        if (error) {
            console.error('Project Archive Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Project archived' });
    } catch (error) {
        console.error('Server error archiving project:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
