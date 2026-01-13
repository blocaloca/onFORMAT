import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Box, CheckSquare } from 'lucide-react';

interface PropItem {
    id: string;
    item: string;
    description: string;
    quantity: string; // string to allow "1 box"
    source: string; // Rental / Buy / Make
    cost: string;
    status: 'pending' | 'acquired' | 'wrapped';
    notes: string;
}

interface PropsListData {
    items: PropItem[];
}

interface PropsListTemplateProps {
    data: Partial<PropsListData>;
    onUpdate: (data: Partial<PropsListData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const PropsListTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: PropsListTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.items) {
            onUpdate({ items: [] });
        }
    }, []);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: PropItem = {
            id: `prop-${Date.now()}`,
            item: '',
            description: '',
            quantity: '1',
            source: '',
            cost: '',
            status: 'pending',
            notes: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<PropItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const ITEMS_PER_PAGE = orientation === 'landscape' ? 9 : 14;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    const grandTotal = items.reduce((sum, item) => {
        const val = parseFloat((item.cost || '0').replace(/[^0-9.]/g, ''));
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Props List"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Header Context - Total on Page 1 */}
                        {pageIndex === 0 && (
                            <div className="flex justify-end pb-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total</span>
                                    <span className="text-xs font-mono font-bold text-zinc-900">
                                        ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Table Header */}
                        <div className="grid grid-cols-[140px_1fr_50px_100px_80px_80px_30px] gap-4 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Item Name</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description / Specs</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Qty</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Source (Rent/Buy)</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Est. Cost</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[140px_1fr_50px_100px_80px_80px_30px] gap-4 py-3 items-center hover:bg-zinc-50 transition-colors group">

                                        {/* Item */}
                                        {isPrinting ? (
                                            <div className="font-bold text-[10px] w-full uppercase text-black py-1">{item.item || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.item}
                                                onChange={e => handleUpdateItem(globalIdx, { item: e.target.value })}
                                                className="font-bold text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 uppercase"
                                                placeholder="ITEM NAME"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Description */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full text-zinc-700 py-1">{item.description || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 text-zinc-700"
                                                placeholder="Red vintage telephone..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Qty */}
                                        {isPrinting ? (
                                            <div className="font-mono text-[10px] w-full text-center text-zinc-700 py-1">{item.quantity || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.quantity}
                                                onChange={e => handleUpdateItem(globalIdx, { quantity: e.target.value })}
                                                className="font-mono text-[10px] bg-transparent outline-none w-full text-center placeholder:text-zinc-300"
                                                placeholder="1"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Source */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full text-zinc-700 italic py-1">{item.source || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.source}
                                                onChange={e => handleUpdateItem(globalIdx, { source: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 italic"
                                                placeholder="Prop House..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Cost */}
                                        {isPrinting ? (
                                            <div className="font-mono text-[10px] w-full text-right text-zinc-700 py-1">{item.cost || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.cost}
                                                onChange={e => handleUpdateItem(globalIdx, { cost: e.target.value })}
                                                className="font-mono text-[10px] bg-transparent outline-none w-full text-right placeholder:text-zinc-300"
                                                placeholder="$0.00"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Status */}
                                        {isPrinting ? (
                                            <div className={`text-[9px] font-bold uppercase flex justify-center items-center border rounded px-1 py-0.5 ${item.status === 'acquired' ? 'border-green-200 text-green-700 bg-green-50' :
                                                item.status === 'wrapped' ? 'border-zinc-200 text-zinc-500 bg-zinc-100 line-through' :
                                                    'border-red-200 text-red-400 bg-red-50'
                                                }`}>
                                                {item.status === 'pending' ? 'Needed' : item.status.toUpperCase()}
                                            </div>
                                        ) : (
                                            <select
                                                value={item.status}
                                                onChange={e => handleUpdateItem(globalIdx, { status: e.target.value as any })}
                                                className={`appearance-none bg-transparent font-bold text-[9px] uppercase text-center w-full cursor-pointer outline-none border rounded px-1 py-0.5
                                                ${item.status === 'acquired' ? 'border-green-200 text-green-700 bg-green-50' :
                                                        item.status === 'wrapped' ? 'border-zinc-200 text-zinc-500 bg-zinc-100 line-through' :
                                                            'border-red-200 text-red-400 bg-red-50'}`}
                                                disabled={isLocked}
                                            >
                                                <option value="pending">Needed</option>
                                                <option value="acquired">Acquired</option>
                                                <option value="wrapped">Wrapped</option>
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
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
                                        <Plus size={10} className="mr-1" /> Add Prop
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
