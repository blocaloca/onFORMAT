import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Get the Profile to find Stripe Customer ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        // 2. If no ID in profile, try to find in Stripe by email
        if (!customerId) {
            console.log("Looking up customer by email...");
            const customers = await stripe.customers.list({
                email: user.email,
                limit: 1,
            });
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                // Update profile for next time
                await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
            }
        }

        // 3. If still no customer, creating a portal session will fail.
        // We can't let them manage billing if they have no billing history.
        // Redirect them to checkout (Upgrade) instead? Or show error.
        if (!customerId) {
            return NextResponse.json({ error: "No billing account found." }, { status: 404 });
        }

        // 4. Create Portal Session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (error: any) {
        console.error('Portal Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
