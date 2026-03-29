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
    Check,
    LockIcon,
    Radio,
    Zap
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

// --- FULL ONFORMAT TOOLSET ---
const TOOLS_BY_PHASE = [
    {
        label: 'Development',
        tools: [
            { id: 'project-vision', name: 'Project Vision' },
            { id: 'brief', name: 'Creative Brief' },
            { id: 'av-script', name: 'AV Script' },
            { id: 'directors-treatment', name: 'Treatment' },
            { id: 'storyboard', name: 'Storyboard' },
            { id: 'lookbook', name: 'Lookbook' }
        ]
    },
    {
        label: 'Pre-Production',
        tools: [
            { id: 'shot-scene-book', name: 'Shot List' },
            { id: 'budget', name: 'Budget' },
            { id: 'crew-list', name: 'Crew List' },
            { id: 'talent-release', name: 'Talent Release' },
            { id: 'casting-talent', name: 'Talent' },
            { id: 'locations-sets', name: 'Locations' },
            { id: 'equipment-list', name: 'Equipment List' },
            { id: 'wardrobe-styling', name: 'Wardrobe' },
            { id: 'props-list', name: 'Props' }
        ]
    },
    {
        label: 'On-Set',
        tools: [
            { id: 'schedule', name: 'Schedule' },
            { id: 'call-sheet', name: 'Call Sheet' },
            { id: 'on-set-notes', name: 'On-Set Notes' },
            { id: 'camera-report', name: 'Camera Report' },
            { id: 'script-notes', name: 'Script Notes' },
            { id: 'sound-report', name: 'Sound Report' },
            { id: 'dit-log', name: 'DIT Log', isSensitive: true }
        ]
    },
    {
        label: 'Post / Wrap',
        tools: [
            { id: 'budget-actual', name: 'Actuals' },
            { id: 'client-selects', name: 'Client Selects', isSensitive: true },
            { id: 'deliverables-licensing', name: 'Deliverables' },
            { id: 'archive-log', name: 'Archive Log' }
        ]
    }
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
    const matrix = safeData.matrix || {};
    const isLive = safeData.isLive || false;

    const [copied, setCopied] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

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
        onUpdate({ ...safeData, matrix: newMatrix });
    };

    const toggleLive = () => {
        if (isLocked || !metadata?.isOwner) return;
        onUpdate({ ...safeData, isLive: !isLive });
    };

    const addRole = () => {
        if (!newRoleName || isLocked || !metadata?.isOwner) return;
        const id = newRoleName.toLowerCase().replace(/\s+/g, '_');
        const newRoles = [...roles, { id, name: newRoleName, icon: '👤', color: 'zinc' }];
        onUpdate({ ...safeData, roles: newRoles });
        setNewRoleName('');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mobileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDocAccess = (roleId: string, docId: string) => (matrix[roleId] && matrix[roleId][docId]) || 'none';

    return (
        <div className="space-y-10 animate-in fade-in">
            
            {/* TOP STATUS BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isLive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                        <Radio size={24} className={isLive ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            OnSet Mobile Control
                            {isLive && <span className="flex h-2 w-3 rounded-full bg-emerald-500 animate-ping" />}
                        </h1>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
                            {isLive ? 'Uplink Broadcast Active' : 'Uplink Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={toggleLive}
                        disabled={!metadata?.isOwner || isLocked}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                            ${isLive 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:bg-emerald-600' 
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95'}`}
                    >
                        <Zap size={16} className={isLive ? 'fill-current' : ''} />
                        {isLive ? 'Active' : 'Go Live'}
                    </button>
                    {isLocked && <div className="text-xs text-zinc-400 font-black uppercase"><Lock size={14} /></div>}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                
                {/* MATRIX SWITCHBOARD */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                        
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Access Control Matrix</h2>
                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Tap cells to define mobile silos</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    View
                                </div>
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                                    Edit
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/10">
                                        <th className="p-6 text-left border-b border-zinc-100 dark:border-zinc-800 sticky left-0 bg-zinc-50 dark:bg-zinc-900 z-10">
                                            <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Document Silo</span>
                                        </th>
                                        {roles.map((role: any) => (
                                            <th key={role.id} className="p-6 text-center border-b border-zinc-100 dark:border-zinc-800 min-w-[110px]">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-2xl mb-1">{role.icon}</span>
                                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 leading-tight">{role.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TOOLS_BY_PHASE.map(phase => (
                                        <React.Fragment key={phase.label}>
                                            <tr className="bg-zinc-100/30 dark:bg-zinc-800/30">
                                                <td colSpan={roles.length + 1} className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">
                                                    <span className="text-xs font-black uppercase text-zinc-400 tracking-[0.2em]">{phase.label}</span>
                                                </td>
                                            </tr>
                                            {phase.tools.map(doc => (
                                                <tr key={doc.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                                                    <td className="p-6 border-b border-zinc-50 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-100 sticky left-0 bg-white dark:bg-zinc-900 z-10 group-hover:bg-[#FCFEFC] dark:group-hover:bg-zinc-800/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg ${doc.isSensitive ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'}`}>
                                                                <FileText size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-black uppercase tracking-tight block">{doc.name}</span>
                                                                {doc.isSensitive && (
                                                                    <div className="flex items-center gap-1 mt-0.5">
                                                                        <Lock size={8} className="text-amber-500" />
                                                                        <span className="text-[8px] font-black uppercase text-amber-500/70 tracking-widest font-mono">Sensitive</span>
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
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {metadata?.isOwner && (
                        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900/40 p-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <Plus size={20} className="text-zinc-400 ml-4" />
                            <input 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Add Role (e.g. BTS Camera)..."
                                className="flex-1 bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest placeholder:text-zinc-400 text-zinc-900 dark:text-white"
                            />
                            <button 
                                onClick={addRole}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                            >
                                Create Role
                            </button>
                        </div>
                    )}
                </div>

                {/* MOBILE UPLINK GATEWAY */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col items-center text-center transition-colors sticky top-4">
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
                </div>
                
            </div>
        </div>
    );
};
