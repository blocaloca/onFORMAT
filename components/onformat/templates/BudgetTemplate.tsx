import React, { useEffect, useMemo, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus } from 'lucide-react';

// --- Constants & Types --- //

const CATEGORIES: Record<string, string[]> = {
    'Talent': ['Principal', 'Supporting', 'Background', 'Voiceover', 'Stunt', 'Casting Director'],
    'Above The Line': ['Director', 'Producer', 'Writer', 'Executive Producer'],
    'Crew': ['Director of Photography', 'Camera Operator', 'Focus Puller/1st AC', '2nd AC', 'DIT', 'Gaffer', 'Best Boy Electric', 'Key Grip', 'Best Boy Grip', 'Sound Mixer', 'Boom Operator', 'Production Designer', 'Art Director', 'Prop Master', 'Wardrobe Stylist', 'Hair/Makeup', 'Production Assistant', 'Script Supervisor'],
    'Equipment': ['Camera Package', 'Lenses', 'Lighting Package', 'Grip Package', 'Sound Package', 'Drones/Specialty', 'Walkies', 'Hard Drives'],
    'Locations': ['Location Fees', 'Permits', 'Security', 'Cleaning', 'Site Rep'],
    'Travel & Transport': ['Airfare', 'Hotel', 'Per Diem', 'Car Rental', 'Mileage', 'Parking', 'Gas', 'Taxis/Rideshare'],
    'Catering & Craft': ['Catering', 'Craft Services', 'Coffee/Water'],
    'Post Production': ['Editor', 'Assistant Editor', 'Colorist', 'Sound Design/Mix', 'VFX', 'Music Licensing', 'Transcoding'],
    'Insurance & Legal': ['Production Insurance', 'Legal Fees', 'Permits', 'Payroll Fees']
};

const RATE_TYPES = ['Day', 'Hour', 'Flat', 'Week', 'Overtime'];

interface BudgetLineItem {
    id: string;
    category: string;
    subCategory: string;
    description: string;
    rateType: string;
    rate: number;
    quantity: number;
    // total is calculated on fly
}

interface BudgetData {
    items: BudgetLineItem[];
    currency: string;
}

interface BudgetTemplateProps {
    data: Partial<BudgetData>;
    onUpdate: (data: Partial<BudgetData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

// --- Component --- //

export const BudgetTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: BudgetTemplateProps) => {

    // Migration: ensure items have IDs and new fields
    useEffect(() => {
        const items = data.items || [];
        let hasChanges = false;
        const newItems = items.map((item, idx) => {
            const anyItem = item as any;
            if (!anyItem.id || !anyItem.rateType) {
                hasChanges = true;
                return {
                    ...item,
                    id: anyItem.id || `line-${Date.now()}-${idx}`,
                    category: anyItem.category || 'Crew',
                    subCategory: anyItem.subCategory || '',
                    description: anyItem.description || '',
                    rateType: anyItem.rateType || 'Day',
                    rate: anyItem.rate || anyItem.amount || 0, // Migrating old 'amount' to rate
                    quantity: anyItem.quantity || 1
                };
            }
            return item;
        });

        if (hasChanges) {
            onUpdate({ items: newItems as BudgetLineItem[] });
        }
    }, [data.items]); // Limited dep

    const items = data.items || [];
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const currency = data.currency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    // Calculate Totals
    const total = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);

    // Categories available
    const categoryOptions = Object.keys(CATEGORIES);

