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
    Users,
    ChevronDown
} from 'lucide-react';
import QRCode from 'qrcode.react';

interface MobileControlTemplateProps {
    data: any;
    onUpdate: (data: any) => void;
    isLocked?: boolean;
    metadata?: any;
}

const PRODUCTION_ROLES = [
    'Producer', 'Director', 'Director of Photography', '1st AD', '2nd AD',
    'UPM / Line Producer', 'Production Coordinator', 'Script Supervisor',
    'Gaffer', 'Key Grip', 'Sound Mixer', 'DIT', 'Media Manager',
    'Production Designer', 'Art Director', 'Stylist / Wardrobe', 'Makeup Artist',
    'Editor', 'Location Manager', 'PA (Production Assistant)',
    'General Crew', 'Other'
];

const DOCUMENT_TYPES = [
    { id: 'project-vision', name: 'Project Vision' },
    { id: 'creative-brief', name: 'Creative Brief' },
    { id: 'av-script', name: 'A/V Script' },
    { id: 'treatment', name: 'Director\'s Treatment' },
    { id: 'storyboard', name: 'Storyboard' },
    { id: 'lookbook', name: 'Lookbook' },
    { id: 'shot-scene-book', name: 'Shot / Scene Book' },
    { id: 'budget', name: 'Budget / Actuals', isSensitive: true },
    { id: 'crew-list', name: 'Crew List' },
    { id: 'releases', name: 'Releases' },
    { id: 'casting', name: 'Casting / Talent' },
    { id: 'locations', name: 'Locations / Sets' },
    { id: 'equipment-list', name: 'Equipment List' },
    { id: 'wardrobe', name: 'Wardrobe / Styling' },
    { id: 'props-list', name: 'Props List' },
    { id: 'schedule', name: 'Schedule' },
    { id: 'call-sheet', name: 'Call Sheet' },
    { id: 'on-set-notes', name: 'On-Set Notes' },
    { id: 'camera-report', name: 'Camera Report' },
    { id: 'script-notes', name: 'Script Notes' },
    { id: 'sound-report', name: 'Sound Report' },
    { id: 'dit-log', name: 'DIT Log' },
    { id: 'client-selects', name: 'Client Selects', isSensitive: true },
    { id: 'deliverables', name: 'Deliverables' },
    { id: 'archive', name: 'Archive' }
];

