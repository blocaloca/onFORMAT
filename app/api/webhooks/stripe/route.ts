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

    try {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = event.data.object as Stripe.Subscription;

        // 1. Checkout Completed -> Create Subscription Record
        if (event.type === 'checkout.session.completed') {
            const subscriptionId = session.subscription as string;
            const userId = session.metadata?.userId;

            if (!userId) {
                return new NextResponse('User id is required', { status: 400 });
            }

            const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);

            await supabaseAdmin.from('subscriptions').upsert({
                user_id: userId,
                stripe_customer_id: subscriptionDetails.customer as string,
                stripe_subscription_id: subscriptionId,
                status: subscriptionDetails.status,
                price_id: subscriptionDetails.items.data[0].price.id,
                tier: 'pro', // Map price ID to tier if needed, defaulting to pro for now
                currency: subscriptionDetails.currency,
                interval: subscriptionDetails.items.data[0].plan.interval,
                period_start: new Date((subscriptionDetails as any).current_period_start * 1000).toISOString(),
                period_end: new Date((subscriptionDetails as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscriptionDetails.cancel_at_period_end,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Sync legacy profile status just in case
            await supabaseAdmin.from('profiles').update({ subscription_status: 'active', subscription_tier: 'pro' }).eq('id', userId);
        }

        // 2. Subscription Updated -> Sync Status
        if (event.type === 'customer.subscription.updated') {
            const sub = event.data.object as Stripe.Subscription;

            await supabaseAdmin.from('subscriptions').update({
                status: sub.status,
                price_id: sub.items.data[0].price.id,
                period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
                period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: sub.cancel_at_period_end,
                updated_at: new Date().toISOString()
            }).eq('stripe_subscription_id', sub.id);
        }

        // 3. Subscription Deleted -> Cancel
        if (event.type === 'customer.subscription.deleted') {
            const sub = event.data.object as Stripe.Subscription;

            await supabaseAdmin.from('subscriptions').update({
                status: 'canceled',
                cancel_at_period_end: false,
                updated_at: new Date().toISOString()
            }).eq('stripe_subscription_id', sub.id);

            // Sync legacy profile
            // We need to find the user via subscription ID if metadata is missing on delete event
            // But usually we can query the subscription table to get the user_id if needed.
            // For now, relies on subscription table being source of truth.
        }

        return new NextResponse(null, { status: 200 });

    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
}
