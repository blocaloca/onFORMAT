'use client';
import React, { useEffect, useState } from 'react';
import { Menu, ChevronRight, Clapperboard, Calendar, LogOut, UserCircle, Wifi, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function OnSetPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        // Identity Check
        const stored = localStorage.getItem('onset_user_email');
        if (stored) setUserEmail(stored);
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false });

            if (data) {
                // Parse Settings & Filter for LIVE projects
                const processed = data.map((p: any) => {
                    let settings = { isLive: false };
                    try {
                        let draft = p.data?.phases?.ON_SET?.drafts?.['onset-mobile-control'];
                        if (draft) {
                            let parsed = JSON.parse(draft);
                            if (Array.isArray(parsed)) parsed = parsed[0];
                            settings = { ...settings, ...parsed };
                        }
                    } catch (e) { /* ignore */ }
                    return { ...p, settings };
                }).filter((p: any) => p.settings.isLive);

                setProjects(processed);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('onset_user_email');
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:max-w-md md:mx-auto md:border-x md:border-zinc-800 shadow-2xl relative overflow-x-hidden pl-safe pr-safe">

            {/* Header */}
            <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-20 pt-safe transition-all">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/onset_logo.png" className="h-6 w-auto object-contain" alt="onSET" />
                        <div className="h-4 w-[1px] bg-zinc-700"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-none">Mobile Companion</span>
                    </div>
                    <button
                        onClick={() => setShowMenu(true)}
                        className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </header>

            {/* Menu Drawer */}
            {showMenu && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="relative w-4/5 max-w-xs h-full bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-8 pt-safe">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">System</h2>
                            <button onClick={() => setShowMenu(false)} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <UserCircle size={24} className="text-emerald-500" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate">Connected As</p>
                                        <p className="text-[10px] font-mono text-zinc-500 truncate">{userEmail || 'Guest'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider bg-black/20 p-3 rounded-lg border border-zinc-800/50">
                                    <span className="flex items-center gap-2"><Wifi size={14} /> Network</span>
                                    <span className="text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 box-shadow-glow"></span> Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-6 pb-safe">
                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                                <LogOut size={14} /> Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Project List */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto pb-safe">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-8 h-8 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] uppercase font-bold text-zinc-600 animate-pulse">Scanning...</p>
                    </div>
                ) : (
                    <>
                        {projects.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Productions</h2>
                                    <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">{projects.length} LIVE</span>
                                </div>

                                {projects.map(p => {
                                    // Dynamic Gradients based on project color if available, else Emerald default
                                    return (
                                        <Link key={p.id} href={`/onset/${p.id}`}>
                                            <div className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-900/10">
                                                {/* Background Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-black opacity-100 group-hover:opacity-0 transition-opacity" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="relative p-5">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/5">
                                                            <p className="text-[9px] font-mono text-white/80 uppercase tracking-wider font-bold">{p.client_name || 'Production'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                                            <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-wide">Live</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-50 transition-colors">{p.name || 'Untitled Project'}</h3>

                                                    <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent my-4"></div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-emerald-500">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4 decoration-emerald-500/50">Enter Production</span>
                                                        </div>
                                                        <ChevronRight className="text-zinc-600 group-hover:text-emerald-500 transition-all transform group-hover:translate-x-1" size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                                <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 text-zinc-600 border border-zinc-800">
                                    <Clapperboard size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">No Active Productions</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px]">
                                    Productions must be set to <span className="text-emerald-500 font-bold">LIVE</span> in the Desktop Control Panel to appear here.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <div className="p-6 text-center border-t border-zinc-900 bg-black pb-safe">
                <p className="text-[9px] text-zinc-700 font-mono uppercase tracking-widest">
                    onFORMAT Mobile v1.0
                </p>
            </div>
        </div>
    );
}
