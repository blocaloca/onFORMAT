'use client';

import React, { useState } from 'react';
import { Check, Loader2, Sparkles, User, Database, Film, Shield } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-products';

export default function PricingPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: STRIPE_PLANS.pro.id
                })
            });

            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handleManage = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 px-8 py-16 text-center">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-4">Upgrade Your OS</h1>
                <p className="text-zinc-500 max-w-2xl mx-auto">Unlock the full power of the Creative Operating System. Unlimited projects, advanced tools, and premium support.</p>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* SCOUT PLAN */}
                <div className="bg-white rounded-2xl p-8 border border-zinc-200 flex flex-col items-start relative overflow-hidden group hover:border-zinc-300 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <User size={120} />
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">Basic</h3>
                    <h2 className="text-3xl font-black uppercase tracking-widest mb-6">Scout</h2>
                    <div className="text-5xl font-black mb-1">Free</div>
                    <div className="text-zinc-400 text-sm mb-8">Forever</div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <Check size={16} className="text-zinc-300" />
                            <span>Up to 3 Active Projects</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <Check size={16} className="text-zinc-300" />
                            <span>Basic Document Templates</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <Check size={16} className="text-zinc-300" />
                            <span>Standard PDF Exports</span>
                        </li>
                    </ul>

                    <button disabled className="w-full py-4 border-2 border-zinc-100 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl cursor-not-allowed">
                        Current Plan
                    </button>
                </div>

                {/* PRO PLAN */}
                <div className="bg-zinc-900 text-white rounded-2xl p-8 border border-zinc-900 flex flex-col items-start relative overflow-hidden shadow-xl transform md:scale-105">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                        <Sparkles size={14} /> Most Popular
                    </h3>
                    <h2 className="text-3xl font-black uppercase tracking-widest mb-6">Pro</h2>
                    <div className="text-5xl font-black mb-1">$29</div>
                    <div className="text-zinc-500 text-sm mb-8">Per Month</div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <div className="bg-indigo-500/20 p-1 rounded-full text-indigo-400"><Check size={12} /></div>
                            <span>Unlimited Projects</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <div className="bg-indigo-500/20 p-1 rounded-full text-indigo-400"><Check size={12} /></div>
                            <span>Advanced AI Tools & Generation</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <div className="bg-indigo-500/20 p-1 rounded-full text-indigo-400"><Check size={12} /></div>
                            <span>Custom Branding on PDFs</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <div className="bg-indigo-500/20 p-1 rounded-full text-indigo-400"><Check size={12} /></div>
                            <span>Client View Links</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium">
                            <div className="bg-indigo-500/20 p-1 rounded-full text-indigo-400"><Check size={12} /></div>
                            <span>Priority Support</span>
                        </li>
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Upgrade Now
                    </button>
                </div>

            </div>

            {/* FAQ / Trust Section */}
            <div className="max-w-3xl mx-auto px-8 py-12 text-center border-t border-zinc-200 mt-8">
                <div className="flex justify-center gap-8 mb-8 text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                        <Shield size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Database size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted Data</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Film size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Industry Standard</span>
                    </div>
                </div>
                <p className="text-xs text-zinc-400">
                    Recurring billing. Cancel anytime. All prices in USD.
                </p>
            </div>
        </div>
    );
}
