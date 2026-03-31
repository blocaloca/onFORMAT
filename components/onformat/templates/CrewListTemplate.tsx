/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, ShieldCheck } from 'lucide-react';
import { getClient } from '@/lib/supabase';

const PRODUCTION_ROLES = [
    'Producer', 'Director', 'Director of Photography', '1st AD', '2nd AD',
    'UPM / Line Producer', 'Production Coordinator', 'Script Supervisor',
    'Gaffer', 'Key Grip', 'Sound Mixer', 'DIT', 'Media Manager',
    'Production Designer', 'Art Director', 'Stylist / Wardrobe', 'Makeup Artist',
    'Editor', 'Location Manager', 'PA (Production Assistant)',
    'General Crew', 'Other'
];

const FALLBACK_MOBILE_ROLES = [
    { id: 'producer', name: 'Producer' },
    { id: 'dit', name: 'DIT' },
    { id: 'scripty', name: 'Script Supervisor' },
    { id: 'dp', name: 'Director of Photography' },
    { id: 'client', name: 'Client / Agency' },
    { id: 'crew', name: 'General Crew' }
];

interface CrewMember {
    id: string;
    role: string;
    name: string;
    email: string;
    phone: string;
    mobileRoleId?: string; 
}

interface CrewListData {
    crew: CrewMember[];
}

