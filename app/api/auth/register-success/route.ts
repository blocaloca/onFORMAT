import { NextRequest, NextResponse } from 'next/server';
import { spawnDemoForUser } from '@/lib/spawn-logic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userEmail } = body;

        if (!userId || !userEmail) {
            return NextResponse.json({ error: 'userId and userEmail are required' }, { status: 400 });
        }

        // Trigger cloning logic in the background - we don't want to block the user.
        // We catch errors internally but return success to the UX.
        // If it's Next.js 15, we could use after() here if config allows.
        // For now, I'll use a simple "don't await" approach since this is a serverless context
        // and usually we'd want a more robust queuing system, but for this "Demo Project"
        // cloning should be reliable enough.

        // Actually, for consistency, let's just await it here but quickly.
        // In a real prod environment we'd use a background queue.
        const result = await spawnDemoForUser(userId, userEmail);

        if (result.error) {
            console.error('⚠️ Spawn-on-Signup failed for', userEmail, ':', result.error);
            // We still return 200 to not block the user's login experience if data clone failed.
            return NextResponse.json({ success: false, message: result.error });
        }

        return NextResponse.json({ success: true, projectId: result.projectId });

    } catch (err: any) {
        console.error('🚨 Error in register-success API:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
