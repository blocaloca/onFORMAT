'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Clapperboard, List, Calendar, ChevronLeft, ChevronRight, Menu, FileText } from 'lucide-react';

/* --------------------------------------------------------------------------------
 * TYPES
 * -------------------------------------------------------------------------------- */
type Tab = 'SCRIPT' | 'SHOTS' | 'CALLSHEET';

interface MobileState {
    script: any | null;
    shots: any | null;
    callSheet: any | null;
    project: any | null;
}

/* --------------------------------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------------------------------- */
export default function OnSetMobilePage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('SCRIPT');
    const [data, setData] = useState<MobileState>({ script: null, shots: null, callSheet: null, project: null });

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const { data: projectData, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !projectData) throw new Error("Project not found");

            // Parse specific drafts
            const drafts = projectData.data?.phases ? {
                ...projectData.data.phases.DEVELOPMENT.drafts,
                ...projectData.data.phases.PRE_PRODUCTION.drafts,
                ...projectData.data.phases.ON_SET.drafts,
            } : {};

            setData({
                project: projectData,
                script: safeParse(drafts['av-script']),
                shots: safeParse(drafts['shot-scene-book']),
                callSheet: safeParse(drafts['call-sheet'])
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const safeParse = (json: string) => {
        if (!json) return null;
        try { return JSON.parse(json); } catch { return null; }
    };

    if (loading) {
        return (
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <img src="/onset_logo.png" className="w-16 animate-pulse opacity-50" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Connecting/...</p>
            </div>
        );
    }

    if (!data.project) {
        return (
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-bold uppercase text-red-500">Project Not Found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">

            {/* HERDER */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <img src="/onset_logo.png" className="h-6 w-auto" alt="onSET" />
                    <div className="h-4 w-[1px] bg-zinc-700"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white leading-none mb-0.5">{data.project.name}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono text-emerald-500 uppercase leading-none">Live Sync</span>
                        </div>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Menu size={14} />
                </div>
            </header>

            {/* CONFIDENTIAL BANNER */}
            <div className="bg-stripes-zinc text-center py-1 border-b border-zinc-800">
                <p className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-600">Confidential Materials • {new Date().getFullYear()}</p>
            </div>

            {/* MAIN CONTENT SCROLLER */}
            <main className="flex-1 overflow-y-auto pb-24 touch-pan-y relative">

                {activeTab === 'SCRIPT' && <ScriptView data={data.script} />}
                {activeTab === 'SHOTS' && <ShotListView data={data.shots} />}
                {activeTab === 'CALLSHEET' && <CallSheetView data={data.callSheet} />}

            </main>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around z-50 pb-safe">
                <NavButton
                    active={activeTab === 'SCRIPT'}
                    onClick={() => setActiveTab('SCRIPT')}
                    icon={FileText}
                    label="Script"
                />
                <NavButton
                    active={activeTab === 'SHOTS'}
                    onClick={() => setActiveTab('SHOTS')}
                    icon={Clapperboard}
                    label="Shots"
                />
                <NavButton
                    active={activeTab === 'CALLSHEET'}
                    onClick={() => setActiveTab('CALLSHEET')}
                    icon={Calendar}
                    label="Call Sheet"
                />
            </nav>
        </div>
    );
}

/* --------------------------------------------------------------------------------
 * SUB-COMPONENTS
 * -------------------------------------------------------------------------------- */

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${active ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}`}
    >
        <Icon size={20} className={active ? "stroke-[2.5px]" : "stroke-[1.5px]"} />
        <span className="text-[9px] uppercase font-bold tracking-wide">{label}</span>
    </button>
);

/* --- VIEWERS --- */

const ScriptView = ({ data }: { data: any }) => {
    if (!data || !data.rows || data.rows.length === 0) return <EmptyState label="Script" />;

    return (
        <div className="p-4 space-y-8 max-w-lg mx-auto">
            {data.rows.map((row: any, i: number) => (
                <div key={row.id || i} className="flex gap-4 group">
                    <div className="w-8 shrink-0 pt-1">
                        <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 font-mono">
                            {row.scene || i + 1}
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-baseline justify-between border-b border-zinc-800 pb-2 mb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
                                {row.time || '00:00'}
                            </span>
                        </div>

                        <div className="font-mono text-sm leading-relaxed text-zinc-100">
                            <span className="text-zinc-500 uppercase text-[10px] font-bold block mb-1">Visual</span>
                            {row.visual}
                        </div>

                        <div className="font-sans text-sm leading-relaxed text-zinc-300 pl-4 border-l border-emerald-500/30">
                            <span className="text-emerald-500/70 uppercase text-[10px] font-bold block mb-1">Audio</span>
                            {row.audio}
                        </div>
                    </div>
                </div>
            ))}
            <div className="h-12 text-center text-[10px] text-zinc-800 uppercase font-bold pt-8">End of Script</div>
        </div>
    );
}

const ShotListView = ({ data }: { data: any }) => {
    if (!data || !data.shots || data.shots.length === 0) return <EmptyState label="Shot List" />;

    // Sort/Group by Scene? For now just list.
    return (
        <div className="flex flex-col divide-y divide-zinc-800/50">
            {data.shots.map((shot: any, i: number) => (
                <div key={shot.id || i} className="p-4 flex gap-4 bg-black">
                    <div className="shrink-0 flex flex-col items-center gap-1 w-10">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">SCENE</span>
                        <span className="text-lg font-black text-white leading-none">{shot.scene || '-'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="bg-zinc-800 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">{shot.size || 'SIZE?'}</span>
                            <span className="bg-zinc-800 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">{shot.angle || 'ANGLE?'}</span>
                            <span className="bg-zinc-800 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">{shot.movement || 'STATIC'}</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium leading-normal mb-1">{shot.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{shot.technical || ''}</p>
                    </div>

                    <div className="shrink-0 flex items-center">
                        <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">
                            <div className="w-4 h-4 bg-zinc-800 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CallSheetView = ({ data }: { data: any }) => {
    if (!data) return <EmptyState label="Call Sheet" />;

    return (
        <div className="p-4 space-y-6">
            {/* HERDER INFO */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">General Call Time</p>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{data.generalCallTime || "TBD"}</h2>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-left">
                    <div>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Location</p>
                        <p className="text-xs font-bold text-zinc-200">{data.locationName || "TBD"}</p>
                        <p className="text-[9px] text-zinc-400">{data.locationAddress}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Weather</p>
                        <p className="text-xs font-bold text-zinc-200">{data.weatherSummary || "Unknown"}</p>
                    </div>
                </div>
            </div>

            {/* MESSAGE */}
            {data.dailyMessage && (
                <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-sm">
                    <p className="text-[10px] font-bold uppercase text-emerald-500 mb-1">Producer Note</p>
                    <p className="text-xs text-emerald-100/80 italic">"{data.dailyMessage}"</p>
                </div>
            )}

            {/* SCHEDULE */}
            <div>
                <h3 className="text-xs font-black uppercase text-zinc-500 mb-2 pl-1">Schedule Block</h3>
                <div className="space-y-1">
                    {/* Placeholder for schedule parsing if complex, standard text for now */}
                    <div className="bg-zinc-900 p-3 rounded-sm border-l-2 border-zinc-500">
                        <span className="text-xs text-zinc-400">Schedule Details not fully parsed in preview.</span>
                    </div>
                </div>
            </div>

            <div className="pt-8 text-center">
                <p className="text-[9px] text-zinc-600 uppercase">Emergency? Call 911</p>
                <p className="text-[9px] text-zinc-600 uppercase">Nearest Hospital: {data.nearestHospital || "Lookup required"}</p>
            </div>
        </div>
    )
}

const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800 relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping opacity-75"></div>
            <span className="text-zinc-500 font-mono text-xl">/</span>
        </div>
        <p className="text-sm uppercase font-black tracking-wider text-zinc-400 mb-2">No {label}</p>
        <p className="text-[10px] text-zinc-600 font-mono max-w-[200px] leading-relaxed">
            Data has not been synced yet. Use the Desktop Editor to draft and publish this document.
        </p>
    </div>
);
