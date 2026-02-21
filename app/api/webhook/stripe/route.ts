import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// We bypass RLS for webhook updates.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headerList = await headers();
        const signature = headerList.get('stripe-signature');

        if (!signature) {
            return new NextResponse('Webhook Error: Missing signature', { status: 400 });
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
        }

        const session = event.data.object as any;

        if (event.type === 'checkout.session.completed') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

            if (!session?.client_reference_id) {
                console.error("Webhook payload missing client_reference_id");
                return new NextResponse('Webhook Error: Missing client_reference_id', { status: 400 });
            }

            // Map Stripe Price ID back to our Plan Tier strings
            let planTier = 'PRO';
            const priceId = subscription.items.data[0].price.id;

            if (priceId === 'price_1SowpyC1rh6o9AP0vhmFIQ0f') planTier = 'SOLO';
            if (priceId === 'price_1T0VXAC1rh6o9AP033es5olH') planTier = 'PRO';
            if (priceId === 'price_1SowsKC1rh6o9AP08wa04r4r') planTier = 'STUDIO';

            // Insert into Database
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    stripe_customer_id: subscription.customer as string,
                    stripe_subscription_id: subscription.id,
                    plan_tier: planTier,
                    // Give them an absurdly long future date so Trial lockout falls away
                    trial_ends_at: new Date('2099-01-01').toISOString()
                })
                .eq('id', session.client_reference_id);

            if (error) {
                console.error('Error updating standard profile for completed checkout:', error);
                return new NextResponse('Webhook Update Error', { status: 500 });
            }

            return new NextResponse('Webhook successful', { status: 200 });
        }

        if (event.type === 'customer.subscription.updated') {
            // Handle future updates, card declines, etc.
            // We'd usually look up the customer and update their status.
        }

        return new NextResponse('Event Handled', { status: 200 });
    } catch (error: any) {
        console.error('Webhook payload error:', error);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
}
