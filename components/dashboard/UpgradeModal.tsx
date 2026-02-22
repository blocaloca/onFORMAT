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
            <div className="relative w-full max-w-lg bg-zinc-50 border border-zinc-200 shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300">

                <div className="p-8 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                            <Sparkles className="text-blue-500" size={24} />
                        </div>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 p-2 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-sans font-bold text-zinc-950 uppercase tracking-tight mb-2 relative z-10">
                        Project Limit Reached
                    </h2>
                    <p className="text-zinc-600 text-sm leading-relaxed mb-8 relative z-10">
                        You have reached the maximum number of active projects for your current plan. Upgrade your account to unlock unlimited project capacity and advanced production tools.
                    </p>

                    <div className="space-y-3 mb-8 relative z-10">
                        <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            <span>Unlimited Active Projects</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            <span>Team Collaboration & Crew Roles</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            <span>Premium Document Templates</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        <button
                            onClick={() => router.push('/account')}
                            className="w-full py-4 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors rounded-lg shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 group"
                        >
                            <span>Upgrade Account</span>
                            <Sparkles size={14} className="group-hover:block text-white animate-pulse" />
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-zinc-200 text-zinc-800 font-bold uppercase tracking-widest text-xs hover:bg-zinc-300 transition-colors rounded-lg flex items-center justify-center"
                        >
                            Return to Dashboard
                        </button>
                    </div>

                    <p className="text-center mt-6 text-[10px] text-zinc-400 uppercase tracking-widest font-bold relative z-10">
                        Secure Billing • Pro Plan
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};
