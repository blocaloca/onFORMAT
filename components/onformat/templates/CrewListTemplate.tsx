/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, ShieldCheck } from 'lucide-react';
import { getClient } from '@/lib/supabase';

const DEPARTMENTS: Record<string, string[]> = {
    'Production': ['Producer', 'UPM', 'Coordinator', 'Prod. Assist (PA)', 'Script Sup.'],
    'Director': ['Director', '1st AD', '2nd AD'],
    'Camera': ['Director of Photography', 'Camera Operator', '1st AC', '2nd AC', 'DIT', 'Steadicam', 'Media Manager'],
    'Lighting': ['Gaffer', 'Best Boy Electric', 'Electrician', 'Board Op', 'Generator Op'],
    'Grip': ['Key Grip', 'Best Boy Grip', 'Grip', 'Dolly Grip'],
    'Sound': ['Sound Mixer', 'Boom Operator', 'Utility'],
    'Art': ['Production Designer', 'Art Director', 'Prop Master', 'Set Dresser', 'Constr. Coord'],
    'Wardrobe/HMU': ['Stylist', 'Assistant Stylist', 'Makeup Artist', 'Hair Stylist'],
    'Locations': ['Location Manager', 'Scout', 'Site Rep', 'Security'],
    'Post': ['Editor', 'Assistant Editor', 'Colorist', 'Sound Design', 'VFX Supervisor'],
    'Other': ['BTS Camera', 'Agency', 'Client Representative', 'Publicist']
};

interface CrewMember {
    id: string;
    department: string;
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
    const mobileRoles = metadata?.mobileRoles || [];

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const deptOptions = Object.keys(DEPARTMENTS);

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Math.random().toString(36).substr(2, 9)}`,
            department: 'Production',
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
                newItems[index].mobileRoleId = 'crew'; 
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
        const pulseChannel = supabase.channel(`production_pulse:${metadata.projectId}`);
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

    const headerLabelStyle = "text-[10px] font-bold uppercase tracking-widest text-zinc-400";
    const pillSelectStyle = "appearance-none bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-sm px-2 font-black text-[10px] uppercase cursor-pointer outline-none text-zinc-900 dark:text-zinc-100";
    const inputStyle = "font-medium text-sm bg-zinc-50 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-sm px-3 py-1.5 outline-none focus:bg-white dark:focus:bg-zinc-800 placeholder:text-zinc-200 w-full text-zinc-900 dark:text-zinc-100";

    return (
        <DocumentLayout
            title="Crew List"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
        >
            <div className="space-y-6 text-sm font-sans flex-1">
                
                {/* Reorganized Layout Grid */}
                {/* [DEPT 80] [ROLE 120] [NAME 1FR] [EMAIL 160] [PHONE 120] [STATUS 50] [ACTIONS 30] */}
                <div className="grid grid-cols-[80px_120px_1fr_160px_120px_50px_30px] gap-4 border-b border-black pb-2 items-end">
                    <span className={headerLabelStyle}>Dept</span>
                    <span className={headerLabelStyle}>Role</span>
                    <span className={headerLabelStyle}>Full Name</span>
                    <span className={headerLabelStyle}>Email</span>
                    <span className={headerLabelStyle}>Phone</span>
                    <span className={`${headerLabelStyle} text-right`}>Status</span>
                    <span className="w-full"></span>
                </div>

                <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((item, idx) => {
                        const isOnline = onlineUsers.has(item.email?.toLowerCase());
                        const suggestions = DEPARTMENTS[item.department] || [];
                        const roleSynced = mobileRoles.some((r: any) => r.id === item.mobileRoleId && r.id !== 'crew');
                        
                        return (
                            <div key={item.id} className="grid grid-cols-[80px_120px_1fr_160px_120px_50px_30px] gap-4 py-2.5 items-center group hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors">
                                
                                {/* 1. Dept Select */}
                                <div className="relative">
                                    <select 
                                        value={item.department}
                                        onChange={(e) => handleUpdateItem(idx, { department: e.target.value })}
                                        className={pillSelectStyle}
                                        disabled={isLocked || isPrinting}
                                    >
                                        {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                {/* 2. Production Role (Moved Left) */}
                                <div className="relative group/role">
                                    <input 
                                        value={item.role}
                                        onChange={(e) => handleUpdateItem(idx, { role: e.target.value })}
                                        placeholder="Role..."
                                        className="font-black text-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-sm px-2 py-1 outline-none focus:bg-white dark:focus:bg-zinc-800 uppercase w-full text-zinc-900 dark:text-zinc-100"
                                        disabled={isLocked || isPrinting}
                                        list={`roles-${idx}`}
                                    />
                                    <datalist id={`roles-${idx}`}>
                                        {mobileRoles.map((r: any) => <option key={r.id} value={r.name} />)}
                                        {suggestions.map(opt => <option key={opt} value={opt} />)}
                                    </datalist>
                                    {roleSynced && !isPrinting && (
                                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 text-white shadow-sm ring-1 ring-white">
                                            <ShieldCheck size={7} />
                                        </div>
                                    )}
                                </div>

                                {/* 3. Full Name (MAXIMIZED 1FR) */}
                                <input 
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                                    placeholder="Enter Name..."
                                    className={`${inputStyle} font-bold`}
                                    disabled={isLocked || isPrinting}
                                />

                                {/* 4. Email (Shortened) */}
                                <input 
                                    value={item.email}
                                    onChange={(e) => handleUpdateItem(idx, { email: e.target.value })}
                                    placeholder="Email Address"
                                    className="text-[11px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-sm px-2 py-1.5 outline-none focus:bg-white dark:focus:bg-zinc-800 placeholder:text-zinc-200 w-full text-zinc-900 dark:text-zinc-100"
                                    disabled={isLocked || isPrinting}
                                />

                                {/* 5. Phone (Shortened) */}
                                <input 
                                    value={item.phone}
                                    onChange={(e) => handleUpdateItem(idx, { phone: e.target.value })}
                                    placeholder="Phone"
                                    className="text-[11px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-sm px-2 py-1.5 outline-none focus:bg-white dark:focus:bg-zinc-800 placeholder:text-zinc-200 w-full text-zinc-900 dark:text-zinc-100"
                                    disabled={isLocked || isPrinting}
                                />

                                {/* 6. Status LED (Pushed Right) */}
                                <div className="flex justify-end">
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                </div>

                                {/* 7. Actions */}
                                <div className="relative flex justify-center w-full">
                                    {!isLocked && (
                                        <>
                                            <button 
                                                onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === idx ? null : idx)}
                                                className={`hover:text-red-500 transition-opacity flex justify-center w-full ${deleteConfirmIndex === idx ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            {deleteConfirmIndex === idx && (
                                                <div className="absolute right-0 top-6 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                    <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                    <button
                                                        onClick={() => handleDeleteItem(idx)}
                                                        className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
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
                        <div className="pt-4">
                            <button 
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/10 px-3 py-3 rounded-md w-full transition-all print-hidden"
                            >
                                <Plus size={12} /> Add Crew Personnel
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
