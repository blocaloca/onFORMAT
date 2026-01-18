import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';

/* --------------------------------------------------------------------------------
 * CONSTANTS & TYPES
 * -------------------------------------------------------------------------------- */

export const DOC_LABELS: Record<string, string> = {
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

/* --------------------------------------------------------------------------------
 * VIEW COMPONENTS
 * -------------------------------------------------------------------------------- */

export const EmptyState = ({ label }: { label: string }) => (
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

export const EmailEntryGate = ({ onJoin, projectName }: any) => {
    const [val, setVal] = useState('');
    return (
        <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Welcome to Set</h1>
            <p className="text-xs text-zinc-500 mb-8 uppercase font-bold tracking-widest">Please identify yourself</p>

            <input
                type="email"
                placeholder="Enter your email..."
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-full max-w-xs bg-zinc-900 border border-zinc-700 p-3 rounded text-center text-sm mb-4 focus:border-emerald-500 outline-none"
            />

            <button
                onClick={() => onJoin(val)}
                disabled={!val}
                className="w-full max-w-xs bg-emerald-500 text-black font-bold uppercase py-3 rounded tracking-widest hover:bg-emerald-400 disabled:opacity-50"
            >
                Enter
            </button>
        </div>
    );
}

export const ScriptView = ({ data }: { data: any }) => {
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
};

export const ShotListView = ({ data }: { data: any }) => {
    if (!data || !data.shots || data.shots.length === 0) return <EmptyState label="Shot List" />;

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

export const CallSheetView = ({ data }: { data: any }) => {
    if (!data) return <EmptyState label="Call Sheet" />;

    return (
        <div className="p-4 space-y-6">
            {/* HERDER INFO */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">General Call Time</p>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{data.crewCall || "TBD"}</h2>

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

export const MobileDITLogView = ({ data, onAdd }: { data: any, onAdd?: (item: any) => void }) => {
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
        setForm({ ...form, description: '', source: '', destination: '' });
    };

    if (!data && !isAdding) return <EmptyState label="DIT Log" />;

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
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold uppercase text-white">New Entry</span>
                        <button onClick={() => setIsAdding(false)}><X size={16} className="text-zinc-400" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Time</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 appearance-none"
                            >
                                <option value="complete">Complete</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Event Type</label>
                        <div className="flex bg-zinc-950 p-1 rounded border border-zinc-800">
                            {['offload', 'issue', 'qc'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setForm({ ...form, eventType: t })}
                                    className={`flex-1 text-[10px] uppercase font-bold py-2 rounded transition-colors ${form.eventType === t ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Source</label>
                            <input
                                placeholder="A001"
                                value={form.source}
                                onChange={e => setForm({ ...form, source: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 placeholder:text-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Dest</label>
                            <input
                                placeholder="Drive 1"
                                value={form.destination}
                                onChange={e => setForm({ ...form, destination: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Description</label>
                        <textarea
                            placeholder="Add detailed notes here..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 min-h-[80px] placeholder:text-zinc-600 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs py-3 rounded flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
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
