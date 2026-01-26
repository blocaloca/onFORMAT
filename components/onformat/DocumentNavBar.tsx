import React, { useState } from 'react';
import { ImageExportButton } from '@/components/export/ImageExportButton';
import { RectangleVertical, RectangleHorizontal, ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';

export type NavMode = 'stack' | 'collection';

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
    navMode = 'stack'
}: DocumentNavBarProps) => {
    const [showVersionMenu, setShowVersionMenu] = useState(false);

    // Helpers for Collection Mode (Day Logic)
    // In Collection Mode: versions array = [Day 1, Day 2, Day 3]
    // The visual order matches the array order (0 is Day 1, 1 is Day 2) - UNLIKE Stack mode where 0 is Newest
    const activeItem = versions[activeVersionIndex] || {};
    const dayLabel = activeItem.dayLabel || `Day ${activeVersionIndex + 1}`;
    const dateLabel = activeItem.date || '';

    return (
        <div className="w-full h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none">
            {/* Left: Navigation Logic */}
            <div className="flex items-center gap-4">

                {/* --- COLLECTION MODE (Multi-Day) --- */}
                {navMode === 'collection' && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 mr-2">{title}</span>

                        <div className="flex items-center bg-black rounded-sm border border-zinc-800">
                            <button
                                onClick={() => onSelectVersion(Math.max(0, activeVersionIndex - 1))}
                                disabled={activeVersionIndex === 0}
                                className="p-1 hover:text-white text-zinc-500 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            <div className="px-3 min-w-[100px] text-center">
                                <span className="block text-[10px] font-bold uppercase text-white tracking-widest leading-none mb-0.5">
                                    {dayLabel}
                                </span>
                                {dateLabel && (
                                    <span className="block text-[9px] font-mono text-zinc-500 leading-none">
                                        {dateLabel}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => onSelectVersion(Math.min(versions.length - 1, activeVersionIndex + 1))}
                                disabled={activeVersionIndex === versions.length - 1}
                                className="p-1 hover:text-white text-zinc-500 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="h-4 w-px bg-zinc-800 mx-2" />

                        {/* Day Actions */}
                        <button onClick={onNew} className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors" title="Add Day">
                            <Plus size={14} />
                        </button>
                        <button onClick={onDuplicate} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="Duplicate Day">
                            <Copy size={12} />
                        </button>
                        <button onClick={onClear} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" title="Clear/Delete Day">
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}


                {/* --- STACK MODE (Legacy/Versions) --- */}
                {navMode === 'stack' && (
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowVersionMenu(!showVersionMenu)}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-white transition-colors"
                            >
                                <span>{title} {versions.length > 1 && `v.${versions.length - activeVersionIndex}`}</span>
                                {versions.length > 1 && <span className="text-[8px] transform scale-y-75">▼</span>}
                            </button>

                            {showVersionMenu && versions.length > 1 && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowVersionMenu(false)}
                                    />
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 shadow-xl rounded-sm py-1 z-20 flex flex-col">
                                        <div className="px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800 mb-1">
                                            Version History
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {versions.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        onSelectVersion(i);
                                                        setShowVersionMenu(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 transition-colors ${i === activeVersionIndex ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400'
                                                        }`}
                                                >
                                                    Version {versions.length - i}
                                                    {i === 0 && <span className="ml-2 text-[9px] text-zinc-400 font-normal">(Current)</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-4 w-px bg-zinc-800 mx-2" />

                        <button onClick={onNew} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">
                            New Version
                        </button>
                        <button onClick={onDuplicate} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">
                            Duplicate
                        </button>
                        <button onClick={onClear} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-red-500 transition-colors">
                            Clear
                        </button>
                    </div>
                )}

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {onToggleOrientation && (
                    <div className="flex bg-zinc-800 rounded-sm p-0.5 gap-0.5 print-hidden">
                        <button
                            onClick={() => onToggleOrientation('portrait')}
                            className={`p-1 rounded-sm transition-all ${orientation === 'portrait' ? 'bg-zinc-600 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Portrait (8.5 x 11)"
                        >
                            <RectangleVertical size={14} />
                        </button>
                        <button
                            onClick={() => onToggleOrientation('landscape')}
                            className={`p-1 rounded-sm transition-all ${orientation === 'landscape' ? 'bg-zinc-600 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Landscape (11 x 8.5)"
                        >
                            <RectangleHorizontal size={14} />
                        </button>
                    </div>
                )}

                <ImageExportButton
                    title={`${title} ${navMode === 'collection' ? dayLabel : 'v' + (versions.length - activeVersionIndex)}`}
                    onNewVersion={onNew}
                    nextVersionLabel={navMode === 'collection' ? "Add Day" : `V${versions.length + 1}`}
                    onExportPdf={onExportPdf}
                    isExportingPdf={isExportingPdf}
                />
            </div>
        </div >
    );
};
