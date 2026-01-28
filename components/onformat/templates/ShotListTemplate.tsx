import React, { useRef, useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, FileInput } from 'lucide-react';

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
    metadata?: any;
    isPrinting?: boolean;
    onMagicImport?: (data: any) => void;
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
    }, [data.shots]);

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
            const newShots = importedRows.map((row: any, i: number) => ({
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
                        <div className="grid grid-cols-[30px_60px_100px_100px_100px_1fr_30px] gap-2 border-b-2 border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">#</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scene</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Size</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Angle</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Movement</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="px-1"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageShots.map((shot, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                const isComplete = (shot.status || '').toLowerCase() === 'complete';
                                return (
                                    <div key={shot.id} className={`grid grid-cols-[30px_60px_100px_100px_100px_1fr_30px] gap-2 py-2 items-start transition-colors group ${isComplete ? 'bg-emerald-50/50' : 'hover:bg-zinc-50'}`}>

                                        {/* Number */}
                                        <div className="flex items-start justify-center pt-1.5">
                                            <span className="font-mono text-zinc-400 text-xs">{(globalIdx + 1).toString().padStart(2, '0')}</span>
                                        </div>

                                        {/* Scene */}
                                        <div>
                                            {isPrinting ? (
                                                <div className="w-full text-xs font-medium px-1 py-1 block">{shot.scene}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={shot.scene}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { scene: e.target.value })}
                                                    className="w-full bg-transparent text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1"
                                                    placeholder="Sc #"
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {/* Size Dropdown */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className="w-full text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 block">{shot.size}</div>
                                            ) : (
                                                <select
                                                    value={shot.size}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { size: e.target.value })}
                                                    className="w-full appearance-none bg-zinc-100 hover:bg-zinc-200 text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/10"
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_SIZES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Angle Dropdown */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className="w-full text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 block">{shot.angle}</div>
                                            ) : (
                                                <select
                                                    value={shot.angle}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { angle: e.target.value })}
                                                    className="w-full appearance-none bg-zinc-100 hover:bg-zinc-200 text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/10"
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_ANGLES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Movement Dropdown */}
                                        <div className="relative">
                                            {isPrinting ? (
                                                <div className="w-full text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 block">{shot.movement}</div>
                                            ) : (
                                                <select
                                                    value={shot.movement}
                                                    onChange={(e) => handleUpdateShot(globalIdx, { movement: e.target.value })}
                                                    className="w-full appearance-none bg-zinc-100 hover:bg-zinc-200 text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/10"
                                                    disabled={isLocked}
                                                >
                                                    {SHOT_MOVEMENTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            {isPrinting ? (
                                                <div className="w-full text-xs leading-relaxed px-1 py-1 whitespace-pre-wrap block">{shot.description}</div>
                                            ) : (
                                                <textarea
                                                    data-index={globalIdx}
                                                    value={shot.description}
                                                    onChange={autoResize}
                                                    rows={1}
                                                    className="w-full bg-transparent text-xs leading-relaxed focus:outline-none focus:bg-white focus:ring-1 focus:ring-black/10 rounded px-1 py-1 resize-none overflow-hidden min-h-[32px]"
                                                    placeholder="Describe the action..."
                                                    disabled={isLocked}
                                                    style={{ height: 'auto' }} // Initial reset
                                                />
                                            )}
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
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
                                                            onClick={() => handleDeleteShot(globalIdx)}
                                                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
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
                                <div className="pt-2 print-hidden">
                                    <button
                                        onClick={handleAddShot}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full"
                                    >
                                        <Plus size={10} className="mr-1" /> Add Shot
                                    </button>

                                    {metadata?.importedAVScript?.rows && (
                                        <button
                                            onClick={handleImportAVScript}
                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-2 rounded-sm w-full mt-1"
                                        >
                                            <FileInput size={10} className="mr-1" /> Import from AV Script
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Empty State */}
                            {shots.length === 0 && (
                                <div className="text-center py-12 text-zinc-300">
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
