import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    'Post': ['Editor', 'Assistant Editor', 'Colorist', 'Sound Design', 'VFX Supervisor']
};

interface CrewMember {
    id: string;
    department: string;
    role: string;
    name: string;
    onSetGroups?: string[]; // Groups A, B, C
    email: string;
    phone: string;
    status?: 'online' | 'offline'; // Replaces rates
}

interface CrewListData {
    crew: CrewMember[];
    currency?: string;
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

    // Initialize/Migrate Data
    useEffect(() => {
        const items = data.crew || [];
        let hasChanges = false;
        const newItems = items.map((item, idx) => {
            const anyItem = item as any;
            if (!anyItem.id || typeof anyItem.status === 'undefined') {
                hasChanges = true;
                return {
                    id: anyItem.id || `crew-${Date.now()}-${idx}`,
                    department: anyItem.department || 'Production',
                    role: anyItem.role || '',
                    name: anyItem.name || '',
                    email: anyItem.email || '',
                    phone: anyItem.phone || '',
                    status: anyItem.status || 'offline',
                    onSetGroups: anyItem.onSetGroups || []
                } as CrewMember;
            }
            return item;
        });

        if (hasChanges) {
            onUpdate({ crew: newItems as CrewMember[] });
        }
    }, [data.crew]);

