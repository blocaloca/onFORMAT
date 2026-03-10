'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-products';
import { getClient } from '@/lib/supabase';

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabase = getClient()
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(data);
            }
        };
        getUser();
    }, []);

    const handleCheckout = async (priceId: string, buttonId: string) => {
        if (!user) {
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        setLoading(buttonId);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Network response was not ok');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Checkout failed. Please try again.');
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error launching checkout: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const isScout = user && (!profile || !profile.subscription_status || profile.subscription_tier === 'scout');
    const isPro = user && profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro';
    const isStudio = user && profile?.subscription_status === 'active' && profile?.subscription_tier === 'studio';

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans selection:bg-blue-500 selection:text-white pb-24">

            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 px-8 py-5 flex items-center justify-between bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200">
                <Link href="/" className="flex items-center group">
                    <img src="/octo%20logo%202-%20long.png" alt="onFORMAT Logo" className="h-[50px] md:h-[60px] w-auto object-contain" />
                </Link>
                <div className="flex items-center gap-8">
                    <Link href={user ? "/dashboard" : "/login"} className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                        {user ? "Back to Dashboard" : "Log In"} <ArrowRight size={14} />
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-40">

                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-zinc-900 uppercase">
                        Production-grade pricing.
                    </h1>
                </div>

                {/* PRICING MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* SOLO */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Solo Tier</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-zinc-950">$19</span>
                                <span className="text-xs font-bold text-zinc-400 uppercase">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10">
                                {['3 Active Projects'].map(f => (
                                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-600 uppercase tracking-tight">
                                        <Check size={14} className="text-zinc-400" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {isScout ? (
                            <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                                CURRENT PLAN
                            </button>
                        ) : (
                            <Link href="/login" className="block text-center w-full bg-zinc-900 text-white py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors">
                                {user ? "DOWNGRADE" : "GET STARTED"}
                            </Link>
                        )}
                    </div>

                    {/* PRO */}
                    <div className="bg-white border border-zinc-300 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:border-zinc-400 transition-colors">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">Pro Tier</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-zinc-950">$49</span>
                                <span className="text-xs font-bold text-zinc-400 uppercase">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10">
                                {['Unlimited Active Projects', 'Custom Studio Branding'].map(f => (
                                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-600 uppercase tracking-tight">
                                        <Check size={14} className="text-zinc-600" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {isPro ? (
                            <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                                CURRENT PLAN
                            </button>
                        ) : (
                            <button
                                onClick={() => handleCheckout(STRIPE_PLANS.pro.id, 'pro')}
                                disabled={loading === 'pro'}
                                className="w-full bg-blue-600 text-white py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading === 'pro' ? <Loader2 size={16} className="animate-spin" /> : "UPGRADE"}
                            </button>
                        )}
                    </div>

                    {/* STUDIO */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
                        {/* Overlay */}
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]"></div>

                        {/* Top Badge */}
                        <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-20 shadow-sm">
                            COMING SOON
                        </div>

                        <div className="relative z-0">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Studio Tier</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-zinc-400">$129</span>
                                <span className="text-xs font-bold text-zinc-400 uppercase">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10">
                                {['Unlimited Active Projects', '3 Producer Seats', 'Priority Support'].map(f => (
                                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-tight">
                                        <Check size={14} className="text-zinc-300" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button disabled className="relative z-20 w-full bg-zinc-200 text-zinc-500 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed border border-zinc-300">
                            COMING SOON
                        </button>
                    </div>

                </div>

                {/* FAQ Link Removed */}

            </div>
        </div>
    );
}
