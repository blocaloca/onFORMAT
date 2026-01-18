import React, { useState } from 'react';
import { Plus, X, Save, Check } from 'lucide-react';

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
    'storyboard': 'Storyboard',
    'crew-list': 'Crew List',
    'shot-log': 'Shot Log'
};

/* --------------------------------------------------------------------------------
 * VIEW COMPONENTS
 * -------------------------------------------------------------------------------- */

import { Phone, Mail, Search } from 'lucide-react';

export const CrewListView = ({ data }: { data: any }) => {
    const [search, setSearch] = useState('');

    if (!data || !data.crew || data.crew.length === 0) return <EmptyState label="Crew List" />;

    const filtered = data.crew.filter((m: any) =>
        (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.department || '').toLowerCase().includes(search.toLowerCase())
    );

    // Group by Department
    const grouped: Record<string, any[]> = {};
    filtered.forEach((m: any) => {
        const d = m.department || 'Other';
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(m);
    });

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="sticky top-0 z-10 bg-black pb-2 pt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500 uppercase font-bold tracking-wide"
                        placeholder="SEARCH CREW..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {Object.entries(grouped).map(([dept, members]) => (
                <div key={dept} className="space-y-2">
                    <div className="sticky top-14 z-0 bg-black/90 backdrop-blur py-1 border-b border-zinc-800">
                        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{dept}</h3>
                    </div>
                    <div className="grid gap-2">
                        {members.map((m: any) => (
                            <div key={m.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">{m.name || 'Unnamed'}</p>
                                    <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wide mb-0.5">{m.role}</p>
                                    {/* Groups Pill */}
                                    {m.onSetGroups && m.onSetGroups.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {m.onSetGroups.map((g: string) => (
                                                <span key={g} className={`text-[8px] font-black uppercase px-1 rounded ${g === 'A' ? 'bg-emerald-900 text-emerald-400' : g === 'B' ? 'bg-blue-900 text-blue-400' : 'bg-amber-900 text-amber-400'}`}>{g}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {m.phone && (
                                        <a href={`tel:${m.phone}`} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                                            <Phone size={14} />
                                        </a>
                                    )}
                                    {m.email && (
                                        <a href={`mailto:${m.email}`} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                                            <Mail size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {filtered.length === 0 && (
                <div className="text-center py-8 opacity-50"><p className="text-xs text-zinc-500">No matches found.</p></div>
            )}
        </div>
    );
};

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
    const [viewDoc, setViewDoc] = useState<'nda' | 'privacy' | null>(null);

    if (viewDoc) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col p-6 animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wider text-white">
                        {viewDoc === 'nda' ? 'Non-Disclosure Agreement' : 'Privacy Policy'}
                    </h2>
                    <button
                        onClick={() => setViewDoc(null)}
                        className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
                        {viewDoc === 'nda' ? (
                            <>
                                <h3 className="text-white font-bold uppercase mb-4">Confidentiality & Non-Disclosure Agreement</h3>

                                <p><strong className="text-white">Confidentiality:</strong> All project materials, including scripts, call sheets, and schedules, are strictly confidential.</p>

                                <p><strong className="text-white">No Photography/Social Media:</strong> You are prohibited from taking or sharing photos, videos, or "behind-the-scenes" content without explicit written permission.</p>

                                <p><strong className="text-white">Proprietary Info:</strong> All technical data, such as DIT logs and lighting plots, remains the property of the Production.</p>

                                <p><strong className="text-white">Revocable Access:</strong> Access to this dashboard is a privilege for active crew members and can be revoked by the Administrator at any time.</p>

                                <div className="mt-8 pt-8 border-t border-zinc-800">
                                    <button
                                        onClick={() => setViewDoc(null)}
                                        className="w-full bg-emerald-500 text-black font-bold uppercase py-4 rounded tracking-widest hover:bg-emerald-400"
                                    >
                                        I have read and agree to protect the privacy of this production.
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p><strong>onFORMAT Terms of Service</strong></p>
                                <p>By joining this project, you agree to the onFORMAT Terms of Service. We use your email to secure your access to project documents and to keep you updated on platform features and industry tools. You can opt-out of marketing communications at any time via your account settings.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Welcome to Set</h1>
            <p className="text-xs text-zinc-500 mb-8 uppercase font-bold tracking-widest">Please identify yourself</p>

            <input
                type="email"
                placeholder="Enter your email..."
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-full max-w-xs bg-zinc-900 border border-zinc-700 p-3 rounded text-center text-sm mb-4 focus:border-emerald-500 outline-none placeholder:text-zinc-600 font-mono"
            />

            <button
                onClick={() => onJoin(val)}
                disabled={!val}
                className="w-full max-w-xs bg-emerald-500 text-black font-bold uppercase py-3 rounded tracking-widest hover:bg-emerald-400 disabled:opacity-50 mb-8"
            >
                Enter
            </button>

            <div className="text-[10px] text-zinc-600 max-w-[280px] leading-relaxed text-center space-y-4">
                <p>
                    By joining this project, you agree to the <button onClick={() => setViewDoc('privacy')} className="underline hover:text-zinc-400 transition-colors">onFORMAT Terms of Service</button>. We use your email to secure your access to project documents and to keep you updated on platform features and industry tools. You can opt-out of marketing communications at any time via your account settings.
                </p>
                <button onClick={() => setViewDoc('nda')} className="text-zinc-500 font-bold underline uppercase tracking-wider block mx-auto hover:text-emerald-500 transition-colors">
                    Read Production NDA
                </button>
            </div>
        </div>
    );
}

export const ScriptView = ({ data }: { data: any }) => {
    if (!data || !data.rows || data.rows.length === 0) return <EmptyState label="Script" />;

    return (
        <div className="space-y-8">
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

export const ShotListView = ({ data, onCheckShot }: { data: any, onCheckShot?: (id: string, status: string, addToLog: boolean) => void }) => {
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    if (!data || !data.shots || data.shots.length === 0) return <EmptyState label="Shot List" />;

    return (
        <div className="flex flex-col divide-y divide-zinc-800/50">
            {data.shots.map((shot: any, i: number) => {
                const isComplete = (shot.status || '').toLowerCase() === 'complete';
                const isConfirming = confirmingId === shot.id;

                if (isConfirming) {
                    return (
                        <div key={shot.id || i} className="p-6 bg-zinc-900 border-l-4 border-emerald-500 animate-in fade-in">
                            <p className="text-sm font-bold text-white mb-4">Mark Shot {shot.scene}-{shot.shot} Complete?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        onCheckShot && onCheckShot(shot.id, 'COMPLETE', true);
                                        setConfirmingId(null);
                                    }}
                                    className="flex-1 bg-emerald-500 text-black font-bold uppercase text-xs py-3 rounded"
                                >
                                    Log & Complete
                                </button>
                                <button
                                    onClick={() => {
                                        onCheckShot && onCheckShot(shot.id, 'COMPLETE', false);
                                        setConfirmingId(null);
                                    }}
                                    className="flex-1 bg-zinc-800 text-white font-bold uppercase text-xs py-3 rounded"
                                >
                                    Just Complete
                                </button>
                                <button onClick={() => setConfirmingId(null)} className="p-3 text-zinc-500"><X size={16} /></button>
                            </div>
                        </div>
                    )
                }

                return (
                    <div key={shot.id || i} className="py-6 flex gap-4 bg-black">
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
                            <button
                                onClick={() => {
                                    if (isComplete) {
                                        onCheckShot && onCheckShot(shot.id, 'PENDING', false);
                                    } else {
                                        setConfirmingId(shot.id);
                                    }
                                }}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isComplete ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-zinc-700 bg-zinc-900/50'}`}
                            >
                                {isComplete && <Check size={16} className="text-black" />}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const CallSheetView = ({ data }: { data: any }) => {
    if (!data) return <EmptyState label="Call Sheet" />;

    return (
        <div className="space-y-6">
            {/* Vitals */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">General Call Time</p>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{data.crewCall || "TBD"}</h2>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-left">
                    <div>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Basecamp / Location</p>
                        <p className="text-xs font-bold text-zinc-200 whitespace-pre-wrap">{data.basecamp || "TBD"}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Weather</p>
                        <p className="text-xs font-bold text-zinc-200">{data.weather || "Unknown"}</p>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {data.notes && (
                <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-sm">
                    <p className="text-[10px] font-bold uppercase text-emerald-500 mb-1">Producer Notes</p>
                    <p className="text-xs text-emerald-100/80 italic whitespace-pre-wrap">{data.notes}</p>
                </div>
            )}

            {/* Schedule */}
            <div>
                <h3 className="text-xs font-black uppercase text-zinc-500 mb-2 pl-1">Schedule</h3>
                <div className="space-y-0.5">
                    {data.events && data.events.length > 0 ? (
                        data.events.map((evt: any, i: number) => (
                            <div key={i} className="bg-zinc-900 p-3 rounded-sm border-l-2 border-emerald-500 flex gap-3">
                                <span className="text-xs font-mono font-bold text-emerald-400 w-10 shrink-0">{evt.time || '00:00'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] font-black uppercase text-zinc-300">{evt.type}</span>
                                        <span className="text-[9px] font-mono text-zinc-600 uppercase truncate max-w-[80px]">{evt.location}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate">{evt.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-zinc-900 p-3 rounded-sm border-l-2 border-zinc-500">
                            <span className="text-xs text-zinc-400">No events scheduled.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Emergency */}
            <div className="pt-8 text-center space-y-1">
                <p className="text-[9px] text-zinc-600 uppercase font-bold">Emergency? Call 911</p>
                <div className="inline-block bg-red-900/20 border border-red-900/40 px-3 py-2 rounded">
                    <p className="text-[9px] text-red-500 uppercase font-bold mb-0.5">Nearest Hospital</p>
                    <p className="text-[10px] text-red-400 font-mono">{data.hospital || "Lookup required"}</p>
                </div>
                {/* Debug: Sunrise check */}
                {data.sunriseSunset && <p className="text-[9px] text-zinc-700">Sun: {data.sunriseSunset}</p>}
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
        <div className="space-y-4">

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

export const MobileShotLogView = ({ data, onAdd }: { data: any, onAdd?: (item: any) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        shotId: '',
        take: '1',
        status: 'good',
        description: ''
    });

    const handleSubmit = () => {
        if (!onAdd) return;
        const newItem = {
            id: `log-${Date.now()}`,
            type: 'SHOT',
            ...form
        };
        onAdd(newItem);
        setIsAdding(false);
        setForm({ ...form, description: '', shotId: '', take: (parseInt(form.take) + 1).toString() });
    };

    if (!data && !isAdding) return <EmptyState label="Shot Log" />;

    const items = data?.entries || [];

    return (
        <div className="space-y-4">
            {/* ADD BUTTON */}
            {onAdd && !isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg mb-4"
                >
                    <Plus size={16} />
                    <span>Log Shot</span>
                </button>
            )}

            {/* ADD FORM */}
            {isAdding && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold uppercase text-white">New Shot Actual</span>
                        <button onClick={() => setIsAdding(false)}><X size={16} className="text-zinc-400" /></button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Time</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Shot #</label>
                            <input
                                placeholder="1A"
                                value={form.shotId}
                                onChange={e => setForm({ ...form, shotId: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 text-center uppercase"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Take</label>
                            <input
                                type="number"
                                value={form.take}
                                onChange={e => setForm({ ...form, take: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 text-center"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Notes</label>
                        <textarea
                            placeholder="Lens, Filters, Action notes..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 min-h-[60px] resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs py-3 rounded flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        <span>Save Shot</span>
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <div className="text-center py-8 opacity-50"><p className="text-xs text-zinc-500">No shots logged.</p></div>
                ) : (
                    items.map((item: any, i: number) => (
                        <div key={item.id || i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex gap-4 items-center">
                            <div className="text-center w-12 shrink-0">
                                <span className="block text-[10px] font-mono text-zinc-500">{item.time}</span>
                                <span className="block text-xl font-black text-white">{item.shotId || '?'}</span>
                            </div>
                            <div className="w-px h-8 bg-zinc-800"></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-xs font-bold text-emerald-500 uppercase">Completed</span>
                                    {item.take && <span className="text-[9px] font-mono text-zinc-600">TK {item.take}</span>}
                                </div>
                                <p className="text-xs text-zinc-300 leading-tight">{item.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export const ScheduleView = ({ data }: { data: any }) => {
    if (!data || !data.items || data.items.length === 0) return <EmptyState label="Schedule" />;

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Shoot Date</p>
                    <p className="text-xl font-black text-white">{data.date || 'TBD'}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Call Time</p>
                    <p className="text-xl font-mono text-emerald-500 font-bold">{data.callTime || 'TBD'}</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative">
                <div className="absolute left-[54px] top-2 bottom-2 w-0.5 bg-zinc-900"></div>

                {data.items.map((item: any, i: number) => (
                    <div key={item.id || i} className="relative flex gap-4 group">
                        {/* Time Column */}
                        <div className="w-[46px] text-right pt-1 shrink-0">
                            <span className="text-xs font-mono font-bold text-zinc-500 block">{item.time || '00:00'}</span>
                        </div>

                        {/* Dot */}
                        <div className="absolute left-[50px] top-2.5 w-2.5 h-2.5 rounded-full bg-zinc-800 border-2 border-black z-10 group-hover:bg-emerald-500 transition-colors"></div>

                        {/* Content Card */}
                        <div className="flex-1 bg-zinc-900 rounded-lg p-3 border border-zinc-800 hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        SCENE {item.scene || '-'}
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-zinc-400">
                                        {item.intExt}
                                    </span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${item.dayNight === 'DAY' ? 'bg-amber-500/10 text-amber-500' :
                                    item.dayNight === 'NIGHT' ? 'bg-blue-900/30 text-blue-400' :
                                        'bg-zinc-800 text-zinc-500'
                                    }`}>
                                    {item.dayNight}
                                </span>
                            </div>

                            <p className="text-xs font-black text-white uppercase mb-1 leading-tight">{item.set}</p>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-12 text-center text-[10px] text-zinc-800 uppercase font-bold pt-8">End of Day</div>
        </div>
    );
};
