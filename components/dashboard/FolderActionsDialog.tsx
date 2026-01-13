import React from 'react';
import { X, Trash2, FolderOpen, Archive } from 'lucide-react';

interface FolderActionsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    folderName: string;
    onDeleteOnly: () => void;
    onDeleteAll: () => void;
    onArchive: () => void;
    isArchived?: boolean;
    onUnarchive?: () => void;
}

export const FolderActionsDialog = ({ isOpen, onClose, folderName, onDeleteOnly, onDeleteAll, onArchive, isArchived, onUnarchive }: FolderActionsDialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Subtle Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-100/60 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Industrial Panel */}
            <div className="relative bg-white border border-black w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header Bar */}
                <div className="flex justify-between items-center bg-zinc-50 border-b border-black p-3 select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-industrial-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
                            System // Folder Operations
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-black transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-zinc-50/30">
                    <div className="mb-6 text-center">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold block mb-1">Target Directory</span>
                        <div className="text-lg font-black uppercase tracking-tighter">{folderName}</div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onDeleteOnly}
                            className="w-full flex items-center gap-4 p-4 text-left bg-white border border-zinc-200 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all group"
                        >
                            <div className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors">
                                <FolderOpen size={16} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Decouple Folder</h3>
                                <p className="text-[9px] text-zinc-400 mt-0.5">Delete folder only. Projects move to general pool.</p>
                            </div>
                        </button>

                        {isArchived ? (
                            <button
                                onClick={onUnarchive}
                                className="w-full flex items-center gap-4 p-4 text-left bg-white border border-zinc-200 hover:border-industrial-accent hover:shadow-[4px_4px_0px_0px_rgba(204,255,0,0.4)] transition-all group"
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 group-hover:bg-industrial-accent group-hover:text-black transition-colors">
                                    <Archive size={16} className="rotate-180" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Restore Directory</h3>
                                    <p className="text-[9px] text-zinc-400 mt-0.5">Re-activate folder and make visible.</p>
                                </div>
                            </button>
                        ) : (
                            <button
                                onClick={onArchive}
                                className="w-full flex items-center gap-4 p-4 text-left bg-white border border-zinc-200 hover:border-industrial-accent hover:shadow-[4px_4px_0px_0px_rgba(204,255,0,0.4)] transition-all group"
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 group-hover:bg-industrial-accent group-hover:text-black transition-colors">
                                    <Archive size={16} />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Archive Directory</h3>
                                    <p className="text-[9px] text-zinc-400 mt-0.5">Move to archive. Hide from main view.</p>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={onDeleteAll}
                            className="w-full flex items-center gap-4 p-4 text-left bg-white border border-red-200 hover:border-red-500 hover:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)] transition-all group mt-6"
                        >
                            <div className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <Trash2 size={16} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600">Delete All Data</h3>
                                <p className="text-[9px] text-red-300 mt-0.5">Permanently destroy folder AND all projects.</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
