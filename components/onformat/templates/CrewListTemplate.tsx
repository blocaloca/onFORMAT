/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, Smartphone, ChevronDown, UserCircle } from 'lucide-react';
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

    const deptOptions = Object.keys(DEPARTMENTS);

    const getRoleSuggestions = (dept: string) => {
        const matrixRoles = mobileRoles.map((r: any) => r.name);
        const deptRoles = DEPARTMENTS[dept] || [];
        return Array.from(new Set([...matrixRoles, ...deptRoles]));
    };

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Date.now()}`,
            department: 'Production',
            role: '',
            name: '',
            email: '',
            phone: ''
        };
        onUpdate({ crew: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<CrewMember>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ crew: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ crew: newItems });
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

    return (
        <DocumentLayout
            title="CREW LIST"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
        >
            <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* STYLE GUIDE COMPLIANT HEADER */}
                <div className="grid grid-cols-[1fr_120px_100px_180px_120px_40px_30px] gap-4 border-b-2 border-zinc-900 pb-4 items-end px-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Full Name</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Production Role</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Dept</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Email</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Phone</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Live</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400"></span>
                </div>

                <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((item, idx) => {
                        const isOnline = onlineUsers.has(item.email?.toLowerCase());
                        const suggestions = getRoleSuggestions(item.department);
                        
                        return (
                            <div key={item.id} className="grid grid-cols-[1fr_120px_100px_180px_120px_40px_30px] gap-4 py-6 items-center group hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors px-3">
                                
                                {/* PRIMARY FIELD: NAME */}
                                <input 
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                                    placeholder="ENTER FULL NAME"
                                    className="w-full bg-transparent text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white outline-none placeholder:text-zinc-200 border-b border-transparent focus:border-emerald-500 transition-all"
                                    disabled={isLocked || isPrinting}
                                />

                                {/* ROLE (Datalist Sync) */}
                                <div className="relative">
                                    <input 
                                        value={item.role}
                                        onChange={(e) => handleUpdateItem(idx, { role: e.target.value })}
                                        placeholder="ROLE..."
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/20 rounded px-2 py-1.5 text-[11px] font-black uppercase tracking-tight text-zinc-500 dark:text-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400"
                                        disabled={isLocked || isPrinting}
                                        list={`roles-${idx}`}
                                    />
                                    <datalist id={`roles-${idx}`}>
                                        {suggestions.map(opt => <option key={opt} value={opt} />)}
                                    </datalist>
                                </div>

                                {/* DEPT */}
                                <select 
                                    value={item.department}
                                    onChange={(e) => handleUpdateItem(idx, { department: e.target.value })}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none focus:text-zinc-900 dark:focus:text-white cursor-pointer"
                                    disabled={isLocked || isPrinting}
                                >
                                    {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                {/* EMAIL */}
                                <input 
                                    value={item.email}
                                    onChange={(e) => handleUpdateItem(idx, { email: e.target.value })}
                                    placeholder="EMAIL@DOMAIN.COM"
                                    className="w-full bg-transparent text-[11px] font-medium text-zinc-400 outline-none focus:text-zinc-900 dark:focus:text-white"
                                    disabled={isLocked || isPrinting}
                                />

                                {/* PHONE */}
                                <input 
                                    value={item.phone}
                                    onChange={(e) => handleUpdateItem(idx, { phone: e.target.value })}
                                    placeholder="PHONE"
                                    className="w-full bg-transparent text-[11px] font-medium text-zinc-400 outline-none focus:text-zinc-900 dark:focus:text-white"
                                    disabled={isLocked || isPrinting}
                                />

                                {/* STATUS INDICATOR */}
                                <div className="flex justify-center">
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${isOnline ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                </div>

                                {/* DELETE ACTION */}
                                <div className="flex justify-end">
                                    {!isLocked && (
                                        <button 
                                            onClick={() => handleDeleteItem(idx)} 
                                            className="text-zinc-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                    {!isLocked && !isPrinting && (
                        <button 
                            onClick={handleAddItem}
                            className="w-full py-8 mt-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-all hover:text-zinc-900 dark:hover:text-white hover:border-zinc-200"
                        >
                            <Plus size={20} /> ADD CREW PERSONNEL
                        </button>
                    )}
                </div>

                {items.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 bg-zinc-50/20 dark:bg-zinc-900/10 rounded-[4rem] border border-zinc-50 dark:border-zinc-800/50">
                            <UserCircle size={56} className="text-zinc-100 mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-200">Production personnel empty</p>
                    </div>
                )}

            </div>
        </DocumentLayout>
    );
};
