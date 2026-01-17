import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature');

    let event: Stripe.Event;

    try {
        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return new NextResponse('Webhook Error', { status: 400 });
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Handle Completed Checkout (Upgrade)
    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        if (!session?.metadata?.userId) {
            return new NextResponse('User id is required', { status: 400 });
        }

        const userId = session.metadata.userId; // Assuming userId passed in metadata

        // Find user by ID in Supabase Profiles and Update
        // Note: profiles table uses 'id' which matches auth.uid
        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: 'active',
                subscription_tier: 'pro',
            })
            .eq('id', userId);
    }

    // Handle Subscription Deleted (Downgrade/Cancel)
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;

        // We need to find the user associated with this customer ID
        // This assumes we stored stripe_customer_id in profiles, OR we can lookup by email if available, 
        // BUT reliable way is metadata if attached to sub, or storing customer_id.
        // For now, let's assume we can query profiles by stripe_customer_id IF we added it.
        // If not, we might be stuck. 
        // fallback: If metadata was passed to subscription creation, we can use it.
        const userId = subscription.metadata?.userId;

        if (userId) {
            await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_status: 'inactive',
                    subscription_tier: 'basic'
                })
                .eq('id', userId);
        }
    }

    return new NextResponse(null, { status: 200 });
}
