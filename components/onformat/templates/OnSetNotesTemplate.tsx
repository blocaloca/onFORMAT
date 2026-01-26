import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus } from 'lucide-react';

interface NoteItem {
    id: string;
    date: string;
    time: string;
    description: string;
    body: string;
}

interface OnSetNotesData {
    items: NoteItem[];
}

interface OnSetNotesTemplateProps {
    data: Partial<OnSetNotesData>;
    onUpdate: (data: Partial<OnSetNotesData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const OnSetNotesTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: OnSetNotesTemplateProps) => {

    // State for delete confirmation popover
    // State for delete confirmation popover
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    const formatDate = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const chars = digits.split('');
        if (chars.length > 2) chars.splice(2, 0, '/');
        if (chars.length > 5) chars.splice(5, 0, '/');
        return chars.join('').slice(0, 10);
    };

    useEffect(() => {
        if (!data.items) {
            // Priority: Imported Schedule > Current Date
            let initialDate = '';
            if ((metadata as any)?.importedSchedule?.date) {
                initialDate = (metadata as any).importedSchedule.date;
            } else {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                initialDate = `${month}/${day}/${year}`;
            }

            onUpdate({
                items: [{
                    id: `note-${Date.now()}`,
                    date: initialDate,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    description: '',
                    body: ''
                }]
            });
        }
    }, []);

    const items = data.items || [];

    const handleAdd = () => {
        // Priority: existing item date > Imported Schedule > Current Date
        let dateToUse = new Date().toISOString().split('T')[0];

        if (items.length > 0) {
            dateToUse = items[items.length - 1].date;
        } else if ((metadata as any)?.importedSchedule?.date) {
            dateToUse = (metadata as any).importedSchedule.date;
        }

        const newItem: NoteItem = {
            id: `note-${Date.now()}`,
            date: dateToUse,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: '',
            body: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<NoteItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDelete = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const isLandscape = orientation === 'landscape';
    const ITEMS_FIRST_PAGE = isLandscape ? 3 : 4;
    const ITEMS_OTHER_PAGES = isLandscape ? 3 : 5;

    const remainingItems = Math.max(0, items.length - ITEMS_FIRST_PAGE);
    const extraPages = Math.ceil(remainingItems / ITEMS_OTHER_PAGES);
    const totalPages = 1 + extraPages;

    const pages = Array.from({ length: totalPages }, (_, i) => {
        if (i === 0) return items.slice(0, ITEMS_FIRST_PAGE);
        const start = ITEMS_FIRST_PAGE + (i - 1) * ITEMS_OTHER_PAGES;
        return items.slice(start, start + ITEMS_OTHER_PAGES);
    });

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="ON-SET NOTES"
                    hideHeader={pageIndex > 0}
                    plain={plain}
                    orientation={orientation}
                    metadata={pageIndex === 0 ? metadata : undefined}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        <div className="flex-1">
                            {pageItems.map((item, localIdx) => {
                                const idx = (pageIndex === 0) ? localIdx : ITEMS_FIRST_PAGE + ((pageIndex - 1) * ITEMS_OTHER_PAGES) + localIdx;
                                return (
                                    <div key={item.id} className="group mb-8">
                                        {/* Note Header Bar */}
                                        <div className="flex items-center gap-4 border-b border-black pb-2 mb-2 relative">
                                            <input
                                                type="text"
                                                value={item.date}
                                                onChange={e => handleUpdateItem(idx, { date: formatDate(e.target.value) })}
                                                className={`font-mono font-bold w-24 bg-transparent outline-none uppercase text-zinc-500 text-[10px] ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="MM/DD/YYYY"
                                                disabled={isLocked}
                                            />
                                            <div className={`font-mono font-bold w-24 uppercase text-zinc-500 text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {item.date}
                                            </div>

                                            <input
                                                type="text"
                                                value={item.time}
                                                onChange={e => handleUpdateItem(idx, { time: e.target.value })}
                                                className={`font-mono font-bold w-16 bg-transparent outline-none uppercase text-zinc-500 text-[10px] ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="00:00"
                                                disabled={isLocked}
                                            />
                                            <div className={`font-mono font-bold w-16 uppercase text-zinc-500 text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {item.time}
                                            </div>

                                            <div className="h-4 w-px bg-zinc-300"></div>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={e => handleUpdateItem(idx, { description: e.target.value })}
                                                className={`flex-1 font-bold bg-transparent outline-none placeholder:text-zinc-300 uppercase ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="NOTE SUBJECT / TOPIC"
                                                disabled={isLocked}
                                            />
                                            <div className={`flex-1 min-w-0 font-bold uppercase text-black pt-0.5 leading-normal break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {item.description}
                                            </div>

                                            {/* Delete Button with Confirmation Popover */}
                                            {!isLocked && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === idx ? null : idx)}
                                                        className={`text-zinc-400 hover:text-red-500 transition-opacity ${deleteConfirmIndex === idx ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100'}`}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>

                                                    {deleteConfirmIndex === idx && (
                                                        <div className="absolute right-0 top-6 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                            <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                            <button
                                                                onClick={() => handleDelete(idx)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Backdrop to close when clicking outside (transparent) */}
                                                    {deleteConfirmIndex === idx && (
                                                        <div
                                                            className="fixed inset-0 z-40 bg-transparent"
                                                            onClick={() => setDeleteConfirmIndex(null)}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <textarea
                                            value={item.body}
                                            onChange={e => handleUpdateItem(idx, { body: e.target.value })}
                                            className={`w-full bg-zinc-50 p-3 outline-none resize-none min-h-[100px] text-sm leading-relaxed rounded-sm focus:bg-white focus:ring-1 focus:ring-black border border-transparent focus:border-transparent transition-all ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Write report details here..."
                                            rows={Math.max(3, item.body.split('\n').length)}
                                            disabled={isLocked}
                                        />
                                        <div className={`w-full bg-zinc-50 p-3 min-h-[100px] text-sm leading-relaxed rounded-sm whitespace-pre-wrap break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                            {item.body}
                                        </div>
                                    </div>
                                )
                            })}
                            {!isLocked && pageIndex === totalPages - 1 && (
                                <div className="pt-4 flex items-center gap-4 print:hidden border-t border-zinc-100 mt-2">
                                    <button
                                        onClick={handleAdd}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-3 py-2 rounded-sm transition-colors border border-transparent hover:border-zinc-200"
                                    >
                                        <Plus size={10} /> Add Report Entry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </DocumentLayout >
            ))}
        </>
    );
};