export default function MobileControlTemplate({ data, onUpdate, isLocked, metadata }: MobileControlTemplateProps) {
    // Start with empty roles by default if data is empty, otherwise use existing
    const roles = data.roles || [];
    const matrix = data.matrix || {};

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
        onUpdate({ ...data, matrix: newMatrix });
    };

    const addRole = () => {
        if (!newRoleName || isLocked || !metadata?.isOwner) return;
        
        // --- TACTICAL HOOKS: Sync ROLE ID with OnSet Identity Engine ---
        let id = newRoleName.toLowerCase().replace(/\s+/g, '-');
        const r = newRoleName.toLowerCase();
        
        if (r === 'dit' || r.includes('media')) id = 'dit';
        else if (r.includes('producer') || r.includes('coordinator')) id = 'producer';
        else if (r === 'director') id = 'director';
        else if (r.includes('supervisor') || r === 'scripty') id = 'scripty';
        else if (r.includes('photography') || r === 'dp') id = 'dp';
        else if (r.includes('ad') || r.includes('assistant director')) id = 'ad';
        else if (r.includes('gaffer') || r.includes('electric')) id = 'electric';
        else if (r.includes('grip')) id = 'grip';
        else if (r.includes('sound') || r.includes('mixer')) id = 'sound';
        else if (r.includes('art') || r.includes('designer') || r.includes('prop')) id = 'art';
        else if (r.includes('stylist') || r.includes('wardrobe')) id = 'wardrobe';
        else if (r.includes('makeup') || r.includes('hmu')) id = 'hmu';
        else if (r.includes('editor')) id = 'editor';
        else if (r.includes('location')) id = 'locations';
        else if (r.includes('client') || r.includes('agency')) id = 'client';
        else if (r.includes('crew') || r === 'pa') id = 'crew';

        if (roles.find((role: any) => role.id === id)) {
            setNewRoleName('');
            return;
        }

        const newRoles = [...roles, { id, name: newRoleName, color: 'zinc' }];
        onUpdate({ ...data, roles: newRoles });
        setNewRoleName('');
    };

    const removeRole = (roleId: string) => {
        if (isLocked || !metadata?.isOwner) return;
        const newRoles = roles.filter((r: any) => r.id !== roleId);
        const newMatrix = { ...matrix };
        delete newMatrix[roleId];
        onUpdate({ ...data, roles: newRoles, matrix: newMatrix });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mobileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDocAccess = (roleId: string, docId: string) => (matrix[roleId] && matrix[roleId][docId]) || 'none';

    return (
        <div className="space-y-8">
            
            <div className="flex flex-col xl:flex-row gap-8">
                
                {/* Switchboard Section */}
                <div className="flex-1 space-y-6">
                    
                    {/* ADD ROLE AT THE TOP */}
                    {metadata?.isOwner && (
                        <div className="bg-white dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <div className="flex items-center gap-3 flex-1 pl-3">
                                <Users size={16} className="text-zinc-400" />
                                <div className="relative flex-1">
                                    <input 
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="Authorize Production Role..."
                                        className="w-full bg-transparent outline-none text-xs font-black uppercase tracking-widest placeholder:text-zinc-300 dark:text-white"
                                        list="production-roles-list"
                                    />
                                    <datalist id="production-roles-list">
                                        {PRODUCTION_ROLES.map(role => <option key={role} value={role} />)}
                                    </datalist>
                                </div>
                            </div>
                            <button 
                                onClick={addRole}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                            >
                                Add Role
                            </button>
                        </div>
                    )}

                    <div className="bg-white dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden text-black dark:text-zinc-100">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-700 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/10">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-tight">Access Permissions Matrix</h2>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Tactical document authorization</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest">View</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Full Write Access">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Edit</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-700">
                                        <th className="py-3 px-6 text-left w-[220px]">
                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Document Permissions</span>
                                        </th>
                                        {roles.map((role: any) => (
                                            <th key={role.id} className="py-3 px-2 text-center group min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight mb-1">{role.name}</span>
                                                    <button 
                                                        onClick={() => removeRole(role.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-red-500 uppercase tracking-tighter transition-opacity"
                                                    >
                                                        [Remove]
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                                    {DOCUMENT_TYPES.map(doc => (
                                        <tr key={doc.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-700/10 transition-colors">
                                            <td className="py-2.5 px-6">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-zinc-600 dark:text-zinc-300">{doc.name}</span>
                                                    {doc.isSensitive && (
                                                        <Lock size={8} className="text-amber-500" />
                                                    )}
                                                </div>
                                            </td>
                                            {roles.map((role: any) => {
                                                const access = getDocAccess(role.id, doc.id);
                                                return (
                                                    <td key={role.id} className="py-2 px-2 text-center">
                                                        <button 
                                                            disabled={!metadata?.isOwner}
                                                            onClick={() => toggleAccess(role.id, doc.id)}
                                                            className={`w-9 h-6 mx-auto rounded-lg flex items-center justify-center transition-all active:scale-95 border
                                                                ${access === 'edit' ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 
                                                                  access === 'view' ? 'bg-blue-500 border-blue-500 text-white shadow-sm' : 
                                                                  'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-300 dark:text-zinc-600'}`}
                                                        >
                                                            {access === 'edit' ? <Edit3 size={10} strokeWidth={4} /> : access === 'view' ? <Eye size={10} strokeWidth={4} /> : <div className="w-1 h-1 rounded-full bg-current opacity-20" />}
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
                </div>

                {/* Uplink Panel (QR) */}
                <div className="w-full xl:w-[280px] shrink-0 space-y-6">
                    <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                        <div className="mb-6">
                            <h3 className="text-sm font-black uppercase tracking-tight text-black dark:text-white">Mobile Uplink</h3>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Crew Gateway</p>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-inner border border-zinc-100 mb-6">
                            <QRCode 
                                value={mobileUrl}
                                size={140}
                                level="H"
                                renderAs="svg"
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <button 
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900 py-3 rounded-xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${copied ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                    {copied ? 'Link Copied' : 'Copy Uplink'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-100 dark:bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <h4 className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">Tactical Security</h4>
                        </div>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-tight leading-normal">
                            Access is role-locked. Crew must join with an assigned email.
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
