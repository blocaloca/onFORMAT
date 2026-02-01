import React, { useState } from 'react';

import { RectangleVertical, RectangleHorizontal, ChevronLeft, ChevronRight, Copy, Plus, Trash2, Printer, Sparkles } from 'lucide-react';

export type NavMode = 'stack' | 'collection' | 'hidden';

interface DocumentNavBarProps {
    versions: any[];
    activeVersionIndex: number;
    onSelectVersion: (index: number) => void;
    onNew: () => void;
    onDuplicate: () => void;
    onClear: () => void;
    onSave: () => void;
    title: string;
    orientation?: 'portrait' | 'landscape';
    onToggleOrientation?: (o: 'portrait' | 'landscape') => void;
    onExportPdf?: (scope: 'current' | 'all') => void;
    isExportingPdf?: boolean;
    projectId?: string;
    navMode?: NavMode;
    onOpenPrintRoom?: () => void;
    onToggleAi?: () => void;
    isAiDocked?: boolean;
}

export const DocumentNavBar = ({
    versions,
    activeVersionIndex,
    onSelectVersion,
    onNew,
    onDuplicate,
    onClear,
    onSave,
    title,
    orientation = 'portrait',
    onToggleOrientation,
    onExportPdf,
    isExportingPdf,
    projectId,
    navMode = 'stack',
    onOpenPrintRoom,
    onToggleAi,
    isAiDocked
}: DocumentNavBarProps) => {
    const [showVersionMenu, setShowVersionMenu] = useState(false);

    // Helpers for Collection Mode (Day Logic)
    // In Collection Mode: versions array = [Day 1, Day 2, Day 3]
    // The visual order matches the array order (0 is Day 1, 1 is Day 2) - UNLIKE Stack mode where 0 is Newest
    // Unified "Day" Logic (Treats all version arrays as [Day 1, Day 2...])
    const activeItem = versions[activeVersionIndex] || {};
    // Fallback: If no dayLabel, use "DAY X". If stack mode was used, this essentially rebrands "Version X" to "Day X".
    // Note: We assume the parent component (DraftEditor) manages the array order.
    const dayLabel = activeItem.dayLabel || `DAY ${activeVersionIndex + 1}`;
    const dateLabel = activeItem.date || ''; // Optional date subtitle

    return (
        <div className="w-full h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none">
            {/* Left: Navigation Logic */}
            <div className="flex items-center gap-4">

                {/* Title */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 mr-2">{title}</span>

                    {/* Day Navigator Pill */}
                    <div className="flex items-center bg-black rounded-sm border border-zinc-800 h-8">
                        <button
                            onClick={() => onSelectVersion(Math.max(0, activeVersionIndex - 1))}
                            disabled={activeVersionIndex === 0}
                            className="h-full px-2 hover:text-white text-zinc-600 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors border-r border-zinc-800/50"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="px-4 min-w-[100px] text-center flex flex-col justify-center h-full">
                            <span className="block text-[10px] font-black uppercase text-white tracking-widest leading-none mb-0.5">
                                {dayLabel}
                            </span>
                            {dateLabel && (
                                <span className="block text-[8px] font-mono text-zinc-500 leading-none opacity-80">
                                    {dateLabel}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => onSelectVersion(Math.min(versions.length - 1, activeVersionIndex + 1))}
                            disabled={activeVersionIndex === versions.length - 1}
                            className="h-full px-2 hover:text-white text-zinc-600 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors border-l border-zinc-800/50"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-zinc-800 mx-2" />

                    {/* Day Actions */}
                    <button onClick={onNew} className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors" title="Add Day">
                        <Plus size={16} />
                    </button>

                    <button onClick={onClear} className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors" title="Delete Day">
                        <Trash2 size={14} />
                    </button>
                </div>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {onToggleAi && (
                    <button
                        onClick={onToggleAi}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border shadow-sm
                            ${isAiDocked
                                ? 'bg-zinc-800 text-emerald-500 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400' // Active/Docked/Shown? Actually "Docked" usually means hidden side panel in some contexts, or shown. In WorkspaceEditor: isAiDocked=true means HIDDEN (docked away). 
                                // Let's check WorkspaceEditor logic: 
                                // const aiMode = isAiDocked ? 'OFF' : ...
                                // So isAiDocked = TRUE means AI is OFF.
                                // isAiDocked = FALSE means AI is OPEN.
                                // So if !isAiDocked (AI Open), we want it bright.
                                : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/50'
                            }
                            ${!isAiDocked ? '' : 'opacity-60 hover:opacity-100'} 
                        `}
                    >
                        <Sparkles size={14} className={!isAiDocked ? "text-emerald-400 fill-emerald-400/20" : "text-zinc-500"} />
                        <span>AI Liaison</span>
                    </button>
                )}

                {onOpenPrintRoom && (
                    <button
                        onClick={onOpenPrintRoom}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-zinc-700 shadow-sm"
                    >
                        <Printer size={14} />
                        <span>Export</span>
                    </button>
                )}
            </div>
        </div >
    );
};
