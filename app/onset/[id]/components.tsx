import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Check, HardDrive, AlertCircle, Trash2, Edit2, MapPin, FileText, Clock, Smartphone, Phone, Mail, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { getClient } from '@/lib/supabase';
import SignatureCanvas from 'react-signature-canvas';
import { useProjectData } from '@/lib/useProjectData';
import { ImageUploader } from '@/components/ui/ImageUploader';

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
    'creative-brief': 'Creative Brief',
    'treatment': 'Treatment',
    'client-selects': 'Client Selects',
    'deliverables': 'Deliverables',
    'archive': 'Archive Log',
    'lookbook': 'Lookbook',
    // Existing
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
    'releases': 'Releases',
    'script-notes': 'Script Notes',
    'sound-report': 'Sound Report',
    'equipment-list': 'Equipment',
    'props-list': 'Props'
};

/* --------------------------------------------------------------------------------
 * VIEW COMPONENTS
 * -------------------------------------------------------------------------------- */



export const CrewListView = ({ data, liveUsers = [], onAdd, onUpdate, onDelete, isReadOnly }: { data: any, liveUsers?: string[], onAdd?: (item: any) => void, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingMember, setEditingMember] = useState<any | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        department: '',
        phone: '',
        email: '',
        onSetGroups: [] as string[]
    });

    if (!data) return <EmptyState label="Crew List" />;

    const crew = data.crew || [];

    const filtered = crew.filter((m: any) =>
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

    const handleStartAdd = () => {
        setForm({ name: '', role: '', department: '', phone: '', email: '', onSetGroups: [] });
        setEditingMember(null);
        setIsAdding(true);
    };

    const handleStartEdit = (m: any) => {
        setForm({
            name: m.name || '',
            role: m.role || '',
            department: m.department || '',
            phone: m.phone || '',
            email: m.email || '',
            onSetGroups: m.onSetGroups || []
        });
        setEditingMember(m);
        setIsAdding(true);
    };

    const handleSubmit = () => {
        if (!form.name || !form.role) return;
        if (editingMember && onUpdate) {
            onUpdate({ ...editingMember, ...form });
        } else if (onAdd) {
            onAdd({ id: `crew-${Date.now()}`, ...form });
        }
        setIsAdding(false);
        setEditingMember(null);
    };

    const toggleGroup = (group: string) => {
        const current = form.onSetGroups;
        const updated = current.includes(group)
            ? current.filter(g => g !== group)
            : [...current, group];
        setForm({ ...form, onSetGroups: updated });
    };

    if (isAdding) {
        return (
            <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5 ml-1">Membership</span>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-black leading-none">{editingMember ? 'Edit Member' : 'Add Crew'}</h3>
                    </div>
                    <button onClick={() => setIsAdding(false)} className="bg-zinc-100 dark:bg-zinc-100 p-2.5 rounded-full text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 transition-colors"><X size={18} /></button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Full Name</label>
                        <input
                            className="w-full bg-white dark:bg-white border border-zinc-200 dark:border-zinc-300 rounded-xl shadow-sm py-4 px-5 text-zinc-900 dark:text-black font-bold placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all"
                            placeholder="NAME"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">Role / Position</label>
                            <input
                                className="w-full bg-white dark:bg-white border border-zinc-200 dark:border-zinc-300 rounded-[16px] shadow-sm py-3 px-4 text-zinc-900 dark:text-black text-[17px] font-black tracking-tight uppercase outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
                                placeholder="ROLE"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">Department</label>
                            <input
                                className="w-full bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-[16px] shadow-sm py-3 px-4 text-zinc-900 dark:text-black text-[17px] font-black tracking-tight uppercase outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
                                placeholder="DEPT"
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">Email Address</label>
                        <input
                            className="w-full bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-[16px] shadow-sm py-3 px-4 text-zinc-900 dark:text-black text-[17px] font-black tracking-tight outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
                            placeholder="EMAIL"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">Phone Number</label>
                        <input
                            className="w-full bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-[16px] shadow-sm py-3 px-4 text-zinc-900 dark:text-black text-[17px] font-black tracking-tight outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
                            placeholder="PHONE"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>

                    {/* ABCD REMOVED - NOW DRIVEN BY MATRIX */}

                    <div className="pt-6 flex flex-col gap-3">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-zinc-900 text-white dark:text-zinc-500 shadow-lg shadow-zinc-900/10 font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Save size={18} />
                            <span>{editingMember ? 'Update Member' : 'Save to Crew List'}</span>
                        </button>
                        {editingMember && onDelete && (
                            <button
                                onClick={() => {
                                    onDelete(editingMember.id);
                                    setIsAdding(false);
                                }}
                                className="w-full bg-red-500/10 text-red-500 font-bold uppercase tracking-widest py-4 rounded-2xl border border-red-500/20"
                            >
                                Remove from Crew
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search & Add */}
            <div className="sticky top-0 z-10 bg-zinc-50/50 dark:bg-zinc-50/50 pb-2 pt-2 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500" size={14} />
                    <input
                        className="w-full bg-white dark:bg-white border border-zinc-200 dark:border-zinc-300 rounded-xl shadow-sm py-3.5 pl-11 pr-5 text-sm text-zinc-900 dark:text-black placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 uppercase font-bold tracking-widest transition-all"
                        placeholder="SEARCH CREW..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {isOwner && (
                    <button
                        onClick={handleStartAdd}
                        className="bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] w-12 h-12 rounded-[16px] flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                    >
                        <Plus size={22} strokeWidth={3} />
                    </button>
                )}
            </div>

            {Object.entries(grouped).map(([dept, members]) => (
                <div key={dept} className="space-y-3">
                    <div className="sticky top-14 z-0 bg-zinc-50/80 dark:bg-zinc-50/80 backdrop-blur-md py-2 px-1">
                        <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                            {dept}
                        </h3>
                    </div>
                    <div className="grid gap-2">
                        {members.map((m: any) => (
                            <div key={m.id} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-zinc-200 dark:border-zinc-200 hover:shadow-md transition-shadow flex items-center justify-between group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {m.email && liveUsers.includes(m.email) && (
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" title="Online now" />
                                        )}
                                        <p className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-black leading-none">{m.name || 'Unnamed'}</p>
                                        {isOwner && !isReadOnly && (
                                            <button onClick={() => handleStartEdit(m)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 size={10} className="text-emerald-600" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wide mb-0.5">{m.role}</p>
                                    {/* Groups Pill */}
                                    {m.onSetGroups && m.onSetGroups.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {m.onSetGroups.map((g: string) => (
                                                <span key={g} className={`text-[10px] font-black uppercase w-6 h-6 flex items-center justify-center rounded-full shadow-sm ${g === 'A' ? 'bg-[#22C55E] text-white dark:text-zinc-500' : g === 'B' ? 'bg-[#3B82F6] text-white dark:text-zinc-500' : g === 'C' ? 'bg-[#EAB308] text-white dark:text-zinc-500' : 'bg-[#EF4444] text-white dark:text-zinc-500'}`}>{g}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {m.phone && (
                                        <a href={`tel:${m.phone}`} className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-50 flex items-center justify-center text-zinc-600 dark:text-zinc-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors">
                                            <Phone size={14} />
                                        </a>
                                    )}
                                    {m.email && (
                                        <a href={`mailto:${m.email}`} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-100 flex items-center justify-center text-zinc-600 dark:text-zinc-600 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
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
                <div className="text-center py-8 opacity-50"><p className="text-xs text-zinc-500 dark:text-zinc-500">No matches found.</p></div>
            )}
        </div>
    );
};

export const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-white dark:bg-white rounded-[24px] flex items-center justify-center mb-6 border border-black/[0.03] shadow-sm relative">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl animate-pulse"></div>
            <AlertCircle size={24} className="text-zinc-300" />
        </div>
        <p className="text-xs uppercase font-black tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Document Registry</p>
        <h3 className="text-sm font-black text-zinc-900 dark:text-black mb-6 uppercase tracking-tight">{label}</h3>

        <div className="bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-sm max-w-[220px]">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                No active data found. <br />
                <span className="text-emerald-600">Draft in Desktop Editor</span><br />
                to sync this tool.
            </p>
        </div>
    </div>
);

export const EmailEntryGate = ({ onJoin, projectName }: any) => {
    const [val, setVal] = useState('');
    const [viewDoc, setViewDoc] = useState<'nda' | 'privacy' | null>(null);

    if (viewDoc) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col p-6 animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wider text-zinc-900 dark:text-black">
                        {viewDoc === 'nda' ? 'Non-Disclosure Agreement' : 'Privacy Policy'}
                    </h2>
                    <button
                        onClick={() => setViewDoc(null)}
                        className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-black">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none text-zinc-500 dark:text-zinc-500">
                        {viewDoc === 'nda' ? (
                            <>
                                <h3 className="text-zinc-900 dark:text-black font-bold uppercase mb-4">Confidentiality & Non-Disclosure Agreement</h3>

                                <p><strong className="text-zinc-900 dark:text-black">Confidentiality:</strong> All project materials, including scripts, call sheets, and schedules, are strictly confidential.</p>

                                <p><strong className="text-zinc-900 dark:text-black">No Photography/Social Media:</strong> You are prohibited from taking or sharing photos, videos, or "behind-the-scenes" content without explicit written permission.</p>

                                <p><strong className="text-zinc-900 dark:text-black">Proprietary Info:</strong> All technical data, such as DIT logs and lighting plots, remains the property of the Production.</p>

                                <p><strong className="text-zinc-900 dark:text-black">Revocable Access:</strong> Access to this dashboard is a privilege for active crew members and can be revoked by the Administrator at any time.</p>

                                <div className="mt-8 pt-8 border-t border-zinc-800">
                                    <button
                                        onClick={() => setViewDoc(null)}
                                        className="w-full bg-zinc-900 text-white dark:text-zinc-500 font-black uppercase py-4 rounded tracking-widest hover:bg-emerald-400"
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
        <div className="h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Welcome to Set</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-8 uppercase font-bold tracking-widest">Please identify yourself</p>

            <input
                type="email"
                placeholder="Enter your email..."
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-[90%] max-w-[340px] bg-white dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-center text-sm mb-4 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-white font-mono shadow-sm"
            />

            <button
                onClick={() => onJoin(val)}
                disabled={!val}
                className="w-[90%] max-w-[340px] bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl font-bold uppercase py-3 rounded-xl tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 mb-8 transition-colors"
            >
                Enter
            </button>

            <div className="text-[10px] text-zinc-600 dark:text-zinc-400 max-w-[280px] leading-relaxed text-center space-y-4">
                <p>
                    By joining this project, you agree to the <button onClick={() => setViewDoc('privacy')} className="underline hover:text-black dark:hover:text-white transition-colors">onFORMAT Terms of Service</button>. We use your email to secure your access to project documents and to keep you updated on platform features and industry tools. You can opt-out of marketing communications at any time via your account settings.
                </p>
                <button onClick={() => setViewDoc('nda')} className="text-zinc-700 dark:text-zinc-300 font-bold underline uppercase tracking-wider block mx-auto hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Read Production NDA
                </button>
            </div>
        </div>
    );
}

export const ScriptView = ({ data }: { data: any }) => {
    if (!data || !data.rows || data.rows.length === 0) return <EmptyState label="Script" />;

    return (
        <div className="bg-white dark:bg-white p-6 rounded-[30px] shadow-sm border border-black/[0.03] space-y-10">
            {data.rows.map((row: any, i: number) => (
                <div key={row.id || i} className="flex gap-4 group">
                    <div className="w-8 shrink-0 pt-1">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-100 shadow-inner border border-zinc-200 dark:border-zinc-200 flex items-center justify-center text-[10px] font-black text-zinc-600 dark:text-zinc-600 font-mono">
                            {row.scene || i + 1}
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-baseline justify-between border-b border-zinc-100 dark:border-zinc-100 pb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 dark:text-zinc-400">
                                {row.time || '00:00'}
                            </span>
                        </div>

                        <div className="font-mono text-base leading-relaxed text-zinc-900 dark:text-black">
                            <span className="text-zinc-400 dark:text-zinc-400 uppercase text-[9px] font-black tracking-widest block mb-1">Visual</span>
                            <div className="whitespace-pre-wrap">{row.visual}</div>
                        </div>

                        <div className="font-sans font-inter text-base leading-relaxed text-zinc-800 dark:text-zinc-800 pl-4 border-l border-emerald-500/30 w-full bg-zinc-50/30 dark:bg-zinc-50/30 py-2 rounded-r-lg">
                            <span className="text-emerald-600 uppercase text-[9px] font-black tracking-widest block mb-1">Audio</span>
                            <div className="whitespace-pre-wrap">{row.audio}</div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="h-12 text-center text-[10px] text-zinc-400 dark:text-zinc-400 uppercase font-black tracking-widest pt-8 border-t border-zinc-50 dark:border-zinc-50">End of Script</div>
        </div>
    );
};

export const ShotListView = ({ data, onCheckShot, isReadOnly }: { data: any, onCheckShot?: (id: string, status: string, addToLog: boolean) => void, isReadOnly?: boolean }) => {
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    if (!data || !data.shots || data.shots.length === 0) return <EmptyState label="Shot List" />;

    return (
        <div className="flex flex-col space-y-3">
            {data.shots.map((shot: any, i: number) => {
                const isComplete = (shot.status || '').toLowerCase() === 'complete';
                const isConfirming = confirmingId === shot.id;

                if (isConfirming) {
                    return (
                        <div key={shot.id || i} className="p-4 bg-white dark:bg-white border border-zinc-200 dark:border-zinc-300 rounded-md shadow-sm border-l-4 border-l-emerald-500 animate-in fade-in">
                            <p className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-black mb-4">Mark Shot {shot.scene}-{shot.shot} Complete?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        onCheckShot && onCheckShot(shot.id, 'COMPLETE', true);
                                        setConfirmingId(null);
                                    }}
                                    className="flex-1 bg-zinc-900 text-white dark:text-zinc-500 shadow-lg shadow-zinc-900/10 font-bold uppercase text-xs py-3 rounded active:scale-95 transition-transform"
                                >
                                    Log & Complete
                                </button>
                                <button
                                    onClick={() => {
                                        onCheckShot && onCheckShot(shot.id, 'COMPLETE', false);
                                        setConfirmingId(null);
                                    }}
                                    className="flex-1 bg-zinc-50/50 dark:bg-zinc-50/50 text-zinc-900 dark:text-black font-bold uppercase text-xs py-3 rounded"
                                >
                                    Just Complete
                                </button>
                                <button onClick={() => setConfirmingId(null)} className="p-3 text-zinc-500 dark:text-zinc-500"><X size={16} /></button>
                            </div>
                        </div>
                    )
                }

                return (
                    <div key={shot.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow group relative flex items-start gap-4">
                        <div className="shrink-0 flex flex-col items-center gap-1 w-10 mt-1">
                            <span className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-bold">SCENE</span>
                            <span className="text-lg font-black text-zinc-900 dark:text-black leading-none">{shot.scene || '-'}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="bg-zinc-50/50 dark:bg-zinc-50/50 text-zinc-700 dark:text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">{shot.size || 'SIZE?'}</span>
                                <span className="bg-zinc-50/50 dark:bg-zinc-50/50 text-zinc-700 dark:text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">{shot.angle || 'ANGLE?'}</span>
                                <span className="bg-zinc-50/50 dark:bg-zinc-50/50 text-zinc-700 dark:text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">{shot.movement || 'STATIC'}</span>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-500 font-medium leading-normal mb-1">{shot.description}</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono truncate">{shot.technical || ''}</p>
                        </div>

                        {/* Editable Checkbox */}
                        <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                            <span className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-bold">DONE</span>
                            <button
                                onClick={() => {
                                    if (isReadOnly) return;
                                    if (isComplete) {
                                        onCheckShot && onCheckShot(shot.id, 'PENDING', false);
                                    } else {
                                        setConfirmingId(shot.id);
                                    }
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${isComplete ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-zinc-50/50 dark:bg-zinc-50/50 border-zinc-200 dark:border-zinc-800 text-transparent hover:border-zinc-400 hover:text-zinc-400 dark:text-zinc-500' }`}
                            >
                                <Check size={16} strokeWidth={4} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

import { EditableInput } from '@/components/ui/EditableInput';

export const CallSheetView = ({ data, scheduleData, onUpdate, isEditable: manualIsEditable, isReadOnly }: { data: any, scheduleData?: any, onUpdate?: (newData: any) => void, isEditable?: boolean, isReadOnly?: boolean }) => {
    const { canEditMobile, isOwner } = useProjectData();
    const isEditable = isReadOnly ? false : (manualIsEditable ?? canEditMobile);

    if (!data) return <EmptyState label="Call Sheet" />;

    const updateField = (field: string, newValue: string) => {
        if (onUpdate) {
            onUpdate({ ...data, [field]: newValue });
        }
    };

    const updateEventField = (index: number, field: string, newValue: string) => {
        if (onUpdate) {
            const newEvents = [...(data.events || [])];
            newEvents[index] = { ...newEvents[index], [field]: newValue };
            onUpdate({ ...data, events: newEvents });
        }
    };

    return (
        <div className="space-y-6">
            {/* Vitals */}
            <div className="bg-white dark:bg-white rounded-[20px] p-8 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-center">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest">Shoot Date</p>
                    <div className="text-xl font-black text-zinc-900 dark:text-black uppercase tracking-tighter">
                        <EditableInput
                            value={scheduleData?.date || data.date || "TBD"}
                            onSave={(val) => updateField('date', val)}
                            isEditable={!!isEditable && !scheduleData?.date}
                            placeholder="TBD"
                        />
                    </div>
                </div>

                <div className="h-px bg-slate-500/20 w-12 mx-auto my-6" />

                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">General Call Time</p>
                <div className="text-5xl font-black text-zinc-900 dark:text-black tracking-tighter flex justify-center">
                    <EditableInput
                        value={scheduleData?.callTime || data.crewCall || "TBD"}
                        onSave={(val) => updateField('crewCall', val)}
                        isEditable={!!isEditable && !scheduleData?.callTime}
                        placeholder="00:00"
                    />
                </div>
            </div>

            {/* Critical Logistics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Basecamp</p>
                    <EditableInput
                        value={data.basecamp || "TBD"}
                        onSave={(val) => updateField('basecamp', val)}
                        isEditable={!!isEditable}
                        className="text-sm font-bold text-zinc-900 dark:text-black whitespace-pre-wrap block"
                        placeholder="Enter location..."
                    />
                </div>
                <div className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Weather</p>
                    <EditableInput
                        value={data.weather || "TBD"}
                        onSave={(val) => updateField('weather', val)}
                        isEditable={!!isEditable}
                        className="text-sm font-bold text-zinc-900 dark:text-black block"
                        placeholder="75° Sunny"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Sunrise / Sunset</p>
                    <EditableInput
                        value={data.sunriseSunset || "TBD"}
                        onSave={(val) => updateField('sunriseSunset', val)}
                        isEditable={!!isEditable}
                        className="text-sm font-bold text-zinc-900 dark:text-black block"
                        placeholder="06:00 / 20:00"
                    />
                </div>
                <div className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-red-500/10 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <p className="text-[10px] text-red-500 uppercase font-black mb-1">Hospital</p>
                    <EditableInput
                        value={data.hospital || "Lookup required"}
                        onSave={(val) => updateField('hospital', val)}
                        isEditable={!!isEditable}
                        className="text-sm font-bold text-zinc-900 dark:text-black block"
                        placeholder="Enter address..."
                    />
                </div>
            </div>

            {/* Notes */}
            <div className={`${isOwner ? 'bg-emerald-500/[0.03] border-emerald-500/10' : 'bg-white dark:bg-white border-black/[0.03]'} rounded-[20px] p-6 shadow-sm border hover:shadow-md transition-shadow`}>
                <p className={`text-[10px] font-black uppercase ${isOwner ? 'text-emerald-600' : 'text-zinc-500 dark:text-zinc-500'} mb-2 tracking-widest`}>Producer Notes</p>
                <EditableInput
                    value={data.notes || ""}
                    onSave={(val) => updateField('notes', val)}
                    isEditable={isOwner}
                    type="textarea"
                    className={`text-sm font-medium ${isOwner ? 'text-zinc-900 dark:text-black' : 'text-zinc-600 dark:text-zinc-500'} italic whitespace-pre-wrap block`}
                    placeholder={isOwner ? "Enter notes..." : ""}
                />
            </div>

            {/* Schedule */}
            <div>
                <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 mb-2 pl-1">Schedule</h3>
                <div className="space-y-0.5">
                    {(scheduleData?.items && scheduleData.items.length > 0) ? (
                        scheduleData.items.map((item: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] border-l-4 border-emerald-500 flex gap-4 hover:shadow-md transition-shadow">
                                <span className="text-xs font-mono font-bold text-emerald-400 w-10 shrink-0">{item.time || '00:00'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-500">
                                            {item.scene ? `SCENE ${item.scene}` : (item.type || 'EVENT')}
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-600 dark:text-zinc-500 uppercase truncate max-w-[80px]">
                                            {item.set || item.location}
                                        </span>
                                    </div>
                                    {(item.intExt || item.dayNight) && (
                                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-bold mb-0.5">
                                            {item.intExt && <span>{item.intExt}</span>}
                                            {item.intExt && item.dayNight && <span>•</span>}
                                            {item.dayNight && <span>{item.dayNight}</span>}
                                        </div>
                                    )}
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">{item.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (data.events && data.events.length > 0 ? (
                        data.events.map((evt: any, i: number) => (
                            <div key={evt.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] border-l-4 border-emerald-500 flex gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 shrink-0">
                                    <EditableInput
                                        value={evt.time || '00:00'}
                                        onSave={(val) => updateEventField(i, 'time', val)}
                                        isEditable={!!isEditable}
                                        className="text-xs font-mono font-bold text-emerald-400 block"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <EditableInput
                                            value={evt.type || 'EVENT'}
                                            onSave={(val) => updateEventField(i, 'type', val)}
                                            isEditable={!!isEditable}
                                            className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-500 block"
                                        />
                                        <EditableInput
                                            value={evt.location || ''}
                                            onSave={(val) => updateEventField(i, 'location', val)}
                                            isEditable={!!isEditable}
                                            className="text-[9px] font-mono text-zinc-600 dark:text-zinc-500 uppercase truncate"
                                        />
                                    </div>
                                    <EditableInput
                                        value={evt.description || ''}
                                        onSave={(val) => updateEventField(i, 'description', val)}
                                        isEditable={!!isEditable}
                                        className="text-xs text-zinc-500 dark:text-zinc-500 block truncate"
                                        placeholder="Add description..."
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-white rounded-[16px] p-4 shadow-sm border border-black/[0.03] border-l-2 border-zinc-500">
                            <span className="text-xs text-zinc-500 dark:text-zinc-500">No events scheduled.</span>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    )
}


export const MobileDITLogView = ({ data, onAdd, projectId, mediaAlerts = [], setMediaAlerts, isReadOnly }: { data: any, onAdd?: (item: any) => void, projectId?: string, mediaAlerts?: any[], setMediaAlerts?: React.Dispatch<React.SetStateAction<any[]>>, isReadOnly?: boolean }) => {
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

    if (items.length === 0 && !isAdding) {
        return (
            <div className="space-y-4">
                {/* Still show the Log Activity button if user has permission */}
                {onAdd && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 mb-6 active:scale-95 transition-transform"
                    >
                        <Plus size={16} />
                        <span>Log Activity</span>
                    </button>
                )}
                <EmptyState label="DIT Log" />
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* MEDIA ALERTS */}
            {mediaAlerts.map((alert, idx) => (
                <div key={idx} className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 mb-2">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                            <HardDrive size={16} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-black uppercase text-emerald-400 mb-1">New Roll Pulled</h4>
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
                                <strong className="text-zinc-900 dark:text-black">Roll {alert.roll}</strong> • Cam {alert.camera} • {alert.mediaType}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1 font-mono">
                                {alert.fps}fps • {alert.iso} ISO • {alert.shutter} • {alert.wb}
                            </p>
                        </div>
                        <button onClick={() => setMediaAlerts && setMediaAlerts((prev: any[]) => prev.filter((_: any, i: number) => i !== idx))} className="text-zinc-500 dark:text-zinc-500"><X size={14} /></button>
                    </div>
                    {onAdd && (
                        <button
                            onClick={() => handleStartIngest(alert)}
                            className="bg-zinc-900 text-white dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest py-3 rounded-xl w-full hover:bg-emerald-500 transition-colors shadow-lg shadow-zinc-900/10"
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
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-6"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Log New Activity</span>
                </button>
            )}

            {/* ADD FORM */}
            {isAdding && (
                <div className="bg-white dark:bg-white rounded-[30px] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-300 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Activity Report</span>
                        <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-50/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"><X size={16} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Timestamp</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-300 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-bold transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Entry Status</label>
                            <div className="relative">
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-bold transition-all text-sm appearance-none"
                                >
                                    <option value="complete">Complete</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
                                    <Check size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Task Category</label>
                        <div className="grid grid-cols-3 gap-2 bg-zinc-100/80 dark:bg-zinc-50/80 p-1.5 rounded-2xl border border-black/[0.02]">
                            {['offload', 'backup', 'transcode', 'qc', 'transfer', 'issue'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm({ ...form, eventType: t as any })}
                                    className={`text-[9px] uppercase font-black tracking-widest py-2.5 rounded-xl transition-all duration-200 ${form.eventType === t ? 'bg-white dark:bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-500'}`}
                                >
                                    {t === 'transfer' ? 'Send' : t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Source Media</label>
                            <input
                                placeholder="Roll A001"
                                value={form.source}
                                onChange={e => setForm({ ...form, source: e.target.value })}
                                className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-bold transition-all text-sm placeholder:text-zinc-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Destination</label>
                            <input
                                placeholder="Backup Drive"
                                value={form.destination}
                                onChange={e => setForm({ ...form, destination: e.target.value })}
                                className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-bold transition-all text-sm placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Data Volume (GB)</label>
                            <input
                                placeholder="128"
                                value={(form as any).dataSize || ''}
                                onChange={e => setForm({ ...form, dataSize: e.target.value } as any)}
                                className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-bold transition-all text-sm placeholder:text-zinc-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Verification</label>
                            <input
                                placeholder="xxhash"
                                value={(form as any).checksum || ''}
                                onChange={e => setForm({ ...form, checksum: e.target.value } as any)}
                                className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-mono font-bold transition-all text-xs placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Detailed Logs</label>
                        <textarea
                            placeholder="Add specifics about ingest or verification..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-medium transition-all text-sm h-32 placeholder:text-zinc-300 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-zinc-900 text-white dark:text-zinc-500 shadow-xl shadow-zinc-900/10 font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20"
                    >
                        <Save size={18} />
                        <span>Commit to Log</span>
                    </button>
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-2 text-center mb-4">
                <div className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                    <div className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Total Offloads</div>
                    <div className="text-2xl font-black text-zinc-900 dark:text-black">{items.filter((i: any) => i.eventType === 'offload').length}</div>
                </div>
                <div className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                    <div className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Issues</div>
                    <div className="text-2xl font-black text-red-500">{items.filter((i: any) => i.eventType === 'issue').length}</div>
                </div>
            </div>

            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <EmptyState label="DIT Log" />
                ) : (
                    items.map((item: any, i: number) => (
                        <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-mono text-emerald-400 text-xs font-bold">{item.time}</span>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm ${item.status === 'complete' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {item.status || 'PENDING'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-2 h-2 rounded-full ${item.eventType === 'issue' ? 'bg-red-500' : 'bg-zinc-500'}`}></div>
                                <div className="font-black text-sm text-zinc-900 dark:text-black uppercase tracking-wider">{item.eventType || 'EVENT'}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-500 mb-3 bg-zinc-50/50 dark:bg-zinc-50/50 p-3 rounded-xl border border-black/[0.03]">
                                <div>
                                    <span className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-0.5 tracking-widest">Source</span>
                                    <span className="font-mono text-zinc-900 dark:text-black font-bold">{item.source || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-0.5 tracking-widest">Destination</span>
                                    <span className="font-mono text-zinc-900 dark:text-black font-bold">{item.destination || '-'}</span>
                                </div>
                            </div>

                            {item.description && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-1 italic">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="h-12 text-center text-[10px] text-zinc-800 dark:text-zinc-200 uppercase font-bold pt-4">End of Log</div>
        </div>
    )
}

export const MobileCameraReportView = ({ data, onAdd, projectId, isReadOnly }: { data: any, onAdd?: (item: any) => void, projectId?: string, isReadOnly?: boolean }) => {
    const supabase = getClient();
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
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex-1 bg-white dark:bg-white text-zinc-900 dark:text-zinc-900 border border-zinc-200 dark:border-zinc-300 py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Log Shot</span>
                    </button>
                    <button
                        onClick={openNewRollModal}
                        className="w-1/3 bg-zinc-100 dark:bg-zinc-100 text-zinc-500 dark:text-zinc-500 font-black uppercase tracking-widest text-[10px] py-5 rounded-[20px] transition-all hover:bg-zinc-200 dark:hover:bg-zinc-200 active:scale-[0.98] border border-zinc-200"
                    >
                        New Roll
                    </button>
                </div>
            )}

            {/* NEW ROLL VERIFICATION MODAL */}
            {isNewRollModal && (
                <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-white rounded-[30px] p-8 shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-8 border border-zinc-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-zinc-900 tracking-tight">Initiate Roll</h3>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-1">Technical Spec Confirmation</p>
                            </div>
                            <button onClick={() => setIsNewRollModal(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-50/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"><X size={16} /></button>
                        </div>

                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Camera Unit</label>
                                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-50/50 rounded-2xl">
                                    {['A', 'B', 'C'].map(cam => (
                                        <button
                                            key={cam}
                                            onClick={() => setRollForm({ ...rollForm, camera: cam })}
                                            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all shadow-sm ${rollForm.camera === cam ? (cam === 'A' ? 'bg-emerald-500 text-white' : cam === 'B' ? 'bg-blue-500 text-white' : 'bg-amber-400 text-black dark:text-black') : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-500' }`}
                                        >
                                            Unit {cam}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1 text-emerald-600">Active Roll ID</label>
                                <input
                                    value={rollForm.roll}
                                    onChange={e => setRollForm({ ...rollForm, roll: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-300 rounded-xl px-4 py-4 text-zinc-900 dark:text-black text-xl font-mono font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase placeholder:text-zinc-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">ISO</label>
                                    <input
                                        value={rollForm.iso}
                                        onChange={e => setRollForm({ ...rollForm, iso: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-50 border border-black/[0.05] rounded-xl px-4 py-3 text-zinc-900 dark:text-black font-bold focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Project FPS</label>
                                    <input
                                        value={rollForm.fps}
                                        onChange={e => setRollForm({ ...rollForm, fps: e.target.value })}
                                        className="w-full bg-white dark:bg-white border border-zinc-200 dark:border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 dark:text-black font-bold focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Shutter</label>
                                    <input
                                        value={rollForm.shutter}
                                        onChange={e => setRollForm({ ...rollForm, shutter: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-50 border border-black/[0.05] rounded-xl px-4 py-3 text-zinc-900 dark:text-black font-bold focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">WB (K)</label>
                                    <input
                                        value={rollForm.wb}
                                        onChange={e => setRollForm({ ...rollForm, wb: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-50 border border-black/[0.05] rounded-xl px-4 py-3 text-zinc-900 dark:text-black font-bold focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsNewRollModal(false)}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-50/50 text-zinc-500 dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-colors hover:bg-zinc-200 dark:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmNewRoll}
                                className="flex-1 bg-zinc-900 text-white dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl shadow-xl shadow-zinc-900/20 hover:bg-emerald-600 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD FORM */}
            {isAdding && (
                <div className="bg-white dark:bg-white rounded-[30px] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-300 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 block">Shot Entry</span>
                            <span className="text-sm font-black text-emerald-600 block uppercase tracking-tighter">Roll {form.roll}</span>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-50/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"><X size={16} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Timestamp</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-300 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-bold transition-all text-sm"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Take Number</label>
                            <input
                                type="number"
                                value={form.take}
                                onChange={e => setForm({ ...form, take: e.target.value })}
                                className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-emerald-600 font-black text-center text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Scene</label>
                            <input
                                placeholder="1"
                                value={form.scene}
                                onChange={e => setForm({ ...form, scene: e.target.value })}
                                className="w-full bg-zinc-100/30 dark:bg-zinc-50/30 rounded-xl px-4 py-4 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-black text-center uppercase tracking-tighter text-lg"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Shot ID</label>
                            <input
                                placeholder="A"
                                value={form.shotId}
                                onChange={e => setForm({ ...form, shotId: e.target.value })}
                                className="w-full bg-zinc-100/30 dark:bg-zinc-50/30 rounded-xl px-4 py-4 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-black text-center uppercase tracking-tighter text-lg"
                            />
                        </div>
                    </div>

                    {/* Tech Specs Grid */}
                    <div className="bg-zinc-100/50 dark:bg-zinc-50/50 p-4 rounded-2xl border border-black/[0.02] mb-6">
                        <div className="mb-4 flex justify-between items-center border-b border-black/[0.03] pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Card Data</span>
                            <span className="font-mono text-[10px] font-black text-emerald-600">{form.roll}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-1">
                                <label className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-1">Lens</label>
                                <input
                                    value={form.lens}
                                    onChange={e => setForm({ ...form, lens: e.target.value })}
                                    className="w-full bg-white dark:bg-white rounded-lg border border-black/[0.05] text-zinc-900 dark:text-black text-[10px] p-2 text-center font-bold focus:outline-none"
                                    placeholder="mm"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-1">FPS</label>
                                <input
                                    value={form.fps}
                                    onChange={e => setForm({ ...form, fps: e.target.value })}
                                    className="w-full bg-white dark:bg-white rounded-lg border border-black/[0.05] text-zinc-900 dark:text-black text-[10px] p-2 text-center font-bold focus:outline-none"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-1">ISO</label>
                                <input
                                    value={form.iso}
                                    onChange={e => setForm({ ...form, iso: e.target.value })}
                                    className="w-full bg-white dark:bg-white rounded-lg border border-zinc-200 dark:border-zinc-300 text-zinc-900 dark:text-black text-[10px] p-2 text-center font-bold focus:outline-none"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-1">TC</label>
                                <input
                                    value={form.timecode || ''}
                                    onChange={e => handleTCChange(e.target.value)}
                                    className="w-full bg-white dark:bg-white rounded-lg border border-black/[0.05] text-zinc-900 dark:text-black text-[10px] p-2 text-center font-mono font-bold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { id: 'good', label: 'Good' },
                            { id: 'bad', label: 'NG' },
                            { id: 'circle', label: 'BUY' }
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setForm({ ...form, status: s.id })}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm ${form.status === s.id ? (s.id === 'circle' ? 'bg-amber-400 text-black dark:text-black shadow-amber-500/20' : s.id === 'bad' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20') : 'bg-zinc-100 dark:bg-zinc-50/50 text-zinc-400 dark:text-zinc-500' }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-8">
                        <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-500 block mb-2 px-1">Shot Notes</label>
                        <textarea
                            placeholder="Performance or technical notes..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-zinc-50/50 dark:bg-zinc-50/50 rounded-xl px-4 py-3 border border-black/[0.05] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900 dark:text-black font-medium transition-all text-sm h-28 placeholder:text-zinc-300 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-zinc-900 text-white dark:text-zinc-500 shadow-xl shadow-zinc-900/10 font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600"
                    >
                        <Save size={18} />
                        <span>Commit Shot</span>
                    </button>
                </div>
            )
            }

            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <EmptyState label="Camera Report" />
                ) : (
                    items.map((item: any, i: number) => (
                        <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow flex gap-4 items-center">
                            <div className="text-center w-12 shrink-0">
                                <span className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-500">{item.time}</span>
                                <span className="block text-xl font-black text-zinc-900 dark:text-black">{item.shot || item.shotId || '?'}</span>
                                {item.scene && <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-500">Sc {item.scene}</span>}
                                {item.roll && <span className="block text-[8px] font-mono text-zinc-600 dark:text-zinc-500 mt-1">{item.roll}</span>}
                            </div>
                            <div className="w-px h-8 bg-zinc-300"></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${item.status === 'circle' ? 'bg-yellow-500 text-black dark:text-black' : item.status === 'bad' ? 'text-red-500 bg-red-900/20' : 'text-emerald-600 bg-emerald-900/20' }`}>
                                        {item.status === 'circle' ? 'BUY' : item.status === 'bad' ? 'NG' : 'GOOD'}
                                    </span>
                                    {item.take && <span className="text-[9px] font-mono text-zinc-600 dark:text-zinc-500">TK {item.take}</span>}
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-500 leading-tight">{item.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}

export const ScheduleView = ({ data, callSheetData, onUpdate, isEditable: manualIsEditable, isReadOnly }: { data: any, callSheetData?: any, onUpdate?: (newData: any) => void, isEditable?: boolean, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const isEditable = isReadOnly ? false : (manualIsEditable ?? isOwner);

    if (!data) return <EmptyState label="Schedule" />;

    const updateField = (field: string, newValue: string) => {
        if (onUpdate) {
            onUpdate({ ...data, [field]: newValue });
        }
    };

    const updateItem = (index: number, updates: any) => {
        if (onUpdate) {
            const newItems = [...(data.items || [])];
            newItems[index] = { ...newItems[index], ...updates };
            onUpdate({ ...data, items: newItems });
        }
    };

    const handleDeleteItem = (id: string) => {
        if (onUpdate) {
            const newItems = (data.items || []).filter((item: any) => item.id !== id);
            onUpdate({ ...data, items: newItems });
        }
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        if (!onUpdate) return;
        const items = [...(data.items || [])];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
        onUpdate({ ...data, items });
    };

    const handleAddItem = () => {
        if (onUpdate) {
            const newItem = {
                id: `sched-${Date.now()}`,
                time: '08:00',
                scene: '',
                intExt: 'INT',
                set: 'NEW SET',
                dayNight: 'DAY',
                description: 'New activity'
            };
            onUpdate({ ...data, items: [...(data.items || []), newItem] });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-white dark:bg-white rounded-[20px] p-6 shadow-sm border border-black/[0.03] space-y-6">
                <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div>
                        <p className="text-[10px] uppercase font-black text-zinc-500 dark:text-zinc-500 mb-1 tracking-widest">Shoot Date</p>
                        <EditableInput
                            value={data.date || 'TBD'}
                            onSave={(val) => updateField('date', val)}
                            isEditable={!!isEditable}
                            className="text-xl font-black text-zinc-900 dark:text-black block uppercase"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-zinc-500 dark:text-zinc-500 mb-1 tracking-widest">Call Time</p>
                        <EditableInput
                            value={data.callTime || 'TBD'}
                            onSave={(val) => updateField('callTime', val)}
                            isEditable={!!isEditable}
                            className="text-xl font-mono text-emerald-500 font-bold block"
                        />
                    </div>
                </div>

                {/* Logistics Bar in Schedule */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-[9px] uppercase font-black text-zinc-500 dark:text-zinc-500 mb-1 tracking-widest">Basecamp</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-black truncate">{callSheetData?.basecamp || 'Not set'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] uppercase font-black text-zinc-500 dark:text-zinc-500 mb-1 tracking-widest">Weather</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-black truncate">{callSheetData?.weather || 'TBD'}</p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative">
                <div className="absolute left-[68px] top-2 bottom-2 w-0.5 bg-zinc-300"></div>

                {(data.items || []).map((item: any, i: number) => (
                    <div key={item.id || i} className="relative flex gap-4 group">
                        {/* Time Column */}
                        <div className="w-[60px] text-right pt-1 shrink-0">
                            <EditableInput
                                value={item.time || '00:00'}
                                onSave={(val) => updateItem(i, { time: val })}
                                isEditable={!!isEditable}
                                className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-500 block"
                            />
                        </div>

                        {/* Dot */}
                        <div className="absolute left-[64px] top-2.5 w-2.5 h-2.5 rounded-full bg-zinc-300 border-2 border-zinc-200 dark:border-zinc-800 z-10 group-hover:bg-emerald-500 transition-colors"></div>

                        {/* Content Card */}
                        <div className="flex-1 bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow relative">
                            {isEditable && (
                                <div className="absolute -right-2 -top-2 flex gap-1 z-20">
                                    {isOwner && (
                                        <>
                                            <button
                                                onClick={() => handleMoveItem(i, 'up')}
                                                disabled={i === 0}
                                                className="w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 transition-shadow"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleMoveItem(i, 'down')}
                                                disabled={i === (data.items?.length || 0) - 1}
                                                className="w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 transition-shadow"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-zinc-50/50 dark:bg-zinc-50/50 text-zinc-900 dark:text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                        <span>SCENE</span>
                                        <EditableInput
                                            value={item.scene || '-'}
                                            onSave={(val) => updateItem(i, { scene: val })}
                                            isEditable={!!isEditable}
                                            className="font-black"
                                        />
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500">
                                        <EditableInput
                                            value={item.intExt || 'INT'}
                                            onSave={(val) => updateItem(i, { intExt: val })}
                                            isEditable={!!isEditable}
                                        />
                                    </div>
                                </div>
                                <div className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${item.dayNight === 'DAY' ? 'bg-amber-500/10 text-amber-500' : item.dayNight === 'NIGHT' ? 'bg-blue-900/30 text-blue-400' : 'bg-zinc-50/50 dark:bg-zinc-50/50 text-zinc-500 dark:text-zinc-500' }`}>
                                    <EditableInput
                                        value={item.dayNight || 'DAY'}
                                        onSave={(val) => updateItem(i, { dayNight: val })}
                                        isEditable={!!isEditable}
                                    />
                                </div>
                            </div>

                            <EditableInput
                                value={item.set || ''}
                                onSave={(val) => updateItem(i, { set: val })}
                                isEditable={!!isEditable}
                                className="text-xs font-black text-zinc-900 dark:text-black uppercase mb-1 leading-tight block"
                                placeholder="Set name..."
                            />
                            <EditableInput
                                value={item.description || ''}
                                onSave={(val) => updateItem(i, { description: val })}
                                isEditable={!!isEditable}
                                type="textarea"
                                className="text-xs text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed block"
                                placeholder="Description..."
                            />
                        </div>
                    </div>
                ))}

                {isEditable && (
                    <button
                        onClick={handleAddItem}
                        className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Add Entry</span>
                    </button>
                )}
            </div>

            <div className="h-12 text-center text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold pt-8">End of Day</div>
        </div>
    );
};

export const MobileOnSetNotesView = ({ data, onAdd, onUpdate, onDelete, isReadOnly }: { data: any, onAdd?: (item: any) => void, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, isReadOnly?: boolean }) => {
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
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Note</span>
                </button>
            )}

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="bg-white dark:bg-white rounded-[30px] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-300 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{editingId ? 'Edit Insight' : 'Note Publication'}</span>
                        <button onClick={handleCancel} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-50/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"><X size={16} /></button>
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Time</label>
                        <input
                            type="time"
                            value={form.time}
                            onChange={e => setForm({ ...form, time: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-base"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Subject</label>
                        <input
                            placeholder="Topic (e.g. Safety Meeting)"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-base placeholder:text-zinc-400 dark:placeholder:text-zinc-500 dark:text-zinc-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Body</label>
                        <textarea
                            placeholder="Enter details..."
                            value={form.body}
                            onChange={e => setForm({ ...form, body: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-base min-h-[120px] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 dark:text-zinc-500 resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex gap-3">
                        {editingId && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-50/50 text-zinc-500 dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-colors hover:bg-zinc-200 dark:bg-zinc-800"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-zinc-900 text-white dark:text-zinc-500 shadow-xl shadow-zinc-900/10 font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600"
                        >
                            <Save size={18} />
                            <span>{editingId ? 'Update Note' : 'Save Note'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <EmptyState label="On-Set Notes" />
                ) : (
                    items.slice().reverse().map((item: any, i: number) => {
                        const isConfirming = deleteConfirmId === item.id;
                        return (
                            <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow group relative">
                                <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-emerald-600 text-[10px] font-black">{item.time}</span>
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">{item.date}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Edit Button */}
                                        {onUpdate && !isConfirming && (
                                            <button
                                                onClick={() => handleStartEdit(item)}
                                                className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-black"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                        {/* Delete Button */}
                                        {onDelete && !isConfirming && (
                                            <button
                                                onClick={() => setDeleteConfirmId(item.id)}
                                                className="text-zinc-500 dark:text-zinc-500 hover:text-red-500"
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
                                                className="flex-1 bg-red-500 text-xs font-bold py-2 rounded uppercase text-black dark:text-black"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {item.description && (
                                            <h4 className="text-sm font-black text-zinc-900 dark:text-black uppercase mb-2 leading-tight">{item.description}</h4>
                                        )}
                                        <p className="text-xs text-zinc-600 dark:text-zinc-500 leading-relaxed whitespace-pre-wrap">{item.body}</p>
                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            <div className="h-12 text-center text-[10px] text-zinc-800 dark:text-zinc-200 uppercase font-bold pt-4">End of Notes</div>
        </div>
    );
};

export const MobileLocationsView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.items || [];

    if (items.length === 0 && !isOwner) return <EmptyState label="Locations" />;

    return (
        <div className="space-y-6 pb-8">
            {isOwner && onAdd && !isReadOnly && (
                <button
                    onClick={() => onAdd({ id: `loc-${Date.now()}`, name: 'New Location', address: '' })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} /> Add Location
                </button>
            )}
            {items.map((loc: any, i: number) => (
                <div key={loc.id || i} className="bg-white dark:bg-white rounded-[20px] overflow-hidden shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow group relative">
                    {isOwner && onDelete && !isReadOnly && (
                        <button onClick={() => onDelete(loc.id)} className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    )}
                    {/* Main Image Banner */}
                    <div className="w-full aspect-video bg-zinc-800 relative">
                        {loc.mainImage ? (
                            <img src={loc.mainImage} className="w-full h-full object-cover" alt={loc.name} />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500">
                                <HardDrive size={24} className="mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <EditableInput
                                value={loc.name || 'Unknown Location'}
                                onSave={(val) => onUpdate?.({ ...loc, name: val })}
                                isEditable={isOwner && !isReadOnly}
                                className="text-xl font-black uppercase text-white dark:text-zinc-500 tracking-tight leading-none mb-1 p-0 bg-transparent border-none text-left"
                            />
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
                        <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                            <div>
                                <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-1 tracking-widest">Address</span>
                                <p className="text-xs text-zinc-900 dark:text-black font-bold leading-snug">{loc.address || 'TBD'}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-1 tracking-widest">Contact</span>
                                <p className="text-xs text-zinc-900 dark:text-black font-bold leading-snug">{loc.contact || '-'}</p>
                            </div>
                        </div>

                        {/* Logistics Notes */}
                        {loc.notes && (
                            <div>
                                <span className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-500 block mb-1">Logistics & Notes</span>
                                <p className="text-xs text-zinc-500 dark:text-zinc-500 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-50 p-4 rounded-xl border border-black/5">
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

export const MobileReleasesView = ({ data, onUpdate, isReadOnly }: { data: any, onUpdate?: (releases: any[]) => void, isReadOnly?: boolean }) => {
    const supabase = getClient();
    const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const sigPad = React.useRef<any>(null);

    // Create Form State
    const [newReleaseType, setNewReleaseType] = useState<'talent' | 'property'>('talent');
    const [newReleaseName, setNewReleaseName] = useState('');

    const releases = data?.releases || [];

    const handleCreateWrapper = () => {
        setNewReleaseName('');
        setNewReleaseType('talent');
        setView('create');
    };

    if (releases.length === 0 && view === 'list') {
        return (
            <div className="space-y-4">
                {(view === 'list') && (
                    <button
                        onClick={handleCreateWrapper}
                        className="w-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 mb-6 active:scale-95 transition-transform"
                    >
                        <Plus size={16} />
                        <span>Create Release</span>
                    </button>
                )}
                <EmptyState label="Releases" />
            </div>
        );
    }
    const activeRelease = releases.find((r: any) => r.id === activeId);

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
                productionCompany: 'ONFORMAT PRODUCTIONS',
                shootDate: new Date().toISOString().split('T')[0],
                // Pre-populate specific fields
                ...(newReleaseType === 'talent' ? { talentName: newReleaseName } : { ownerName: newReleaseName })
            }
        };

        onUpdate([...releases, newRelease]);
        setActiveId(id);
        setView('detail');
    };

    // Helper to convert base64 dataURL to Blob directly (avoids fetch issues on mobile)
    const dataURLToBlob = (dataURL: string) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    // State for signature mode
    const [signMode, setSignMode] = useState<'type'>('type');
    const [typedName, setTypedName] = useState('');

    const handleSaveSignature = async () => {
        if (!activeRelease || !onUpdate) return;

        // Validation
        if (!typedName.trim()) {
            alert("Please type your name.");
            return;
        }

        setIsSaving(true);
        try {
            let blob: Blob;

            // Generate image from typed name
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 400, 100);
                ctx.font = 'italic bold 48px "Style Script", cursive, sans-serif'; // Fallback font
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedName, 200, 50);
            }
            const dataUrl = canvas.toDataURL('image/png');
            blob = dataURLToBlob(dataUrl);

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
                            signedAt: new Date().toISOString(),
                            signedByMethod: signMode // Track method just in case
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
            if (e.message?.includes("Bucket not found") || e.message?.toLowerCase().includes("row not found")) {
                alert("Configuration Error: The 'documents' storage bucket is missing. Please run the 'create_documents_bucket.sql' migration.");
            } else {
                alert(`Failed to save signature: ${e.message || "Unknown error"}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (view === 'create') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <button
                    onClick={() => setView('list')}
                    className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-900 dark:text-black"
                >
                    <X size={14} /> Back to List
                </button>

                <div className="bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-[16px] shadow-sm p-6">
                    <h2 className="text-lg font-black uppercase text-zinc-900 dark:text-black mb-6">New Release</h2>

                    <div className="mb-4">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-500 block mb-2">Type</label>
                        <div className="flex bg-zinc-50/50 dark:bg-zinc-50/50 p-1 rounded-lg border border-zinc-300 dark:border-zinc-700">
                            <button
                                onClick={() => setNewReleaseType('talent')}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-md transition-all ${newReleaseType === 'talent' ? 'bg-white dark:bg-white text-zinc-900 dark:text-black shadow-sm' : 'text-zinc-500 dark:text-zinc-500'}`}
                            >
                                Talent
                            </button>
                            <button
                                onClick={() => setNewReleaseType('property')}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-md transition-all ${newReleaseType === 'property' ? 'bg-white dark:bg-white text-zinc-900 dark:text-black shadow-sm' : 'text-zinc-500 dark:text-zinc-500'}`}
                            >
                                Property
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-500 block mb-2">
                            {newReleaseType === 'talent' ? 'Talent Name' : 'Owner Name'}
                        </label>
                        <input
                            value={newReleaseName}
                            onChange={(e) => setNewReleaseName(e.target.value)}
                            placeholder={newReleaseType === 'talent' ? "Enter full name..." : "Enter owner name..."}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow rounded-lg p-4 text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-colors placeholder:text-zinc-700 dark:text-zinc-500"
                        />
                    </div>

                    <button
                        onClick={submitCreate}
                        disabled={!newReleaseName}
                        className="w-full bg-emerald-500 text-black dark:text-black font-black uppercase text-xs py-4 rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-900 dark:text-black"
                >
                    <X size={14} /> Back to List
                </button>

                <div className="bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-[16px] shadow-sm overflow-hidden p-6 space-y-6">
                    <div>
                        <span className="bg-zinc-800 text-zinc-500 dark:text-zinc-500 text-[9px] font-black uppercase px-2 py-1 rounded inline-block mb-2">
                            {activeRelease.type} Release
                        </span>
                        <h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-black leading-none mb-1">
                            {activeRelease.name || 'Untitled'}
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">{activeRelease.description}</p>
                    </div>

                    {/* Quick Meta */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-500 block">Producer</label>
                            <span className="text-zinc-900 dark:text-black">{d.productionCompany}</span>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-500 block">Date</label>
                            <span className="text-zinc-900 dark:text-black">{d.shootDate || d.shootDates}</span>
                        </div>
                    </div>

                    {/* Status */}
                    {isSigned ? (
                        <div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                            <Check size={24} className="text-emerald-600 mb-2" />
                            <p className="text-emerald-400 font-black uppercase text-xs tracking-wider">Signed & Valid</p>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono mt-1">{new Date(d.signedAt).toLocaleString()}</p>
                            <img src={d.signatureUrl} className="h-12 mt-3 opacity-80 filter invert" alt="Sig" />
                        </div>
                    ) : (
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            {/* Full Legal Text Display for Mobile */}
                            <div className="bg-zinc-100 dark:bg-zinc-50/50 p-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-500 leading-relaxed max-h-[200px] overflow-y-auto mb-4 text-justify">
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

                            <div className="bg-zinc-100 dark:bg-zinc-50/50 p-4 rounded-lg mb-4 border border-zinc-300 dark:border-zinc-700 shadow-inner">
                                <label className="block text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-500 mb-2">Type Full Name (Legal Signature)</label>
                                <input
                                    value={typedName}
                                    onChange={(e) => setTypedName(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 p-3 rounded text-zinc-900 dark:text-black font-mono text-center outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-colors"
                                    placeholder="John Doe"
                                />
                                <p className="text-[9px] text-zinc-600 dark:text-zinc-500 mt-2 text-center">
                                    By typing your name, you acknowledge this as your legal electronic signature.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveSignature}
                                    disabled={isSaving}
                                    className="flex-[2] bg-emerald-500 text-black dark:text-black py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-400"
                                >
                                    {isSaving ? 'Saving...' : 'Accept & Sign'}
                                </button>
                            </div>

                            <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 text-center tracking-widest mb-2">Sign Above</p>
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
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
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
                        className="bg-white dark:bg-white border border-zinc-100 dark:border-zinc-800 rounded-[16px] shadow-sm p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.status === 'signed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-50/50 text-zinc-400 dark:text-zinc-500'}`}>
                                {r.status === 'signed' ? <Check size={20} strokeWidth={3} /> : <FileText size={20} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-black leading-none mb-1.5">{r.name || 'Untitled'}</h3>
                                <p className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-[0.15em]">{r.description || r.type}</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${r.status === 'signed' ? 'text-emerald-600 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                            {r.status || 'Draft'}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

/* --------------------------------------------------------------------------------
 * SCRIPT NOTES VIEW
 * -------------------------------------------------------------------------------- */

export const MobileScriptNotesView = ({ data, avScript, onUpdate, onAdd, onDelete, onSetItems, isReadOnly }: any) => {
    const items = data?.items || [];
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Auto-populate from AV Script if available and items are empty
    useEffect(() => {
        let scriptRows: any[] = [];
        try {
            if (typeof avScript === 'string') {
                const parsed = JSON.parse(avScript);
                const arr = Array.isArray(parsed) ? parsed : [parsed];
                if (arr.length > 0 && arr[0].rows) scriptRows = arr[0].rows;
            } else if (avScript?.rows) {
                scriptRows = avScript.rows;
            }
        } catch { }

        if (items.length === 0 && scriptRows.length > 0 && onSetItems) {
            const initialItems = scriptRows.map((row: any, idx: number) => ({
                id: `imported-${Date.now()}-${idx}`,
                scene: row.scene || '',
                visual: row.visual || '',
                audio: row.audio || '',
                bestTake: '',
                notes: '',
                showNoteInput: false
            }));
            onSetItems(initialItems);
        }
    }, [items.length, avScript]); // Intentionally not fully exhaustive to avoid looping

    const [form, setForm] = useState({
        scene: '',
        visual: '',
        audio: '',
        bestTake: '',
        notes: ''
    });

    const handleStartEdit = (item: any) => {
        setForm({
            scene: item.scene || '',
            visual: item.visual || '',
            audio: item.audio || '',
            bestTake: item.bestTake || '',
            notes: item.notes || ''
        });
        setEditingId(item.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setForm({
            scene: '',
            visual: '',
            audio: '',
            bestTake: '',
            notes: ''
        });
    };

    const handleSubmit = () => {
        const payload = { ...form };

        if (editingId && onUpdate) {
            const updatedItem = {
                id: editingId,
                ...payload
            };
            onUpdate(updatedItem);
        } else if (onAdd) {
            const newItem = {
                id: `note-${Date.now()}`,
                ...payload
            };
            onAdd(newItem);
        }
        handleCancel();
    };

    // Use a local EmptyState if imported one is not available or reuse the one in scope? 
    // EmptyState is defined earlier in this file at line 132. It should be available if these components are at the end.

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-10">
            {/* Header / Add Button */}
            {!isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Scene Note</span>
                </button>
            )}

            {/* Form */}
            {isAdding && (
                <div className="bg-white dark:bg-white rounded-[30px] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-300 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Scene Documentation</span>
                        <button onClick={handleCancel} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-50/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"><X size={16} /></button>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Scene</label>
                            <input
                                value={form.scene}
                                onChange={e => setForm({ ...form, scene: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500"
                                placeholder="#"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Best Take</label>
                            <input
                                value={form.bestTake}
                                onChange={e => setForm({ ...form, bestTake: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500"
                                placeholder="1"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Visual</label>
                        <textarea
                            value={form.visual}
                            onChange={e => setForm({ ...form, visual: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 h-28 text-sm"
                            placeholder="Description..."
                        />
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Audio</label>
                        <textarea
                            value={form.audio}
                            onChange={e => setForm({ ...form, audio: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 h-28 text-sm"
                            placeholder="Dialogue/Sound..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Supervisor Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black font-bold outline-none focus:border-emerald-500 h-28 text-sm italic text-zinc-500 dark:text-zinc-500"
                            placeholder="Notes..."
                        />
                    </div>

                    <div className="flex gap-3">
                        {editingId && (
                            <button onClick={handleCancel} className="flex-1 bg-zinc-100 dark:bg-zinc-50/50 text-zinc-500 dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-colors hover:bg-zinc-200 dark:bg-zinc-800">
                                Cancel
                            </button>
                        )}
                        <button onClick={handleSubmit} className="flex-1 bg-zinc-900 text-white dark:text-zinc-500 shadow-xl shadow-zinc-900/10 font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600">
                            <Save size={18} />
                            <span>{editingId ? 'Update' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {items.length === 0 && !isAdding ? (
                    <EmptyState label="Script Notes" />
                ) : (
                    items.slice().reverse().map((item: any, i: number) => {
                        const isConfirming = deleteConfirmId === item.id;
                        return (
                            <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-zinc-900 px-3 py-1.5 rounded-xl">
                                            <span className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 block text-center leading-none mb-1 tracking-widest">Scene</span>
                                            <span className="text-sm font-black text-white dark:text-zinc-500 block text-center leading-none">{item.scene || '-'}</span>
                                        </div>
                                        {item.bestTake && (
                                            <div className="bg-emerald-500 px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">
                                                <span className="text-[8px] uppercase font-black text-emerald-900/50 block text-center leading-none mb-1 tracking-widest">Best Take</span>
                                                <span className="text-sm font-black text-white dark:text-zinc-500 block text-center leading-none tracking-tighter">{item.bestTake}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onUpdate && !isConfirming && (
                                            <button onClick={() => handleStartEdit(item)} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-black"><Edit2 size={14} /></button>
                                        )}
                                        {onDelete && !isConfirming && (
                                            <button onClick={() => setDeleteConfirmId(item.id)} className="text-zinc-500 dark:text-zinc-500 hover:text-red-500"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </div>

                                {isConfirming ? (
                                    <div className="bg-red-900/10 border border-red-500/20 p-3 rounded mb-2">
                                        <p className="text-[10px] text-red-400 font-bold uppercase mb-2 text-center">Delete Note?</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-zinc-800 text-xs py-2 rounded">Cancel</button>
                                            <button onClick={() => { onDelete && onDelete(item.id); setDeleteConfirmId(null); }} className="flex-1 bg-red-500 text-black dark:text-black font-bold text-xs py-2 rounded">Delete</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {item.visual && (
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-500">Visual</span>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-500 whitespace-pre-wrap">{item.visual}</p>
                                            </div>
                                        )}
                                        {item.audio && (
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-500">Audio</span>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-500 whitespace-pre-wrap">{item.audio}</p>
                                            </div>
                                        )}
                                        {item.notes ? (
                                            <div className="bg-black/20 p-2 rounded mt-1">
                                                <p className="text-xs text-zinc-500 dark:text-zinc-500 italic whitespace-pre-wrap">{item.notes}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-1">
                                                <button
                                                    onClick={() => handleStartEdit(item)}
                                                    className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-500 transition-colors"
                                                >
                                                    + Add Note
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            {!isAdding && items.length > 5 && (
                <div className="h-12 text-center text-[10px] text-zinc-800 dark:text-zinc-200 uppercase font-bold pt-4">End of Script Notes</div>
            )}
        </div>
    );
};

/* --------------------------------------------------------------------------------
 * SOUND REPORT VIEW
 * -------------------------------------------------------------------------------- */

export const MobileSoundReportView = ({ data, onUpdate, onAdd, onDelete, isReadOnly }: any) => {
    const takes = data?.takes || [];
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Initial constants for pre-filling
    const [lastScene, setLastScene] = useState('');
    const [lastTakeNum, setLastTakeNum] = useState(0);

    const [form, setForm] = useState({
        scene: '',
        take: '',
        timecode: '',
        description: '',
        tracks: '',
        notes: '',
        circled: false
    });

    // Auto-increment logic
    useEffect(() => {
        if (takes.length > 0) {
            const last = takes[takes.length - 1];
            setLastScene(last.scene || '');
            const tNum = parseInt(last.take) || 0;
            setLastTakeNum(tNum);
        }
    }, [takes]);

    const handleStartAdd = () => {
        setForm({
            scene: lastScene,
            take: String(lastTakeNum + 1),
            timecode: '',
            description: '',
            tracks: '',
            notes: '',
            circled: false
        });
        setIsAdding(true);
        setEditingId(null);
    };

    const handleStartEdit = (item: any) => {
        setForm({
            scene: item.scene || '',
            take: item.take || '',
            timecode: item.timecode || '',
            description: item.description || '',
            tracks: item.tracks || '',
            notes: item.notes || '',
            circled: item.circled || false
        });
        setEditingId(item.id);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSubmit = () => {
        const payload = { ...form };
        if (editingId && onUpdate) {
            onUpdate({ id: editingId, ...payload });
        } else if (onAdd) {
            onAdd({ id: `snd-${Date.now()}`, ...payload });
        }
        handleCancel();
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-10">
            {/* Header / Add Button */}
            {!isAdding && (
                <div className="space-y-4">
                    {/* Mini Header Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white dark:bg-white shadow-sm border border-black/[0.03] p-4 rounded-2xl text-center">
                            <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-1 tracking-widest">Active Roll</span>
                            <span className="text-zinc-900 dark:text-black font-black font-mono">{data?.roll || '1'}</span>
                        </div>
                        <div className="bg-white dark:bg-white shadow-sm border border-black/[0.03] p-4 rounded-2xl text-center">
                            <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-1 tracking-widest">Sample Rate</span>
                            <span className="text-zinc-900 dark:text-black font-black font-mono">{data?.sampleRate || '48k'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleStartAdd}
                        className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Log New Take</span>
                    </button>
                </div>
            )}

            {/* Form */}
            {isAdding && (
                <div className="bg-white dark:bg-white rounded-[30px] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-300 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{editingId ? 'Edit Performance' : 'Take Registration'}</span>
                        <button onClick={handleCancel} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-50/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"><X size={16} /></button>
                    </div>

                    <div className="flex gap-4 mb-3">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Scene</label>
                            <input
                                value={form.scene}
                                onChange={e => setForm({ ...form, scene: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black p-2 rounded text-center font-bold"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Take</label>
                            <input
                                value={form.take}
                                onChange={e => setForm({ ...form, take: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black p-2 rounded text-center font-bold"
                            />
                        </div>
                        <div className="flex-[2]">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Timecode</label>
                            <input
                                value={form.timecode}
                                onChange={e => setForm({ ...form, timecode: e.target.value })}
                                className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black p-2 rounded text-center font-mono"
                                placeholder="00:00:00:00"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setForm({ ...form, circled: !form.circled })}
                        className={`flex items-center gap-3 w-full mb-6 p-4 rounded-xl border transition-all ${form.circled ? 'bg-emerald-500 border-emerald-600' : 'bg-zinc-50/50 dark:bg-zinc-50/50 border-black/[0.05]'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${form.circled ? 'bg-white dark:bg-white border-white text-emerald-600' : 'border-zinc-300 dark:border-zinc-700'}`}>
                            {form.circled && <Check size={14} strokeWidth={4} />}
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest select-none ${form.circled ? 'text-white' : 'text-zinc-500 dark:text-zinc-500'}`}>Circle Take (BEST)</span>
                    </button>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Description</label>
                        <input
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black p-2 rounded"
                            placeholder="Action description..."
                        />
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Tracks</label>
                        <input
                            value={form.tracks}
                            onChange={e => setForm({ ...form, tracks: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black p-2 rounded text-xs font-mono"
                            placeholder="Boom, Lav 1, etc"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow text-zinc-900 dark:text-black p-2 rounded h-16 text-xs italic"
                            placeholder="Sound issues, planes, etc"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleSubmit} className="w-full bg-zinc-900 text-white dark:text-zinc-500 shadow-lg shadow-zinc-900/10 font-bold uppercase text-xs py-3 rounded flex items-center justify-center gap-2 active:scale-95 transition-transform">
                            <Save size={14} />
                            <span>{editingId ? 'Update Take' : 'Save Take'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {takes.length === 0 && !isAdding ? (
                    <EmptyState label="Sound Report" />
                ) : (
                    takes.slice().reverse().map((take: any, i: number) => {
                        const isConfirming = deleteConfirmId === take.id;
                        return (
                            <div key={take.id || i} className={`bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border hover:shadow-md transition-shadow relative flex items-center gap-3 ${take.circled ? 'border-emerald-500 shadow-emerald-500/10' : 'border-black/[0.03]'}`}>

                                {/* Scene/Take Badge */}
                                <div className="flex flex-col items-center justify-center min-w-[50px] bg-zinc-100 dark:bg-zinc-50/50 rounded border border-zinc-100 dark:border-zinc-800 p-1">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 leading-none">SCN</span>
                                    <span className="text-base font-black text-zinc-900 dark:text-black leading-tight">{take.scene}</span>
                                    <div className="w-full h-px bg-zinc-300 my-0.5" />
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 leading-none">TK</span>
                                    <span className={`text-base font-black leading-tight ${take.circled ? 'text-emerald-600' : 'text-zinc-900 dark:text-black'}`}>{take.take}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-emerald-600 text-xs font-bold">{take.timecode}</span>
                                        {take.circled && <span className="text-[9px] bg-emerald-500 text-black dark:text-black font-bold px-1 rounded-sm">CIRCLED</span>}
                                    </div>
                                    <p className="text-xs font-bold text-zinc-900 dark:text-black truncate mb-0.5">{take.description || 'No Description'}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {take.tracks && <span className="text-[9px] bg-zinc-50/50 dark:bg-zinc-50/50 px-1 rounded text-zinc-600 dark:text-zinc-500 font-mono border border-zinc-300 dark:border-zinc-700">{take.tracks}</span>}
                                        {take.notes && <span className="text-[9px] text-zinc-500 dark:text-zinc-500 italic truncate">{take.notes}</span>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    {onUpdate && !isConfirming && (
                                        <button onClick={() => handleStartEdit(take)} className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:text-black"><Edit2 size={16} /></button>
                                    )}
                                    {onDelete && !isConfirming && (
                                        <button onClick={() => setDeleteConfirmId(take.id)} className="text-zinc-600 dark:text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                                    )}
                                </div>

                                {isConfirming && (
                                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-50 flex items-center justify-between px-4 rounded-lg z-10 border border-red-500">
                                        <span className="text-xs font-bold text-red-500 uppercase">Delete?</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs text-zinc-900 dark:text-black bg-zinc-50/50 dark:bg-zinc-50/50 px-3 py-1 rounded shadow-sm border border-zinc-300 dark:border-zinc-700">No</button>
                                            <button onClick={() => { onDelete && onDelete(take.id); setDeleteConfirmId(null); }} className="text-xs text-zinc-900 dark:text-black bg-red-600 px-3 py-1 rounded">Yes</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export const MobileBriefView = ({ data, onUpdate, isEditable: manualIsEditable, isReadOnly }: { data: any, onUpdate?: (newData: any) => void, isEditable?: boolean, isReadOnly?: boolean }) => {
    const { canEditMobile } = useProjectData();
    const isEditable = isReadOnly ? false : (manualIsEditable ?? canEditMobile);

    if (!data) return <EmptyState label="Creative Brief" />;

    const updateField = (field: string, newValue: string) => {
        if (onUpdate) {
            onUpdate({ ...data, [field]: newValue });
        }
    };

    const fields = [
        { key: 'product', label: 'Vision' },
        { key: 'objective', label: 'Objective' },
        { key: 'targetAudience', label: 'Target Audience' },
        { key: 'tone', label: 'Tone & Style' },
        { key: 'keyMessage', label: 'Key Message' },
        { key: 'narrative', label: 'Narrative Approach' },
        { key: 'talent', label: 'Talent / Casting' },
        { key: 'location', label: 'Location / Setting' },
        { key: 'deliverables', label: 'Deliverables' }
    ];

    return (
        <div className="space-y-4 pb-8">
            {fields.map((field) => {
                const value = data[field.key];
                return (
                    <div key={field.key} className="bg-white dark:bg-white rounded-[20px] p-8 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest block mb-2">{field.label}</span>
                        <EditableInput
                            value={(typeof value === 'string' ? value : '') || ""}
                            onSave={(val) => updateField(field.key, val)}
                            isEditable={!!isEditable}
                            type="textarea"
                            className="text-sm font-medium text-zinc-900 dark:text-black leading-relaxed whitespace-pre-wrap block"
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export const MobileTreatmentView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const slides = data?.slides || [];
    if (slides.length === 0 && !isOwner) return <EmptyState label="Treatment" />;

    return (
        <div className="space-y-6 pb-8">
            {isOwner && onAdd && (
                <button
                    onClick={() => onAdd({ id: `slide-${Date.now()}`, title: 'New Treatment Note', category: 'Treatment Note', content: '', layout: 'Image', modules: { image1: '' } })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Slide</span>
                </button>
            )}
            {slides.map((slide: any, i: number) => (
                <div key={slide.id || i} className="bg-white dark:bg-white rounded-[20px] overflow-hidden shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow group relative">
                    {isOwner && onDelete && (
                        <button onClick={() => onDelete(slide.id)} className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    )}
                    <ImageUploader
                        currentUrl={slide.modules?.image1 || ''}
                        onUpload={(url) => onUpdate?.({ ...slide, modules: { ...slide.modules, image1: url } })}
                        isLocked={!isOwner}
                        className="w-full aspect-video bg-zinc-800 relative rounded-none border-none"
                    />
                    <div className="p-4">
                        <EditableInput
                            value={slide.category || 'CATEGORY'}
                            onSave={(val) => onUpdate?.({ ...slide, category: val })}
                            isEditable={isOwner}
                            className="text-[10px] font-black uppercase text-emerald-600 block mb-1 p-0 bg-transparent border-none text-left"
                            placeholder="TYPE OF TREATMENT"
                        />
                        <EditableInput
                            value={slide.title || 'Slide Title'}
                            onSave={(val) => onUpdate?.({ ...slide, title: val })}
                            isEditable={isOwner}
                            className="text-xl font-black uppercase text-zinc-900 dark:text-black tracking-tight leading-none mb-3 p-0 bg-transparent border-none text-left"
                        />
                        <EditableInput
                            value={slide.content || ''}
                            onSave={(val) => onUpdate?.({ ...slide, content: val })}
                            isEditable={isOwner}
                            className="text-sm text-zinc-700 dark:text-zinc-500 leading-relaxed whitespace-pre-wrap p-0 bg-transparent border-none text-left"
                            placeholder={isOwner ? "Write your narrative here..." : ""}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MobileReadOnlyListView = ({ data, titleKey, subtitleKey, detailKeys, imageKey, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, titleKey: string, subtitleKey?: string, detailKeys?: string[], imageKey?: string, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.items || data?.roles || data?.looks || [];

    if (items.length === 0 && !isOwner) return <EmptyState label="Document" />;

    return (
        <div className="space-y-4 pb-12">
            {isOwner && onAdd && (
                <button
                    onClick={() => onAdd({ id: `item-${Date.now()}`, [titleKey]: 'New Item' })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add New Entry</span>
                </button>
            )}

            {items.map((item: any, i: number) => (
                <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] p-6 shadow-sm border border-black/[0.03] hover:shadow-md transition-all flex gap-5 overflow-hidden items-center group relative">
                    {imageKey && (item[imageKey] || isOwner) && (
                        <div className="w-20 h-20 shrink-0 bg-zinc-50/50 dark:bg-zinc-50/50 rounded-2xl overflow-hidden border border-black/[0.03] relative shadow-inner">
                            {isOwner ? (
                                <ImageUploader
                                    currentUrl={item[imageKey] || ''}
                                    onUpload={(url) => onUpdate?.({ ...item, [imageKey]: url })}
                                    isLocked={false}
                                    className="w-full h-full !border-none"
                                />
                            ) : (
                                item[imageKey] ? <img src={item[imageKey]} className="w-full h-full object-cover" /> : null
                            )}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        {subtitleKey && (
                            <div className="mb-1.5 flex items-center">
                                <EditableInput
                                    value={item[subtitleKey] || ''}
                                    onSave={(val) => onUpdate?.({ ...item, [subtitleKey]: val })}
                                    isEditable={isOwner}
                                    className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.15em] truncate p-0 bg-transparent border-none text-left"
                                />
                            </div>
                        )}
                        <EditableInput
                            value={item[titleKey] || 'Unnamed Item'}
                            onSave={(val) => onUpdate?.({ ...item, [titleKey]: val })}
                            isEditable={isOwner}
                            className="text-[17px] font-black text-zinc-900 dark:text-black leading-tight tracking-tight p-0 bg-transparent border-none text-left uppercase"
                        />

                        {detailKeys && detailKeys.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                {detailKeys.map((k: string) => (
                                    <div key={k} className="bg-zinc-50/50 dark:bg-zinc-50/50 px-2.5 py-1 rounded-lg border border-black/[0.02] flex items-center gap-2">
                                        <span className="opacity-40 font-black uppercase text-[8px] tracking-widest">{k}</span>
                                        <EditableInput
                                            value={item[k] || ''}
                                            onSave={(val) => onUpdate?.({ ...item, [k]: val })}
                                            isEditable={isOwner}
                                            className="p-0 bg-transparent border-none text-[10px] font-mono font-black text-zinc-900 dark:text-black"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {isOwner && onDelete && (
                        <button
                            onClick={() => onDelete(item.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50/50 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export const MobileLookbookView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.items || [];
    if (items.length === 0 && !isOwner) return <EmptyState label="Lookbook" />;

    return (
        <div className="space-y-6 pb-8">
            {isOwner && onAdd && (
                <button
                    onClick={() => onAdd({ id: `look-${Date.now()}`, title: 'New Image', caption: '' })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Image</span>
                </button>
            )}
            {items.map((item: any, i: number) => (
                <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] overflow-hidden shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow group relative">
                    {isOwner && onDelete && (
                        <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    )}
                    <div className="w-full bg-zinc-800 relative" style={{ aspectRatio: item.aspectRatio === '9:16' ? '9/16' : item.aspectRatio === '1:1' ? '1/1' : item.aspectRatio === '4:5' ? '4/5' : '16/9' }}>
                        {item.url ? (
                            <img src={item.url} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500">
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            {item.imageNumber && <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">{item.imageNumber}</span>}
                            <EditableInput
                                value={item.title || 'Untitled Image'}
                                onSave={(val) => onUpdate?.({ ...item, title: val })}
                                isEditable={isOwner}
                                className="text-xl font-black uppercase text-white dark:text-zinc-500 tracking-tight leading-none mb-1 p-0 bg-transparent border-none text-left"
                            />
                        </div>
                    </div>
                    {item.showCaption && item.caption && (
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-50/50 border-t border-zinc-100 dark:border-zinc-800">
                            <p className="text-sm font-medium text-zinc-900 dark:text-black leading-relaxed whitespace-pre-wrap">{item.caption}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const MobileWardrobeView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.looks || data?.items || [];
    if (items.length === 0 && !isOwner) return <EmptyState label="Wardrobe" />;

    return (
        <div className="space-y-6 pb-8">
            {isOwner && onAdd && (
                <button
                    onClick={() => onAdd({ id: `ward-${Date.now()}`, character: 'New Character', description: 'TBD' })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Character</span>
                </button>
            )}
            {items.map((item: any, i: number) => (
                <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] overflow-hidden shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow group relative">
                    {isOwner && onDelete && (
                        <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    )}
                    <div className="w-full aspect-[4/5] bg-zinc-800 relative">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500">
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Character</span>
                            <EditableInput
                                value={item.character || 'TBD'}
                                onSave={(val) => onUpdate?.({ ...item, character: val })}
                                isEditable={isOwner}
                                className="text-xl font-black uppercase text-white dark:text-zinc-500 tracking-tight leading-none p-0 bg-transparent border-none text-left"
                            />
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <span className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-500 block mb-0.5">Description</span>
                            <EditableInput
                                value={item.description || ''}
                                onSave={(val) => onUpdate?.({ ...item, description: val })}
                                isEditable={isOwner}
                                className="text-sm text-zinc-900 dark:text-black leading-snug font-medium p-0 bg-transparent border-none text-left"
                            />
                        </div>
                        {(item.notes || isOwner) && (
                            <div>
                                <span className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-500 block mb-0.5">Notes</span>
                                <EditableInput
                                    value={item.notes || ''}
                                    onSave={(val) => onUpdate?.({ ...item, notes: val })}
                                    isEditable={isOwner}
                                    className="text-xs text-zinc-600 dark:text-zinc-500 leading-snug italic p-0 bg-transparent border-none text-left"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MobileCastingView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.roles || data?.items || [];
    if (items.length === 0 && !isOwner) return <EmptyState label="Casting" />;

    return (
        <div className="space-y-6 pb-8">
            {isOwner && onAdd && (
                <button
                    onClick={() => onAdd({ id: `cast-${Date.now()}`, role: 'New Role', name: 'TBD' })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Role</span>
                </button>
            )}
            {items.map((item: any, i: number) => (
                <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] overflow-hidden shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow flex flex-col group relative">
                    {isOwner && onDelete && (
                        <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    )}
                    <div className="flex p-4 gap-4 items-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-300 border border-zinc-100 dark:border-zinc-800 overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 dark:text-zinc-500 font-bold uppercase text-[10px]">No Pic</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">Role</span>
                            <EditableInput
                                value={item.role || 'TBD'}
                                onSave={(val) => onUpdate?.({ ...item, role: val })}
                                isEditable={isOwner}
                                className="text-lg font-black uppercase text-zinc-900 dark:text-black tracking-tight leading-none p-0 bg-transparent border-none text-left"
                            />
                            <EditableInput
                                value={item.name || 'Actor Name TBD'}
                                onSave={(val) => onUpdate?.({ ...item, name: val })}
                                isEditable={isOwner}
                                className="text-[17px] font-black tracking-tight text-zinc-600 dark:text-zinc-500 leading-snug p-0 bg-transparent border-none text-left"
                            />
                        </div>
                    </div>
                    {(item.notes || isOwner) && (
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-50 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-500 block mb-0.5">Casting Notes</span>
                            <EditableInput
                                value={item.notes || ''}
                                onSave={(val) => onUpdate?.({ ...item, notes: val })}
                                isEditable={isOwner}
                                className="text-xs text-zinc-700 dark:text-zinc-500 leading-snug italic p-0 bg-transparent border-none text-left"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const MobilePropsView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.items || [];
    if (items.length === 0 && !isOwner) return <EmptyState label="Props" />;

    return (
        <div className="space-y-4 pb-8">
            {isOwner && onAdd && (
                <button
                    onClick={() => onAdd({ id: `prop-${Date.now()}`, name: 'New Prop', category: 'Props' })}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Prop</span>
                </button>
            )}
            {items.map((item: any, i: number) => (
                <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow flex gap-4 items-center group relative overflow-hidden">
                    {isOwner && onDelete && (
                        <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    )}
                    {item.imageUrl && (
                        <div className="w-20 h-20 bg-zinc-800 rounded-md border border-zinc-100 dark:border-zinc-800 overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                                <EditableInput
                                    value={item.category || 'Uncategorized'}
                                    onSave={(val) => onUpdate?.({ ...item, category: val })}
                                    isEditable={isOwner}
                                    className="text-[9px] uppercase font-bold text-emerald-600 tracking-widest p-0 bg-transparent border-none text-left"
                                />
                            </div>
                            {(item.quantity || isOwner) && (
                                <div className="flex items-center gap-1 bg-zinc-50/50 dark:bg-zinc-50/50 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500">QTY:</span>
                                    <EditableInput
                                        value={item.quantity || '1'}
                                        onSave={(val) => onUpdate?.({ ...item, quantity: val })}
                                        isEditable={isOwner}
                                        className="text-[10px] font-mono font-bold text-zinc-900 dark:text-black p-0 bg-transparent border-none"
                                    />
                                </div>
                            )}
                        </div>
                        <EditableInput
                            value={item.name || 'Unnamed Prop'}
                            onSave={(val) => onUpdate?.({ ...item, name: val })}
                            isEditable={isOwner}
                            className="text-base font-black uppercase text-zinc-900 dark:text-black leading-tight p-0 bg-transparent border-none text-left"
                        />
                        {(item.description || isOwner) && (
                            <EditableInput
                                value={item.description || ''}
                                onSave={(val) => onUpdate?.({ ...item, description: val })}
                                isEditable={isOwner}
                                className="text-xs text-zinc-600 dark:text-zinc-500 leading-snug p-0 bg-transparent border-none text-left"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MobileClientSelectsView = ({ data, onAdd, onUpdate, onDelete, isReadOnly }: { data: any, onAdd?: (item: any) => void, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, isReadOnly?: boolean }) => {
    const { canEditMobile } = useProjectData();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const [form, setForm] = useState({
        fileNumber: '',
        description: '',
        notes: '',
        status: ''
    });

    const items = data?.items || [];

    const handleStartAdd = () => {
        setForm({ fileNumber: '', description: '', notes: '', status: '' });
        setEditingId(null);
        setIsAdding(true);
    };

    const handleStartEdit = (item: any) => {
        setForm({
            fileNumber: item.fileNumber || '',
            description: item.description || '',
            notes: item.notes || '',
            status: item.status || ''
        });
        setEditingId(item.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSubmit = () => {
        if (!form.fileNumber && !form.description) return;

        if (editingId && onUpdate) {
            onUpdate({ id: editingId, ...form });
        } else if (onAdd) {
            onAdd({ id: `selects-${Date.now()}`, ...form });
        }
        setIsAdding(false);
        setEditingId(null);
    };

    const STATUS_OPTIONS = [
        { value: '', label: '-', className: 'text-zinc-500 bg-zinc-50/50' },
        { value: 'approved', label: 'APPROVED', className: 'text-green-700 bg-green-100 border-green-200' },
        { value: 'edit', label: 'EDIT', className: 'text-blue-700 bg-blue-100 border-blue-200' },
        { value: 'reshoot', label: 'RESHOOT', className: 'text-orange-700 bg-orange-100 border-orange-200' },
        { value: 'kill', label: 'KILL', className: 'text-red-700 bg-red-100 border-red-200' },
    ];

    return (
        <div className="space-y-4 pb-8">
            {/* Header Actions */}
            {canEditMobile && !isAdding && (
                <button
                    onClick={handleStartAdd}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Select</span>
                </button>
            )}

            {/* Form */}
            {isAdding && (
                <div className="bg-white dark:bg-white rounded-[20px] p-6 shadow-2xl border border-black/[0.03] animate-in fade-in slide-in-from-top-4 mb-6">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-300 dark:border-zinc-700 pb-2">
                        <span className="text-xs font-bold uppercase text-zinc-900 dark:text-black tracking-widest">{editingId ? 'Edit Select' : 'New Select'}</span>
                        <button onClick={handleCancel}><X size={16} className="text-zinc-500 dark:text-zinc-500" /></button>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">File Number</label>
                            <input
                                value={form.fileNumber}
                                onChange={e => setForm({ ...form, fileNumber: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-black py-3 rounded-xl text-center font-bold outline-none focus:bg-white dark:bg-white"
                                placeholder="..."
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-black py-3 rounded-xl text-center font-bold text-xs uppercase outline-none focus:bg-white dark:bg-white h-[46px] appearance-none"
                            >
                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-black p-4 rounded-xl h-24 outline-none focus:bg-white dark:bg-white resize-none"
                            placeholder="Describe what happens..."
                        />
                    </div>

                    <div className="mb-5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 block mb-1">Notes (Optional)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-black p-4 rounded-xl h-20 outline-none focus:bg-white dark:bg-white resize-none text-xs italic"
                            placeholder="Additional context or editor notes..."
                        />
                    </div>

                    <div className="flex gap-3">
                        {editingId && (
                            <button onClick={handleCancel} className="flex-1 bg-zinc-100 dark:bg-zinc-50/50 text-zinc-500 dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-colors hover:bg-zinc-200 dark:bg-zinc-800">
                                Cancel
                            </button>
                        )}
                        <button onClick={handleSubmit} className="flex-1 bg-zinc-900 text-white dark:text-zinc-500 shadow-xl shadow-zinc-900/10 font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600">
                            <Save size={18} />
                            <span>{editingId ? 'Update Select' : 'Save Select'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            {items.length === 0 && !isAdding ? (
                <EmptyState label="Client Selects" />
            ) : (
                <div className="space-y-3">
                    {items.map((item: any) => {
                        const isConfirming = deleteConfirmId === item.id;
                        const statusObj = STATUS_OPTIONS.find(o => o.value === item.status) || STATUS_OPTIONS[0];

                        return (
                            <div key={item.id} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow relative flex gap-4 overflow-hidden group">
                                {/* Left Col: Status & File Number */}
                                <div className="flex flex-col gap-2 min-w-[70px] w-[70px] flex-shrink-0">
                                    <div className={`text-[9px] font-black uppercase text-center py-1 px-1 rounded border ${statusObj.className} tracking-wider`}>
                                        {statusObj.label}
                                    </div>
                                    <div className="bg-white dark:bg-white border border-slate-300 rounded text-center py-1">
                                        <span className="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">FILE</span>
                                        <span className="block text-xs font-black text-zinc-800 dark:text-zinc-200 break-all px-1 leading-none pb-0.5">{item.fileNumber || '-'}</span>
                                    </div>
                                </div>

                                {/* Right Col: Content */}
                                <div className="flex-1 min-w-0 pr-8">
                                    <p className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-black leading-snug whitespace-pre-wrap">{item.description || 'No Description'}</p>
                                    {item.notes && <p className="text-xs text-zinc-600 dark:text-zinc-500 italic whitespace-pre-wrap mt-2">{item.notes}</p>}
                                </div>

                                {/* Actions Toolbox */}
                                <div className="absolute right-2 top-2 bottom-2 w-8 flex flex-col justify-center gap-3">
                                    {onUpdate && !isConfirming && (
                                        <button onClick={() => handleStartEdit(item)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:text-black transition-colors mx-auto"><Edit2 size={14} /></button>
                                    )}
                                    {onDelete && !isConfirming && (
                                        <button onClick={() => setDeleteConfirmId(item.id)} className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors mx-auto"><Trash2 size={14} /></button>
                                    )}
                                </div>

                                {/* Delete Confirmation Overlay */}
                                {isConfirming && (
                                    <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-4 z-10">
                                        <span className="text-xs font-bold text-red-600 uppercase mb-3 tracking-widest">Delete Select?</span>
                                        <div className="flex gap-4 w-full">
                                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 text-xs font-bold text-zinc-600 dark:text-zinc-500 bg-white dark:bg-white border border-zinc-300 dark:border-zinc-700 py-2 rounded uppercase tracking-wider">Cancel</button>
                                            <button onClick={() => { onDelete && onDelete(item.id); setDeleteConfirmId(null); }} className="flex-1 text-xs font-bold text-white dark:text-zinc-500 bg-red-600 py-2 rounded uppercase tracking-wider shadow-sm shadow-red-500/30 border border-red-700">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export const MobileControlView = ({ data, onUpdate }: { data: any, onUpdate: (tool: string, units: string[]) => void }) => {
    const sortedTools = Object.keys(DOC_LABELS).sort();

    return (
        <div className="space-y-4 pb-8">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 mb-4 pl-1">Delegation Dashboard</h3>
            <div className="grid gap-2">
                {sortedTools.map(key => {
                    const groups = data?.toolGroups?.[key] || [];
                    const isDelegated = groups.includes('D');

                    return (
                        <div key={key} className="bg-white dark:bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <p className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-black uppercase">{DOC_LABELS[key] || key}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">ID: {key}</p>
                            </div>
                            <button
                                onClick={() => {
                                    const newGroups = isDelegated ? groups.filter((g: string) => g !== 'D') : [...groups, 'D'];
                                    onUpdate(key, newGroups);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white dark:text-zinc-500 transition-all ${isDelegated ? 'bg-red-500 shadow-lg scale-110' : 'bg-zinc-300'}`}
                            >
                                D
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const MobileVisionView = ({ data, onUpdate, isReadOnly }: { data: any, onUpdate: (newData: any) => void, isReadOnly?: boolean }) => {
    const isEditable = !isReadOnly;
    if (!data || !data.pages || data.pages.length === 0) return <EmptyState label="Project Vision" />;

    return (
        <div className="space-y-6 pb-20">
            {data.pages.map((p: any, idx: number) => (
                <div key={p.id || idx} className="bg-white dark:bg-white rounded-[20px] p-8 shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                    <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-1 mb-4">
                        Page {idx + 1}
                    </h3>
                    <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-serif leading-relaxed">
                        {p.content || <span className="text-zinc-400 dark:text-zinc-500 italic">No content</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MobileStoryboardView = ({ data, onUpdate, onDelete, onAdd, isReadOnly }: { data: any, onUpdate?: (item: any) => void, onDelete?: (id: string) => void, onAdd?: (item: any) => void, isReadOnly?: boolean }) => {
    const { isOwner } = useProjectData();
    const items = data?.items || [];

    if (items.length === 0 && !isOwner) return <EmptyState label="Storyboard" />;

    return (
        <div className="space-y-6 pb-20">
            {isOwner && onAdd && (
                <button
                    onClick={() => {
                        const nextNum = (items.length + 1).toString().padStart(2, '0');
                        onAdd({ id: `sb-${Date.now()}`, url: '', caption: '', notes: '', title: '', imageNumber: nextNum, sceneLink: '', aspectRatio: '3:2', size: 'large' })
                    }}
                    className="w-full bg-white dark:bg-white text-zinc-900 dark:text-black border border-black/[0.03] py-5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Frame</span>
                </button>
            )}
            <div className="grid grid-cols-1 gap-6">
                {items.map((item: any, i: number) => (
                    <div key={item.id || i} className="bg-white dark:bg-white rounded-[20px] overflow-hidden shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow flex flex-col group relative">
                        {isOwner && onDelete && (
                            <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white dark:text-zinc-500 opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <X size={14} />
                            </button>
                        )}
                        <div className="w-full aspect-[3/2] bg-zinc-800 relative shrink-0">
                            {isOwner ? (
                                <ImageUploader
                                    currentUrl={item.url || ''}
                                    onUpload={(url) => onUpdate?.({ ...item, url })}
                                    isLocked={!isOwner}
                                    className="w-full h-full !border-none"
                                />
                            ) : (
                                item.url ? <img src={item.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500"><span className="text-[10px] font-bold uppercase tracking-widest">No Image</span></div>
                            )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-50/50 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <EditableInput
                                    value={item.imageNumber || ''}
                                    onSave={(val) => onUpdate?.({ ...item, imageNumber: val })}
                                    isEditable={isOwner}
                                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 p-0 bg-transparent border-none text-left w-6 shrink-0"
                                    placeholder="00"
                                />
                                <EditableInput
                                    value={item.sceneLink || ''}
                                    onSave={(val) => onUpdate?.({ ...item, sceneLink: val })}
                                    isEditable={isOwner}
                                    className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 p-0 bg-transparent border-none text-right flex-1 truncate"
                                    placeholder="SC: #"
                                />
                            </div>
                            <EditableInput
                                value={item.title || ''}
                                onSave={(val) => onUpdate?.({ ...item, title: val })}
                                isEditable={isOwner}
                                className="text-xs font-bold text-zinc-900 dark:text-black leading-tight mb-1 p-0 bg-transparent border-none text-left"
                                placeholder="SHOT TITLE"
                            />
                            <EditableInput
                                value={item.caption || ''}
                                onSave={(val) => onUpdate?.({ ...item, caption: val })}
                                isEditable={isOwner}
                                className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 p-0 bg-transparent border-none text-left mt-auto"
                                placeholder="SHOT TYPE"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
