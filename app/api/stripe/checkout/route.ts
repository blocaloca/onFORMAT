import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';
import { STRIPE_PLANS } from '@/lib/stripe-products';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { priceId } = body;

        // Use the configured Pro Plan ID as default
        const PRO_PRICE_ID = STRIPE_PLANS.pro.id;

        // Collect all valid price IDs
        const validPriceIds = Object.values(STRIPE_PLANS).map(plan => plan.id);

        if (priceId && !validPriceIds.includes(priceId)) {
            return new NextResponse('Invalid Price ID', { status: 400 });
        }

        const effectivePriceId = priceId || PRO_PRICE_ID;

        if (!effectivePriceId) {
            return new NextResponse('Price ID not configured', { status: 500 });
        }

        const headersList = await headers();
        const origin = headersList.get('origin') || 'http://localhost:3000';

        // Check if user already has a stripe customer id
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        let customerId = subscription?.stripe_customer_id;

        // If no customer ID in DB, we'll let Stripe create one, 
        // OR ideally we search Stripe by email, but for now specific flow:
        // Checkout session will create a guest if we don't pass customer, 
        // but we want to link it. 
        // Better: Create customer if not exists? 
        // Actually Stripe Checkout `customer_email` is enough to pre-fill, 
        // and we handle the `checkout.session.completed` to save the new customer ID.

        const sessionConfig: any = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: effectivePriceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
            },
            success_url: `${origin}/dashboard?success=true`,
            cancel_url: `${origin}/pricing?canceled=true`,
            customer_email: user.email,
        };

        // If we ALREADY have a striped_customer_id, pass it to avoid duplicates
        if (customerId) {
            sessionConfig.customer = customerId;
            delete sessionConfig.customer_email; // Cannot allow email update if customer is locked
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
