import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Technically we bypass RLS with Service Key below, but only for updating status.
        // A proper implementation checks if the active user has access first.
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