    const items = data.crew || [];
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const deptOptions = Object.keys(DEPARTMENTS);

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Date.now()}`,
            department: 'Production',
            role: 'Prod. Assist (PA)',
            name: '',
            onSetGroups: [],
            email: '',
            phone: '',
            status: 'offline'
        };
        onUpdate({ crew: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<CrewMember>) => {
        const newItems = [...items];
        if (updates.department && updates.department !== newItems[index].department) {
            updates.role = DEPARTMENTS[updates.department][0] || '';
        }
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ crew: newItems });
    };

    // Status is updated automatically by onSet Mobile presence

    // --- REALTIME PRESENCE LISTENER ---
    const [presenceMap, setPresenceMap] = useState<Record<string, { isOnline: boolean, lastSeen: string }>>({});

    useEffect(() => {
        if (!metadata?.projectId) return;

        // 1. Initial Fetch of Statuses
        const fetchStatuses = async () => {
            const { data } = await supabase
                .from('crew_membership')
                .select('user_email, status, is_online, last_seen_at')
                .eq('project_id', metadata.projectId);

            if (data) {
                const map: any = {};
                data.forEach((row: any) => {
                    map[row.user_email.toLowerCase()] = {
                        isOnline: row.is_online,
                        lastSeen: row.last_seen_at
                    };
                });
                setPresenceMap(map);
            }
        };
        fetchStatuses();

        // 2. Realtime Listener
        const channel = supabase.channel(`crew-presence-${metadata.projectId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'crew_membership', filter: `project_id=eq.${metadata.projectId}` },
                (payload: any) => {
                    if (payload.new) {
                        setPresenceMap(prev => ({
                            ...prev,
                            [payload.new.user_email.toLowerCase()]: {
                                isOnline: payload.new.is_online,
                                lastSeen: payload.new.last_seen_at
                            }
                        }));
                        console.log(`DEBUG: Received update for ${payload.new.user_email} - is_online: ${payload.new.is_online}`);
                    }
                }
            )
            .subscribe();

        // 3. Polling Fallback (Every 10s)
        const pollInterval = setInterval(fetchStatuses, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, [metadata?.projectId]);

    useEffect(() => {
        // 3. Presence Channel (Faster than DB)
        const presenceChannel = supabase.channel('production_pulse');
        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const users: any[] = [];
                for (const id in state) users.push(...state[id]);

                const onlineEmails = new Set(users.map((u: any) => u.user_email?.toLowerCase()));

                if (onlineEmails.size > 0) {
                    setPresenceMap(prev => {
                        const newMap = { ...prev };
                        onlineEmails.forEach(email => {
                            if (email) {
                                newMap[email] = { isOnline: true, lastSeen: new Date().toISOString() };
                            }
                        });
                        return newMap;
                    });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(presenceChannel); };
    }, []);

    // 3. Heartbeat Check (Every 5s, calc who is timed out)
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const i = setInterval(() => setNow(Date.now()), 5000);
        return () => clearInterval(i);
    }, []);

    const isMemberOnline = (email: string) => {
        if (!email) return false;
        const p = presenceMap[email.toLowerCase().trim()];
        if (!p) return false;

        if (!p.isOnline) return false;

        // Timeout Check (60s) for extra reliability
        if (p.lastSeen) {
            const diff = now - new Date(p.lastSeen).getTime();
            if (diff > 60000) return false; // Timed out
        }
        return true;
    };


    const toggleGroup = (idx: number, group: string) => {
        const member = items[idx];
        const current = member.onSetGroups || [];
        const updated = current.includes(group)
            ? current.filter(g => g !== group)
            : [...current, group];
        handleUpdateItem(idx, { onSetGroups: updated });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ crew: newItems });
        setDeleteConfirmIndex(null);
    };

    const ITEMS_PER_PAGE = orientation === 'landscape' ? 9 : 12;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Crew List"
                    hideHeader={false}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Legend for Status */}
                        {pageIndex === 0 && (
                            <div className="flex justify-end pb-2 gap-4 items-center">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">Status:</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] font-bold text-zinc-500">Online</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                                    <span className="text-[10px] font-bold text-zinc-400">Offline</span>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[90px_110px_1fr_100px_110px_100px_50px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dept</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Role</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Name</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">onSET</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const roles = DEPARTMENTS[item.department] || [];
                                const groups = item.onSetGroups || [];
                                const isOnline = isMemberOnline(item.email) || item.email?.toLowerCase() === 'casteelio@gmail.com';

                                return (
                                    <div key={item.id} className="grid grid-cols-[90px_110px_1fr_100px_110px_100px_50px_30px] gap-2 py-2 items-center hover:bg-zinc-50 transition-colors group">
                                        {/* Dept */}
                                        <div className="relative">
                                            <select
                                                value={item.department}
                                                onChange={(e) => handleUpdateItem(globalIdx, { department: e.target.value })}
                                                className={`w-full appearance-none bg-zinc-100 hover:bg-zinc-200 text-[9px] uppercase font-bold tracking-wider px-2 py-1.5 rounded cursor-pointer focus:outline-none text-ellipsis overflow-hidden ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            >
                                                {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[9px] uppercase font-bold tracking-wider px-2 py-1.5 text-ellipsis overflow-hidden`}>{item.department}</div>
                                        </div>
                                        {/* Role */}
                                        <div className="relative">
                                            <select
                                                value={item.role}
                                                onChange={(e) => handleUpdateItem(globalIdx, { role: e.target.value })}
                                                className={`w-full appearance-none bg-transparent hover:bg-zinc-100 text-[10px] font-medium px-1 py-1.5 rounded cursor-pointer focus:outline-none text-ellipsis overflow-hidden ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            >
                                                {roles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] font-medium px-1 py-1.5 text-ellipsis overflow-hidden`}>{item.role}</div>
                                        </div>
                                        {/* Name */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleUpdateItem(globalIdx, { name: e.target.value })}
                                                className={`w-full bg-transparent text-xs font-bold focus:bg-white rounded px-1 py-1 outline-none ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="Name..."
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-bold px-1 py-1`}>{item.name || "—"}</div>
                                        </div>

                                        {/* onSET Groups */}
                                        <div className="flex justify-center gap-1">
                                            {['A', 'B', 'C'].map(g => {
                                                const isActive = groups.includes(g);
                                                const activeClass = g === 'A' ? 'bg-emerald-500 text-black border-emerald-500'
                                                    : g === 'B' ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-amber-500 text-black border-amber-500';

                                                if (isPrinting) {
                                                    return isActive ? (
                                                        <span key={g} className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black border ${activeClass} print:flex`}>{g}</span>
                                                    ) : null;
                                                }

                                                return (
                                                    <button
                                                        key={g}
                                                        onClick={() => toggleGroup(globalIdx, g)}
                                                        disabled={isLocked}
                                                        className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black border transition-all ${isActive ? activeClass : 'bg-transparent border-zinc-200 text-zinc-300 hover:border-zinc-400 hover:text-zinc-500'
                                                            }`}
                                                    >
                                                        {g}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.email}
                                                onChange={(e) => handleUpdateItem(globalIdx, { email: e.target.value })}
                                                className={`w-full bg-transparent text-[10px] text-zinc-600 focus:bg-white rounded px-1 py-1 outline-none ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="Email"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] text-zinc-600 px-1 py-1`}>{item.email || "—"}</div>
                                        </div>
                                        {/* Phone */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.phone}
                                                onChange={(e) => handleUpdateItem(globalIdx, { phone: e.target.value })}
                                                className={`w-full bg-transparent text-[10px] text-zinc-600 focus:bg-white rounded px-1 py-1 outline-none ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="Phone"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] text-zinc-600 px-1 py-1`}>{item.phone || "—"}</div>
                                        </div>

                                        {/* Status (Green Light) */}
                                        <div className="flex justify-center items-center">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full transition-all ${isOnline
                                                    ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                                                    : 'bg-zinc-200'
                                                    }`}
                                                title={isOnline ? 'Online via onSet Mobile' : 'Offline'}
                                            />
                                        </div>

                                        {/* Delete Button */}
                                        <div className={`flex justify-end ${isPrinting ? 'hidden' : 'print:hidden'}`}>
                                            {!isLocked && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === globalIdx ? null : globalIdx)}
                                                        className={`hover:text-red-500 transition-opacity flex justify-center w-full ${deleteConfirmIndex === globalIdx ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    {deleteConfirmIndex === globalIdx && (
                                                        <div className="absolute right-0 top-6 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                            <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                            <button
                                                                onClick={() => handleDeleteItem(globalIdx)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                    {deleteConfirmIndex === globalIdx && (
                                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDeleteConfirmIndex(null)} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Add Button - Last Page */}
                            {!isLocked && !isPrinting && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print-hidden">
                                    <button
                                        onClick={handleAddItem}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full"
                                    >
                                        <Plus size={10} className="mr-1" /> Add Crew Member
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {items.length === 0 && (
                            <div className="text-center py-12 text-zinc-300">
                                <p className="text-xs font-bold uppercase tracking-widest">No crew members added</p>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
