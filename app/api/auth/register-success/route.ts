import { NextRequest, NextResponse } from 'next/server';
import { spawnDemoForUser } from '@/lib/spawn-logic';
import { sendEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userEmail } = body;

        if (!userId || !userEmail) {
            return NextResponse.json({ error: 'userId and userEmail are required' }, { status: 400 });
        }

        // 1. Spawn Demo Project
        const result = await spawnDemoForUser(userId, userEmail);

        if (result.error) {
            console.error('⚠️ Spawn-on-Signup failed for', userEmail, ':', result.error);
            return NextResponse.json({ success: false, message: result.error });
        }

        // 2. Send Welcome Email via Resend
        try {
            await sendEmail({
                to: userEmail,
                subject: '🎨 Welcome to the onFORMAT Beta!',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h1 style="color: #4F46E5;">Welcome to the Pioneer Phase.</h1>
                        <p>Hello,</p>
                        <p>Your onFORMAT workspace has been successfully initialized. We've spawned a <strong>Demo Project</strong> for you to explore the tactical production toolset.</p>
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>Check out the <strong>Creative Brief</strong> in your dashboard.</li>
                            <li>Explore the <strong>OnSet Mobile</strong> interface via the QR codes in your control panel.</li>
                            <li>Give us feedback using the "Beta Feedback" button!</li>
                        </ul>
                        <p>We are excited to see what you build.</p>
                        <br/>
                        <p>Best regards,<br/>The onFORMAT Team</p>
                    </div>
                `
            });
            console.log("✅ Welcome email dispatched to", userEmail);
        } catch (emailErr) {
            console.warn("⚠️ Failed to send welcome email:", emailErr);
        }

        return NextResponse.json({ success: true, projectId: result.projectId });

    } catch (err: any) {
        console.error('🚨 Error in register-success API:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
