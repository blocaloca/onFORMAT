import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronUp, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FeedbackDialog } from '@/components/dashboard/FeedbackDialog';
import { isFounder } from '@/lib/permissions';

import { getClient } from '@/lib/supabase';

export const UserMenu = ({ email }: { email?: string }) => {
    const router = useRouter();
    const supabase = getClient();
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
        // Explicit Presence Cleanup
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // 1. Untrack from Realtime Channels
            const channels = supabase.getChannels();
            for (const channel of channels) {
                await channel.untrack();
            }
            await supabase.removeAllChannels();

            // 2. DB Status Update (Best Effort - might fail if RLS prevents cross-project update without ID)
            // We try to update ALL memberships for this user to offline.
            await supabase
                .from('crew_membership')
                .update({ is_online: false })
                .eq('user_email', user.email);
        }

        await supabase.auth.signOut();

        // Zombie Verification: Explicitly clear client storage
        localStorage.clear();

        // Nuclear Logout: Trigger Server Route for 303 Hard Refresh
        // router.push('/login'); // REPLACED
        window.location.href = '/api/auth/logout';
    };

    return (
        <>
            <div className="relative mt-auto p-4 border-t border-zinc-300 bg-zinc-100">
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
                        </div>
                        {isFounder(email) && (
                            <div className="border-t border-zinc-800 py-1">
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="w-full text-left px-4 py-2 text-xs text-purple-400 hover:bg-zinc-800 hover:text-purple-300 flex items-center gap-2 transition-colors"
                                >
                                    Admin Console
                                </button>
                            </div>
                        )}
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
                    className={`w-full flex items-center gap-3 p-2 rounded-sm transition-all border ${isOpen ? 'bg-zinc-200 border-zinc-300' : 'hover:bg-zinc-200/50 border-transparent hover:border-zinc-300'}`}
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-600 font-bold text-xs shadow-inner">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{email ? email[0].toUpperCase() : 'U'}</span>
                        )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-zinc-700 truncate tracking-wide">Account</p>
                            {isFounder(email) && <span className="bg-zinc-800 text-white px-1 py-0.5 text-[8px] rounded uppercase font-mono tracking-widest leading-none translate-y-px">Founder</span>}
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">{email || 'user@example.com'}</p>
                    </div>
                    <ChevronUp size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <FeedbackDialog isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        </>
    );
};
