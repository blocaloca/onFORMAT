/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, ShieldCheck } from 'lucide-react';
import { getClient } from '@/lib/supabase';

import { PRODUCTION_ROLES, deriveMobileRoleId } from '@/lib/roleUtils';


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
            // First check if this exact role name exists in the custom mobileRoles matrix
            const roleMatch = mobileRoles.find((r: any) => r.name.toLowerCase() === updates.role?.toLowerCase());
            if (roleMatch) {
                newItems[index].mobileRoleId = roleMatch.id;
            } else {
                // Otherwise derive it canonically
                newItems[index].mobileRoleId = deriveMobileRoleId(updates.role);
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

    // --- Proactive Authorization Sync ---
    // Instantly sync JSON changes to SQL for accurate RLS
    useEffect(() => {
        if (!metadata?.projectId || isLocked || isPrinting || items.length === 0) return;
        const syncTimeout = setTimeout(async () => {
            const validCrew = items.filter((c: CrewMember) => c.email && c.email.trim() !== '');
            if (validCrew.length === 0) return;
            const records = validCrew.map((c: CrewMember) => ({
                project_id: metadata.projectId,
                user_email: c.email.trim().toLowerCase(),
                role: c.role || 'General Crew'
            }));
            try {
                // Upserting without 'is_online' so we don't clobber active presence
                await supabase.from('crew_membership').upsert(records, { onConflict: 'project_id, user_email' });
            } catch (e) {
                console.error("Proactive SQL Auth Sync failed:", e);
            }
        }, 1500);
        return () => clearTimeout(syncTimeout);
    }, [items, metadata?.projectId, isLocked, isPrinting]);

    // Dynamic Pagination
    const MAX_PAGE_HEIGHT_SCORE = orientation === 'landscape' ? 600 : 850;

    const pages: CrewMember[][] = [];
    let currentPage: CrewMember[] = [];
    let currentPageHeight = 0;

    items.forEach((item) => {
        let rowScore = 42; // Base row height (~40px)
        
        if (currentPageHeight + rowScore > MAX_PAGE_HEIGHT_SCORE && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [];
            currentPageHeight = 0;
        }

        currentPage.push(item);
        currentPageHeight += rowScore;
    });

    if (currentPage.length > 0 || items.length === 0) {
        pages.push(currentPage);
    }

    const headerLabelStyle = "text-[9px] font-black uppercase tracking-widest text-zinc-400";
    const inputStyle = "text-[11px] font-medium bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 px-2 py-1 outline-none transition-all w-full text-zinc-900 dark:text-zinc-900 placeholder:text-zinc-300";

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Crew List"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Crew List (Cont.)` : ''}
                    isPrinting={isPrinting}
                >
                    <div className="space-y-4 text-sm font-sans flex-1 h-full flex flex-col">
                        
                        {/* Operator Status Legend */}
                        {!isPrinting && pageIndex === 0 && (
                            <div className="flex justify-end gap-5 h-2 -mb-2 pr-[40px]">
                                <div className="flex items-center gap-1.5 opacity-70" title="User is mapped to OnSet Mobile">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]" />
                                    <span className={headerLabelStyle}>Auth Standby</span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-70" title="User is currently live on the app">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]" />
                                    <span className={headerLabelStyle}>Live Online</span>
                                </div>
                            </div>
                        )}

                        {/* Tactical Grid Header: role(150) name(1fr) email(180) phone(100) status(90) actions(30) */}
                        <div className="grid grid-cols-[150px_1fr_180px_100px_90px_30px] gap-3 border-b border-black pb-1.5 items-end mb-1">
                            <span className={headerLabelStyle}>Production Role</span>
                            <span className={`${headerLabelStyle} pl-2`}>Full Name</span>
                            <span className={headerLabelStyle}>Email</span>
                            <span className={headerLabelStyle}>Phone</span>
                            <span className={`${headerLabelStyle} text-center`}>Operator Status</span>
                            <span className="w-full"></span>
                        </div>

                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item) => {
                                const globalIdx = items.findIndex(i => i.id === item.id);
                        const isOnline = onlineUsers.has(item.email?.toLowerCase());
                        const roleSynced = mobileRoles.some((r: any) => r.id === item.mobileRoleId && r.id !== 'crew') || 
                                          ['dit', 'producer', 'director', 'scripty', 'dp', 'client'].includes(item.mobileRoleId || '');
                        
                        return (
                            <div key={item.id} className="grid grid-cols-[150px_1fr_180px_100px_90px_30px] gap-3 py-1 items-center group hover:bg-zinc-50 transition-colors">
                                
                                {/* 1. Role Selector */}
                                <div className="relative pt-0.5">
                                    {isPrinting ? (
                                        <div className="w-full text-[10px] uppercase font-black tracking-tight px-1 py-1 block text-zinc-900 truncate">{item.role}</div>
                                    ) : (
                                        <div className="relative flex flex-col justify-center w-full">
                                            {(!PRODUCTION_ROLES.includes(item.role) && !mobileRoles?.some((mr:any) => mr.name === item.role) && item.role !== '') ? (

                                                <div className="flex w-full items-center">
                                                    <input 
                                                        value={item.role}
                                                        onChange={(e) => handleUpdateItem(globalIdx, { role: e.target.value })}
                                                        placeholder="Custom Role..."
                                                        className={`text-[10px] font-black uppercase tracking-tight bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 px-2 py-1 outline-none w-full text-amber-600 dark:text-amber-500 placeholder:text-zinc-400`}
                                                    />
                                                    <button onClick={() => handleUpdateItem(globalIdx, { role: '' })} className="ml-1 text-zinc-400 hover:text-black">×</button>
                                                </div>
                                            ) : (
                                                <select
                                                    value={item.role || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'Other') {
                                                            handleUpdateItem(globalIdx, { role: 'Custom Role' });
                                                        } else {
                                                            handleUpdateItem(globalIdx, { role: val });
                                                        }
                                                    }}
                                                    className={`text-[10px] font-black uppercase tracking-tight bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 px-1 py-1 outline-none w-full text-zinc-900 dark:text-zinc-900 appearance-none cursor-pointer`}
                                                    disabled={isLocked}
                                                >
                                                    <option value="" disabled>Select Role...</option>
                                                    {PRODUCTION_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                                    {/* Inject custom MobileControlTemplate roles if not already present */}
                                                    {mobileRoles.map((mr: any) => {
                                                        if (PRODUCTION_ROLES.some(pr => pr.toLowerCase() === mr.name.toLowerCase())) return null;
                                                        return <option key={`custom-${mr.id}`} value={mr.name}>{mr.name}</option>;
                                                    })}
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Full Name */}
                                <div className="pt-0.5">
                                    {isPrinting ? (
                                        <div className="w-full text-[11px] font-black px-2 py-1 block text-zinc-900 truncate">{item.name}</div>
                                    ) : (
                                        <input 
                                            value={item.name}
                                            onChange={(e) => handleUpdateItem(globalIdx, { name: e.target.value })}
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
                                            onChange={(e) => handleUpdateItem(globalIdx, { email: e.target.value })}
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
                                            onChange={(e) => handleUpdateItem(globalIdx, { phone: e.target.value })}
                                            placeholder="Phone"
                                            className={`${inputStyle} text-[10px] font-mono`}
                                            disabled={isLocked}
                                        />
                                    )}
                                </div>

                                {/* 5. Operator Status */}
                                <div className="flex items-center justify-center pt-0.5 w-full">
                                    {isPrinting ? (
                                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest">{roleSynced ? 'SYNCED' : '-'}</div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 w-full relative group/status cursor-help" title={isOnline ? 'Online Now' : (roleSynced ? 'Ready for Phone Sync (Offline)' : 'Unused Role')}>
                                            <div className="flex gap-1.5 items-center">
                                                {/* Blue Dot = Auth Matrix Sync */}
                                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${roleSynced ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]' : 'bg-zinc-200'}`} />
                                                {/* Green Dot = Live Online */}
                                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isOnline ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]' : 'bg-zinc-200'}`} />
                                            </div>
                                            <span className="text-[7.5px] uppercase tracking-[0.1em] font-black text-zinc-400 mt-0.5 absolute top-4 opacity-0 group-hover/status:opacity-100 pointer-events-none w-[90px] text-center">
                                                {isOnline ? 'Active' : (roleSynced ? 'Standby' : 'Local')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 6. Actions */}
                                <div className="relative flex justify-center w-full">
                                    {!isLocked && !isPrinting && (
                                        <>
                                            <button 
                                                onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === globalIdx ? null : globalIdx)}
                                                className={`hover:text-red-500 transition-opacity flex justify-center w-full p-1 ${deleteConfirmIndex === globalIdx ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                            >
                                                <Trash2 size={10} />
                                            </button>

                                            {deleteConfirmIndex === globalIdx && (
                                                <div className="absolute right-0 top-8 z-50 bg-white shadow-xl border border-zinc-200 p-2 rounded-lg w-[100px] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
                                                    <button
                                                        onClick={() => handleDeleteItem(globalIdx)}
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

                    {!isLocked && !isPrinting && pageIndex === pages.length - 1 && (
                        <div className="pt-3">
                            <button 
                                onClick={handleAddItem}
                                className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-zinc-900 transition-all px-4 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-200 hover:border-zinc-300 w-[160px]"
                            >
                                <Plus size={10} /> Add Personnel
                            </button>
                        </div>
                    )}
                </div>

                {items.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center bg-transparent rounded-xl border border-dashed border-zinc-200">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">No personnel added to list</p>
                    </div>
                )}

                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
