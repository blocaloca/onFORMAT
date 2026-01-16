import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

interface DeliverableItem {
    id: string;
    thumbnailUrl: string;
    fileNumber: string;
    description: string;
    format: string; // Aspect Ratio
    type: string;   // File Type (Codec)
    notes: string;  // General Notes
}

interface DeliverablesData {
    items: DeliverableItem[];
}

interface DeliverablesTemplateProps {
    data: Partial<DeliverablesData>;
    onUpdate: (data: Partial<DeliverablesData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const ASPECT_OPTIONS = [
    { value: '', label: '-' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
    { value: '4:5', label: '4:5' },
    { value: '1:1', label: '1:1' },
    { value: '2.39:1', label: '2.39' },
];

const TYPE_OPTIONS = [
    { value: '', label: '-' },
    { value: 'ProRes 4444', label: 'ProRes 4444' },
    { value: 'ProRes 422', label: 'ProRes 422' },
    { value: 'H.264', label: 'H.264 / Web' },
    { value: 'H.265', label: 'H.265 / HEVC' },
    { value: 'TIFF', label: 'TIFF' },
    { value: 'JPEG', label: 'JPEG' },
    { value: 'DCP', label: 'DCP' },
];

export const DeliverablesTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: DeliverablesTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.items) {
            onUpdate({ items: [] });
        }
    }, []);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: DeliverableItem = {
            id: `del-${Date.now()}`,
            thumbnailUrl: '',
            fileNumber: '',
            description: '',
            format: '',
            type: '',
            notes: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<DeliverableItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Deliverables"
                    hideHeader={false}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Table Header */}
                        <div className="grid grid-cols-[60px_80px_1fr_80px_100px_1fr_30px] gap-4 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Thumb</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">File #</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Aspect</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Type</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[60px_80px_1fr_80px_100px_1fr_30px] gap-4 py-4 items-start hover:bg-zinc-50 transition-colors group">

                                        {/* Thumbnail */}
                                        <div className="relative w-full aspect-square bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center group/image">
                                            {item.thumbnailUrl ? (
                                                <img src={item.thumbnailUrl} alt="Thumb" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={16} className="text-zinc-300" />
                                            )}
                                            {!isLocked && (
                                                <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center`}>
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        handleUpdateItem(globalIdx, { thumbnailUrl: reader.result as string });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                        <Upload size={16} className="text-white hover:scale-110 transition-transform" />
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        {/* File Number */}
                                        {isPrinting ? (
                                            <div className="font-mono font-bold text-xs px-1 pt-1 leading-normal block">{item.fileNumber}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.fileNumber}
                                                onChange={e => handleUpdateItem(globalIdx, { fileNumber: e.target.value })}
                                                className="font-mono font-bold text-xs bg-transparent outline-none focus:bg-white rounded px-1 pt-1"
                                                placeholder="A001_..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Description */}
                                        <div className="min-w-0">
                                            {isPrinting ? (
                                                <div className="px-1 pt-1 leading-normal whitespace-pre-wrap break-words text-[10px] block">{item.description}</div>
                                            ) : (
                                                <textarea
                                                    value={item.description}
                                                    onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                    className="bg-transparent outline-none focus:bg-white rounded px-1 resize-none overflow-hidden placeholder:text-zinc-300 min-h-[40px] w-full text-[10px]"
                                                    placeholder="Description..."
                                                    rows={Math.max(2, item.description.split('\n').length)}
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {/* Aspect Select */}
                                        <div className="relative pt-1">
                                            {isPrinting ? (
                                                <div className="font-bold text-[10px] uppercase text-zinc-700 block">
                                                    {ASPECT_OPTIONS.find(o => o.value === item.format)?.label || ''}
                                                </div>
                                            ) : (
                                                <select
                                                    value={item.format}
                                                    onChange={e => handleUpdateItem(globalIdx, { format: e.target.value })}
                                                    className="appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none text-zinc-700"
                                                    disabled={isLocked}
                                                >
                                                    <option value="" disabled className="text-zinc-300">ASPECT</option>
                                                    {ASPECT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Type Select */}
                                        <div className="relative pt-1">
                                            {isPrinting ? (
                                                <div className="font-bold text-[10px] uppercase text-zinc-700 block">
                                                    {TYPE_OPTIONS.find(o => o.value === item.type)?.label || ''}
                                                </div>
                                            ) : (
                                                <select
                                                    value={item.type || ''}
                                                    onChange={e => handleUpdateItem(globalIdx, { type: e.target.value })}
                                                    className="appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none text-zinc-700"
                                                    disabled={isLocked}
                                                >
                                                    <option value="" disabled className="text-zinc-300">TYPE</option>
                                                    {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Notes (was Edit/Grade Notes) */}
                                        <div className="min-w-0">
                                            {isPrinting ? (
                                                <div className="px-1 pt-1 text-zinc-500 text-[10px] whitespace-pre-wrap break-words block">{item.notes}</div>
                                            ) : (
                                                <textarea
                                                    value={item.notes || ''}
                                                    onChange={e => handleUpdateItem(globalIdx, { notes: e.target.value })}
                                                    className="bg-transparent outline-none focus:bg-white rounded px-1 resize-none overflow-hidden text-zinc-500 text-[10px] placeholder:text-zinc-300 min-h-[40px] w-full"
                                                    placeholder="Notes..."
                                                    rows={Math.max(2, (item.notes || '').split('\n').length)}
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
                                        {!isLocked && !isPrinting && (
                                            <div className="relative flex justify-center w-full pt-1">
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
                                )
                            })}

                            {/* Add Button - Moved inside the list container */}
                            {!isLocked && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print:hidden">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
                                        <Plus size={10} className="mr-1" /> Add Deliverable
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {items.length === 0 && (
                            <div className="text-center py-12 text-zinc-300">
                                <p className="text-xs font-bold uppercase tracking-widest">No deliverables added</p>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
