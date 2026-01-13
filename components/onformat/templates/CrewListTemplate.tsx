import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus } from 'lucide-react';

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
    email: string;
    phone: string;
    dayRate: number;
    days: number;
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
            if (!anyItem.id || typeof anyItem.days === 'undefined') {
                hasChanges = true;
                return {
                    id: anyItem.id || `crew-${Date.now()}-${idx}`,
                    department: anyItem.department || 'Production',
                    role: anyItem.role || '',
                    name: anyItem.name || '',
                    email: anyItem.email || '',
                    phone: anyItem.phone || '',
                    dayRate: anyItem.dayRate || 0,
                    days: anyItem.days || 1
                };
            }
            return item;
        });

        if (hasChanges) {
            onUpdate({ crew: newItems as CrewMember[] });
        }
    }, [data.crew]);

    const items = data.crew || [];
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const currency = data.currency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    const total = items.reduce((sum, item) => sum + ((item.dayRate || 0) * (item.days || 1)), 0);
    const deptOptions = Object.keys(DEPARTMENTS);

    const handleAddItem = () => {
        const newItem: CrewMember = {
            id: `crew-${Date.now()}`,
            department: 'Production',
            role: 'Prod. Assist (PA)',
            name: '',
            email: '',
            phone: '',
            dayRate: 0,
            days: 1
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
                        {/* Header Context - Total on Page 1 */}
                        {pageIndex === 0 && (
                            <div className="flex justify-end pb-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total</span>
                                    <span className="text-xs font-mono font-bold text-zinc-900">
                                        {formatter.format(total)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[100px_120px_1fr_120px_110px_80px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dept</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Role</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Name</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Day Rate</span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const roles = DEPARTMENTS[item.department] || [];

                                return (
                                    <div key={item.id} className="grid grid-cols-[100px_120px_1fr_120px_110px_80px_30px] gap-2 py-2 items-center hover:bg-zinc-50 transition-colors group">
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
                                        {/* Rate */}
                                        <div>
                                            <input
                                                type="number"
                                                value={item.dayRate || ''}
                                                onChange={(e) => handleUpdateItem(globalIdx, { dayRate: parseFloat(e.target.value) || 0 })}
                                                className={`w-full bg-transparent text-xs font-mono text-right focus:bg-white rounded px-1 py-1 outline-none ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="0.00"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-mono text-right px-1 py-1`}>{formatter.format(item.dayRate || 0)}</div>
                                        </div>
                                        {/* Delete Button with Confirmation Popover */}
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

                                                    {/* Backdrop to close when clicking outside (transparent) */}
                                                    {deleteConfirmIndex === globalIdx && (
                                                        <div
                                                            className="fixed inset-0 z-40 bg-transparent"
                                                            onClick={() => setDeleteConfirmIndex(null)}
                                                        />
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
