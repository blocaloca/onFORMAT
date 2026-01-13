import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const userId = session.client_reference_id; // We MUST pass this when creating session on client

        if (userId) {
            await supabaseAdmin.from('profiles').update({
                stripe_customer_id: customerId,
                subscription_status: 'active',
            }).eq('id', userId);
            console.log(`Updated profile for user ${userId} with customer ${customerId}`);
        } else {
            console.warn("No client_reference_id found in session");
        }
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabaseAdmin.from('profiles').update({
            subscription_status: subscription.status
        }).eq('stripe_customer_id', customerId);

        if (error) console.error("Error updating profile subscription status:", error);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabaseAdmin.from('profiles').update({
            subscription_status: 'canceled'
        }).eq('stripe_customer_id', customerId);
    }

    return NextResponse.json({ result: event, ok: true });
}
