'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Loader2, ArrowRight } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-products';
import { supabase } from '@/lib/supabase';

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleCheckout = async (priceId: string) => {
        if (!user) {
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Checkout failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black">

            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 relative">
                        <img src="/logo-white.png" alt="onFORMAT" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase">Pricing</span>
                </Link>
                <Link href={user ? "/dashboard" : "/login"} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                    {user ? "Back to Dashboard" : "Log In"}
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto px-8 pt-32 pb-20">

                {/* Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-light mb-6 tracking-wide">
                        Production-grade pricing.
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
                        Start for free, upgrade when you need the power. No hidden fees, cancel anytime.
                    </p>
                </div>

                {/* Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                    {/* SCOUT (Free) */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Scout</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-light text-white">$0</span>
                                <span className="text-sm text-zinc-500 font-mono">/mo</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
                                Perfect for independent producers just getting started with the system.
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <ul className="space-y-3">
                                {STRIPE_PLANS.free.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                        <Check size={16} className="mt-0.5 text-zinc-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href={user ? "/dashboard" : "/signup"}
                            className="block w-full text-center py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors"
                        >
                            {user ? "Plan Active" : "Start For Free"}
                        </Link>
                    </div>

                    {/* PRO (Paid) */}
                    <div className="bg-black border border-emerald-900/50 rounded-2xl p-8 relative overflow-hidden ring-1 ring-emerald-500/20 shadow-2xl shadow-emerald-900/10 scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                            Most Popular
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-2">Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-light text-white">$15</span>
                                <span className="text-sm text-zinc-500 font-mono">/mo</span>
                            </div>
                            <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                                For working producers managing multiple active projects.
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <ul className="space-y-3">
                                {STRIPE_PLANS.pro.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-white">
                                        <Check size={16} className="mt-0.5 text-emerald-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => handleCheckout(STRIPE_PLANS.pro.id)}
                            disabled={loading}
                            className="w-full py-4 bg-white text-black hover:bg-emerald-400 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Upgrade to Pro"}
                        </button>
                    </div>

                    {/* STUDIO (Top) */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-2">Studio</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-light text-white">$29</span>
                                <span className="text-sm text-zinc-500 font-mono">/mo</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
                                Unlimited power for production companies and heavy users.
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <ul className="space-y-3">
                                {STRIPE_PLANS.studio.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                        <Check size={16} className="mt-0.5 text-purple-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => handleCheckout(STRIPE_PLANS.studio.id)}
                            disabled={loading}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Upgrade to Studio"}
                        </button>
                    </div>

                </div>

                {/* FAQ Link */}
                <div className="mt-20 text-center border-t border-zinc-800 pt-12">
                    <p className="text-zinc-500 text-sm mb-4">
                        Have questions about the plans?
                    </p>
                    <Link href="/support" className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs border-b border-white/20 pb-1 hover:border-white transition-colors">
                        Visit Support Center <ArrowRight size={14} />
                    </Link>
                </div>

            </div>
        </div>
    );
}
