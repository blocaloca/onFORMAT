import React from 'react';

import { ChevronLeft, ChevronRight, Plus, Trash2, Printer, Sparkles } from 'lucide-react';

export type NavMode = 'stack' | 'collection' | 'hidden';

interface DocumentNavBarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    versions: any[];
    activeVersionIndex: number;
    onSelectVersion: (index: number) => void;
    onNew: () => void;
    onClear: () => void;
    title: string;
    onOpenPrintRoom?: () => void;
    onToggleAi?: () => void;
    isAiDocked?: boolean;
}

import { useTheme } from '@/components/ThemeProvider';

export const DocumentNavBar = ({
    versions,
    activeVersionIndex,
    onSelectVersion,
    onNew,
    onClear,
    title,
    onOpenPrintRoom,
    onToggleAi,
    isAiDocked
}: DocumentNavBarProps) => {
    const { theme } = useTheme();
    const darkMode = theme === 'dark';

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
        <div className={`w-full h-12 border-b flex items-center justify-between px-4 select-none transition-colors ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
            {/* Left: Navigation Logic */}
            <div className="flex items-center gap-4">

                {/* Title */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wide mr-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{title}</span>

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
                            <span className={`block text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
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
                            className={`h-full px-2 transition-colors border-l ${darkMode ? 'text-zinc-600 hover:text-white border-zinc-800/50 disabled:hover:text-zinc-600' : 'text-zinc-400 hover:text-black hover:bg-zinc-100 border-zinc-200 disabled:hover:text-zinc-400'}`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className={`h-4 w-px mx-2 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

                    {/* Day Actions */}
                    <button onClick={onNew} className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors" title="Add Day">
                        <Plus size={16} />
                    </button>

                    <button onClick={onClear} className={`p-1.5 transition-colors ${darkMode ? 'text-zinc-500 hover:text-red-500' : 'text-zinc-400 hover:text-red-600'}`} title="Delete Day">
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
                                ? (darkMode ? 'bg-zinc-800 text-emerald-500 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100') // Active/Docked/Shown? Actually "Docked" usually means hidden side panel in some contexts, or shown. In WorkspaceEditor: isAiDocked=true means HIDDEN (docked away). 
                                // Let's check WorkspaceEditor logic: 
                                // const aiMode = isAiDocked ? 'OFF' : ...
                                // So isAiDocked = TRUE means AI is OFF.
                                // isAiDocked = FALSE means AI is OPEN.
                                // isAiDocked = FALSE means AI is OPEN.
                                // So if !isAiDocked (AI Open), we want it bright.
                                : (darkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/50' : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md')
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
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border shadow-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700' : 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900'}`}
                    >
                        <Printer size={14} />
                        <span>Export</span>
                    </button>
                )}
            </div>
        </div >
    );
};
