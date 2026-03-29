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
import QRCode from 'qrcode.react';

interface MobileControlTemplateProps {
    data: any;
    onUpdate: (data: any) => void;
    isLocked?: boolean;
    metadata?: any;
}

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

export default function MobileControlTemplate({ data, onUpdate, isLocked, metadata }: MobileControlTemplateProps) {
    const roles = data.roles || INITIAL_ROLES;
    const matrix = data.matrix || {
        producer: { schedule: 'edit', call_sheet: 'edit', dit_log: 'edit', shot_list: 'edit', script_notes: 'edit', client_selects: 'edit', lookbook: 'edit', budget: 'edit' },
        dit: { schedule: 'view', call_sheet: 'view', dit_log: 'edit', shot_list: 'view' },
        scripty: { schedule: 'view', call_sheet: 'view', script_notes: 'edit' },
        client: { call_sheet: 'view', client_selects: 'view' },
        crew: { call_sheet: 'view', schedule: 'view' }
    };

    const [copied, setCopied] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const mobileUrl = `${window.location.origin}/onset/${metadata?.projectId || ''}`;

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
        onUpdate({ ...data, roles: newRoles });
        setNewRoleName('');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mobileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDocAccess = (roleId: string, docId: string) => (matrix[roleId] && matrix[roleId][docId]) || 'none';

    return (
        <div className="space-y-12">
            
            <div className="flex flex-col xl:flex-row gap-12">
                
                {/* Switchboard Section */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden text-black dark:text-zinc-100">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Access Control Matrix</h2>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Define mobile silos for each production role</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">View</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Edit</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <th className="p-6 text-left border-b border-zinc-100 dark:border-zinc-700">
                                            <span className="text-[10px] font-black uppercase text-zinc-400">Document Silo</span>
                                        </th>
                                        {roles.map((role: any) => (
                                            <th key={role.id} className="p-6 text-center border-b border-zinc-100 dark:border-zinc-700">
                                                <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                                    <span className="text-lg">{role.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{role.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DOCUMENT_TYPES.map(doc => (
                                        <tr key={doc.id} className="group hover:bg-emerald-500/[0.02]">
                                            <td className="p-6 border-b border-zinc-50 dark:border-zinc-700/30">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${doc.isSensitive ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'}`}>
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black uppercase tracking-tight block">{doc.name}</span>
                                                        {doc.isSensitive && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Lock size={8} className="text-amber-500" />
                                                                <span className="text-[8px] font-black uppercase text-amber-500/70 tracking-widest font-mono">Sens-T1</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {roles.map((role: any) => {
                                                const access = getDocAccess(role.id, doc.id);
                                                return (
                                                    <td key={role.id} className="p-2 border-b border-zinc-50 dark:border-zinc-700/30 text-center">
                                                        <button 
                                                            disabled={!metadata?.isOwner}
                                                            onClick={() => toggleAccess(role.id, doc.id)}
                                                            className={`w-14 h-9 mx-auto rounded-xl flex items-center justify-center transition-all active:scale-95 border-2
                                                                ${access === 'edit' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                                                  access === 'view' ? 'bg-white dark:bg-zinc-900 border-blue-500/40 text-blue-500' : 
                                                                  'bg-zinc-50 dark:bg-zinc-800/40 border-transparent text-zinc-300 dark:text-zinc-600'}`}
                                                        >
                                                            {access === 'edit' ? <Edit3 size={14} strokeWidth={3} /> : access === 'view' ? <Eye size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
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
                        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
                            <Plus size={20} className="text-zinc-400 ml-2" />
                            <input 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Add Production Role..."
                                className="flex-1 bg-transparent outline-none text-xs font-black uppercase tracking-widest placeholder:text-zinc-400"
                            />
                            <button 
                                onClick={addRole}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                            >
                                Create Role
                            </button>
                        </div>
                    )}
                </div>

                {/* Uplink Panel (QR) */}
                <div className="w-full xl:w-[320px] shrink-0 space-y-8">
                    <div className="bg-white dark:bg-zinc-800/80 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="mb-8">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mx-auto mb-4">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-black dark:text-white">Mobile Uplink</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Crew Gateway</p>
                        </div>

                        <div className="bg-white p-4 rounded-3xl shadow-inner border border-zinc-100 mb-8">
                            <QRCode 
                                value={mobileUrl}
                                size={180}
                                level="H"
                                renderAs="svg"
                            />
                        </div>

                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-4 mb-8">
                            Scan to launch **OnSet Mobile** on any device for this production.
                        </p>

                        <div className="w-full space-y-3">
                            <button 
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900 py-4 rounded-2xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-zinc-400" />}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${copied ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                    {copied ? 'Link Copied' : 'Copy Uplink'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 space-y-4">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-emerald-500" />
                            <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Security HUD</h4>
                        </div>
                        <p className="text-[10px] text-emerald-800/70 dark:text-emerald-400/70 font-bold uppercase tracking-tight leading-relaxed">
                            Access is role-locked at the perimeter. Crew can only see silos toggled above.
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
