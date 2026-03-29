/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, Smartphone, ChevronDown, UserCircle, Shield } from 'lucide-react';
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
    mobileRole?: string; // Replaces onSetGroups (ABCD)
    email: string;
    phone: string;
    status?: 'online' | 'offline';
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

    const getRoleSuggestions = (dept: string) => DEPARTMENTS[dept] || [];

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Date.now()}`,
            department: 'Production',
            role: '',
            name: '',
            mobileRole: 'crew', 
            email: '',
            phone: '',
            status: 'offline'
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

    return (
        <>
            <DocumentLayout
                title="Crew List"
                hideHeader={false}
                plain={plain}
                orientation={orientation}
                metadata={metadata}
            >
                <div className="space-y-6 text-sm font-sans flex-1">
                    
                    {/* Simplified Header Table */}
                    <div className="grid grid-cols-[100px_160px_1fr_120px_130px_100px_40px_30px] gap-4 border-b-2 border-zinc-900 pb-3 items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Dept</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Production Role</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Full Name</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2 text-center">Mobile Perimeter</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Email</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Phone</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400 text-center">St.</span>
                    </div>

                    <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {items.map((item, idx) => {
                            const isOnline = onlineUsers.has(item.email?.toLowerCase());
                            const suggestions = getRoleSuggestions(item.department);
                            
                            return (
                                <div key={item.id} className="grid grid-cols-[100px_160px_1fr_120px_130px_100px_40px_30px] gap-4 py-4 items-center group hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                    
                                    {/* Dept Dropdown */}
                                    <select 
                                        value={item.department}
                                        onChange={(e) => handleUpdateItem(idx, { department: e.target.value })}
                                        className="bg-transparent text-sm font-black uppercase tracking-tight text-zinc-500 outline-none focus:text-zinc-900 dark:focus:text-white"
                                        disabled={isLocked || isPrinting}
                                    >
                                        {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>

                                    {/* Role Selection (Free Text + Datalist) */}
                                    <div className="relative">
                                        <input 
                                            value={item.role}
                                            onChange={(e) => handleUpdateItem(idx, { role: e.target.value })}
                                            placeholder="Assign Role..."
                                            className="w-full bg-zinc-100/30 dark:bg-zinc-800/30 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300"
                                            disabled={isLocked || isPrinting}
                                            list={`roles-${idx}`}
                                        />
                                        <datalist id={`roles-${idx}`}>
                                            {suggestions.map(opt => <option key={opt} value={opt} />)}
                                        </datalist>
                                    </div>

                                    {/* CRITICAL: FULL NAME INPUT */}
                                    <input 
                                        value={item.name}
                                        onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                                        placeholder="Enter Crew Name"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/10 border-b border-transparent hover:border-zinc-200 focus:border-emerald-500 text-sm font-black uppercase text-zinc-900 dark:text-white outline-none placeholder:text-zinc-200 px-2 py-1 transition-all"
                                        disabled={isLocked || isPrinting}
                                    />

                                    {/* MOBILE ROLE PERIMETER */}
                                    <div className="relative">
                                        <div className="flex items-center gap-2 border border-zinc-100 dark:border-zinc-800 rounded-xl px-2 py-2 group-hover:border-emerald-500/30 transition-colors">
                                            <Smartphone size={12} className="text-zinc-400 group-hover:text-emerald-500" />
                                            <select 
                                                value={item.mobileRole}
                                                onChange={(e) => handleUpdateItem(idx, { mobileRole: e.target.value })}
                                                className="w-full bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 outline-none appearance-none pr-3 cursor-pointer"
                                                disabled={isLocked || isPrinting}
                                            >
                                                {mobileRoles.length > 0 ? (
                                                    mobileRoles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)
                                                ) : (
                                                    <>
                                                        <option value="crew">General Crew</option>
                                                        <option value="producer">Producer</option>
                                                        <option value="dit">DIT</option>
                                                        <option value="dp">DP</option>
                                                        <option value="client">Client</option>
                                                    </>
                                                )}
                                            </select>
                                            <ChevronDown size={10} className="absolute right-2 text-zinc-300 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <input 
                                        value={item.email}
                                        onChange={(e) => handleUpdateItem(idx, { email: e.target.value })}
                                        placeholder="Email Addr."
                                        className="w-full bg-transparent text-xs text-zinc-400 outline-none focus:text-zinc-900 dark:focus:text-white"
                                        disabled={isLocked || isPrinting}
                                    />

                                    {/* Phone */}
                                    <input 
                                        value={item.phone}
                                        onChange={(e) => handleUpdateItem(idx, { phone: e.target.value })}
                                        placeholder="Phone"
                                        className="w-full bg-transparent text-xs text-zinc-400 outline-none focus:text-zinc-900 dark:focus:text-white"
                                        disabled={isLocked || isPrinting}
                                    />

                                    {/* Pulse Indicator */}
                                    <div className="flex justify-center">
                                        <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLocked && (
                                            <button onClick={() => handleDeleteItem(idx)} className="text-zinc-200 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })}

                        {!isLocked && !isPrinting && (
                            <button 
                                onClick={handleAddItem}
                                className="w-full py-5 mt-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors hover:text-zinc-900 dark:hover:text-white"
                            >
                                <Plus size={16} /> Add Production Personnel
                            </button>
                        )}
                    </div>

                    {items.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800">
                             <UserCircle size={40} className="text-zinc-100 mb-4" />
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-300">Production ensemble is empty</p>
                        </div>
                    )}

                </div>
            </DocumentLayout>
        </>
    );
};