interface CrewListTemplateProps {
    data: Partial<CrewListData>;
    onUpdate: (data: Partial<CrewListData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const CrewListTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: CrewListTemplateProps) => {
    const supabase = getClient();
    const items = data.crew || [];
    const mobileRoles = (metadata?.mobileRoles && metadata.mobileRoles.length > 0) ? metadata.mobileRoles : FALLBACK_MOBILE_ROLES;

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Math.random().toString(36).substr(2, 9)}`,
            role: '',
            name: '',
            email: '',
            phone: '',
            mobileRoleId: 'crew'
        };
        onUpdate({ crew: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<CrewMember>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        
        if (updates.role) {
            const roleMatch = mobileRoles.find((r: any) => r.name.toLowerCase() === updates.role?.toLowerCase());
            if (roleMatch) {
                newItems[index].mobileRoleId = roleMatch.id;
            } else {
                // --- TACTICAL HOOKS: Map every PRODUCTION_ROLE to a predictable Mobile ID ---
                const r = updates.role.toLowerCase();
                if (r === 'dit' || r.includes('media')) newItems[index].mobileRoleId = 'dit';
                else if (r.includes('producer') || r.includes('coordinator')) newItems[index].mobileRoleId = 'producer';
                else if (r === 'director') newItems[index].mobileRoleId = 'director';
                else if (r.includes('supervisor') || r === 'scripty') newItems[index].mobileRoleId = 'scripty';
                else if (r.includes('photography') || r === 'dp') newItems[index].mobileRoleId = 'dp';
                else if (r.includes('ad') || r.includes('assistant director')) newItems[index].mobileRoleId = 'ad';
                else if (r.includes('gaffer') || r.includes('electric')) newItems[index].mobileRoleId = 'electric';
                else if (r.includes('grip')) newItems[index].mobileRoleId = 'grip';
                else if (r.includes('sound') || r.includes('mixer')) newItems[index].mobileRoleId = 'sound';
                else if (r.includes('art') || r.includes('designer') || r.includes('prop')) newItems[index].mobileRoleId = 'art';
                else if (r.includes('stylist') || r.includes('wardrobe')) newItems[index].mobileRoleId = 'wardrobe';
                else if (r.includes('makeup') || r.includes('hmu')) newItems[index].mobileRoleId = 'hmu';
                else if (r.includes('editor')) newItems[index].mobileRoleId = 'editor';
                else if (r.includes('location')) newItems[index].mobileRoleId = 'locations';
                else if (r.includes('client') || r.includes('agency')) newItems[index].mobileRoleId = 'client';
                else newItems[index].mobileRoleId = 'crew'; 
            }
        }

        onUpdate({ crew: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ crew: newItems });
        setDeleteConfirmIndex(null);
    };

    // --- Presence Check ---
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    useEffect(() => {
        if (!metadata?.projectId) return;
        const pulseChannel = supabase.channel(`production_presence:${metadata.projectId}`);
        pulseChannel.on('presence', { event: 'sync' }, () => {
            const state = pulseChannel.presenceState();
            const set = new Set<string>();
            Object.values(state).flat().forEach((u: any) => {
                if (u.user_email) set.add(u.user_email.toLowerCase());
            });
            setOnlineUsers(set);
        }).subscribe();
        return () => { supabase.removeChannel(pulseChannel); };
    }, [metadata?.projectId]);

    const headerLabelStyle = "text-[9px] font-black uppercase tracking-widest text-zinc-400";
    const inputStyle = "text-[11px] font-medium bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 px-2 py-1 outline-none transition-all w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300";

    return (
        <DocumentLayout
            title="Crew List"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
        >
            <div className="space-y-4 text-sm font-sans flex-1">
                
                {/* Tactical Grid Header: role(180) name(1fr) email(180) phone(140) status(50) actions(30) */}
                <div className="grid grid-cols-[180px_1fr_180px_140px_50px_30px] gap-3 border-b border-black pb-1.5 items-end mb-1">
                    <span className={headerLabelStyle}>Production Role</span>
                    <span className={`${headerLabelStyle} pl-2`}>Full Name</span>
                    <span className={headerLabelStyle}>Email</span>
                    <span className={headerLabelStyle}>Phone</span>
                    <span className={`${headerLabelStyle} text-right`}>Sync</span>
                    <span className="w-full"></span>
                </div>

                <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/30 flex-1">
                    {items.map((item, idx) => {
                        const isOnline = onlineUsers.has(item.email?.toLowerCase());
                        const roleSynced = mobileRoles.some((r: any) => r.id === item.mobileRoleId && r.id !== 'crew') || 
                                          ['dit', 'producer', 'director', 'scripty', 'dp', 'client'].includes(item.mobileRoleId || '');
                        
                        return (
                            <div key={item.id} className="grid grid-cols-[180px_1fr_180px_140px_50px_30px] gap-3 py-1 items-center group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                
                                {/* 1. Role Selector with Sync Badge */}
                                <div className="relative pt-0.5">
                                    {isPrinting ? (
                                        <div className="w-full text-[10px] uppercase font-black tracking-tight px-1 py-1 block text-black truncate">{item.role}</div>
                                    ) : (
                                        <div className="relative flex items-center">
                                            {roleSynced && (
                                                <div className="absolute left-0 w-1 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" title="Tactical Sync Active" />
                                            )}
                                            <input 
                                                value={item.role}
                                                onChange={(e) => handleUpdateItem(idx, { role: e.target.value })}
                                                placeholder="Role..."
                                                className={`text-[10px] font-black uppercase tracking-tight bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 px-2 py-1 outline-none w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 ${roleSynced ? 'pl-3' : 'pl-1'}`}
                                                disabled={isLocked}
                                                list={`roles-${idx}`}
                                            />
                                            <datalist id={`roles-${idx}`}>
                                                {PRODUCTION_ROLES.map(role => <option key={role} value={role} />)}
                                            </datalist>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Full Name */}
                                <div className="pt-0.5">
                                    {isPrinting ? (
                                        <div className="w-full text-[11px] font-black px-2 py-1 block text-black truncate">{item.name}</div>
                                    ) : (
                                        <input 
                                            value={item.name}
                                            onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                                            placeholder="Full Name"
                                            className={`${inputStyle} font-black uppercase tracking-tight`}
                                            disabled={isLocked}
                                        />
                                    )}
                                </div>

                                {/* 3. Email */}
                                <div className="pt-0.5">
                                    {isPrinting ? (
                                        <div className="w-full text-xs px-2 py-1 block text-zinc-900 truncate font-mono">{item.email}</div>
                                    ) : (
                                        <input 
                                            value={item.email}
                                            onChange={(e) => handleUpdateItem(idx, { email: e.target.value })}
                                            placeholder="email@production.com"
                                            className={`${inputStyle} text-[10px] font-mono`}
                                            disabled={isLocked}
                                        />
                                    )}
                                </div>

                                {/* 4. Phone */}
                                <div className="pt-0.5">
                                    {isPrinting ? (
                                        <div className="w-full text-xs px-2 py-1 block text-zinc-900 truncate font-mono">{item.phone}</div>
                                    ) : (
                                        <input 
                                            value={item.phone}
                                            onChange={(e) => handleUpdateItem(idx, { phone: e.target.value })}
                                            placeholder="Phone"
                                            className={`${inputStyle} text-[10px] font-mono`}
                                            disabled={isLocked}
                                        />
                                    )}
                                </div>

                                {/* 5. Status LED */}
                                <div className="flex justify-end pr-1">
                                    <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                </div>

                                {/* 6. Actions */}
                                <div className="relative flex justify-center w-full">
                                    {!isLocked && !isPrinting && (
                                        <>
                                            <button 
                                                onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === idx ? null : idx)}
                                                className={`hover:text-red-500 transition-opacity flex justify-center w-full p-1 ${deleteConfirmIndex === idx ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                            >
                                                <Trash2 size={10} />
                                            </button>

                                            {deleteConfirmIndex === idx && (
                                                <div className="absolute right-0 top-8 z-50 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-700 p-2 rounded-lg w-[100px] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
                                                    <button
                                                        onClick={() => handleDeleteItem(idx)}
                                                        className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-black py-1.5 px-2 rounded-md uppercase w-full transition-colors tracking-widest"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                    {!isLocked && !isPrinting && (
                        <div className="pt-3">
                            <button 
                                onClick={handleAddItem}
                                className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white transition-all px-4 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 w-[160px]"
                            >
                                <Plus size={10} /> Add Personnel
                            </button>
                        </div>
                    )}
                </div>

                {items.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">No personnel added to list</p>
                    </div>
                )}

            </div>
        </DocumentLayout>
    );
};
