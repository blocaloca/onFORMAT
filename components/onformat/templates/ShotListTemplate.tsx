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
                        <div className={`grid grid-cols-[30px_50px_90px_90px_90px_1fr_30px] gap-2 border-b border-black pb-1.5 items-end mb-1`}>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-center text-zinc-400`}>#</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-zinc-400`}>Sc</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-zinc-400`}>Size</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-zinc-400`}>Angle</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-zinc-400`}>Move</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-2`}>Description</span>
                            <span className="text-center font-black text-[9px] text-zinc-400 uppercase tracking-widest">St</span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageShots.map((shot, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const isComplete = (shot.status || '').toLowerCase() === 'complete';
                                return (
                                    <div key={shot.id} className={`grid grid-cols-[30px_50px_90px_90px_90px_1fr_30px] gap-2 py-1 items-start transition-colors group ${isComplete ? 'bg-emerald-50/30' : 'bg-transparent hover:border-zinc-200 border border-transparent'}`}>

                                        {/* Number */}
                                        <div className="flex items-start justify-center pt-2">
                                            <span className={`font-mono text-[10px] font-bold text-zinc-400`}>{(globalIdx + 1).toString().padStart(2, '0')}</span>
                                        </div>

                                        {/* Scene */}
                                        <div className="pt-0.5">
                                            {isPrinting ? (
                                                <div className={`w-full text-xs font-black px-1 py-1 block text-black truncate`}>{shot.scene}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={shot.scene}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { scene: e.target.value })}
                                                    className={`w-full text-[11px] font-black focus:outline-none border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 px-1 py-1 transition-all bg-transparent text-zinc-900 placeholder:text-zinc-300`}
                                                    placeholder="Sc"
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {/* Size Dropdown */}
                                        <div className="pt-0.5">
                                            {isPrinting ? (
                                                <div className={`w-full text-[9px] uppercase font-bold tracking-tight px-1 py-1 block text-black`}>{shot.size}</div>
                                            ) : (
                                                <select
                                                    value={shot.size}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { size: e.target.value })}
                                                    className={`w-full appearance-none text-[10px] uppercase font-bold tracking-tight px-1 py-1 rounded-sm cursor-pointer focus:outline-none bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 transition-all text-zinc-700 dark:text-zinc-300`}
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_SIZES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Angle Dropdown */}
                                        <div className="pt-0.5">
                                            {isPrinting ? (
                                                <div className={`w-full text-[9px] uppercase font-bold tracking-tight px-1 py-1 block text-black`}>{shot.angle}</div>
                                            ) : (
                                                <select
                                                    value={shot.angle}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { angle: e.target.value })}
                                                    className={`w-full appearance-none text-[10px] uppercase font-bold tracking-tight px-1 py-1 rounded-sm cursor-pointer focus:outline-none bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 transition-all text-zinc-700`}
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_ANGLES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Movement Dropdown */}
                                        <div className="pt-0.5">
                                            {isPrinting ? (
                                                <div className={`w-full text-[9px] uppercase font-bold tracking-tight px-1 py-1 block text-black`}>{shot.movement}</div>
                                            ) : (
                                                <select
                                                    value={shot.movement}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { movement: e.target.value })}
                                                    className={`w-full appearance-none text-[10px] uppercase font-bold tracking-tight px-1 py-1 rounded-sm cursor-pointer focus:outline-none bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 transition-all text-zinc-700`}
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_MOVEMENTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="pt-0.5 relative group/desc">
                                            {isPrinting ? (
                                                <div className={`w-full text-[11px] leading-tight px-2 py-1 whitespace-pre-wrap block text-black`}>{shot.description}</div>
                                            ) : (
                                                <div className="flex items-start gap-2">
                                                    <textarea
                                                        data-index={globalIdx}
                                                        value={shot.description}
                                                        onChange={autoResize}
                                                        rows={1}
                                                        className={`flex-1 text-[11px] leading-tight focus:outline-none bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-emerald-500/50 px-2 py-1 resize-none overflow-hidden min-h-[24px] transition-all text-zinc-900 placeholder:text-zinc-300`}
                                                        placeholder="Describe action..."
                                                        disabled={isLocked}
                                                        style={{ height: 'auto' }}
                                                    />
                                                    
                                                    {/* Delete Button - Only in Hover */}
                                                    {!isLocked && (
                                                        <button
                                                            onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === globalIdx ? null : globalIdx)}
                                                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 mt-0.5 ${deleteConfirmIndex === globalIdx ? 'text-red-500 opacity-100' : 'text-zinc-300 hover:text-red-400'}`}
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    )}

                                                    {deleteConfirmIndex === globalIdx && (
                                                        <div className={`absolute right-0 top-8 z-50 shadow-xl border p-2 rounded-lg w-[100px] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100 bg-white border-zinc-200`}>
                                                            <button
                                                                onClick={() => handleDeleteShot(globalIdx)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-black py-1.5 px-2 rounded-md uppercase w-full transition-colors tracking-widest"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Toggle Checkbox */}
                                        <div className="flex justify-center pt-1.5 w-full">
                                            <button
                                                onClick={() => handleUpdateShot(globalIdx, { status: isComplete ? 'PENDING' : 'COMPLETE' })}
                                                disabled={isLocked}
                                                className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${isComplete
                                                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                                        : 'bg-zinc-100 text-zinc-300 border border-zinc-200'
                                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {isComplete && <Check size={10} strokeWidth={4} />}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Add Shot Button */}
                            {!isLocked && !isPrinting && (
                                <div className="pt-3 print-hidden">
                                    <button
                                        onClick={handleAddShot}
                                        className={`flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl w-[120px] transition-all border bg-transparent border-zinc-200 text-zinc-400 hover:bg-transparent hover:text-zinc-900 hover:border-zinc-300`}
                                    >
                                        <Plus size={10} /> Add Shot
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
                                <div className={`text-center py-12 text-zinc-300`}>
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
