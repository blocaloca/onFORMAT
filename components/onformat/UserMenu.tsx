import React, { useState, useEffect } from 'react';
import { User, CreditCard, Settings, Users, LogOut, ChevronUp, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FeedbackDialog } from '@/components/dashboard/FeedbackDialog';

import { supabase } from '@/lib/supabase';

export const UserMenu = ({ email }: { email?: string }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
                if (data?.avatar_url) setAvatarUrl(data.avatar_url);
            }
        };
        fetchAvatar();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <>
            <div className="relative mt-auto p-4 border-t border-transparent bg-zinc-900">
                {/* Popover */}
                {isOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-sm overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-3 border-b border-zinc-800 bg-zinc-950">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Signed in as</p>
                            <p className="text-xs text-white truncate font-mono">{email || 'user@onset.com'}</p>
                        </div>
                        <div className="py-1">
                            <button
                                onClick={() => router.push('/account')}
                                className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                            >
                                <User size={14} /> Account & Billing
                            </button>
                            <button
                                onClick={async () => {
                                    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE;
                                    if (!priceId) {
                                        alert("Beta Access is not configured yet.");
                                        return;
                                    }
                                    try {
                                        const res = await fetch('/api/checkout', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ priceId })
                                        });
                                        const data = await res.json();
                                        if (data.url) window.location.href = data.url;
                                    } catch (e) {
                                        console.error(e);
                                        alert("Failed to start checkout");
                                    }
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                            >
                                <CreditCard size={14} /> Upgrade to Pro
                            </button>
                        </div>
                        <div className="border-t border-zinc-800 py-1">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsFeedbackOpen(true);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-emerald-400 hover:bg-zinc-800 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                            >
                                <MessageSquare size={14} /> Send Feedback
                            </button>
                        </div>
                        <div className="border-t border-zinc-800 py-1">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 transition-colors"
                            >
                                <LogOut size={14} /> Log Out
                            </button>
                        </div>
                    </div>
                )}

                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center gap-3 p-2 rounded-sm transition-all border ${isOpen ? 'bg-zinc-800 border-zinc-600' : 'hover:bg-zinc-800/50 border-transparent hover:border-zinc-700'}`}
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{email ? email[0].toUpperCase() : 'U'}</span>
                        )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-bold text-zinc-200 truncate tracking-wide">Account</p>
                        <p className="text-[10px] text-zinc-400 truncate">{email || 'user@example.com'}</p>
                    </div>
                    <ChevronUp size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <FeedbackDialog isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        </>
    );
};
