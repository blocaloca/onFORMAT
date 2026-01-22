import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface DeliverableItem {
    id: string;
    item: string;
    usage: string;
}

interface BriefData {
    projectName: string;
    client: string;
    projectType: string;
    product: string; // New Field  
    objective: string;
    targetAudience: string;
    keyMessage: string;
    tone: string;
    deliverables: DeliverableItem[];
    // Legacy support
    usage?: string;
}

export const BriefTemplate = ({ data, onUpdate, persona, isPrinting, plain, orientation, metadata }: {
    data: Partial<BriefData>;
    onUpdate?: (d: Partial<BriefData>) => void;
    persona?: string;
    isPrinting?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
}) => {

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Migration / Initialization Effect
    useEffect(() => {
        // ... (existing logic) ...
        const currentDeliverables = data.deliverables;
        const isLegacy = Array.isArray(currentDeliverables) && (typeof currentDeliverables[0] === 'string' || currentDeliverables.length === 0);

        if (!currentDeliverables || (Array.isArray(currentDeliverables) && typeof currentDeliverables[0] === 'string')) {
            const legacyList = (currentDeliverables as unknown as string[]) || [];
            const legacyUsage = data.usage || '';

            let newItems: DeliverableItem[] = legacyList.map((item, i) => ({
                id: `del-${Date.now()}-${i}`,
                item: item,
                usage: legacyUsage // Inherit legacy global usage
            }));

            // Ensure at least one row
            if (newItems.length === 0) {
                newItems = [{ id: `del-${Date.now()}`, item: '', usage: '' }];
            }

            onUpdate?.({
                deliverables: newItems,
                usage: undefined
            });
        }
    }, [data.deliverables, data.usage, onUpdate]); // Added dependencies to fix lint warning

    const handleChange = (field: keyof BriefData, value: string) => {
        onUpdate?.({ [field]: value });
    };

    // ... (existing handlers) ...
    const handleDeliverableChange = (id: string, field: keyof DeliverableItem, value: string) => {
        const current = (data.deliverables as unknown as DeliverableItem[]) || [];
        const updated = current.map(d => d.id === id ? { ...d, [field]: value } : d);
        onUpdate?.({ deliverables: updated });
    };

    const addDeliverable = () => {
        const current = (data.deliverables as unknown as DeliverableItem[]) || [];
        const newItem = { id: `del-${Date.now()}`, item: '', usage: '' };
        onUpdate?.({ deliverables: [...current, newItem] });
    };

    const removeDeliverable = (id: string) => {
        const current = (data.deliverables as unknown as DeliverableItem[]) || [];
        onUpdate?.({ deliverables: current.filter(d => d.id !== id) });
        setDeleteConfirmId(null);
    };

    // Safe Accessor
    const deliverables = (data.deliverables as unknown as DeliverableItem[]) || [];
    const safeDeliverables = Array.isArray(deliverables) && typeof deliverables[0] !== 'string'
        ? deliverables
        : [];

    const inputStyle = "w-full bg-zinc-50 border border-zinc-200 p-3 text-xs outline-none focus:border-black resize-none placeholder-zinc-300 min-h-[60px] font-sans";
    const labelStyle = "block font-bold text-zinc-500 mb-2 text-[10px] uppercase tracking-widest";

    const renderField = (key: keyof BriefData, placeholder: string, minHeight: string = 'min-h-[60px]') => {
        const val = data[key] as string || '';
        return (
            <>
                <textarea
                    className={`${inputStyle} ${minHeight} ${isPrinting ? 'hidden' : 'print:hidden'}`}
                    value={val}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                />
                <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs leading-relaxed text-black whitespace-pre-wrap bg-zinc-50 border border-zinc-200 p-3 rounded-sm`}>
                    {val || "—"}
                </div>
            </>
        );
    };

    // Pagination Logic
    const ITEMS_FIRST_PAGE = orientation === 'landscape' ? 1 : 3;
    const ITEMS_OTHER_PAGES = orientation === 'landscape' ? 12 : 18;

    const remainingItems = Math.max(0, safeDeliverables.length - ITEMS_FIRST_PAGE);
    const extraPages = Math.ceil(remainingItems / ITEMS_OTHER_PAGES);
    const totalPages = 1 + extraPages;

    const pages = Array.from({ length: totalPages }, (_, i) => {
        if (i === 0) return safeDeliverables.slice(0, ITEMS_FIRST_PAGE);
        const start = ITEMS_FIRST_PAGE + (i - 1) * ITEMS_OTHER_PAGES;
        return safeDeliverables.slice(start, start + ITEMS_OTHER_PAGES);
    });

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Creative Brief"
                    hideHeader={pageIndex > 0}
                    metadata={pageIndex === 0 ? metadata : undefined}
                    plain={plain}
                    orientation={orientation}
                >
                    {pageIndex > 0 && (
                        <div className="mb-4 text-center text-sm font-bold text-zinc-500">
                            Creative Brief (Cont. Page {pageIndex + 1})
                        </div>
                    )}

                    <div className="space-y-4 h-full flex flex-col">

                        {pageIndex === 0 && (
                            <>
                                <section>
                                    <label className={labelStyle}>Vision</label>
                                    {renderField('product', 'Vision Summary... (Auto-filled from Project Vision)', 'min-h-[60px]')}
                                </section>

                                <section>
                                    <label className={labelStyle}>Objective</label>
                                    {renderField('objective', 'What is the primary goal of this project?', 'min-h-[60px]')}
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <section>
                                        <label className={labelStyle}>Target Audience</label>
                                        {renderField('targetAudience', 'Who are we talking to?', 'min-h-[60px]')}
                                    </section>

                                    <section>
                                        <label className={labelStyle}>Tone & Style</label>
                                        {renderField('tone', 'Adjectives describing the feel...', 'min-h-[60px]')}
                                    </section>
                                </div>

                                <section>
                                    <label className={labelStyle}>Key Message</label>
                                    {renderField('keyMessage', 'The one thing the audience should remember...', 'min-h-[60px]')}
                                </section>
                            </>
                        )}

                        {/* Deliverables Table */}
                        <section className="flex-1 flex flex-col min-h-0">
                            {pageIndex === 0 && <label className={labelStyle}>Deliverables & Usage</label>}
                            {pageIndex > 0 && <label className={labelStyle}>Deliverables (Cont.)</label>}

                            <div className="flex-1 overflow-auto pr-2">
                                {/* Header Row - Show on every page for clarity */}
                                {!isPrinting && (
                                    <div className="grid grid-cols-[1fr_30px] gap-2 mb-2 px-1">
                                        <span className="text-[9px] uppercase font-bold text-zinc-300">Deliverable Item & Usage</span>
                                        <span></span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {pageItems.map((del) => (
                                        <div key={del.id} className="grid grid-cols-[1fr_30px] gap-2 items-start group">
                                            {/* Item Name */}
                                            <div className="contents">
                                                <input
                                                    type="text"
                                                    value={del.item === '[object Object]' ? '' : del.item}
                                                    onChange={(e) => handleDeliverableChange(del.id, 'item', e.target.value)}
                                                    className={`bg-zinc-50 border border-zinc-200 p-2 text-xs font-bold outline-none focus:border-black placeholder:text-zinc-300 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                    placeholder="e.g. 30s TV Spot (Global Rights)"
                                                />
                                                <div className={`${isPrinting ? 'block' : 'hidden print:block'} font-bold text-xs bg-zinc-50 border border-zinc-200 p-2 rounded-sm`}>{del.item || "—"}</div>
                                            </div>

                                            {!isPrinting && (
                                                <div className="relative flex justify-center w-full h-full items-center">
                                                    <button
                                                        onClick={() => setDeleteConfirmId(deleteConfirmId === del.id ? null : del.id)}
                                                        className={`flex items-center justify-center transition-opacity hover:text-red-500 ${deleteConfirmId === del.id ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>

                                                    {deleteConfirmId === del.id && (
                                                        <div className="absolute right-0 top-8 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                            <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                            <button
                                                                onClick={() => removeDeliverable(del.id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Backdrop to close when clicking outside (transparent) */}
                                                    {deleteConfirmId === del.id && (
                                                        <div
                                                            className="fixed inset-0 z-40 bg-transparent"
                                                            onClick={() => setDeleteConfirmId(null)}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add Button - Only on last page */}
                                {!isPrinting && pageIndex === totalPages - 1 && (
                                    <button
                                        onClick={addDeliverable}
                                        className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 hover:text-black py-2"
                                    >
                                        <Plus size={10} /> Add Deliverable
                                    </button>
                                )}
                            </div>
                        </section>

                    </div>

                    {/* Footer Actions - Last Page */}
                    {/* Jump Start removed */}
                </DocumentLayout>
            ))}
        </>
    );
};
