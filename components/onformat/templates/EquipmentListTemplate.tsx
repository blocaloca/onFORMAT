import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus } from 'lucide-react';

interface EquipmentItem {
    id: string;
    category: 'camera' | 'lens' | 'lighting' | 'grip' | 'sound' | 'art' | 'other';
    description: string;
    source: 'own' | 'rent';
    vendor: string;
    dayRate: string;
    quantity: string;
    total: string;
}

interface EquipmentData {
    items: EquipmentItem[];
}

interface EquipmentListTemplateProps {
    data: Partial<EquipmentData>;
    onUpdate: (data: Partial<EquipmentData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const CATEGORY_OPTIONS = [
    { value: 'camera', label: 'Camera' },
    { value: 'lens', label: 'Lenses' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'grip', label: 'Grip' },
    { value: 'sound', label: 'Sound' },
    { value: 'art', label: 'Art Dept' },
    { value: 'other', label: 'Other/Misc' },
];

export const EquipmentListTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: EquipmentListTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const items = data.items || [];

    useEffect(() => {
        if (!data.items) {
            onUpdate({ items: [] });
        }
    }, []);

    const handleAddItem = () => {
        const newItem: EquipmentItem = {
            id: `item-${Math.random().toString(36).substr(2, 9)}`,
            category: 'camera',
            description: '',
            source: 'rent',
            vendor: '',
            dayRate: '',
            quantity: '1',
            total: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<EquipmentItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };

        // Auto-calc Total if Rate & Qty are numbers
        const rate = parseFloat(newItems[index].dayRate.replace(/[^0-9.]/g, ''));
        const qty = parseFloat(newItems[index].quantity);
        if (!isNaN(rate) && !isNaN(qty)) {
            newItems[index].total = `$${(rate * qty).toFixed(2)}`;
        }

        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    // Pagination
    const ITEMS_PER_PAGE = orientation === 'landscape' ? 12 : 15;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    const grandTotal = items.reduce((sum, item) => {
        const val = parseFloat((item.total || '0').replace(/[^0-9.]/g, ''));
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Equipment List"
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
                                        ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[100px_1fr_60px_100px_60px_40px_60px_30px] gap-4 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description / Item</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Source</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Vendor</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Rate</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Qty</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Total</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[100px_1fr_60px_100px_60px_40px_60px_30px] gap-4 py-2 items-center hover:bg-zinc-50 transition-colors group">

                                        {/* Category */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className="font-bold text-[10px] uppercase w-full text-zinc-700">
                                                    {CATEGORY_OPTIONS.find(opt => opt.value === item.category)?.label || item.category}
                                                </div>
                                            ) : (
                                                <select
                                                    value={item.category}
                                                    onChange={e => handleUpdateItem(globalIdx, { category: e.target.value as any })}
                                                    className="appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none text-zinc-700"
                                                    disabled={isLocked}
                                                >
                                                    {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {isPrinting ? (
                                            <div className="font-medium text-xs w-full whitespace-pre-wrap min-h-[1rem] flex items-center">
                                                {item.description}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                className="font-medium text-xs bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-300 w-full"
                                                placeholder="e.g. Sony FX3 Body..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Source */}
                                        {isPrinting ? (
                                            <div className={`font-bold text-[9px] uppercase w-full ${item.source === 'own' ? 'text-blue-600' : 'text-zinc-600'}`}>
                                                {item.source}
                                            </div>
                                        ) : (
                                            <select
                                                value={item.source}
                                                onChange={e => handleUpdateItem(globalIdx, { source: e.target.value as any })}
                                                className={`appearance-none bg-transparent font-bold text-[9px] uppercase w-full cursor-pointer outline-none ${item.source === 'own' ? 'text-blue-600' : 'text-zinc-600'}`}
                                                disabled={isLocked}
                                            >
                                                <option value="rent">RENT</option>
                                                <option value="own">OWN</option>
                                            </select>
                                        )}

                                        {/* Vendor */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full text-zinc-600">
                                                {item.vendor}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.vendor}
                                                onChange={e => handleUpdateItem(globalIdx, { vendor: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-200 w-full"
                                                placeholder={item.source === 'rent' ? 'Rental House...' : '—'}
                                                disabled={isLocked || item.source === 'own'}
                                            />
                                        )}

                                        {/* Rate */}
                                        {isPrinting ? (
                                            <div className="text-right font-mono text-[10px] text-zinc-700">
                                                {item.dayRate}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.dayRate}
                                                onChange={e => handleUpdateItem(globalIdx, { dayRate: e.target.value })}
                                                className="text-right font-mono text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-200"
                                                placeholder="$0.00"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Quantity */}
                                        {isPrinting ? (
                                            <div className="text-center font-bold text-[10px] text-zinc-700">
                                                {item.quantity}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.quantity}
                                                onChange={e => handleUpdateItem(globalIdx, { quantity: e.target.value })}
                                                className="text-center font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded px-1"
                                                placeholder="1"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Total - Read Only usually */}
                                        <div className="text-right font-mono font-bold text-[10px] text-zinc-800">
                                            {item.total || '—'}
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
                                        <div className="relative flex justify-center w-full">
                                            {!isLocked && (
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
                            {/* Add Button - Last Page */}
                            {!isLocked && !isPrinting && pageIndex === totalPages - 1 && (
                                <div className="pt-2">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full print-hidden">
                                        <Plus size={10} className="mr-1" /> Add Equipment
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
