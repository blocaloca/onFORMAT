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
    mobileRoleId?: string; // Tying custom role to mobile control matrix
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

    // Typography Standards from BriefTemplate
    const inputStyle = "w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-sm outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-sans text-zinc-900 placeholder:text-zinc-300";
    const labelStyle = "font-bold text-zinc-500 text-[10px] uppercase tracking-widest";

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Date.now()}`,
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
        
        // Auto-tie custom role to mobile control ID if a match is found
        if (updates.role) {
            const roleMatch = mobileRoles.find((r: any) => r.name.toLowerCase() === updates.role?.toLowerCase());
            if (roleMatch) {
                newItems[index].mobileRoleId = roleMatch.id;
            }
        }

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
            <div className="space-y-6 pt-4 animate-in fade-in duration-700">
                
                {/* HEADERS: Matching OnFormat Style Guide */}
                <div className="grid grid-cols-[1fr_120px_140px_180px_120px_40px_30px] gap-4 border-b-2 border-zinc-900 pb-3 items-end px-1">
                    <span className={labelStyle}>Full Name</span>
                    <span className={labelStyle}>Dept</span>
                    <span className={labelStyle}>Production Role</span>
                    <span className={labelStyle}>Email</span>
                    <span className={labelStyle}>Phone</span>
                    <span className={`${labelStyle} text-center`}>St.</span>
                    <span className={labelStyle}></span>
                </div>

                <div className="space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((item, idx) => {
                        const isOnline = onlineUsers.has(item.email?.toLowerCase());
                        const suggestions = DEPARTMENTS[item.department] || [];
                        const currentRoleMatch = mobileRoles.find((r: any) => r.id === item.mobileRoleId);
                        
                        return (
                            <div key={item.id} className="grid grid-cols-[1fr_120px_140px_180px_120px_40px_30px] gap-4 py-4 items-center group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/5 transition-colors px-1">
                                
                                {/* NAME */}
                                <input 
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                                    placeholder="ENTER NAME..."
                                    className={`${inputStyle} font-bold border-transparent bg-transparent hover:bg-zinc-50 focus:bg-white text-base`}
                                    disabled={isLocked || isPrinting}
                                />

                                {/* DEPT */}
                                <select 
                                    value={item.department}
                                    onChange={(e) => handleUpdateItem(idx, { department: e.target.value })}
                                    className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-zinc-400 outline-none focus:text-zinc-900 dark:focus:text-white cursor-pointer"
                                    disabled={isLocked || isPrinting}
                                >
                                    {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                {/* ROLE (CUSTOM + MOBILE SYNC) */}
                                <div className="relative">
                                    <input 
                                        value={item.role}
                                        onChange={(e) => handleUpdateItem(idx, { role: e.target.value })}
                                        placeholder="ROLE..."
                                        className={`${inputStyle} text-[11px] py-2 bg-zinc-100/30 border-none font-bold uppercase tracking-tight`}
                                        disabled={isLocked || isPrinting}
                                        list={`roles-${idx}`}
                                    />
                                    <datalist id={`roles-${idx}`}>
                                        {mobileRoles.map((r: any) => <option key={r.id} value={r.name} />)}
                                        {suggestions.map(opt => <option key={opt} value={opt} />)}
                                    </datalist>
                                    {currentRoleMatch && (
                                        <div className="mt-1 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-emerald-500/60">
                                            <Shield size={8} /> Matrix Linked: {currentRoleMatch.id}
                                        </div>
                                    )}
                                </div>

                                {/* EMAIL */}
                                <input 
                                    value={item.email}
                                    onChange={(e) => handleUpdateItem(idx, { email: e.target.value })}
                                    placeholder="EMAIL@DOMAIN.COM"
                                    className={`${inputStyle} text-xs border-none bg-transparent hover:bg-zinc-50 focus:bg-white`}
                                    disabled={isLocked || isPrinting}
                                />

                                {/* PHONE */}
                                <input 
                                    value={item.phone}
                                    onChange={(e) => handleUpdateItem(idx, { phone: e.target.value })}
                                    placeholder="PHONE"
                                    className={`${inputStyle} text-xs border-none bg-transparent hover:bg-zinc-50 focus:bg-white`}
                                    disabled={isLocked || isPrinting}
                                />

                                {/* STATUS */}
                                <div className="flex justify-center">
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                </div>

                                {/* DELETE */}
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
                            className="w-full py-8 mt-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 rounded-3xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-all hover:text-zinc-600 dark:hover:text-white"
                        >
                            <Plus size={20} /> ADD CREW PERSONNEL
                        </button>
                    )}
                </div>

                {items.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 bg-zinc-50/10 dark:bg-zinc-900/5 rounded-[3rem] border border-zinc-50/50 dark:border-zinc-800/20">
                            <UserCircle size={48} className="text-zinc-100 mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-200">Production personnel empty</p>
                    </div>
                )}

            </div>
        </DocumentLayout>
    );
};
