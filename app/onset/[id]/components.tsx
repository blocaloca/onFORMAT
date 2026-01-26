import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Check, HardDrive, AlertCircle, Trash2, Edit2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SignatureCanvas from 'react-signature-canvas';

const DEFAULT_STANDARD_TEXT = `I, the undersigned, hereby grant permission to THE PRODUCER and its agents, successors, assigns, and licensees (collectively, the "Producer"), to photograph, film, and record my likeness, voice, and performance (the "Materials") in connection with the production currently known as THE PROJECT.

1. Usage Rights: I grant Producer the irrevocable, perpetual, worldwide right to use, reproduce, modify, distribute, and display the Materials in any media now known or hereafter created, including but not limited to television, theatrical, digital, streaming, and social media platforms, for any purpose, including advertising, promotion, and trade.

2. Compensation: I acknowledge that I have received all agreed-upon compensation (if any) and that no further payment is due.

3. Waiver: I waive any right to inspect or approve the finished product or any advertising copy or printed matter that may be used in connection therewith. I release Producer from any liability associated with the use of the Materials, including claims for invasion of privacy or right of publicity.

I represent that I am over 18 years of age and have the right to enter into this agreement. If under 18, a parent or guardian must sign below.`;

const DEFAULT_PROPERTY_TEXT = `I, the undersigned owner or authorized agent of the property listed below (the "Property"), hereby grant permission to THE PRODUCER (the "Producer") to enter upon and use the Property for the purpose of photographing, filming, and recording in connection with the production currently known as THE PROJECT.

1. Access and Use: Producer may bring necessary personnel, equipment, and props onto the Property. Producer agrees to leave the Property in substantially the same condition as found, reasonable wear and tear excepted.

2. Rights: I grant Producer the right to photograph, film, and record the Property and to use such recordings in any media worldwide, in perpetuity. I waive any right to inspect or approve the finished content.

3. Warranty: I warrant that I have the full right and authority to enter into this agreement and grant the rights herein.

4. Compensation: I acknowledge that I have received good and valuable consideration, receipt of which is hereby acknowledged.`;

/* --------------------------------------------------------------------------------
 * CONSTANTS & TYPES
 * -------------------------------------------------------------------------------- */

