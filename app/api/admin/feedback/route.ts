import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const id = formData.get('id') as string;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === 'read') {
      await supabase.from('feedback_messages').update({ status: 'read' }).eq('id', id);
    } else if (action === 'delete') {
      await supabase.from('feedback_messages').delete().eq('id', id);
    }

    return NextResponse.redirect(new URL('/admin', request.url), 303);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}