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
    ChevronDown,
    Zap,
    Radio
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

interface OnSetControlPanelTemplateProps {
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

// Combine all tools into a single flat list as requested (no phase labels)
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
    { id: 'dit-log', name: 'DIT Log', isSensitive: true },
    { id: 'client-selects', name: 'Client Selects', isSensitive: true },
    { id: 'deliverables', name: 'Deliverables' },
    { id: 'archive', name: 'Archive Log' }
];

export const OnSetControlPanelTemplate = ({ data, onUpdate, isLocked, metadata }: any) => {
    const safeData = (data && typeof data === 'object') ? data : {};
    const roles = safeData.roles || [];
    const matrix = safeData.matrix || {};
    const isLive = safeData.isLive || false;

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
        onUpdate({ ...safeData, matrix: newMatrix });
    };

    const toggleLive = () => {
        if (isLocked || !metadata?.isOwner) return;
        onUpdate({ ...safeData, isLive: !isLive });
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
        onUpdate({ ...safeData, roles: newRoles });
        setNewRoleName('');
    };

    const removeRole = (roleId: string) => {
        if (isLocked || !metadata?.isOwner) return;
        const newRoles = roles.filter((r: any) => r.id !== roleId);
        const newMatrix = { ...matrix };
        delete newMatrix[roleId];
        onUpdate({ ...safeData, roles: newRoles, matrix: newMatrix });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mobileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDocAccess = (roleId: string, docId: string) => (matrix[roleId] && matrix[roleId][docId]) || 'none';

    return (
        <div className="space-y-8 animate-in fade-in">
            
            {/* COMPACT STATUS BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent px-6 py-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-transparent border border-zinc-100 text-zinc-400'}`}>
                        <Radio size={20} className={isLive ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            OnSet Mobile Control
                        </h1>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                            {isLive ? 'Broadcasting Permissions' : 'Broadcasting Offline'}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={toggleLive}
                    disabled={!metadata?.isOwner || isLocked}
                    className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${isLive 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 active:bg-emerald-600' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95'}`}
                >
                    <Zap size={14} className={isLive ? 'fill-current' : ''} />
                    {isLive ? 'Active' : 'Go Live'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* MATRIX SWITCHBOARD */}
                <div className="flex-1 min-w-0 space-y-6">
                    
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

                    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                        
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-transparent">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">Access Permissions Matrix</h2>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Define mobile silos for crew</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-blue-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    View
                                </div>
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/10" />
                                    Edit
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto scrollbar-hide">
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
                                        <tr key={doc.id} className="group hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.05] transition-colors">
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

                {/* MOBILE UPLINK GATEWAY */}
                <div className="w-full lg:w-[280px] shrink-0 space-y-6">
                    <div className="bg-transparent p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center transition-colors">
                        <div className="mb-6">
                            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">Mobile Uplink</h3>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Crew Gateway QR</p>
                        </div>

                        <div className="bg-white p-3 rounded-2xl shadow-inner border border-zinc-100 mb-6 overflow-hidden">
                            <QRCode 
                                value={mobileUrl}
                                size={140}
                                level="H"
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <button 
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900 py-3 rounded-xl transition-all hover:bg-emerald-500/10 active:scale-95"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${copied ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                    {copied ? 'Link Copied' : 'Copy Mobile Link'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 dark:bg-blue-500/10 p-5 rounded-[1.5rem] border border-blue-500/10 space-y-3">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <h4 className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Tactical Security</h4>
                        </div>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-tight leading-normal">
                            All mobile traffic is role-locked. Permissions update instantly upon toggle.
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
    );
};
