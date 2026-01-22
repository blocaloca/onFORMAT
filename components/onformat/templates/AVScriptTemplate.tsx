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

    // Auto-resize for textareas
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
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

    const ITEMS_PER_PAGE = 4;
    const totalPages = Math.ceil(Math.max(rows.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => rows.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <div className="flex flex-col items-center w-full relative">

            {/* Logic Toggle */}
            {metadata?.importedBrief && (
                <div className="absolute -top-10 right-0 z-20 print:hidden flex justify-end w-full">
                    <div className="relative">
                        <button
                            onClick={() => setShowBrief(!showBrief)}
                            className="flex items-center gap-2 bg-white border border-zinc-200 shadow-sm text-zinc-500 hover:text-black hover:border-zinc-300 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                            <Sparkles size={12} className={showBrief ? "text-purple-600" : "text-zinc-400"} />
                            {showBrief ? 'Hide Logic' : 'Reference Logic'}
                        </button>
                        {showBrief && (
                            <div className="absolute right-0 top-12 w-72 bg-white border border-zinc-200 shadow-xl rounded-lg p-5 animate-in slide-in-from-top-2 fade-in z-50">
                                <h4 className="text-[10px] uppercase font-bold text-zinc-400 mb-3 border-b border-zinc-100 pb-2">Brief Context</h4>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block">Vision</span>
                                        <span className="text-xs font-bold text-black">{metadata.importedBrief.product || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block">Objective</span>
                                        <p className="text-[11px] text-zinc-600 leading-snug">{metadata.importedBrief.objective || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block">Tone</span>
                                        <p className="text-[11px] text-zinc-600 leading-snug">{metadata.importedBrief.tone || '—'}</p>
                                    </div>
                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 italic text-zinc-600 text-[11px]">
                                        "{metadata.importedBrief.keyMessage || '...'}"
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-8">
                {pages.map((pageRows, pageIndex) => (
                    <DocumentLayout
                        key={pageIndex}
                        title="AV Script"
                        hideHeader={false}
                        plain={plain}
                        orientation={orientation}
                        metadata={metadata}
                        subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    >
                        <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                            {/* Table Header */}
                            <div className="grid grid-cols-[60px_80px_1fr_1fr_30px] gap-6 border-b border-black pb-2 items-end">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scene</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duration</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Video size={10} /> Visual</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Mic size={10} /> Audio</span>
                                <span className="w-full"></span>
                            </div>

                            {/* Rows */}
                            <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                                {pageRows.map((row, localIdx) => {
                                    const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                    return (
                                        <div key={row.id} className="grid grid-cols-[60px_80px_1fr_1fr_30px] gap-6 py-6 items-start hover:bg-zinc-50 transition-colors group">

                                            {/* Scene */}
                                            <div className="contents">
                                                <input
                                                    type="text"
                                                    value={row.scene}
                                                    onChange={e => handleUpdateRow(globalIdx, { scene: e.target.value })}
                                                    className={`font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300 text-center ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                    placeholder="#"
                                                    disabled={isLocked}
                                                />
                                                <div className={`${isPrinting ? 'block' : 'hidden print:block'} font-bold text-sm text-center text-black py-1`}>{row.scene}</div>
                                            </div>

                                            {/* Duration */}
                                            <div className="contents">
                                                <input
                                                    type="text"
                                                    value={row.time}
                                                    onChange={e => handleUpdateRow(globalIdx, { time: handleDurationChange(e.target.value) })}
                                                    className={`font-mono text-xs bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                    placeholder="00:00:00"
                                                    disabled={isLocked}
                                                />
                                                <div className={`${isPrinting ? 'block' : 'hidden print:block'} font-mono text-xs text-black py-1`}>{row.time}</div>
                                            </div>

                                            {/* Visual */}
                                            <div className="contents">
                                                <textarea
                                                    value={row.visual}
                                                    onChange={e => {
                                                        handleUpdateRow(globalIdx, { visual: e.target.value });
                                                        autoResize(e);
                                                    }}
                                                    className={`text-xs bg-transparent outline-none w-full placeholder:text-zinc-300 resize-none min-h-[80px] leading-relaxed uppercase ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                    placeholder="ACTION DESCRIPTION..."
                                                    disabled={isLocked}
                                                />
                                                <div className={`${isPrinting ? 'block' : 'hidden print:block'} text-xs leading-relaxed uppercase whitespace-pre-wrap text-black`}>{row.visual}</div>
                                            </div>

                                            {/* Audio */}
                                            <div className="contents">
                                                <textarea
                                                    value={row.audio}
                                                    onChange={e => {
                                                        handleUpdateRow(globalIdx, { audio: e.target.value });
                                                        autoResize(e);
                                                    }}
                                                    className={`text-xs font-mono bg-transparent outline-none w-full placeholder:text-zinc-300 resize-none min-h-[80px] leading-relaxed ${isPrinting ? 'hidden' : 'print:hidden'}`}
                                                    placeholder="Dialogue or SFX..."
                                                    disabled={isLocked}
                                                />
                                                <div className={`${isPrinting ? 'block' : 'hidden print:block'} text-xs font-mono leading-relaxed whitespace-pre-wrap text-black`}>{row.audio}</div>
                                            </div>

                                            {/* Delete Button */}
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
                                                                onClick={() => handleDeleteRow(globalIdx)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
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
                                {!isLocked && pageIndex === totalPages - 1 && (
                                    <div className="pt-2">
                                        <button onClick={handleAddRow} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
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
