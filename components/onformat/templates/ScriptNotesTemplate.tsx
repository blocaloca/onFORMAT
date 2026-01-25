import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Download } from 'lucide-react';

interface ScriptNoteItem {
    id: string;
    scene: string;
    visual: string;
    audio: string;
    bestTake: string;
    notes: string;
}

interface ScriptNotesData {
    date: string;
    items: ScriptNoteItem[];
}

interface ScriptNotesTemplateProps {
    data: Partial<ScriptNotesData>;
    onUpdate: (data: Partial<ScriptNotesData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const TAKE_OPTIONS = Array.from({ length: 20 }, (_, i) => String(i + 1));

export const ScriptNotesTemplate = ({ data, onUpdate, isLocked = false, plain, orientation = 'landscape', metadata, isPrinting }: ScriptNotesTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    const formatDate = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const chars = digits.split('');
        if (chars.length > 2) chars.splice(2, 0, '/');
        if (chars.length > 5) chars.splice(5, 0, '/');
        return chars.join('').slice(0, 10);
    };

    const updateField = (field: keyof ScriptNotesData, value: any) => {
        onUpdate({ [field]: value });
    };

    useEffect(() => {
        // Initialize if either items are missing OR date is missing (and we have a schedule date)
        if (!data.items || !data.date) {

            // Priority: Imported Schedule > Current Date
            let initialDate = '';

            // Use existing date if available (in case items missing but date set)
            if (data.date) {
                initialDate = data.date;
            } else if ((metadata as any)?.importedSchedule?.date) {
                initialDate = (metadata as any).importedSchedule.date;
            } else {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                initialDate = `${month}/${day}/${year}`;
            }

            onUpdate({
                items: data.items || [],
                date: initialDate
            });
        }
    }, [metadata?.importedSchedule?.date]);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: ScriptNoteItem = {
            id: `note-${Date.now()}`,
            scene: '',
            visual: '',
            audio: '',
            bestTake: '',
            notes: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<ScriptNoteItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const handleImportScript = () => {
        if (!metadata?.importedAVScript?.rows) {
            alert('No AV Script found in Development phase.');
            return;
        }

        if (items.length > 0 && !confirm('Importing will overwrite existing notes. Continue?')) {
            return;
        }

        const scriptRows = metadata.importedAVScript.rows || [];
        const newItems: ScriptNoteItem[] = scriptRows.map((row: any, idx: number) => ({
            id: `imported-${Date.now()}-${idx}`,
            scene: row.scene || '',
            visual: row.visual || '',
            audio: row.audio || '',
            bestTake: '',
            notes: ''
        }));

        onUpdate({ items: newItems });
    };

    // Reduced items per page to accommodate taller rows
    const ITEMS_PER_PAGE = 6;
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Script Notes"
                    hideHeader={false}
                    plain={plain}
                    orientation="landscape"
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Header Info - Only on first page */}
                        {pageIndex === 0 && (
                            <div className="border-b-2 border-black pb-4">
                                <div className="w-48">
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Shoot Date</label>
                                    <input
                                        type="text"
                                        value={data.date || ''}
                                        onChange={e => updateField('date', formatDate(e.target.value))}
                                        placeholder="MM/DD/YYYY"
                                        className={`font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                        disabled={isLocked}
                                    />
                                    <div className={`font-bold text-sm pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                        {data.date}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLocked && !isPrinting && (
                            <div className="flex items-center justify-start gap-4 pb-2 print:hidden w-full">
                                <button
                                    onClick={handleAddItem}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-3 py-2 rounded-sm transition-colors border border-transparent hover:border-zinc-200"
                                >
                                    <Plus size={10} /> Add Scene
                                </button>

                                {metadata?.importedAVScript && (
                                    <button
                                        onClick={handleImportScript}
                                        className="text-[10px] text-zinc-300 hover:text-blue-500 hover:underline transition-colors"
                                        title="Import AV Script"
                                    >
                                        or import script
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-[60px_1fr_1fr_100px_1.5fr_30px] gap-6 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Scene #</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Visual</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Audio</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Best Take</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[60px_1fr_1fr_100px_1.5fr_30px] gap-6 py-6 items-start hover:bg-zinc-50 transition-colors group">

                                        {/* Scene # - min-w-0 added */}
                                        {isPrinting ? (
                                            <div className="font-bold text-[10px] w-full text-center py-2 min-w-0">{item.scene || '—'}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.scene}
                                                onChange={e => handleUpdateItem(globalIdx, { scene: e.target.value })}
                                                className="font-bold text-[10px] bg-transparent outline-none w-full text-center placeholder:text-zinc-300 py-2 min-w-0"
                                                placeholder="#"
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Visual - break-all added for long content */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full whitespace-pre-wrap break-all py-1 leading-relaxed min-h-[80px] min-w-0">{item.visual || ''}</div>
                                        ) : (
                                            <textarea
                                                value={item.visual}
                                                onChange={e => handleUpdateItem(globalIdx, { visual: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 min-h-[80px] resize-none leading-relaxed min-w-0"
                                                placeholder="Visual description..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Audio - break-all added */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full whitespace-pre-wrap break-all py-1 leading-relaxed min-h-[80px] min-w-0">{item.audio || ''}</div>
                                        ) : (
                                            <textarea
                                                value={item.audio}
                                                onChange={e => handleUpdateItem(globalIdx, { audio: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 min-h-[80px] resize-none leading-relaxed min-w-0"
                                                placeholder="Dialogue / Sound..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Best Take */}
                                        <div className="flex justify-center py-1 min-w-0">
                                            {isPrinting ? (
                                                <div className="font-bold text-[10px] border rounded px-3 py-1">{item.bestTake || '-'}</div>
                                            ) : (
                                                <select
                                                    value={item.bestTake}
                                                    onChange={e => handleUpdateItem(globalIdx, { bestTake: e.target.value })}
                                                    className="appearance-none bg-transparent font-bold text-[10px] text-center cursor-pointer outline-none border rounded px-2 py-1 w-20 hover:bg-zinc-100"
                                                    disabled={isLocked}
                                                >
                                                    <option value="">-</option>
                                                    {TAKE_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {/* Notes - break-all added */}
                                        {isPrinting ? (
                                            <div className="text-[10px] w-full whitespace-pre-wrap break-all leading-relaxed italic text-zinc-600 min-h-[80px] py-1 min-w-0">{item.notes || ''}</div>
                                        ) : (
                                            <textarea
                                                value={item.notes}
                                                onChange={e => handleUpdateItem(globalIdx, { notes: e.target.value })}
                                                className="text-[10px] bg-transparent outline-none w-full placeholder:text-zinc-300 min-h-[80px] resize-none leading-relaxed italic text-zinc-600 min-w-0"
                                                placeholder="Supervisor notes..."
                                                disabled={isLocked}
                                            />
                                        )}

                                        {/* Delete Button */}
                                        <div className="relative flex justify-center w-full pt-2 min-w-0">
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

                                                    {/* Backdrop */}
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
                        </div>
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
