import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Archive, Truck, Database, Cloud, Link as LinkIcon, FileCheck } from 'lucide-react';

interface ArchiveItem {
    id: string;
    date: string;
    itemType: string; // Asset, Folder, Media
    itemName: string; // Description/Name
    activity: string; // Shipping, Courier, Upload, Archive
    destination: string; // DAM, Local HD, Cloud, Client, Agency
    link: string;
    notes: string;
    status: 'pending' | 'in-progress' | 'complete';
}

interface ArchiveLogData {
    items: ArchiveItem[];
}

interface ArchiveLogTemplateProps {
    data: Partial<ArchiveLogData>;
    onUpdate: (data: Partial<ArchiveLogData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const ITEM_OPTIONS = [
    { value: '', label: '-' },
    { value: 'asset', label: 'Asset' },
    { value: 'folder', label: 'Folder' },
    { value: 'media', label: 'Media' },
];

const ACTIVITY_OPTIONS = [
    { value: '', label: '-' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'courier', label: 'Courier' },
    { value: 'upload', label: 'Upload' },
    { value: 'archive', label: 'Archive' },
];

const DESTINATION_OPTIONS = [
    { value: '', label: '-' },
    { value: 'dam', label: 'DAM' },
    { value: 'local_hd', label: 'Local HD' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'client', label: 'Client' },
    { value: 'agency', label: 'Agency' },
];

export const ArchiveLogTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: ArchiveLogTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.items) {
            onUpdate({ items: [] });
        }
    }, []);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: ArchiveItem = {
            id: `arch-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            itemType: '',
            itemName: '',
            activity: '',
            destination: '',
            link: '',
            notes: '',
            status: 'pending'
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<ArchiveItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const cycleStatus = (index: number) => {
        if (isLocked) return;
        const statuses: ArchiveItem['status'][] = ['pending', 'in-progress', 'complete'];
        const currentIdx = statuses.indexOf(items[index].status);
        const nextStatus = statuses[(currentIdx + 1) % statuses.length];
        handleUpdateItem(index, { status: nextStatus });
    };

    const isLandscape = orientation === 'landscape';
    const ITEMS_PER_PAGE = isLandscape ? 4 : 6;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Archive Log"
                    hideHeader={false}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Table Header */}
                        {/* Aligned with Grid Columns: [90, 80, 1fr, 100, 120, 60, 30] */}
                        {/* Row 1 Headers */}
                        <div className="grid grid-cols-[90px_80px_1fr_100px_120px_60px_30px] gap-4 border-b border-black pb-2 items-end px-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Item</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Activity</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dest</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-1 mt-2 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className={`py-4 px-2 rounded hover:bg-zinc-100 transition-colors group grid grid-cols-[90px_80px_1fr_100px_120px_60px_30px] gap-x-4 gap-y-2 ${globalIdx % 2 !== 0 ? 'bg-zinc-50' : ''}`}>

                                        {/* Col 1: Date (Centered Vertically across 2 rows) */}
                                        <div className="row-span-2 place-self-center self-center w-full">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={item.date}
                                                    onChange={e => handleUpdateItem(globalIdx, { date: e.target.value })}
                                                    className={`font-mono font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 w-full text-center ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                    placeholder="YYYY-MM-DD"
                                                    disabled={isLocked}
                                                />
                                                <div className={`font-mono font-bold text-[10px] px-1 text-center ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.date}</div>
                                            </div>
                                        </div>

                                        {/* Row 1, Col 2: Item Type */}
                                        <div className="col-start-2 relative">
                                            <select
                                                value={item.itemType || ''}
                                                onChange={e => handleUpdateItem(globalIdx, { itemType: e.target.value })}
                                                className={`appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none text-zinc-700 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                disabled={isLocked}
                                            >
                                                <option value="" disabled className="text-zinc-300">ITEM</option>
                                                {ITEM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className={`font-bold text-[10px] uppercase text-zinc-700 ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {ITEM_OPTIONS.find(o => o.value === item.itemType)?.label || ''}
                                            </div>
                                        </div>

                                        {/* Row 1, Col 3: Description */}
                                        <div className="col-start-3 relative min-w-0">
                                            <input
                                                type="text"
                                                value={item.itemName || ''}
                                                onChange={e => handleUpdateItem(globalIdx, { itemName: e.target.value })}
                                                className={`font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-300 w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="Name/Description..."
                                                disabled={isLocked}
                                            />
                                            <div className={`font-bold text-[10px] px-1 whitespace-pre-wrap break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.itemName}</div>
                                        </div>

                                        {/* Row 1, Col 4: Activity */}
                                        <div className="col-start-4 relative">
                                            <select
                                                value={item.activity}
                                                onChange={e => handleUpdateItem(globalIdx, { activity: e.target.value })}
                                                className={`appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none text-zinc-700 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                disabled={isLocked}
                                            >
                                                <option value="" disabled className="text-zinc-300">ACT</option>
                                                {ACTIVITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className={`font-bold text-[10px] uppercase text-zinc-700 ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {ACTIVITY_OPTIONS.find(o => o.value === item.activity)?.label || ''}
                                            </div>
                                        </div>

                                        {/* Row 1, Col 5: Destination */}
                                        <div className="col-start-5 relative">
                                            <select
                                                value={item.destination}
                                                onChange={e => handleUpdateItem(globalIdx, { destination: e.target.value })}
                                                className={`appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none text-zinc-700 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                disabled={isLocked}
                                            >
                                                <option value="" disabled className="text-zinc-300">DEST</option>
                                                {DESTINATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className={`font-bold text-[10px] uppercase text-zinc-700 ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {DESTINATION_OPTIONS.find(o => o.value === item.destination)?.label || ''}
                                            </div>
                                        </div>

                                        <div className="col-start-6 flex justify-center items-center w-full">
                                            <button
                                                onClick={() => cycleStatus(globalIdx)}
                                                disabled={isLocked}
                                                className={`w-full flex items-center justify-center transition-opacity ${isLocked ? '' : 'hover:opacity-80'}`}
                                            >
                                                {item.status === 'complete' && <span className="w-full h-[18px] flex items-center justify-center px-2 bg-green-100 text-green-700 border border-green-200 rounded text-[9px] font-bold uppercase tracking-wider leading-none">DONE</span>}
                                                {item.status === 'in-progress' && <span className="w-full h-[18px] flex items-center justify-center px-2 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase tracking-wider leading-none">DOING</span>}
                                                {item.status === 'pending' && <span className="w-full h-[18px] flex items-center justify-center px-2 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded text-[9px] font-bold uppercase tracking-wider leading-none">TODO</span>}
                                            </button>
                                        </div>

                                        {/* Row 1, Col 7: Delete */}
                                        <div className="col-start-7 flex justify-center items-center">
                                            {!isLocked && (
                                                <div className="relative flex justify-center w-full">
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

                                        {/* Row 2, Col 2-4: Notes (Starts under Item Type) */}
                                        <div className="col-start-2 col-end-5 relative min-w-0">
                                            <textarea
                                                value={item.notes}
                                                onChange={e => handleUpdateItem(globalIdx, { notes: e.target.value })}
                                                className={`resize-none bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-300 w-full text-[10px] text-zinc-500 overflow-hidden ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="Detailed notes..."
                                                rows={Math.max(2, item.notes.split('\n').length)}
                                                disabled={isLocked}
                                            />
                                            <div className={`text-[10px] px-1 text-zinc-500 whitespace-pre-wrap break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.notes}</div>
                                        </div>

                                        {/* Row 2, Col 5-7: Link (Starts under Destination) */}
                                        <div className="col-start-5 col-end-8 relative flex items-start gap-1 min-w-0">
                                            <LinkIcon size={10} className="text-zinc-300 mt-1 shrink-0" />
                                            <div className="w-full min-w-0">
                                                <input
                                                    type="text"
                                                    value={item.link}
                                                    onChange={e => handleUpdateItem(globalIdx, { link: e.target.value })}
                                                    className={`text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-300 w-full text-blue-600 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                    placeholder="URL..."
                                                    disabled={isLocked}
                                                />
                                                <div className={`text-[10px] px-1 text-blue-600 break-all whitespace-pre-wrap ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.link}</div>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}

                            {/* Add Button - Last Page */}
                            {!isLocked && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print:hidden">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
                                        <Plus size={10} className="mr-1" /> Add Archive Task
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {items.length === 0 && (
                            <div className="text-center py-12 text-zinc-300">
                                <p className="text-xs font-bold uppercase tracking-widest">No archive tasks added</p>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
