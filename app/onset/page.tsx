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
                        const draft = p.phases?.ON_SET?.drafts?.['onset-mobile-control'];
                        if (draft) {
                            const parsed = JSON.parse(draft);
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
                                    const baseColor = p?.color || 'green';
                                    const isLive = p.settings?.isLive;

                                    const colorClasses: Record<string, string> = {
                                        green: 'border-emerald-900/50 hover:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
                                        purple: 'border-purple-900/50 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
                                        orange: 'border-amber-900/50 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
                                        blue: 'border-blue-900/50 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                                        red: 'border-red-900/50 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
                                    };

                                    const textColors: Record<string, string> = {
                                        green: 'text-emerald-400',
                                        purple: 'text-purple-400',
                                        orange: 'text-amber-400',
                                        blue: 'text-blue-400',
                                        red: 'text-red-400',
                                    };

                                    return (
                                        <Link key={p.id} href={`/onset/${p.id}`}>
                                            <div className={`group bg-zinc-900 hover:bg-zinc-900 border p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden ${colorClasses[baseColor] || colorClasses.green} ${!isLive ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>

                                                {/* Status Dot */}
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    <span className={`text-[9px] font-bold uppercase ${isLive ? 'text-emerald-500' : 'text-red-500'} transition-colors`}>
                                                        {isLive ? 'LIVE' : 'OFFLINE'}
                                                    </span>
                                                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                                                </div>

                                                <h3 className={`text-lg font-black text-white mb-1 group-hover:${textColors[baseColor] || 'text-emerald-400'} transition-colors`}>{p.name || 'Untitled Project'}</h3>
                                                <p className="text-[10px] font-mono text-zinc-500 mb-4 uppercase">{p.client_name || 'Internal'}</p>

                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-1.5 text-zinc-500 bg-black/30 px-2 py-1 rounded">
                                                        <Clapperboard size={12} />
                                                        <span className="text-[9px] font-bold">SHOTS</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-zinc-500 bg-black/30 px-2 py-1 rounded">
                                                        <Calendar size={12} />
                                                        <span className="text-[9px] font-bold">DOCS</span>
                                                    </div>
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
