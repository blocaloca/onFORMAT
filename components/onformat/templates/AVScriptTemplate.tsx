/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
import React, { useEffect, useState, useRef } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Video, Mic, Sparkles } from 'lucide-react';

interface AVRow {
    id: string;
    scene: string;
    time: string; // Seconds or Timecode
    visual: string;
    audio: string;
}

interface AVScriptData {
    title: string;
    rows: AVRow[];
}

interface AVScriptTemplateProps {
    data: Partial<AVScriptData>;
    onUpdate: (data: Partial<AVScriptData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const AVScriptTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: AVScriptTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [showBrief, setShowBrief] = useState(false);

    useEffect(() => {
        if (!data.rows) {
            onUpdate({ rows: [] });
        }
    }, []);

    const rows = data.rows || [];

    const handleAddRow = () => {
        const newRow: AVRow = {
            id: `row-${Date.now()}`,
            scene: '',
            time: '',
            visual: '',
            audio: ''
        };
        onUpdate({ rows: [...rows, newRow] });
    };

    const handleUpdateRow = (index: number, updates: Partial<AVRow>) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], ...updates };
        onUpdate({ rows: newRows });
    };

    const handleDeleteRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        onUpdate({ rows: newRows });
        setDeleteConfirmIndex(null);
    };

    // Auto-resize removed to enforce strict US Letter conforming row bounds
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Obsolete
    };

    const handleDurationChange = (val: string) => {
        const digits = val.replace(/\D/g, '');
        // Limit to 6 digits (99:59:59 usually max, but HH:MM:SS allows 99)
        const truncated = digits.slice(-6);
        // Pad with zeros to 6 chars
        const padded = truncated.padStart(6, '0');
        const hh = padded.slice(0, 2);
        const mm = padded.slice(2, 4);
        const ss = padded.slice(4, 6);
        return `${hh}:${mm}:${ss}`;
    };

    // Dynamic Pagination Logic
    // Row Height Score (Approximate)
    // US Letter Portrait height: 1056px. Content area ~800-900px.
    // Base row height (padding + borders): ~100px.
    // Each line (~60 chars) adds ~20px.
    const MAX_PAGE_HEIGHT_SCORE = orientation === 'landscape' ? 580 : 740;

    const pages: AVRow[][] = [];
    let currentPage: AVRow[] = [];
    let currentPageHeight = 0;

    rows.forEach((row) => {
        // Calculate Row Height Score
        // Base score for the row structure
        let rowScore = 120; 

        // Additional score based on text length (approximate line count)
        const visualLines = Math.ceil((row.visual?.length || 0) / 45);
        const audioLines = Math.ceil((row.audio?.length || 0) / 45);
        const maxLines = Math.max(visualLines, audioLines, 1);
        
        rowScore += (maxLines - 1) * 22; // Add ~22px per additional line

        // Safety cap for extremely large rows to prevent infinite loops (though unlikely here)
        if (rowScore > MAX_PAGE_HEIGHT_SCORE) rowScore = MAX_PAGE_HEIGHT_SCORE;

        if (currentPageHeight + rowScore > MAX_PAGE_HEIGHT_SCORE && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [];
            currentPageHeight = 0;
        }

        currentPage.push(row);
        currentPageHeight += rowScore;
    });

    if (currentPage.length > 0 || rows.length === 0) {
        pages.push(currentPage);
    }

    return (
        <div className="flex flex-col items-center w-full relative">

            <div className="flex flex-col gap-8">
                {pages.map((pageRows, pageIndex) => (
                    <DocumentLayout
                        key={pageIndex}
                        title="AV Script"
                        hideHeader={false}
                        plain={plain}
                        orientation={orientation}
                        metadata={metadata}
                        subtitle={pageIndex > 0 ? `AV Script (Cont.)` : ''}
                        isPrinting={isPrinting}
                    >
                        <div className="space-y-6 text-sm font-sans h-full flex flex-col">

                            {/* Table Header */}
                            <div className="grid grid-cols-[60px_110px_1fr_1fr_30px] gap-6 border-b border-black pb-2 items-end px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scene</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duration</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Video size={10} /> Visual</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Mic size={10} /> Audio</span>
                                <span className="w-full"></span>
                            </div>

                            {/* Rows */}
                            <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                                {pageRows.map((row) => {
                                    const globalIdx = rows.findIndex(r => r.id === row.id);
                                    return (
                                        <div key={row.id} className="grid grid-cols-[60px_110px_1fr_1fr_30px] gap-6 py-6 px-4 items-start bg-transparent transition-colors group">

                                            {/* Scene */}
                                            {isPrinting ? (
                                                <div className="font-bold text-sm text-center text-black py-2 border border-zinc-200 bg-transparent rounded-sm">
                                                    {row.scene || "—"}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={row.scene}
                                                    onChange={e => handleUpdateRow(globalIdx, { scene: e.target.value })}
                                                    className={`font-bold text-sm bg-transparent border-b border-transparent hover:border-zinc-200 px-2 py-2 outline-none w-full text-zinc-900 placeholder:text-zinc-400 text-center`}
                                                    placeholder="#"
                                                    disabled={isLocked}
                                                />
                                            )}

                                            {/* Duration */}
                                            {isPrinting ? (
                                                <div className="font-mono text-sm text-black py-2 border border-zinc-200 bg-transparent rounded-sm text-center">
                                                    {row.time || "—"}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={row.time}
                                                    onChange={e => handleUpdateRow(globalIdx, { time: handleDurationChange(e.target.value) })}
                                                    className={`font-mono text-sm bg-transparent border-b border-transparent hover:border-zinc-200 px-2 py-2 outline-none w-full text-zinc-900 placeholder:text-zinc-400`}
                                                    placeholder="00:00:00"
                                                    disabled={isLocked}
                                                />
                                            )}

                                            {/* Visual */}
                                            {isPrinting ? (
                                                <div className="text-sm leading-relaxed uppercase whitespace-pre-wrap break-words text-black dark:text-zinc-100 bg-transparent p-4 border border-zinc-200 rounded-sm min-h-[100px] overflow-hidden">
                                                    {row.visual || "—"}
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={row.visual}
                                                    onChange={e => handleUpdateRow(globalIdx, { visual: e.target.value })}
                                                    className={`text-sm bg-transparent border-b border-transparent hover:border-zinc-200 px-4 py-4 outline-none w-full text-zinc-900 placeholder:text-zinc-400 resize-none min-h-[100px] max-h-[160px] overflow-y-auto leading-relaxed uppercase break-words`}
                                                    placeholder="ACTION DESCRIPTION..."
                                                    disabled={isLocked}
                                                />
                                            )}

                                            {/* Audio */}
                                            {isPrinting ? (
                                                <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-black dark:text-zinc-100 bg-transparent p-4 border border-zinc-200 rounded-sm min-h-[100px] overflow-hidden">
                                                    {row.audio || "—"}
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={row.audio}
                                                    onChange={e => handleUpdateRow(globalIdx, { audio: e.target.value })}
                                                    className={`text-sm font-mono bg-transparent border-b border-transparent hover:border-zinc-200 px-4 py-4 outline-none w-full text-zinc-900 placeholder:text-zinc-400 resize-none min-h-[100px] max-h-[160px] overflow-y-auto leading-relaxed break-words`}
                                                    placeholder="Dialogue or SFX..."
                                                    disabled={isLocked}
                                                />
                                            )}

                                            {/* Delete Button */}
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
                                                                onClick={() => handleDeleteRow(globalIdx)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                    {deleteConfirmIndex === globalIdx && (
                                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDeleteConfirmIndex(null)} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                    {metadata?.importedBrief && rows.length === 0 && !isPrinting && (
                                        <div className="pt-4 flex justify-center">
                                            <button
                                                onClick={() => {
                                                    const brief = metadata.importedBrief;
                                                    if (confirm("Generate initial script rows from Brief? (Note: This is a structural breakdown, use AI Vision for full creative writing)")) {
                                                        const newRows: AVRow[] = [
                                                            { id: `row-${Date.now()}-1`, scene: '1', time: '00:00:05', visual: 'OPENING SHOT: ', audio: '(MUSIC SWELLS)' },
                                                            { id: `row-${Date.now()}-2`, scene: '2', time: '00:00:10', visual: 'TEXT OVERLAY: ', audio: 'NARRATOR: ' }
                                                        ];
                                                        onUpdate({ rows: newRows });
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-500 transition-colors"
                                            >
                                                <Sparkles size={12} className="animate-pulse" />
                                                Generate from Brief
                                            </button>
                                        </div>
                                    )}
                                {!isLocked && !isPrinting && pageIndex === pages.length - 1 && (
                                    <div className="pt-2">
                                        <button onClick={handleAddRow} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-zinc-100 bg-transparent px-2 py-2 rounded-sm w-full">
                                            <Plus size={10} className="mr-1" /> Add Scene
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DocumentLayout>
                ))}
            </div>
        </div>
    );
};
