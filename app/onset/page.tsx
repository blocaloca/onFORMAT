'use client';
import React, { useEffect, useState } from 'react';
import { Menu, ChevronRight, Clapperboard, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function OnSetPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false });

            if (data) {
                // Parse Settings & Filter
                const processed = data.map((p: any) => {
                    let settings = { isLive: false, themeColor: 'zinc' };
                    try {
                        let draft = p.data?.phases?.ON_SET?.drafts?.['onset-mobile-control'];
                        if (draft) {
                            let parsed = JSON.parse(draft);
                            // Handle Document Versions (Array)
                            if (Array.isArray(parsed)) {
                                parsed = parsed[0]; // Active version is usually index 0 in recent system
                            }
                            settings = { ...settings, ...parsed };
                        }
                    } catch (e) { /* ignore */ }
                    return { ...p, settings };
                }).filter((p: any) => true); // DEBUG: Show all to verify data

                setProjects(processed);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col max-w-md mx-auto border-x border-zinc-800 shadow-2xl relative">

            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-end bg-zinc-950 border-b border-zinc-900 sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-white mb-1">onSET</h1>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Mobile Companion</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <Menu size={16} />
                </div>
            </header>

            {/* Project List */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-6 h-6 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] uppercase font-bold text-zinc-600">Loading Productions...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">All Productions (Debug Mode)</h2>
                        {projects.length > 0 ? (
                            <div className="space-y-3">
                                {projects.map(p => {
                                    // Map Project Colors to Tailwind Styles
                                    // Colors: green, purple, orange, blue, red
                                    const baseColor = p?.data?.color || 'green';
                                    const isLive = p.settings?.isLive;

                                    const colorClasses: Record<string, string> = {
                                        green: 'bg-gradient-to-br from-emerald-800 to-emerald-950 border-emerald-500 shadow-lg shadow-emerald-900/40',
                                        emerald: 'bg-gradient-to-br from-emerald-800 to-emerald-950 border-emerald-500 shadow-lg shadow-emerald-900/40',

                                        purple: 'bg-gradient-to-br from-purple-800 to-purple-950 border-purple-500 shadow-lg shadow-purple-900/40',

                                        orange: 'bg-gradient-to-br from-amber-700 to-amber-950 border-amber-500 shadow-lg shadow-amber-900/40',
                                        amber: 'bg-gradient-to-br from-amber-700 to-amber-950 border-amber-500 shadow-lg shadow-amber-900/40',

                                        blue: 'bg-gradient-to-br from-blue-800 to-blue-950 border-blue-500 shadow-lg shadow-blue-900/40',
                                        indio: 'bg-gradient-to-br from-indigo-800 to-indigo-950 border-indigo-500 shadow-lg shadow-indigo-900/40',

                                        red: 'bg-gradient-to-br from-red-800 to-red-950 border-red-500 shadow-lg shadow-red-900/40',
                                        rose: 'bg-gradient-to-br from-rose-800 to-rose-950 border-rose-500 shadow-lg shadow-rose-900/40',
                                    };

                                    const textColors: Record<string, string> = {
                                        green: 'text-white',
                                        emerald: 'text-white',
                                        purple: 'text-white',
                                        orange: 'text-white',
                                        amber: 'text-white',
                                        blue: 'text-white',
                                        red: 'text-white',
                                        rose: 'text-white',
                                        indio: 'text-white'
                                    };

                                    return (
                                        <Link key={p.id} href={`/onset/${p.id}`}>
                                            <div className={`group p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden ${colorClasses[baseColor] || colorClasses.green} ${!isLive ? 'opacity-80 grayscale contrast-125' : ''}`}>

                                                {/* Status Dot */}
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    <span className={`text-[9px] font-bold uppercase ${isLive ? 'text-white animate-pulse shadow-glow' : 'text-white/60'} transition-colors`}>
                                                        {isLive ? 'LIVE' : 'OFFLINE'}
                                                    </span>
                                                    <ChevronRight size={14} className="text-white/70 group-hover:text-white transition-colors" />
                                                </div>

                                                <h3 className={`text-xl font-black text-white mb-1 tracking-tight`}>{p.name || 'Untitled Project'}</h3>
                                                <p className="text-[10px] font-mono text-white/70 mb-6 uppercase tracking-wider font-bold">{p.client_name || 'Internal'}</p>

                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-1.5 text-white/90 bg-black/20 px-3 py-1.5 rounded-sm backdrop-blur-sm border border-white/10 shadow-sm">
                                                        <Clapperboard size={14} />
                                                        <span className="text-[10px] font-bold">SHOTS</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-white/90 bg-black/20 px-3 py-1.5 rounded-sm backdrop-blur-sm border border-white/10 shadow-sm">
                                                        <Calendar size={14} />
                                                        <span className="text-[10px] font-bold">DOCS</span>
                                                    </div>
                                                </div>

                                                {/* DEBUG INFO */}
                                                <div className="mt-4 pt-2 border-t border-white/20 text-[8px] font-mono text-white/50 break-all leading-tight">
                                                    DEBUG: Color=[{p.color}] Live=[{String(isLive)}] <br />
                                                    Settings: {JSON.stringify(p.settings).slice(0, 50)}...
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                                <p className="text-sm font-bold text-zinc-400 mb-1">No Projects Found</p>
                                <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto">Create a project in the Desktop App to see it here.</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <div className="p-6 text-center border-t border-zinc-900 bg-zinc-950">
                <p className="text-[9px] text-zinc-600 font-mono">
                    Logged in as User (Dev) <br />
                    v0.9 Beta
                </p>
            </div>
        </div>
    );
}
