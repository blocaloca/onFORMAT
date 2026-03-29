'use client';
import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    FileText, 
    Eye, 
    Edit3, 
    Plus, 
    Smartphone, 
    Lock,
    Activity,
    Copy,
    Check
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

// --- DATA DEFINITIONS ---
const DOCUMENT_TYPES = [
    { id: 'schedule', name: 'Schedule', isSensitive: false },
    { id: 'call_sheet', name: 'Call Sheet', isSensitive: false },
    { id: 'dit_log', name: 'DIT Log', isSensitive: true },
    { id: 'shot_list', name: 'Shot List', isSensitive: false },
    { id: 'script_notes', name: 'Script Notes', isSensitive: false },
    { id: 'client_selects', name: 'Client Selects', isSensitive: true },
    { id: 'lookbook', name: 'Lookbook', isSensitive: false },
    { id: 'budget', name: 'Budget / Rates', isSensitive: true }
];

const INITIAL_ROLES = [
    { id: 'producer', name: 'Producer', icon: '👑', color: 'emerald' },
    { id: 'dit', name: 'DIT', icon: '💾', color: 'blue' },
    { id: 'scripty', name: 'Script Supervisor', icon: '✍️', color: 'pink' },
    { id: 'dp', name: 'Director of Photo', icon: '🎥', color: 'amber' },
    { id: 'client', name: 'Client / Agency', icon: '💼', color: 'zinc' },
    { id: 'crew', name: 'General Crew', icon: '👤', color: 'zinc' }
];

export const OnSetControlPanelTemplate = ({ data, onUpdate, isLocked, metadata }: any) => {
    const safeData = (data && typeof data === 'object') ? data : {};
    const roles = safeData.roles || INITIAL_ROLES;
    const matrix = safeData.matrix || {
        producer: { schedule: 'edit', call_sheet: 'edit', dit_log: 'edit', shot_list: 'edit', script_notes: 'edit', client_selects: 'edit', lookbook: 'edit', budget: 'edit' },
        dit: { schedule: 'view', call_sheet: 'view', dit_log: 'edit', shot_list: 'view' },
        scripty: { schedule: 'view', call_sheet: 'view', script_notes: 'edit' },
        client: { call_sheet: 'view', client_selects: 'view' },
        crew: { call_sheet: 'view', schedule: 'view' }
    };

    const [copied, setCopied] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    // Gateway URL Generation
    const mobileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/onset/${metadata?.projectId || ''}`;

    const toggleAccess = (roleId: string, docId: string) => {
        if (isLocked || !metadata?.isOwner) return;

        const current = (matrix[roleId] && matrix[roleId][docId]) || 'none';
        const nextMap: Record<string, 'none' | 'view' | 'edit'> = { 'none': 'view', 'view': 'edit', 'edit': 'none' };
        const next = nextMap[current];

        const newMatrix = {
            ...matrix,
            [roleId]: {
                ...(matrix[roleId] || {}),
                [docId]: next
            }
        };
        onUpdate({ ...data, matrix: newMatrix });
    };

    const addRole = () => {
        if (!newRoleName || isLocked || !metadata?.isOwner) return;
        const id = newRoleName.toLowerCase().replace(/\s+/g, '_');
        const newRoles = [...roles, { id, name: newRoleName, icon: '👤', color: 'zinc' }];
        onUpdate({ ...data, roles: newRoles, matrix }); // Carry over matrix
        setNewRoleName('');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mobileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDocAccess = (roleId: string, docId: string) => (matrix[roleId] && matrix[roleId][docId]) || 'none';

    return (
        <div className="space-y-12 animate-in fade-in">
            
            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                
                {/* MATRIX SWITCHBOARD */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                        
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Document Access Matrix</h2>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Tap cells to cycle permission: None → View → Edit</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                    None
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    View
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                                    Edit
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/30">
                                        <th className="p-6 text-left border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Document Silo</span>
                                        </th>
                                        {roles.map((role: any) => (
                                            <th key={role.id} className="p-6 text-center border-b border-zinc-100 dark:border-zinc-800 min-w-[110px]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-lg mb-1">{role.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{role.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DOCUMENT_TYPES.map(doc => (
                                        <tr key={doc.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                                            <td className="p-6 border-b border-zinc-50 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${doc.isSensitive ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'}`}>
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black uppercase tracking-tight block">{doc.name}</span>
                                                        {doc.isSensitive && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Lock size={8} className="text-amber-500" />
                                                                <span className="text-[8px] font-black uppercase text-amber-500/70 tracking-widest font-mono">Sens-T1 Security</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {roles.map((role: any) => {
                                                const access = getDocAccess(role.id, doc.id);
                                                return (
                                                    <td key={role.id} className="p-2 border-b border-zinc-50 dark:border-zinc-800/50 text-center">
                                                        <button 
                                                            disabled={!metadata?.isOwner}
                                                            onClick={() => toggleAccess(role.id, doc.id)}
                                                            className={`w-14 h-9 mx-auto rounded-xl flex items-center justify-center transition-all active:scale-95 border-2
                                                                ${access === 'edit' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                                                  access === 'view' ? 'bg-white dark:bg-zinc-900 border-blue-500/40 text-blue-500 shadow-sm' : 
                                                                  'bg-zinc-50 dark:bg-zinc-800/40 border-transparent text-zinc-300 dark:text-zinc-600'}`}
                                                        >
                                                            {access === 'edit' ? <Edit3 size={15} strokeWidth={3} /> : access === 'view' ? <Eye size={15} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {metadata?.isOwner && (
                        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                                <Plus size={20} />
                            </div>
                            <input 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Add Role (e.g. Hair/Makeup)..."
                                className="flex-1 bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest placeholder:text-zinc-400 text-zinc-900 dark:text-white"
                            />
                            <button 
                                onClick={addRole}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                            >
                                Add Role
                            </button>
                        </div>
                    )}
                </div>

                {/* MOBILE UPLINK GATEWAY */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col items-center text-center transition-colors">
                        <div className="mb-8">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mx-auto mb-4">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Mobile Uplink</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Crew Gateway QR</p>
                        </div>

                        <div className="bg-white p-4 rounded-3xl shadow-inner border border-zinc-100 mb-8 overflow-hidden">
                            <QRCode 
                                value={mobileUrl}
                                size={180}
                                level="H"
                            />
                        </div>

                        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed px-2 mb-8 uppercase tracking-tight">
                            Scan to launch <span className="text-zinc-900 dark:text-white font-black">OnSet Mobile</span> on your device.
                        </p>

                        <div className="w-full space-y-3">
                            <button 
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-3 bg-zinc-100 dark:bg-zinc-800 py-4 rounded-2xl transition-all hover:bg-emerald-500/10 group active:scale-95"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-zinc-400 transition-colors group-hover:text-emerald-500" />}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${copied ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                    {copied ? 'Link Copied' : 'Copy Mobile Link'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20 shadow-sm transition-all hover:shadow-emerald-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity size={18} className="text-emerald-500" />
                            <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Secure Uplink</h4>
                        </div>
                        <p className="text-[10px] text-emerald-800/70 dark:text-emerald-400/70 font-bold uppercase tracking-tight leading-relaxed">
                            This perimeter is role-locked. Access is granted based on the matrix configurations above.
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
    );
};
