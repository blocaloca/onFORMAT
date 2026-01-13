import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Shirt, User } from 'lucide-react';

interface WardrobeLook {
    id: string;
    character: string;
    actor: string;
    sceneRange: string; // e.g. "Sc 1-5"
    lookNumber: string;
    description: string;
    notes: string;
    status: 'concept' | 'fitting' | 'ready';
}

interface WardrobeData {
    items: WardrobeLook[];
}

interface WardrobeTemplateProps {
    data: Partial<WardrobeData>;
    onUpdate: (data: Partial<WardrobeData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const WardrobeTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: WardrobeTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.items) {
            onUpdate({ items: [] });
        }
    }, []);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: WardrobeLook = {
            id: `look-${Date.now()}`,
            character: '',
            actor: '',
            sceneRange: '',
            lookNumber: String(items.length + 1),
            description: '',
            notes: '',
            status: 'concept'
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<WardrobeLook>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const ITEMS_PER_PAGE = orientation === 'landscape' ? 7 : 10;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Wardrobe & Styling"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Table Header */}
                        <div className="grid grid-cols-[120px_60px_60px_1fr_1fr_80px_30px] gap-4 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Character / Actor</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Look #</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scenes</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Garments / Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes / Source</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[120px_60px_60px_1fr_1fr_80px_30px] gap-4 py-3 items-start hover:bg-zinc-50 transition-colors group">

                                        {/* Char/Actor */}
                                        <div className="space-y-1">
                                            {isPrinting ? (
                                                <>
                                                    <div className="font-bold text-[10px] w-full uppercase text-black">{item.character || '—'}</div>
                                                    <div className="text-[9px] w-full text-zinc-500">{item.actor || '—'}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={item.character}
                                                        onChange={e => handleUpdateItem(globalIdx, { character: e.target.value })}
                                                        className="font-bold text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 uppercase"
                                                        placeholder="CHARACTER"
                                                        disabled={isLocked}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.actor}
                                                        onChange={e => handleUpdateItem(globalIdx, { actor: e.target.value })}
                                                        className="text-[9px] bg-transparent outline-none w-full text-zinc-500 placeholder:text-zinc-200"
                                                        placeholder="Actor Name"
                                                        disabled={isLocked}
                                                    />
                                                </>
                                            )}
                                        </div>

                                        {/* Look # */}
                                        {isPrinting ? (
                                            <div className="font-mono font-bold text-[10px] w-full text-center py-1">{item.lookNumber || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.lookNumber}
                                                onChange={e => handleUpdateItem(globalIdx, { lookNumber: e.target.value })}
                                                className="font-mono font-bold text-[10px] bg-transparent outline-none w-full text-center placeholder:text-zinc-300"
                                                placeholder="#"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Scenes */}
                                        {isPrinting ? (
                                            <div className="font-mono text-[10px] w-full py-1">{item.sceneRange || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.sceneRange}
                                                onChange={e => handleUpdateItem(globalIdx, { sceneRange: e.target.value })}
                                                className="font-mono text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300"
                                                placeholder="1, 4, 12"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Description */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full min-h-[40px] leading-relaxed whitespace-pre-wrap py-1">{item.description || '—'}</div>
                                        ) : (
                                            <textarea
                                                value={item.description}
                                                onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 min-h-[40px] resize-none leading-relaxed"
                                                placeholder="Blue denim jacket, vintage tee..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Notes */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full min-h-[40px] leading-relaxed text-zinc-500 italic whitespace-pre-wrap py-1">{item.notes || '—'}</div>
                                        ) : (
                                            <textarea
                                                value={item.notes}
                                                onChange={e => handleUpdateItem(globalIdx, { notes: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 min-h-[40px] resize-none leading-relaxed text-zinc-500 italic"
                                                placeholder="Returns to Zara..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Status */}
                                        {isPrinting ? (
                                            <div className={`text-[9px] font-bold uppercase flex justify-center items-center border rounded px-1 py-0.5
                                                ${item.status === 'ready' ? 'border-green-200 text-green-700 bg-green-50' :
                                                    item.status === 'fitting' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                                        'border-zinc-200 text-zinc-400 bg-zinc-50'}`}>
                                                {item.status.toUpperCase()}
                                            </div>
                                        ) : (
                                            <select
                                                value={item.status}
                                                onChange={e => handleUpdateItem(globalIdx, { status: e.target.value as any })}
                                                className={`appearance-none bg-transparent font-bold text-[9px] uppercase text-center w-full cursor-pointer outline-none border rounded px-1 py-0.5
                                            ${item.status === 'ready' ? 'border-green-200 text-green-700 bg-green-50' :
                                                        item.status === 'fitting' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                                            'border-zinc-200 text-zinc-400 bg-zinc-50'}`}
                                                disabled={isLocked}
                                            >
                                                <option value="concept">Concept</option>
                                                <option value="fitting">Fitting</option>
                                                <option value="ready">Ready</option>
                                            </select>
                                        )}

                                        {/* Delete Button with Confirmation Popover */}
                                        <div className="relative flex justify-center w-full">
                                            {!isLocked && !isPrinting && (
                                                <>
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
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {!isLocked && !isPrinting && pageIndex === totalPages - 1 && (
                                <div className="pt-2">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full print-hidden">
                                        <Plus size={10} className="mr-1" /> Add Look
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