export const DOC_LABELS: Record<string, string> = {
    'av-script': 'AV Script',
    'shot-scene-book': 'Shot List',
    'call-sheet': 'Call Sheet',
    'schedule': 'Schedule',
    'dit-log': 'DIT Log',
    'budget': 'Budget',
    'casting': 'Casting',
    'locations': 'Locations',
    'wardrobe': 'Wardrobe',
    'storyboard': 'Storyboard',
    'crew-list': 'Crew List',
    'camera-report': 'Camera Report',
    'on-set-notes': 'On-Set Notes',
    'releases': 'Releases'
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

                        {/* Mobile Read Only: Approve Button Removed */}
                        {isComplete && (
                            <div className="shrink-0 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/50">
                                    <Check size={14} className="text-emerald-500" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const CallSheetView = ({ data, scheduleData }: { data: any, scheduleData?: any }) => {
    if (!data) return <EmptyState label="Call Sheet" />;

    return (
        <div className="space-y-6">
            {/* Vitals */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">General Call Time</p>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{data.crewCall || scheduleData?.callTime || "TBD"}</h2>

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
                    {(scheduleData?.items && scheduleData.items.length > 0) ? (
                        scheduleData.items.map((item: any, i: number) => (
                            <div key={i} className="bg-zinc-900 p-3 rounded-sm border-l-2 border-emerald-500 flex gap-3">
                                <span className="text-xs font-mono font-bold text-emerald-400 w-10 shrink-0">{item.time || '00:00'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[10px] font-black uppercase text-zinc-300">
                                            {item.scene ? `SCENE ${item.scene}` : (item.type || 'EVENT')}
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-600 uppercase truncate max-w-[80px]">
                                            {item.set || item.location}
                                        </span>
                                    </div>
                                    {(item.intExt || item.dayNight) && (
                                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase font-bold mb-0.5">
                                            {item.intExt && <span>{item.intExt}</span>}
                                            {item.intExt && item.dayNight && <span>•</span>}
                                            {item.dayNight && <span>{item.dayNight}</span>}
                                        </div>
                                    )}
                                    <p className="text-xs text-zinc-400 truncate">{item.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (data.events && data.events.length > 0 ? (
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
                    ))}
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

export const MobileDITLogView = ({ data, onAdd, projectId, mediaAlerts = [], setMediaAlerts }: { data: any, onAdd?: (item: any) => void, projectId?: string, mediaAlerts?: any[], setMediaAlerts?: React.Dispatch<React.SetStateAction<any[]>> }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'complete',
        eventType: 'offload',
        source: '',
        destination: '',
        description: ''
    });



    const handleStartIngest = (alert: any) => {
        // Pre-fill form
        setForm({
            ...form,
            eventType: 'offload',
            source: `Roll ${alert.roll} (${alert.camera})`,
            description: `${alert.mediaType} | ${alert.fps}fps | ISO ${alert.iso} | ${alert.shutter}° | ${alert.wb}`,
            destination: ''
        });
        setIsAdding(true);
        // Remove from alerts
        if (setMediaAlerts) {
            // @ts-ignore
            setMediaAlerts(prev => prev.filter(a => a !== alert));
        }
    };


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

    const items = data?.items || [];

    return (
        <div className="space-y-4">

            {/* MEDIA ALERTS */}
            {mediaAlerts.map((alert, idx) => (
                <div key={idx} className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 mb-2">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                            <HardDrive size={16} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-black uppercase text-emerald-400 mb-1">New Roll Pulled</h4>
                            <p className="text-[10px] text-zinc-300">
                                <strong className="text-white">Roll {alert.roll}</strong> • Cam {alert.camera} • {alert.mediaType}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                                {alert.fps}fps • {alert.iso} ISO • {alert.shutter} • {alert.wb}
                            </p>
                        </div>
                        <button onClick={() => setMediaAlerts && setMediaAlerts((prev: any[]) => prev.filter((_: any, i: number) => i !== idx))} className="text-zinc-500"><X size={14} /></button>
                    </div>
                    {onAdd && (
                        <button
                            onClick={() => handleStartIngest(alert)}
                            className="bg-emerald-500 text-black font-bold uppercase text-[10px] py-3 rounded w-full hover:bg-emerald-400"
                        >
                            Start Ingest
                        </button>
                    )}
                </div>
            ))}

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

export const MobileCameraReportView = ({ data, onAdd, projectId }: { data: any, onAdd?: (item: any) => void, projectId?: string }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        scene: '',
        shotId: '',
        take: '1',
        lens: '',
        fps: '24',
        iso: '800',
        roll: 'A001',
        timecode: '00:00:00:00',
        shutter: '180',
        wb: '5600K',
        mediaType: 'Card',
        status: 'good',
        description: ''
    });

    const items = data?.items || data?.entries || [];
    const lastItem = items.length > 0 ? items[0] : null;

    const [isNewRollModal, setIsNewRollModal] = useState(false);
    const [rollForm, setRollForm] = useState({
        camera: 'A',
        roll: '',
        iso: '800',
        fps: '24',
        shutter: '180',
        wb: '5600K',
        mediaType: 'CFexpress',
        soundRoll: ''
    });

    // Smart Carry-Over Initialization
    React.useEffect(() => {
        if (lastItem && !isAdding) {
            // Auto-increment take if same shot, otherwise reset take
            // Carry over tech specs IF same roll
            const sameRoll = lastItem.roll === form.roll;
            setForm(prev => ({
                ...prev,
                roll: lastItem.roll || prev.roll, // Sync roll
                lens: sameRoll ? (lastItem.lens || '') : '', // Reset on new roll (if detected via logic, though here we just default)
                fps: sameRoll ? (lastItem.fps || '24') : '24',
                iso: sameRoll ? (lastItem.iso || '800') : '800',
                shutter: sameRoll ? (lastItem.shutter || '180') : '180',
                wb: sameRoll ? (lastItem.wb || '5600K') : '5600K',
            }));
        }
    }, [isAdding, lastItem]);

    const handleTCChange = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;
        if (digits.length > 2) formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
        if (digits.length > 4) formatted = `${formatted.slice(0, 5)}:${digits.slice(4)}`;
        if (digits.length > 6) formatted = `${formatted.slice(0, 8)}:${digits.slice(6)}`;
        setForm({ ...form, timecode: formatted });
    };

    const openNewRollModal = () => {
        // Suggest Next Roll
        const current = form.roll || 'A001';
        const match = current.match(/([A-Z]+)(\d+)/);
        let nextRoll = current;
        if (match) {
            const prefix = match[1];
            const num = parseInt(match[2]) + 1;
            nextRoll = `${prefix}${String(num).padStart(3, '0')}`;
        }
        setRollForm({
            ...rollForm,
            roll: nextRoll,
            iso: '800',
            fps: '24',
            shutter: '180',
            wb: '5600K',
            mediaType: 'CFexpress',
            soundRoll: ''
        });
        setIsNewRollModal(true);
    };

    const confirmNewRoll = async () => {

        // Broadcast DIT Alert
        if (projectId) {
            await supabase.channel(`project-live-${projectId}`).send({
                type: 'broadcast',
                event: 'NEW_ROLL_PULLED',
                payload: rollForm
            });
        }

        setForm(prev => ({
            ...prev,
            roll: rollForm.roll,
            iso: rollForm.iso,
            fps: rollForm.fps,
            shutter: rollForm.shutter,
            wb: rollForm.wb,
            mediaType: rollForm.mediaType,
            lens: '', // Clear Lens
            timecode: '00:00:00:00', // Reset TC
            take: '1',
            shotId: ''
        }));
        setIsNewRollModal(false);
        setIsAdding(true);
    };

    const handleSubmit = () => {
        if (!onAdd) return;
        if (!form.roll) {
            alert("Roll ID is required.");
            return;
        }
        const newItem = {
            id: `log-${Date.now()}`,
            type: 'SHOT',
            shot: form.shotId,
            ...form
        };
        onAdd(newItem);
        setIsAdding(false);
        // Next shot prep
        setForm(prev => ({
            ...prev,
            description: '',
            shotId: prev.shotId, // Keep shot ID usually? No, usually next shot. But logic says keep take increment?
            // Actually, keep shotId and increment take is standard for "Next Take".
            // If new shot, user clears shotId. 
            take: (parseInt(prev.take) + 1).toString()
        }));
    };

    return (
        <div className="space-y-4">
            {/* HEADER ACTIONS: New Roll / Add Shot */}
            {onAdd && !isAdding && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex-1 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Plus size={16} />
                        <span>Log Shot</span>
                    </button>
                    <button
                        onClick={openNewRollModal}
                        className="w-1/3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider text-[10px] py-3 rounded-lg border border-zinc-700 hover:bg-zinc-700"
                    >
                        New Roll
                    </button>
                </div>
            )}

            {/* NEW ROLL VERIFICATION MODAL */}
            {isNewRollModal && (
                <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-black uppercase text-white mb-1">Start New Roll</h3>
                        <p className="text-xs text-zinc-400 mb-6">Verify technical specs for the new card.</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Camera ID</label>
                                <div className="flex gap-2">
                                    {['A', 'B', 'C'].map(cam => (
                                        <button
                                            key={cam}
                                            onClick={() => setRollForm({ ...rollForm, camera: cam })}
                                            className={`flex-1 py-3 text-sm font-black rounded border ${rollForm.camera === cam ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
                                        >
                                            {cam}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Roll Number</label>
                                <input
                                    value={rollForm.roll}
                                    onChange={e => setRollForm({ ...rollForm, roll: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-lg font-mono p-3 rounded"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Base ISO</label>
                                    <input
                                        value={rollForm.iso}
                                        onChange={e => setRollForm({ ...rollForm, iso: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-base p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">PROJ FPS</label>
                                    <input
                                        value={rollForm.fps}
                                        onChange={e => setRollForm({ ...rollForm, fps: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-base p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Shutter (Deg)</label>
                                    <input
                                        value={rollForm.shutter}
                                        onChange={e => setRollForm({ ...rollForm, shutter: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-base p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">WB (K)</label>
                                    <input
                                        value={rollForm.wb}
                                        onChange={e => setRollForm({ ...rollForm, wb: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-base p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Media Type</label>
                                    <select
                                        value={rollForm.mediaType}
                                        onChange={e => setRollForm({ ...rollForm, mediaType: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-base p-2 rounded appearance-none"
                                    >
                                        <option>CFexpress</option>
                                        <option>SD Card</option>
                                        <option>SSD</option>
                                        <option>RED Mag</option>
                                        <option>Arri Codex</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Sound Roll</label>
                            <input
                                value={rollForm.soundRoll}
                                onChange={e => setRollForm({ ...rollForm, soundRoll: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded"
                                placeholder="SR001"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsNewRollModal(false)}
                                className="flex-1 bg-zinc-800 text-white font-bold uppercase text-xs py-3 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmNewRoll}
                                className="flex-1 bg-emerald-500 text-black font-bold uppercase text-xs py-3 rounded"
                            >
                                Confirm & Start
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD FORM */}
            {isAdding && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <div>
                            <span className="text-xs font-bold uppercase text-white block">Log Shot Actual</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-500 block">ROLL {form.roll}</span>
                        </div>
                        <button onClick={() => setIsAdding(false)}><X size={16} className="text-zinc-400" /></button>
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Time</label>
                        <input
                            type="time"
                            value={form.time}
                            onChange={e => setForm({ ...form, time: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Scene</label>
                            <input
                                placeholder="1"
                                value={form.scene}
                                onChange={e => setForm({ ...form, scene: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 text-center uppercase"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Shot #</label>
                            <input
                                placeholder="A"
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

                    {/* Tech Specs Grid */}
                    <div className="bg-black/50 p-2 rounded-lg border border-zinc-800 mb-3">
                        <div className="mb-2 border-b border-zinc-800 pb-2">
                            <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Current Roll</label>
                            <input
                                value={form.roll}
                                onChange={e => setForm({ ...form, roll: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs p-1.5 rounded text-left font-mono focus:border-emerald-500"
                                placeholder="A001"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Lens</label>
                                <input
                                    value={form.lens}
                                    onChange={e => setForm({ ...form, lens: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs p-1.5 rounded text-center font-mono focus:border-emerald-500"
                                    placeholder="mm"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">FPS</label>
                                <input
                                    value={form.fps}
                                    onChange={e => setForm({ ...form, fps: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs p-1.5 rounded text-center font-mono focus:border-emerald-500"
                                    placeholder="24"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">ISO</label>
                                <input
                                    value={form.iso}
                                    onChange={e => setForm({ ...form, iso: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs p-1.5 rounded text-center font-mono focus:border-emerald-500"
                                    placeholder="800"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">TC</label>
                                <input
                                    value={form.timecode || ''}
                                    onChange={e => handleTCChange(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs p-1.5 rounded text-center font-mono focus:border-emerald-500"
                                    placeholder="00:00:00:00"
                                />
                            </div>
                        </div>
                        {/* Shutter / WB Row */}
                        <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-zinc-800/50">
                            <div>
                                <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Shutter</label>
                                <input
                                    value={form.shutter}
                                    onChange={e => setForm({ ...form, shutter: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-[10px] p-1 rounded"
                                    placeholder="180"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">White Balance</label>
                                <input
                                    value={form.wb}
                                    onChange={e => setForm({ ...form, wb: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-[10px] p-1 rounded"
                                    placeholder="5600K"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { id: 'good', label: 'Good' },
                            { id: 'bad', label: 'NG' },
                            { id: 'circle', label: 'BUY' }
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setForm({ ...form, status: s.id })}
                                className={`flex-1 py-3 text-xs font-black uppercase rounded border transition-all ${form.status === s.id
                                    ? (s.id === 'circle' ? 'bg-yellow-500 text-black border-yellow-500' :
                                        s.id === 'bad' ? 'bg-red-500 text-white border-red-500' :
                                            'bg-emerald-500 text-black border-emerald-500')
                                    : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
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
            )
            }

            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <div className="text-center py-8 opacity-50"><p className="text-xs text-zinc-500">No shots logged.</p></div>
                ) : (
                    items.map((item: any, i: number) => (
                        <div key={item.id || i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex gap-4 items-center">
                            <div className="text-center w-12 shrink-0">
                                <span className="block text-[10px] font-mono text-zinc-500">{item.time}</span>
                                <span className="block text-xl font-black text-white">{item.shot || item.shotId || '?'}</span>
                                <span className="block text-xl font-black text-white">{item.shot || item.shotId || '?'}</span>
                                {item.scene && <span className="block text-[9px] font-bold text-zinc-500">Sc {item.scene}</span>}
                                {item.roll && <span className="block text-[8px] font-mono text-zinc-600 mt-1">{item.roll}</span>}
                            </div>
                            <div className="w-px h-8 bg-zinc-800"></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${item.status === 'circle' ? 'bg-yellow-500 text-black' :
                                        item.status === 'bad' ? 'text-red-500 bg-red-900/20' :
                                            'text-emerald-500 bg-emerald-900/20'
                                        }`}>
                                        {item.status === 'circle' ? 'BUY' : item.status === 'bad' ? 'NG' : 'GOOD'}
                                    </span>
                                    {item.take && <span className="text-[9px] font-mono text-zinc-600">TK {item.take}</span>}
                                </div>
                                <p className="text-xs text-zinc-300 leading-tight">{item.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
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

export const MobileOnSetNotesView = ({ data, onAdd, onUpdate, onDelete }: { data: any, onAdd?: (item: any) => void, onUpdate?: (item: any) => void, onDelete?: (id: string) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const [form, setForm] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: '',
        body: ''
    });

    const items = data?.items || [];

    const handleStartEdit = (item: any) => {
        setForm({
            time: item.time,
            description: item.description,
            body: item.body
        });
        setEditingId(item.id);
        setIsAdding(true);
        // Scroll to top? (Form is at top)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setForm({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            description: '',
            body: ''
        });
    };

    const handleSubmit = () => {
        if (!form.description && !form.body) return; // Prevent empty

        if (editingId && onUpdate) {
            // Update Existing
            const updatedItem = {
                id: editingId,
                // Keep original date or allow update? Usually keep original unless editable.
                // We'll trust the form content. Date isn't in form, so we grab it from original item?
                // The item ID lookup handled by parent or we find it here to preserve other fields?
                // For simplicity, we pass back the fields we edit. The parent merges.
                // Actually, let's find the original to be safe about date.
                date: items.find((i: any) => i.id === editingId)?.date || new Date().toLocaleDateString(),
                ...form
            };
            onUpdate(updatedItem);
        } else if (onAdd) {
            // Create New
            const newItem = {
                id: `note-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                ...form
            };
            onAdd(newItem);
        }

        handleCancel();
    };

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            {(onAdd || onUpdate) && !isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg mb-4"
                >
                    <Plus size={16} />
                    <span>Add Note</span>
                </button>
            )}

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold uppercase text-white">{editingId ? 'Edit Note' : 'New Note'}</span>
                        <button onClick={handleCancel}><X size={16} className="text-zinc-400" /></button>
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Time</label>
                        <input
                            type="time"
                            value={form.time}
                            onChange={e => setForm({ ...form, time: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Subject</label>
                        <input
                            placeholder="Topic (e.g. Safety Meeting)"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 placeholder:text-zinc-600 font-bold"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Body</label>
                        <textarea
                            placeholder="Enter details..."
                            value={form.body}
                            onChange={e => setForm({ ...form, body: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base p-2 rounded focus:outline-none focus:border-emerald-500 min-h-[120px] placeholder:text-zinc-600 resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex gap-2">
                        {editingId && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-zinc-800 text-white font-bold uppercase text-xs py-3 rounded"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs py-3 rounded flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            <span>{editingId ? 'Update Note' : 'Save Note'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <div className="text-center py-8 opacity-50"><p className="text-xs text-zinc-500">No notes recorded.</p></div>
                ) : (
                    items.slice().reverse().map((item: any, i: number) => {
                        const isConfirming = deleteConfirmId === item.id;
                        return (
                            <div key={item.id || i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 group relative">
                                <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-emerald-500 text-xs font-bold">{item.time}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">{item.date}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Edit Button */}
                                        {onUpdate && !isConfirming && (
                                            <button
                                                onClick={() => handleStartEdit(item)}
                                                className="text-zinc-500 hover:text-white"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                        {/* Delete Button */}
                                        {onDelete && !isConfirming && (
                                            <button
                                                onClick={() => setDeleteConfirmId(item.id)}
                                                className="text-zinc-500 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isConfirming ? (
                                    <div className="bg-red-900/10 border border-red-500/20 p-3 rounded mb-2 animate-in fade-in">
                                        <p className="text-[10px] text-red-400 font-bold uppercase mb-2 text-center">Delete this note?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setDeleteConfirmId(null)}
                                                className="flex-1 bg-zinc-800 text-xs font-bold py-2 rounded uppercase"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDelete && onDelete(item.id);
                                                    setDeleteConfirmId(null);
                                                }}
                                                className="flex-1 bg-red-500 text-xs font-bold py-2 rounded uppercase text-black"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {item.description && (
                                            <h4 className="text-sm font-black text-white uppercase mb-2 leading-tight">{item.description}</h4>
                                        )}
                                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{item.body}</p>
                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            <div className="h-12 text-center text-[10px] text-zinc-800 uppercase font-bold pt-4">End of Notes</div>
        </div>
    );
};

export const MobileLocationsView = ({ data }: { data: any }) => {
    const items = data?.items || [];

    // Assuming EmptyState is a component that exists and is accessible
    // If not, you might need to define it or import it.
    const EmptyState = ({ label }: { label: string }) => (
        <div className="text-center py-8 opacity-50">
            <p className="text-xs text-zinc-500">No {label} recorded.</p>
        </div>
    );

    if (items.length === 0) return <EmptyState label="Locations" />;

    return (
        <div className="space-y-6 pb-8">
            {items.map((loc: any, i: number) => (
                <div key={loc.id || i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Main Image Banner */}
                    <div className="w-full aspect-video bg-zinc-800 relative">
                        {loc.mainImage ? (
                            <img src={loc.mainImage} className="w-full h-full object-cover" alt={loc.name} />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                                <HardDrive size={24} className="mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-xl font-black uppercase text-white tracking-tight leading-none mb-1">{loc.name || 'Unknown Location'}</h3>
                            {loc.address && (
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wide w-fit"
                                >
                                    <MapPin size={12} />
                                    <span>Open Map</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Details Body */}
                    <div className="p-4 space-y-4">
                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-4">
                            <div>
                                <span className="text-[9px] font-bold uppercase text-zinc-500 block mb-0.5">Address</span>
                                <p className="text-xs text-zinc-300 leading-snug">{loc.address || 'TBD'}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase text-zinc-500 block mb-0.5">Contact</span>
                                <p className="text-xs text-zinc-300 leading-snug">{loc.contact || '-'}</p>
                            </div>
                        </div>

                        {/* Logistics Notes */}
                        {loc.notes && (
                            <div>
                                <span className="text-[9px] font-bold uppercase text-zinc-500 block mb-1">Logistics & Notes</span>
                                <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
                                    {loc.notes}
                                </p>
                            </div>
                        )}

                        {/* Secondary Images (Grid) */}
                        {(loc.smallImage1 || loc.smallImage2) && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                {loc.smallImage1 && (
                                    <div className="aspect-video bg-zinc-800 rounded overflow-hidden border border-zinc-800">
                                        <img src={loc.smallImage1} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {loc.smallImage2 && (
                                    <div className="aspect-video bg-zinc-800 rounded overflow-hidden border border-zinc-800">
                                        <img src={loc.smallImage2} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MobileReleasesView = ({ data, onUpdate }: { data: any, onUpdate?: (releases: any[]) => void }) => {
    const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const sigPad = React.useRef<any>(null);

    // Create Form State
    const [newReleaseType, setNewReleaseType] = useState<'talent' | 'property'>('talent');
    const [newReleaseName, setNewReleaseName] = useState('');

    const releases = data?.releases || [];
    const activeRelease = releases.find((r: any) => r.id === activeId);

    const handleCreateWrapper = () => {
        setNewReleaseName('');
        setNewReleaseType('talent');
        setView('create');
    };

    const submitCreate = () => {
        if (!newReleaseName || !onUpdate) return;

        const id = `rev-${Date.now()}`;
        const newRelease = {
            id,
            type: newReleaseType,
            name: newReleaseName, // This will map to talentName or ownerName
            description: '',
            status: 'draft',
            dateCreated: new Date().toISOString(),
            data: {
                productionCompany: 'CREATIVE OS PRODUCTIONS',
                shootDate: new Date().toISOString().split('T')[0],
                // Pre-populate specific fields
                ...(newReleaseType === 'talent' ? { talentName: newReleaseName } : { ownerName: newReleaseName })
            }
        };

        onUpdate([...releases, newRelease]);
        setActiveId(id);
        setView('detail');
    };

    const handleSaveSignature = async () => {
        if (!activeRelease || !sigPad.current || sigPad.current.isEmpty() || !onUpdate) {
            if (sigPad.current?.isEmpty()) alert("Please sign before saving.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Convert signature to blob
            const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // 2. Generate filename
            const fileName = `signatures/mobile-${activeRelease.type}-${Date.now()}.png`;

            // 3. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: 'image/png'
                });

            if (uploadError) {
                console.error("Supabase Upload Error:", uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // 4. Get Public URL
            const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
            if (!data || !data.publicUrl) {
                throw new Error("Failed to retrieve public URL");
            }

            // 5. Update local object
            const updatedReleases = releases.map((r: any) => {
                if (r.id === activeId) {
                    return {
                        ...r,
                        status: 'signed',
                        data: {
                            ...r.data,
                            signatureUrl: data.publicUrl,
                            signedAt: new Date().toISOString()
                        }
                    };
                }
                return r;
            });

            onUpdate(updatedReleases);
            setView('list');
            setActiveId(null);

        } catch (e: any) {
            console.error("Signature Save Error:", e);
            alert(`Failed to save signature: ${e.message || "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (view === 'create') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <button
                    onClick={() => setView('list')}
                    className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-white"
                >
                    <X size={14} /> Back to List
                </button>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-black uppercase text-white mb-6">New Release</h2>

                    <div className="mb-4">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-2">Type</label>
                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                            <button
                                onClick={() => setNewReleaseType('talent')}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-md transition-all ${newReleaseType === 'talent' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                            >
                                Talent
                            </button>
                            <button
                                onClick={() => setNewReleaseType('property')}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-md transition-all ${newReleaseType === 'property' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                            >
                                Property
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-2">
                            {newReleaseType === 'talent' ? 'Talent Name' : 'Owner Name'}
                        </label>
                        <input
                            value={newReleaseName}
                            onChange={(e) => setNewReleaseName(e.target.value)}
                            placeholder={newReleaseType === 'talent' ? "Enter full name..." : "Enter owner name..."}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
                        />
                    </div>

                    <button
                        onClick={submitCreate}
                        disabled={!newReleaseName}
                        className="w-full bg-emerald-500 text-black font-black uppercase text-xs py-4 rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Release
                    </button>
                </div>
            </div>
        )
    }

    if (view === 'detail' && activeRelease) {
        const d = activeRelease.data || {};
        const isSigned = !!d.signatureUrl;

        return (
            <div className="space-y-6">
                <button
                    onClick={() => { setView('list'); setActiveId(null); }}
                    className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-white"
                >
                    <X size={14} /> Back to List
                </button>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6 space-y-6">
                    <div>
                        <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase px-2 py-1 rounded inline-block mb-2">
                            {activeRelease.type} Release
                        </span>
                        <h2 className="text-2xl font-black uppercase text-white leading-none mb-1">
                            {activeRelease.name || 'Untitled'}
                        </h2>
                        <p className="text-sm text-zinc-400">{activeRelease.description}</p>
                    </div>

                    {/* Quick Meta */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-600 block">Producer</label>
                            <span className="text-white">{d.productionCompany}</span>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-600 block">Date</label>
                            <span className="text-white">{d.shootDate || d.shootDates}</span>
                        </div>
                    </div>

                    {/* Status */}
                    {isSigned ? (
                        <div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                            <Check size={24} className="text-emerald-500 mb-2" />
                            <p className="text-emerald-400 font-black uppercase text-xs tracking-wider">Signed & Valid</p>
                            <p className="text-[9px] text-zinc-500 font-mono mt-1">{new Date(d.signedAt).toLocaleString()}</p>
                            <img src={d.signatureUrl} className="h-12 mt-3 opacity-80 filter invert" alt="Sig" />
                        </div>
                    ) : (
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            {/* Full Legal Text Display for Mobile */}
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 text-[10px] text-zinc-400 leading-relaxed max-h-[200px] overflow-y-auto mb-4 text-justify">
                                <p className="whitespace-pre-wrap">
                                    {d.isCustom
                                        ? (d.customLegalText || "No custom terms provided.")
                                        : (
                                            activeRelease.type === 'property'
                                                ? (d.standardLegalText || DEFAULT_PROPERTY_TEXT)
                                                : (d.standardLegalText || DEFAULT_STANDARD_TEXT)
                                        ).replace(/THE PRODUCER/g, d.productionCompany || 'THE PRODUCER')
                                    }
                                </p>
                            </div>

                            <p className="text-[10px] uppercase font-bold text-zinc-400 text-center tracking-widest mb-2">Sign Below</p>

                            <div className="bg-white rounded overflow-hidden mb-4">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor="black"
                                    canvasProps={{
                                        width: 300,
                                        height: 150,
                                        className: 'w-full h-[150px] cursor-crosshair'
                                    }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => sigPad.current?.clear()}
                                    className="flex-1 bg-zinc-800 text-zinc-400 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleSaveSignature}
                                    disabled={isSaving}
                                    className="flex-[2] bg-emerald-500 text-black py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-400"
                                >
                                    {isSaving ? 'Saving...' : 'Accept & Sign'}
                                </button>
                            </div>

                            <p className="text-[10px] uppercase font-bold text-zinc-400 text-center tracking-widest mb-2">Sign Above</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {onUpdate && (
                <button
                    onClick={handleCreateWrapper}
                    className="w-full bg-emerald-500 text-black font-black uppercase text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg mb-4"
                >
                    <Plus size={16} />
                    <span>New Release</span>
                </button>
            )}

            {releases.length === 0 ? (
                <EmptyState label="Releases" />
            ) : (
                releases.map((r: any) => (
                    <div
                        key={r.id}
                        onClick={() => { setActiveId(r.id); setView('detail'); }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.status === 'signed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                {r.status === 'signed' ? <Check size={16} /> : <Edit2 size={16} />}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-none mb-1">{r.name || 'Untitled'}</h3>
                                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wide">{r.description || r.type}</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${r.status === 'signed' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                            {r.status || 'Draft'}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
