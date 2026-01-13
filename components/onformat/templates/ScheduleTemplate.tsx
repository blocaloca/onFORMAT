import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface ScheduleItem {
    id: string;
    time: string;
    scene: string;
    intExt: 'INT' | 'EXT' | 'I/E';
    set: string;
    dayNight: 'DAY' | 'NIGHT' | 'MAGIC' | 'DAWN' | 'DUSK';
    description: string;
}

interface ScheduleData {
    date: string;
    callTime: string;
    items: ScheduleItem[];
}

interface ScheduleTemplateProps {
    data: Partial<ScheduleData>;
    onUpdate: (data: Partial<ScheduleData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const INT_EXT_OPTIONS = ['INT', 'EXT', 'I/E'];
const TIME_OF_DAY_OPTIONS = ['DAY', 'NIGHT', 'MAGIC', 'DAWN', 'DUSK'];

export const ScheduleTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: ScheduleTemplateProps) => {

    const formatDate = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const chars = digits.split('');
        if (chars.length > 2) chars.splice(2, 0, '/');
        if (chars.length > 5) chars.splice(5, 0, '/');
        return chars.join('').slice(0, 10);
    };

    const formatTimeInput = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const chars = digits.split('');
        if (chars.length > 2) chars.splice(2, 0, ':');
        return chars.join('').slice(0, 5);
    };

    // Migration / Init
    useEffect(() => {
        const items = data.items || [];
        let hasChanges = false;
        const newItems = items.map((item, idx) => {
            const anyItem = item as any;
            if (!anyItem.id || !anyItem.intExt) {
                hasChanges = true;
                return {
                    ...item,
                    id: anyItem.id || `sched-${Date.now()}-${idx}`,
                    time: anyItem.time || '08:00',
                    scene: anyItem.scene || '',
                    intExt: anyItem.intExt || 'INT',
                    set: anyItem.set || anyItem.location || '',
                    dayNight: anyItem.dayNight || 'DAY',
                    description: anyItem.description || anyItem.activity || ''
                };
            }
            return item;
        });

        if (hasChanges) {
            onUpdate({ items: newItems as ScheduleItem[] });
        }
    }, [data.items]);

    const items = data.items || [];
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    // Handlers
    const handleAddItem = () => {
        const newItem: ScheduleItem = {
            id: `sched-${Date.now()}`,
            time: '',
            scene: '',
            intExt: 'INT',
            set: '',
            dayNight: 'DAY',
            description: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<ScheduleItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        onUpdate({ items: newItems });
    };

    const ITEMS_PER_PAGE = 15;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Shooting Schedule"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 h-full flex flex-col">

                        {/* Header Inputs (Only on Page 1) */}
                        {pageIndex === 0 && (
                            <div className="grid grid-cols-2 gap-8 border-b-2 border-black pb-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Shoot Date</label>
                                    <input
                                        type="text"
                                        value={data.date || ''}
                                        onChange={(e) => onUpdate({ date: formatDate(e.target.value) })}
                                        className={`w-full bg-transparent font-mono font-bold text-sm border-b border-zinc-200 focus:border-black outline-none py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                        placeholder="MM/DD/YYYY"
                                        disabled={isLocked}
                                    />
                                    <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full font-mono font-bold text-sm border-b border-zinc-200 py-1`}>
                                        {data.date || "—"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">General Call Time</label>
                                    {/* Call Time Edit Mode */}
                                    <div className={`flex items-center gap-2 ${isPrinting ? 'hidden' : 'print:hidden'}`}>
                                        <input
                                            type="text"
                                            value={(data.callTime || "").split(" ")[0]}
                                            onChange={(e) => {
                                                const time = formatTimeInput(e.target.value);
                                                const ampm = (data.callTime || "").split(" ")[1] || "AM";
                                                onUpdate({ callTime: `${time} ${ampm}`.trim() });
                                            }}
                                            className="flex-1 bg-transparent font-mono font-bold text-sm border-b border-zinc-200 focus:border-black outline-none py-1"
                                            placeholder="00:00"
                                            disabled={isLocked}
                                        />
                                        <button
                                            onClick={() => {
                                                if (isLocked) return;
                                                const parts = (data.callTime || "").split(" ");
                                                const time = parts[0] || "";
                                                const currentAmpm = parts[1] || "AM";
                                                const newAmpm = currentAmpm === "AM" ? "PM" : "AM";
                                                onUpdate({ callTime: `${time} ${newAmpm}`.trim() });
                                            }}
                                            className="text-[10px] font-bold uppercase bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded cursor-pointer transition-colors"
                                            disabled={isLocked}
                                        >
                                            {(data.callTime || "").split(" ")[1] || "AM"}
                                        </button>
                                    </div>
                                    {/* Call Time Print Mode */}
                                    <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full font-mono font-bold text-sm border-b border-zinc-200 py-1`}>
                                        {data.callTime || "—"}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[60px_50px_160px_60px_1fr_60px_30px] gap-2 border-b-2 border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Time</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Scene</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Setting</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">D/N</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Sort</span>
                            <span></span>
                        </div>

                        {/* Rows */}
                        <div className="flex-1 space-y-0 divide-y divide-zinc-100">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[60px_50px_160px_60px_1fr_60px_30px] gap-2 py-2 items-start hover:bg-zinc-50 transition-colors group">

                                        {/* Time */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.time}
                                                onChange={(e) => handleUpdateItem(globalIdx, { time: formatTimeInput(e.target.value) })}
                                                className={`w-full bg-transparent text-xs font-mono font-bold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="00:00"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-mono font-bold px-1 py-1`}>
                                                {item.time || "—"}
                                            </div>
                                        </div>

                                        {/* Scene */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.scene}
                                                onChange={(e) => handleUpdateItem(globalIdx, { scene: e.target.value })}
                                                className={`w-full bg-transparent text-xs font-bold text-center focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="#"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-bold text-center px-1 py-1`}>
                                                {item.scene || "—"}
                                            </div>
                                        </div>

                                        {/* Setting (Toggle + Input) */}
                                        <div className="flex gap-1">
                                            <div className={`contents ${isPrinting ? 'hidden' : 'print:hidden'}`}>
                                                <select
                                                    value={item.intExt}
                                                    onChange={(e) => handleUpdateItem(globalIdx, { intExt: e.target.value as any })}
                                                    className="bg-black text-white text-[9px] font-bold uppercase px-1 rounded-sm appearance-none cursor-pointer text-center w-10 flex-shrink-0"
                                                    disabled={isLocked}
                                                >
                                                    {INT_EXT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={item.set}
                                                    onChange={(e) => handleUpdateItem(globalIdx, { set: e.target.value })}
                                                    className="w-full bg-transparent text-xs font-bold uppercase focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 min-w-0"
                                                    placeholder="SETTING"
                                                    disabled={isLocked}
                                                />
                                            </div>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-bold uppercase px-1 py-1`}>
                                                {item.intExt} {item.set ? `. ${item.set}` : ''}
                                            </div>
                                        </div>

                                        {/* Day/Night */}
                                        <div>
                                            <select
                                                value={item.dayNight}
                                                onChange={(e) => handleUpdateItem(globalIdx, { dayNight: e.target.value as any })}
                                                className={`w-full bg-zinc-100 text-[9px] font-bold uppercase px-1 py-1 rounded-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-black text-center ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            >
                                                {TIME_OF_DAY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[9px] font-bold uppercase text-center px-1 py-1`}>
                                                {item.dayNight}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                className={`w-full bg-transparent text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 text-zinc-600 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="Action / Notes..."
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs text-zinc-600 px-1 py-1`}>
                                                {item.description || "—"}
                                            </div>
                                        </div>

                                        {/* Sort */}
                                        <div className={`flex justify-center gap-1 pt-0.5 ${isPrinting ? 'hidden' : 'print:hidden'}`}>
                                            {!isLocked && (
                                                <>
                                                    <button onClick={() => handleMoveItem(globalIdx, 'up')} disabled={globalIdx === 0} className="text-zinc-300 hover:text-black disabled:opacity-20 transition-colors">
                                                        <ArrowUp size={12} />
                                                    </button>
                                                    <button onClick={() => handleMoveItem(globalIdx, 'down')} disabled={globalIdx === items.length - 1} className="text-zinc-300 hover:text-black disabled:opacity-20 transition-colors">
                                                        <ArrowDown size={12} />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
                                        <div className={`flex justify-end pt-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}>
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
                                )
                            })}
                            {/* Add Button - Last Page */}
                            {!isLocked && !isPrinting && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print-hidden">
                                    <button
                                        onClick={handleAddItem}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full"
                                    >
                                        <Plus size={10} className="mr-1" /> Add Scene
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {items.length === 0 && (
                            <div className="text-center py-12 text-zinc-300">
                                <p className="text-xs font-bold uppercase tracking-widest">No schedule items added</p>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
