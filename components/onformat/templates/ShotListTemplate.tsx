/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, FileInput, Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface Shot {
    id: string;
    scene: string;
    size: string; // e.g. Wide, Medium, Close Up
    angle: string; // e.g. Eye Level, Low Angle
    movement: string; // e.g. Static, Pan, Dolly
    description: string;
    status?: string;
    sourceId?: string; // Reference to AV Script row ID
}

interface ShotListData {
    shots: Shot[];
}

interface ShotListTemplateProps {
    data: Partial<ShotListData>;
    onUpdate: (data: Partial<ShotListData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
    isPrinting?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMagicImport?: (data: Record<string, any>) => void;
}

const SHOT_SIZES = ['Wide', 'Full', 'Medium', 'Cowboy', 'Close Up', 'Extreme CU'];
const SHOT_ANGLES = ['Eye Level', 'Low Angle', 'High Angle', 'Overhead', 'Dutch'];
const SHOT_MOVEMENTS = ['Static', 'Pan', 'Tilt', 'Tracking', 'Steadicam', 'Handheld', 'Zoom'];

export const ShotListTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting, onMagicImport }: ShotListTemplateProps) => {
    // Migration/Init
    useEffect(() => {
        if (!data.shots) {
            onUpdate({ shots: [] });
        } else {
            // Ensure IDs
            const shots = data.shots || [];
            let hasChanges = false;
            const newShots = shots.map((s, idx) => {
                if (!s.id) {
                    hasChanges = true;
                    return { ...s, id: `shot-${Date.now()}-${idx}` };
                }
                return s;
            });
            if (hasChanges) {
                onUpdate({ shots: newShots });
            }
        }
    }, [data.shots, onUpdate]);

    const { theme } = useTheme();
    const darkMode = theme === 'dark';

    const shots = data.shots || [];
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    const handleAddShot = () => {
        const newShot: Shot = {
            id: `shot-${Date.now()}`,
            scene: '',
            size: 'Wide',
            angle: 'Eye Level',
            movement: 'Static',
            description: ''
        };
        onUpdate({ shots: [...shots, newShot] });
    };

    const handleUpdateShot = (index: number, updates: Partial<Shot>) => {
        const newShots = [...shots];
        newShots[index] = { ...newShots[index], ...updates };
        onUpdate({ shots: newShots });
    };

    const handleDeleteShot = (index: number) => {
        const newShots = shots.filter((_, i) => i !== index);
        onUpdate({ shots: newShots });
        setDeleteConfirmIndex(null);
    };

    const handleImportAVScript = () => {
        if (!metadata?.importedAVScript?.rows) return;
        if (confirm(`Import ${metadata.importedAVScript.rows.length} scenes from AV Script?`)) {
            // "Magic" AI Path
            if (onMagicImport) {
                onMagicImport(metadata.importedAVScript);
                return;
            }

            // Legacy Path
            const importedRows = metadata.importedAVScript.rows;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newShots = importedRows.map((row: Record<string, any>, i: number) => ({
                id: `shot-import-${Date.now()}-${i}`,
                sourceId: row.id, // Track source for updates
                scene: row.scene || '',
                size: 'Wide', // Default start point
                angle: 'Eye Level',
                movement: 'Static',
                description: row.visual || ''
            }));
            onUpdate({ shots: [...shots, ...newShots] });
        }
    };

    // Auto-resize textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        handleUpdateShot(parseInt(e.target.dataset.index || '0'), { description: e.target.value });
    };

    const ITEMS_PER_PAGE = 12;
    const totalPages = Math.ceil(Math.max(shots.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => shots.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageShots, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Shot List"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-4 h-full flex flex-col">

                        {/* Table Header */}
                        <div className={`grid grid-cols-[30px_60px_100px_100px_100px_1fr_30px_30px] gap-2 border-b-2 pb-2 items-end ${darkMode ? 'border-zinc-800' : 'border-black'}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>#</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Scene</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Size</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Angle</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Movement</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Description</span>
                            <span className="text-center"><Check size={12} className={darkMode ? 'text-zinc-500 mx-auto' : 'text-zinc-300 mx-auto'} /></span>
                            <span className="px-1"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100/10 flex-1">
                            {pageShots.map((shot, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const isComplete = (shot.status || '').toLowerCase() === 'complete';
                                return (
                                    <div key={shot.id} className={`grid grid-cols-[30px_60px_100px_100px_100px_1fr_30px_30px] gap-2 py-2 items-start transition-colors group ${isComplete
                                        ? (darkMode ? 'bg-emerald-900/10' : 'bg-emerald-50/50')
                                        : (darkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-900/50')
                                        }`}>

                                        {/* Number */}
                                        <div className="flex items-start justify-center pt-1.5">
                                            <span className={`font-mono text-xs ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{(globalIdx + 1).toString().padStart(2, '0')}</span>
                                        </div>

                                        {/* Scene */}
                                        <div>
                                            {isPrinting ? (
                                                <div className={`w-full text-sm font-medium px-2 py-2 block ${darkMode ? 'text-zinc-300' : 'text-black dark:text-zinc-100'}`}>{shot.scene}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={shot.scene}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { scene: e.target.value })}
                                                    className={`w-full text-sm font-medium focus:outline-none border px-2 py-2 rounded-sm transition-colors bg-white border-zinc-200 text-black focus:border-zinc-400 focus:bg-white placeholder:text-zinc-300`}
                                                    placeholder="Sc #"
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {/* Size Dropdown */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className={`w-full text-[10px] uppercase font-bold tracking-wider px-2 py-2 block ${darkMode ? 'text-zinc-400' : 'text-black dark:text-zinc-100'}`}>{shot.size}</div>
                                            ) : (
                                                <select
                                                    value={shot.size}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { size: e.target.value })}
                                                    className={`w-full appearance-none text-[11px] uppercase font-bold tracking-wider px-2 py-2 rounded-sm cursor-pointer focus:outline-none border transition-colors bg-white border-zinc-200 text-black focus:border-zinc-400 focus:bg-white hover:bg-zinc-50`}
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_SIZES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Angle Dropdown */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className={`w-full text-[10px] uppercase font-bold tracking-wider px-2 py-2 block ${darkMode ? 'text-zinc-400' : 'text-black dark:text-zinc-100'}`}>{shot.angle}</div>
                                            ) : (
                                                <select
                                                    value={shot.angle}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { angle: e.target.value })}
                                                    className={`w-full appearance-none text-[11px] uppercase font-bold tracking-wider px-2 py-2 rounded-sm cursor-pointer focus:outline-none border transition-colors bg-white border-zinc-200 text-black focus:border-zinc-400 focus:bg-white hover:bg-zinc-50`}
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_ANGLES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Movement Dropdown */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className={`w-full text-[10px] uppercase font-bold tracking-wider px-2 py-2 block ${darkMode ? 'text-zinc-400' : 'text-black dark:text-zinc-100'}`}>{shot.movement}</div>
                                            ) : (
                                                <select
                                                    value={shot.movement}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { movement: e.target.value })}
                                                    className={`w-full appearance-none text-[11px] uppercase font-bold tracking-wider px-2 py-2 rounded-sm cursor-pointer focus:outline-none border transition-colors bg-white border-zinc-200 text-black focus:border-zinc-400 focus:bg-white hover:bg-zinc-50`}
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_MOVEMENTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            {isPrinting ? (
                                                <div className={`w-full text-sm leading-relaxed px-2 py-2 whitespace-pre-wrap block ${darkMode ? 'text-zinc-300' : 'text-black dark:text-zinc-100'}`}>{shot.description}</div>
                                            ) : (
                                                <textarea
                                                    data-index={globalIdx}
                                                    value={shot.description}
                                                    onChange={autoResize}
                                                    rows={1}
                                                    className={`w-full text-sm leading-relaxed focus:outline-none border rounded-sm px-2 py-2 resize-none overflow-hidden min-h-[34px] transition-colors bg-white border-zinc-200 text-black focus:border-zinc-400 focus:bg-white placeholder:text-zinc-300`}
                                                    placeholder="Describe the action..."
                                                    disabled={isLocked}
                                                    style={{ height: 'auto' }} // Initial reset
                                                />
                                            )}
                                        </div>

                                        {/* Status Toggle Checkbox */}
                                        <div className="flex justify-center pt-2 w-full">
                                            <button
                                                onClick={() => handleUpdateShot(globalIdx, { status: isComplete ? 'PENDING' : 'COMPLETE' })}
                                                disabled={isLocked}
                                                className={`w-[14px] h-[14px] rounded-sm border transition-colors flex items-center justify-center ${isComplete
                                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                                        : (darkMode ? 'border-zinc-700 hover:border-zinc-500 bg-black' : 'border-zinc-300 hover:border-zinc-400 bg-white dark:bg-zinc-950')
                                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {isComplete && <Check size={10} strokeWidth={3} />}
                                            </button>
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
                                        {!isLocked && !isPrinting && (
                                            <div className="relative flex justify-center w-full pt-1">
                                                <button
                                                    onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === globalIdx ? null : globalIdx)}
                                                    className={`hover:text-red-500 transition-opacity flex justify-center w-full ${deleteConfirmIndex === globalIdx ? 'opacity-100 text-red-500' : `opacity-0 group-hover:opacity-100 ${darkMode ? 'text-zinc-600' : 'text-zinc-300'}`}`}
                                                >
                                                    <Trash2 size={12} />
                                                </button>

                                                {deleteConfirmIndex === globalIdx && (
                                                    <div className={`absolute right-0 top-6 z-50 shadow-xl border p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'}`}>
                                                        <span className={`text-[10px] font-bold text-center uppercase tracking-widest ${darkMode ? 'text-zinc-300' : 'text-black dark:text-zinc-100'}`}>Remove?</span>
                                                        <button
                                                            onClick={() => handleDeleteShot(globalIdx)}
                                                            className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
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
                                )
                            })}

                            {/* Add Shot Button */}
                            {!isLocked && !isPrinting && (
                                <div className="pt-4 print-hidden">
                                    <button
                                        onClick={handleAddShot}
                                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-sm w-full transition-colors border ${darkMode
                                            ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                                            : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-white dark:bg-zinc-950 hover:text-black dark:text-zinc-100 dark:hover:text-zinc-100 hover:border-zinc-300'}`}
                                    >
                                        <Plus size={10} className="mr-1" /> Add Shot
                                    </button>

                                    {metadata?.importedAVScript?.rows && (
                                        <button
                                            onClick={handleImportAVScript}
                                            className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-500 transition-colors w-full mt-6"
                                        >
                                            <Sparkles size={12} className="animate-pulse" />
                                            Breakdown from AV Script
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Empty State */}
                            {shots.length === 0 && (
                                <div className={`text-center py-12 ${darkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                    <p className="text-xs font-bold uppercase tracking-widest">No shots added</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
