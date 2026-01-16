'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Clapperboard, List, Calendar, ChevronLeft, ChevronRight, Menu, FileText, Plus, X, Save } from 'lucide-react';
import Link from 'next/link';

/* --------------------------------------------------------------------------------
 * TYPES
 * -------------------------------------------------------------------------------- */
type Tab = string;

const DOC_LABELS: Record<string, string> = {
    'av-script': 'AV Script',
    'shot-scene-book': 'Shot List',
    'call-sheet': 'Call Sheet',
    'production-schedule': 'Schedule',
    'dit-log': 'DIT Log',
    'budget': 'Budget',
    'casting': 'Casting',
    'locations': 'Locations',
    'wardrobe': 'Wardrobe',
    'storyboard': 'Storyboard'
};

interface MobileState {
    project: any | null;
    docs: Record<string, any>;
}

/* --------------------------------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------------------------------- */
export default function OnSetMobilePage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('');
    const [data, setData] = useState<MobileState>({ project: null, docs: {} });

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

            // Parse ALL drafts across all phases
            const allDrafts: Record<string, any> = {};
            if (projectData.data?.phases) {
                Object.values(projectData.data.phases).forEach((phase: any) => {
                    if (phase.drafts) {
                        Object.entries(phase.drafts).forEach(([key, val]) => {
                            const parsed = safeParse(val as string);
                            // Safety: Handle Array Versions (take latest/first)
                            if (Array.isArray(parsed)) {
                                allDrafts[key] = parsed[0];
                            } else if (parsed) {
                                allDrafts[key] = parsed;
                            }
                        });
                    }
                });
            }

            setData({
                project: projectData,
                docs: allDrafts
            });

            // Determine Tabs: Use "onset-mobile-control" selection if available, else all found drafts
            const mobileControl = allDrafts['onset-mobile-control'];
            const selectedTools = mobileControl?.selectedTools || [];

            const availableKeys = selectedTools.length > 0
                ? selectedTools
                : Object.keys(allDrafts).filter(k => k !== 'onset-mobile-control');

            if (availableKeys.length > 0) {
                // Priority sort? call-sheet -> shots -> script
                const priority = ['call-sheet', 'shot-scene-book', 'av-script'];
                // Find first priority that exists in availableKeys, or just first available
                const bestStart = priority.find(k => availableKeys.includes(k)) || availableKeys[0];
                setActiveTab(bestStart);
            }

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

    const handleUpdateDIT = async (newItem: any) => {
        if (!data.project) return;
        try {
            // 1. Get fresh project to minimize conflicts
            const { data: fresh, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !fresh) return;

            const existingPhase = fresh.data?.phases?.ON_SET || {};
            const existingDrafts = existingPhase.drafts || {};

            // 2. Parse existing Log
            let logData = { items: [] };
            try {
                const raw = existingDrafts['dit-log'];
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Calculate if array or object
                    if (Array.isArray(parsed)) logData = parsed[0];
                    else logData = parsed;
                }
            } catch { }

            // 3. Append Item
            const updatedLog = {
                ...logData, // Preserve other props
                items: [newItem, ...(logData['items'] || [])]
            };

            // 4. Save
            const mergedPhase = {
                ...existingPhase,
                drafts: {
                    ...existingDrafts,
                    'dit-log': JSON.stringify(updatedLog)
                }
            };

            const updatedProjectData = {
                ...fresh.data,
                phases: {
                    ...fresh.data.phases,
                    ON_SET: mergedPhase
                }
            };

            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);

            // 5. Reload local
            fetchData();

        } catch (e) { console.error(e); }
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
                <Link href="/onset" className="flex items-center gap-3">
                    <img src="/onset_logo.png" className="h-6 w-auto" alt="onSET" />
                    <div className="h-4 w-[1px] bg-zinc-700"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white leading-none mb-0.5">{data.project.name}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono text-emerald-500 uppercase leading-none">Live Sync</span>
                        </div>
                    </div>
                </Link>
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

                {activeTab === 'av-script' && <ScriptView data={data.docs['av-script']} />}
                {activeTab === 'shot-scene-book' && <ShotListView data={data.docs['shot-scene-book']} />}
                {activeTab === 'call-sheet' && <CallSheetView data={data.docs['call-sheet']} />}
                {activeTab === 'dit-log' && <MobileDITLogView data={data.docs['dit-log']} onAdd={handleUpdateDIT} />}

                {/* Fallback for other docs */}
                {!['av-script', 'shot-scene-book', 'call-sheet', 'dit-log'].includes(activeTab) && (
                    <EmptyState label={DOC_LABELS[activeTab] || 'Document'} />
                )}

            </main>

            {/* BOTTOM NAV (SCROLLABLE ROWS) */}
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-zinc-950 border-t border-zinc-900 z-50 pb-safe">
                <div className="flex items-center h-full overflow-x-auto px-4 gap-3 no-scrollbar">
                    {(() => {
                        const mobileControl = data.docs['onset-mobile-control'];
                        const selectedTools = mobileControl?.selectedTools || [];
                        const tabs = selectedTools.length > 0
                            ? selectedTools
                            : Object.keys(data.docs).filter(k => k !== 'onset-mobile-control');

                        if (tabs.length === 0) {
                            return <span className="text-zinc-600 text-[10px] uppercase font-bold pl-2">No synced docs</span>;
                        }

                        return tabs.map((key: string) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`
                                flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all
                                ${activeTab === key
                                        ? 'bg-white text-black border-white'
                                        : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                            >
                                {DOC_LABELS[key] || key}
                            </button>
                        ));
                    })()}
                </div>
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

const MobileDITLogView = ({ data, onAdd }: { data: any, onAdd?: (item: any) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'complete',
        eventType: 'offload',
        source: '',
        destination: '',
        description: ''
    });

    const handleSubmit = () => {
        if (!onAdd) return;
        const newItem = {
            id: `entry-${Date.now()}`,
            ...form
        };
        onAdd(newItem);
        setIsAdding(false);
        // Reset form slightly but keep useful defaults
        setForm({ ...form, description: '', source: '', destination: '' });
    };

    if (!data && !isAdding) return <EmptyState label="DIT Log" />;

    // Safety check for empty data object but valid component render
    const items = data?.items || [];

    return (
        <div className="p-4 space-y-4">

            {/* ADD BUTTON */}
            {onAdd && !isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg mb-4"
                >
                    <Plus size={16} />
                    <span>Log Activity</span>
                </button>
            )}

            {/* ADD FORM */}
            {isAdding && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 shadow-2xl animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold uppercase text-white">New Entry</span>
                        <button onClick={() => setIsAdding(false)}><X size={16} className="text-zinc-500" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Time</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-2 rounded focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-2 rounded focus:outline-none focus:border-emerald-500 appearance-none"
                            >
                                <option value="complete">Complete</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Event Type</label>
                        <div className="flex bg-zinc-950 p-1 rounded border border-zinc-800">
                            {['offload', 'issue', 'qc'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setForm({ ...form, eventType: t })}
                                    className={`flex-1 text-[9px] uppercase font-bold py-1.5 rounded transition-colors ${form.eventType === t ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            placeholder="Source (e.g. A001)"
                            value={form.source}
                            onChange={e => setForm({ ...form, source: e.target.value })}
                            className="bg-zinc-950 border border-zinc-800 text-white text-xs p-2 rounded focus:outline-none focus:border-emerald-500 placeholder:text-zinc-700"
                        />
                        <input
                            placeholder="Dest (e.g. Drive 1)"
                            value={form.destination}
                            onChange={e => setForm({ ...form, destination: e.target.value })}
                            className="bg-zinc-950 border border-zinc-800 text-white text-xs p-2 rounded focus:outline-none focus:border-emerald-500 placeholder:text-zinc-700"
                        />
                    </div>

                    <textarea
                        placeholder="Notes..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-2 rounded focus:outline-none focus:border-emerald-500 min-h-[60px] mb-4 placeholder:text-zinc-700 resize-none"
                    />

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs py-2 rounded flex items-center justify-center gap-2"
                    >
                        <Save size={14} />
                        <span>Save Entry</span>
                    </button>
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-2 text-center mb-4">
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                    <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Total Offloads</div>
                    <div className="text-2xl font-black text-white">{items.filter((i: any) => i.eventType === 'offload').length}</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                    <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Issues</div>
                    <div className="text-2xl font-black text-red-500">{items.filter((i: any) => i.eventType === 'issue').length}</div>
                </div>
            </div>

            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <div className="text-center py-8 opacity-50"><p className="text-xs text-zinc-500">No logs yet.</p></div>
                ) : (
                    items.map((item: any, i: number) => (
                        <div key={item.id || i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-mono text-emerald-400 text-xs font-bold">{item.time}</span>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm ${item.status === 'complete' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {item.status || 'PENDING'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-2 h-2 rounded-full ${item.eventType === 'issue' ? 'bg-red-500' : 'bg-zinc-500'}`}></div>
                                <div className="font-black text-sm text-white uppercase tracking-wider">{item.eventType || 'EVENT'}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 mb-3 bg-black/40 p-3 rounded-lg">
                                <div>
                                    <span className="text-[8px] font-bold uppercase text-zinc-600 block mb-0.5">Source</span>
                                    <span className="font-mono text-zinc-200">{item.source || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold uppercase text-zinc-600 block mb-0.5">Destination</span>
                                    <span className="font-mono text-zinc-200">{item.destination || '-'}</span>
                                </div>
                            </div>

                            {item.description && (
                                <p className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3 mt-1">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="h-12 text-center text-[10px] text-zinc-800 uppercase font-bold pt-4">End of Log</div>
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
