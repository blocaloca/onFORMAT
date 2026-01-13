import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2 } from 'lucide-react';

interface Selection {
    id: string;
    fileNumber: string;
    description: string;
    notes: string;
    status: 'approved' | 'reshoot' | 'kill' | 'edit' | '';
}

interface ClientSelectsData {
    items: Selection[];
}

interface ClientSelectsTemplateProps {
    data: Partial<ClientSelectsData>;
    onUpdate: (data: Partial<ClientSelectsData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    metadata?: any;
    orientation?: 'portrait' | 'landscape';
    isPrinting?: boolean;
}

const STATUS_OPTIONS: { value: Selection['status'], label: string, className: string }[] = [
    { value: '', label: '-', className: 'text-zinc-300' },
    { value: 'approved', label: 'APPROVED', className: 'text-green-600' },
    { value: 'edit', label: 'EDIT', className: 'text-blue-600' },
    { value: 'reshoot', label: 'RESHOOT', className: 'text-orange-500' },
    { value: 'kill', label: 'KILL', className: 'text-red-500' },
];

export const ClientSelectsTemplate = ({ data, onUpdate, isLocked = false, plain, metadata, orientation, isPrinting = false }: ClientSelectsTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.items) {
            onUpdate({ items: [] });
        }
    }, []);

    const items = data.items || [];

    const isLandscape = orientation === 'landscape';
    const ITEMS_PER_PAGE = isLandscape ? 10 : 16;
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;

    const pages = Array.from({ length: totalPages }, (_, i) =>
        items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
    );

    const handleAddItem = () => {
        const newItem: Selection = {
            id: `select-${Date.now()}`,
            fileNumber: '',
            description: '',
            notes: '',
            status: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<Selection>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Client Selects"
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    metadata={metadata}
                    orientation={orientation}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Table Header */}
                        <div className="grid grid-cols-[80px_1fr_1fr_100px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">File #</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[80px_1fr_1fr_100px_30px] gap-2 py-2 items-start hover:bg-zinc-50 transition-colors group">
                                        {/* File Number */}
                                        <input
                                            type="text"
                                            value={item.fileNumber}
                                            onChange={e => handleUpdateItem(globalIdx, { fileNumber: e.target.value })}
                                            className={`font-mono font-bold text-sm bg-transparent outline-none focus:bg-white rounded px-1 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="..."
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono font-bold text-sm px-1 pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.fileNumber}</div>

                                        {/* Description */}
                                        <textarea
                                            value={item.description}
                                            onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                            className={`bg-transparent outline-none focus:bg-white rounded px-1 resize-none overflow-hidden placeholder:text-zinc-300 min-h-[20px] ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Description..."
                                            rows={Math.max(1, item.description.split('\n').length)}
                                            disabled={isLocked}
                                        />
                                        <div className={`px-1 pt-0.5 leading-normal whitespace-pre-wrap break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.description}</div>

                                        {/* Notes */}
                                        <textarea
                                            value={item.notes}
                                            onChange={e => handleUpdateItem(globalIdx, { notes: e.target.value })}
                                            className={`bg-transparent outline-none focus:bg-white rounded px-1 resize-none overflow-hidden text-zinc-500 italic placeholder:text-zinc-300 min-h-[20px] ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Notes..."
                                            rows={Math.max(1, item.notes.split('\n').length)}
                                            disabled={isLocked}
                                        />
                                        <div className={`px-1 pt-0.5 leading-normal text-zinc-500 italic whitespace-pre-wrap break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.notes}</div>

                                        {/* Status Select */}
                                        <div className="relative flex justify-center">
                                            <select
                                                value={item.status}
                                                onChange={e => handleUpdateItem(globalIdx, { status: e.target.value as any })}
                                                className={`appearance-none bg-transparent font-black uppercase text-[10px] tracking-wider text-center w-full cursor-pointer outline-none ${item.status === 'approved' ? 'text-green-600' :
                                                    item.status === 'edit' ? 'text-blue-600' :
                                                        item.status === 'reshoot' ? 'text-orange-500' :
                                                            item.status === 'kill' ? 'text-red-500' : 'text-zinc-200'
                                                    } ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                disabled={isLocked}
                                            >
                                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className={`font-black uppercase text-[10px] tracking-wider text-center pt-0.5 ${STATUS_OPTIONS.find(o => o.value === item.status)?.className || 'text-zinc-200'} ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {STATUS_OPTIONS.find(o => o.value === item.status)?.label || '-'}
                                            </div>
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
                                        {!isLocked && (
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
                            {!isLocked && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print:hidden">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
                                        <Plus size={10} className="mr-1" /> Add Entry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
