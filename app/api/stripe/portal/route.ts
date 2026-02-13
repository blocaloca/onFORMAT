import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!subscription?.stripe_customer_id) {
            return new NextResponse('User does not have a subscription', { status: 400 });
        }

        const headersList = await headers();
        const origin = headersList.get('origin') || 'http://localhost:3000';

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${origin}/dashboard`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('[STRIPE_PORTAL]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
