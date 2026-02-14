import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, CheckCircle2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export const UpgradeModal = ({ isOpen, onClose, title, description }: UpgradeModalProps) => {
    const router = useRouter();

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        try {
            const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;

            // Fallback for Demo/Beta if env var not set
            if (!priceId) {
                console.warn('Stripe Price ID not found. Using Free/Beta flow for testing.');
                // Trigger checkout for whatever is configured or alert
                alert("This is a demo. In production, this redirects to Stripe.");
                return;
            }

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId })
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e: any) {
            console.error(e);
            alert("Checkout Error: " + e.message);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#09090b] border border-zinc-800 shadow-[0_0_100px_-20px_rgba(16,185,129,0.2)] rounded-lg overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300">

                {/* Decorative Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-900" />

                <div className="p-8 relative overflow-hidden">
                    {/* Background glow effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center mb-4">
                            <Sparkles className="text-emerald-500" size={24} />
                        </div>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 relative z-10">
                        Project Limit Reached
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 relative z-10">
                        You have reached the maximum number of active projects for your current plan. Upgrade to unlock more capacity.
                    </p>

                    <div className="space-y-3 mb-8 relative z-10">
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Increase Project Limits</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Team Collaboration & Roles</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Advanced Features</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/account')}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors rounded-sm shadow-lg shadow-white/5 relative z-10 flex items-center justify-center gap-2 group"
                    >
                        <span>Manage Subscription</span>
                        <Sparkles size={14} className="hidden group-hover:block text-emerald-600 animate-pulse" />
                    </button>

                    <p className="text-center mt-4 text-[10px] text-zinc-500 uppercase tracking-widest relative z-10">
                        Cancel Anytime • Include 14-Day Money Back Guarantee
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};
