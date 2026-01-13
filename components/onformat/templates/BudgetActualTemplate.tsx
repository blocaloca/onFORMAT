import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, RefreshCw } from 'lucide-react';

interface ActualLineItem {
    id: string;
    description: string;
    budgeted: number;
    actual: number;
    notes: string;
}

interface BudgetActualData {
    items: ActualLineItem[];
    currency: string;
}

interface BudgetActualTemplateProps {
    data: Partial<BudgetActualData>;
    onUpdate: (data: Partial<BudgetActualData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const BudgetActualTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: BudgetActualTemplateProps) => {

    const items = data.items || [];
    const currency = data.currency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    // One-time Import check (if empty)
    useEffect(() => {
        if (items.length === 0 && metadata?.importedBudget?.items) {
            handleImportBudget();
        }
    }, [metadata?.importedBudget]);

    const handleImportBudget = () => {
        if (!metadata?.importedBudget?.items) return;
        const budgetItems = metadata.importedBudget.items;

        // Map Budget items to Actual items
        // We flatten Category/Sub/Desc into Description
        const newItems = budgetItems.map((bi: any) => {
            // Construct meaningful description
            let desc = bi.category || '';
            if (bi.subCategory && bi.subCategory !== desc) desc += ` - ${bi.subCategory}`;
            if (bi.description) desc += ` (${bi.description})`;

            return {
                id: `actual-${bi.id || Date.now() + Math.random()}`,
                description: desc,
                budgeted: (Number(bi.rate) * Number(bi.quantity)) || 0,
                actual: 0,
                notes: ''
            };
        });

        onUpdate({ items: newItems });
    };

    const handleAddItem = () => {
        const newItem: ActualLineItem = {
            id: `actual-${Date.now()}`,
            description: '',
            budgeted: 0,
            actual: 0,
            notes: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<ActualLineItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
    };

    // Calculations
    const totalBudgeted = items.reduce((sum, item) => sum + (item.budgeted || 0), 0);
    const totalActual = items.reduce((sum, item) => sum + (item.actual || 0), 0);
    const totalVariance = totalBudgeted - totalActual;

    const ITEMS_PER_PAGE = orientation === 'landscape' ? 10 : 14;
    const totalPages = Math.ceil(Math.max(items.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Actual Budget"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 h-full flex flex-col">

                        {/* Summary Header - Page 0 Only */}
                        {pageIndex === 0 && (
                            <div className="grid grid-cols-3 gap-8 border-b-2 border-black pb-6 mb-2">
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Estimated Total</h2>
                                    <div className="text-xl font-mono font-bold">{formatter.format(totalBudgeted)}</div>
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Actual Total</h2>
                                    <div className="text-xl font-mono font-bold text-emerald-600">{formatter.format(totalActual)}</div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Variance</h2>
                                    <div className={`text-xl font-mono font-bold ${totalVariance < 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                                        {totalVariance < 0 ? '-' : '+'}{formatter.format(Math.abs(totalVariance))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!metadata?.importedBudget?.items && items.length === 0 && !isLocked && (
                            <div className="text-center p-8 bg-zinc-50 border border-dashed border-zinc-200 rounded text-zinc-400 text-xs uppercase tracking-widest">
                                No Budget Data Found in Pre-Production
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_100px_100px_100px_150px_30px] gap-4 border-b border-black pb-2 items-end px-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Budgeted</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actual</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Variance</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                            <span className="px-1"></span>
                        </div>

                        {/* Rows */}
                        <div className="flex-1 space-y-0 divide-y divide-zinc-100">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const variance = (item.budgeted || 0) - (item.actual || 0);

                                return (
                                    <div key={item.id} className="grid grid-cols-[1fr_100px_100px_100px_150px_30px] gap-4 py-2 items-center hover:bg-zinc-50 transition-colors px-2">

                                        {/* Description */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(globalIdx, { description: e.target.value })}
                                                className={`w-full bg-transparent text-xs font-bold uppercase focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-bold uppercase px-1 py-1 text-ellipsis overflow-hidden`}>{item.description}</div>
                                        </div>

                                        {/* Budgeted (ReadOnly) */}
                                        <div className="text-right text-xs font-mono text-zinc-500">
                                            {formatter.format(item.budgeted)}
                                        </div>

                                        {/* Actual (Editable) */}
                                        <div>
                                            <input
                                                type="number"
                                                value={item.actual || ''}
                                                onChange={(e) => handleUpdateItem(globalIdx, { actual: parseFloat(e.target.value) || 0 })}
                                                className={`w-full bg-transparent text-xs font-mono font-bold text-right focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="0.00"
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs font-mono font-bold text-right px-1 py-1`}>{formatter.format(item.actual)}</div>
                                        </div>

                                        {/* Variance */}
                                        <div className={`text-right text-xs font-mono font-bold ${variance < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                                            {formatter.format(variance)}
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => handleUpdateItem(globalIdx, { notes: e.target.value })}
                                                className={`w-full bg-transparent text-[10px] text-zinc-500 font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                placeholder="..."
                                                disabled={isLocked}
                                            />
                                            <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-[10px] text-zinc-500 font-mono px-1 py-1`}>{item.notes}</div>
                                        </div>

                                        {/* Delete */}
                                        <div className={`flex justify-end ${isPrinting ? 'hidden' : 'print:hidden'}`}>
                                            {!isLocked && (
                                                <button
                                                    onClick={() => handleDeleteItem(globalIdx)}
                                                    className="text-zinc-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {!isLocked && !isPrinting && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print-hidden flex justify-between items-center">
                                    <button
                                        onClick={handleAddItem}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm"
                                    >
                                        <Plus size={10} className="mr-1" /> Add Line Item
                                    </button>

                                    {/* Manual Re-sync button (Subtle) */}
                                    {metadata?.importedBudget?.items && (
                                        <button
                                            onClick={() => {
                                                if (confirm('This will overwrite current items with original budget data. Continue?')) {
                                                    handleImportBudget();
                                                }
                                            }}
                                            className="text-zinc-300 hover:text-emerald-600 transition-colors p-2"
                                            title="Reset to Original Budget"
                                        >
                                            <RefreshCw size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
