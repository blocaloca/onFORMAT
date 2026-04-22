import React from 'react';

import { ChevronLeft, ChevronRight, Plus, Trash2, Printer, Sparkles, RectangleVertical, RectangleHorizontal, Sun, Moon } from 'lucide-react';

export type NavMode = 'stack' | 'collection' | 'hidden';

interface DocumentNavBarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    versions: any[];
    activeVersionIndex: number;
    onSelectVersion: (index: number) => void;
    onNew: (duplicate?: boolean) => void;
    onClear: () => void;
    title: string;
    onOpenPrintRoom?: () => void;
    onToggleAi?: () => void;
    isAiDocked?: boolean;
    activeToolKey?: string;
    orientation?: 'portrait' | 'landscape';
    onToggleOrientation?: () => void;
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
    isAiDocked,
    activeToolKey,
    orientation,
    onToggleOrientation
}: DocumentNavBarProps) => {
    const { theme, setTheme } = useTheme();
    const darkMode = theme === 'dark';
    const [showNewMenu, setShowNewMenu] = React.useState(false);

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
                    {/* Title removed per user request */}

                    {/* Day Navigator Pill */}
                    <div className={`flex items-center rounded-sm border h-8 transition-colors ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-300'}`}>
                        <button
                            onClick={() => onSelectVersion(Math.max(0, activeVersionIndex - 1))}
                            disabled={activeVersionIndex === 0}
                            className={`h-full px-2 transition-colors border-r disabled:opacity-30 ${darkMode ? 'hover:text-white text-zinc-600 disabled:hover:text-zinc-600 border-zinc-800/50' : 'text-zinc-500 hover:text-black border-zinc-200 disabled:hover:text-zinc-500'}`}
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
                            className={`h-full px-2 transition-colors border-l ${darkMode ? 'text-zinc-600 hover:text-white border-zinc-800/50 disabled:hover:text-zinc-600' : 'text-zinc-500 hover:text-black border-zinc-200 disabled:hover:text-zinc-500 disabled:opacity-30'}`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className={`h-4 w-px mx-2 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

                    {/* Day Actions */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNewMenu(!showNewMenu)} 
                            className={`p-1.5 transition-colors ${showNewMenu ? 'text-emerald-500' : 'text-zinc-500 hover:text-emerald-400'}`} 
                            title="Add Day Options"
                        >
                            <Plus size={16} />
                        </button>

                        {showNewMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)} />
                                <div className={`absolute left-0 top-10 w-48 z-50 rounded-sm border shadow-xl p-1 animate-in fade-in slide-in-from-top-2 duration-150 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                                    <button
                                        onClick={() => { onNew(false); setShowNewMenu(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${darkMode ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-zinc-50 text-zinc-600 hover:text-black'}`}
                                    >
                                        <Plus size={12} />
                                        New Blank Day
                                    </button>
                                    <button
                                        onClick={() => { onNew(true); setShowNewMenu(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${darkMode ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-zinc-50 text-zinc-600 hover:text-black'}`}
                                    >
                                        <ChevronRight size={12} className="rotate-45" />
                                        Duplicate Current
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button onClick={onClear} className={`p-1.5 transition-colors ${darkMode ? 'text-zinc-500 hover:text-red-500' : 'text-zinc-400 hover:text-red-600'}`} title="Delete Day">
                        <Trash2 size={14} />
                    </button>
                </div>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {onToggleOrientation && (
                    <div className="flex items-center rounded-sm border overflow-hidden">
                        <button
                            onClick={onToggleOrientation}
                            className={`p-2 transition-all flex items-center justify-center border-r ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white' : 'bg-white border-zinc-300 text-zinc-400 hover:text-black'}`}
                            title={`Switch to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
                        >
                            {orientation === 'portrait' ? <RectangleVertical size={14} /> : <RectangleHorizontal size={14} />}
                        </button>
                        <button
                            onClick={() => setTheme(darkMode ? 'light' : 'dark')}
                            className={`p-2 transition-all flex items-center justify-center ${darkMode ? 'bg-zinc-900 text-zinc-500 hover:text-white' : 'bg-white text-zinc-400 hover:text-black'}`}
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                )}

                <div className={`h-4 w-px mx-1 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

                {onToggleAi && activeToolKey === 'project-vision' && (
                    <button
                        onClick={onToggleAi}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-colors border shadow-sm
                            ${!isAiDocked
                                ? (darkMode ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 border-zinc-300 hover:bg-zinc-200 shadow-md')
                                : (darkMode ? 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white' : 'bg-white text-zinc-400 border-zinc-200 hover:text-zinc-900')
                            }
                        `}
                    >
                        <Sparkles size={14} className={!isAiDocked ? "text-white" : "text-zinc-500"} />
                        <span>AI VISION</span>
                    </button>
                )}

                {onOpenPrintRoom && (
                    <button
                        onClick={onOpenPrintRoom}
                        className={`
                            flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-md active:scale-95
                            bg-[#FBBF24] border border-amber-400 text-white hover:bg-amber-500 hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]
                        `}
                    >
                        <Printer size={14} />
                        <span>Export</span>
                    </button>
                )}
            </div>
        </div>
    );
};
