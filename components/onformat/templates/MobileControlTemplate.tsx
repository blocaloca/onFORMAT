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
import { QRCodeSVG as QRCode } from 'qrcode.react';

interface MobileControlTemplateProps {
    data: any;
    onUpdate: (data: any) => void;
    isLocked?: boolean;
    metadata?: any;
}

import { PRODUCTION_ROLES, deriveMobileRoleId } from '@/lib/roleUtils';


const DOCUMENT_TYPES = [
    { id: 'project-vision', name: 'Project Vision' },
    { id: 'creative-brief', name: 'Creative Brief' },
    { id: 'av-script', name: 'A/V Script' },
    { id: 'treatment', name: 'Director\'s Treatment' },
    { id: 'storyboard', name: 'Storyboard' },
    { id: 'lookbook', name: 'Lookbook' },
    { id: 'shot-scene-book', name: 'Shot / Scene Book' },
    { id: 'ecomm-shot-list', name: 'eComm Shot List' },
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        const r = newRoleName.toLowerCase();
        let id = deriveMobileRoleId(newRoleName);
        
        // If deriveMobileRoleId defaults to 'crew' but they explicitly defined something custom,
        // we should create a safe custom ID so it doesn't collide with literal 'General Crew'
        if (id === 'crew' && !r.includes('crew') && r !== 'pa') {
            id = newRoleName.toLowerCase().trim().replace(/\s+/g, '-');
        }

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
                        <div className="bg-transparent p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <div className="flex items-center gap-3 flex-1 pl-3">
                                <Users size={14} className="text-zinc-400" />
                                <div 
                                    className="relative flex-1"
                                    onBlur={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                            setTimeout(() => setIsDropdownOpen(false), 150);
                                        }
                                    }}
                                >
                                    <div className="flex items-center">
                                        <input 
                                            value={newRoleName}
                                            onChange={(e) => {
                                                setNewRoleName(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            placeholder="Authorize Production Role..."
                                            className="w-full bg-transparent outline-none text-xs font-black uppercase tracking-widest placeholder:text-zinc-300 dark:text-white"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded absolute right-0"
                                        >
                                            <ChevronDown size={14} className="text-zinc-400" />
                                        </button>
                                    </div>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute top-[120%] left-0 w-full max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-xl z-50 py-1 scrollbar-hide">
                                            {PRODUCTION_ROLES
                                                .filter(role => role.toLowerCase().includes(newRoleName.toLowerCase()))
                                                .map(role => (
                                                    <div 
                                                        key={role}
                                                        className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer text-zinc-700 dark:text-zinc-300 transition-colors"
                                                        onClick={() => {
                                                            setNewRoleName(role);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        {role}
                                                    </div>
                                                ))}
                                            {newRoleName && !PRODUCTION_ROLES.some(r => r.toLowerCase() === newRoleName.toLowerCase()) && (
                                                <div 
                                                    className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer transition-colors"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    + Custom: "{newRoleName}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={addRole}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-colors"
                            >
                                Add Role
                            </button>
                        </div>
                    )}

                    <div className="bg-transparent rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden text-black dark:text-zinc-100">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-700 flex justify-between items-center bg-transparent">
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
                                    <tr className="bg-transparent border-b border-zinc-100 dark:border-zinc-700">
                                        <th className="py-3 px-4 text-left w-[180px]">
                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Document Permissions</span>
                                        </th>
                                        {roles.map((role: any) => (
                                            <th key={role.id} className="py-3 px-1 text-center group min-w-[50px] w-[50px]">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight mb-1 dark:text-zinc-100">{role.name}</span>
                                                    <button 
                                                        onClick={() => removeRole(role.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-red-500 uppercase tracking-tighter transition-opacity"
                                                    >
                                                        [Remove]
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="w-full"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                                    {DOCUMENT_TYPES.map(doc => (
                                        <tr key={doc.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-700/10 transition-colors">
                                            <td className="py-2.5 px-4">
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
                                                    <td key={role.id} className="py-1 px-0 text-center">
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
                                            <td className="w-full"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Uplink Panel (QR) */}
                <div className="w-full xl:w-[280px] shrink-0 space-y-6">
                    <div className="bg-transparent p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                        <div className="mb-6">
                            <h3 className="text-sm font-black uppercase tracking-tight text-black dark:text-white">Mobile Uplink</h3>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Crew Gateway</p>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-inner border border-zinc-100 mb-6">
                            <QRCode 
                                value={mobileUrl}
                                size={140}
                                level="H"
                            />
                        </div>

                        <div className="w-full space-y-3">
                                <button 
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-2 bg-transparent border border-zinc-200 dark:border-zinc-800 py-3 rounded-xl transition-all hover:border-zinc-400 active:scale-95"
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