    // Handlers
    const handleAddItem = () => {
        const newItem: BudgetLineItem = {
            id: `line-${Date.now()}`,
            category: 'Crew',
            subCategory: 'Production Assistant',
            description: '',
            rateType: 'Day',
            rate: 0,
            quantity: 1
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<BudgetLineItem>) => {
        const newItems = [...items];
        // If category changes, reset subCategory to first option
        if (updates.category && updates.category !== newItems[index].category) {
            updates.subCategory = CATEGORIES[updates.category][0] || '';
        }
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
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
                    title="Production Budget"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 h-full flex flex-col">

                        {/* Grand Total - Only on first page */}
                        {pageIndex === 0 && (
                            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-4">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight">Estimated Total</h2>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Based on current line items</p>
                                </div>
                                <div className="text-xl font-mono font-bold tracking-tight">
                                    {formatter.format(total)}
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[110px_110px_1fr_60px_80px_60px_90px_30px] gap-3 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Role/Item</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Unit</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Rate</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Qty/Days</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Total</span>
                            <span className="px-1"></span>
                        </div>

                        {/* Rows */}
                        <div className="flex-1 space-y-0 divide-y divide-zinc-100">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const subCats = CATEGORIES[item.category] || [];
                                const lineTotal = item.rate * item.quantity;

                                return (
                                    <div key={item.id} className="grid grid-cols-[110px_110px_1fr_60px_80px_60px_90px_30px] gap-3 py-2 items-start hover:bg-zinc-50 transition-colors group">

                                        {/* Category */}
                                        <div className="relative">
                                            <select
                                                value={item.category}
                                                onChange={(e) => handleUpdateItem(globalIdx, { category: e.target.value })}
                                                className={`w-full appearance-none bg-zinc-100 hover:bg-zinc-200 text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/10 text-ellipsis overflow-hidden whitespace-nowrap ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            >
                                                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 text-ellipsis overflow-hidden whitespace-nowrap`}>{item.category}</div>
                                        </div>

                                        {/* SubCategory */}
                                        <div className="relative">
                                            <select
                                                value={item.subCategory}
                                                onChange={(e) => handleUpdateItem(globalIdx, { subCategory: e.target.value })}
                                                className={`w-full appearance-none bg-transparent hover:bg-zinc-100 border border-transparent hover:border-zinc-200 text-[10px] font-medium px-2 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/10 text-ellipsis overflow-hidden whitespace-nowrap ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            >
                                                {subCats.length > 0 ? (
                                                    subCats.map(opt => <option key={opt} value={opt}>{opt}</option>)
                                                ) : <option value="">-</option>}
                                            </select>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] font-medium px-2 py-1.5 text-ellipsis overflow-hidden whitespace-nowrap`}>{item.subCategory}</div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                className={`w-full bg-transparent text-xs font-normal focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="Details..."
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-normal px-1 py-1`}>{item.description || "—"}</div>
                                        </div>

                                        {/* Rate Type */}
                                        <div className="relative">
                                            <select
                                                value={item.rateType}
                                                onChange={(e) => handleUpdateItem(globalIdx, { rateType: e.target.value })}
                                                className={`w-full appearance-none bg-zinc-50 hover:bg-zinc-100 text-[10px] uppercase font-bold tracking-wider px-1 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/10 text-center ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            >
                                                {RATE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] uppercase font-bold tracking-wider px-1 py-1.5 text-center`}>{item.rateType}</div>
                                        </div>

                                        {/* Rate */}
                                        <div>
                                            <input
                                                type="number"
                                                value={item.rate || ''}
                                                onChange={(e) => handleUpdateItem(globalIdx, { rate: parseFloat(e.target.value) || 0 })}
                                                className={`w-full bg-transparent text-xs font-mono text-right focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="0.00"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-mono text-right px-1 py-1`}>{formatter.format(item.rate)}</div>
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <input
                                                type="number"
                                                value={item.quantity || ''}
                                                onChange={(e) => handleUpdateItem(globalIdx, { quantity: parseFloat(e.target.value) || 0 })}
                                                className={`w-full bg-transparent text-xs font-mono text-center focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="1"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-mono text-center px-1 py-1`}>{item.quantity}</div>
                                        </div>

                                        {/* Line Total */}
                                        <div className="text-right pt-1">
                                            <span className="text-xs font-mono font-bold text-black">{formatter.format(lineTotal)}</span>
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
                                        <Plus size={10} className="mr-1" /> Add Line Item
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
