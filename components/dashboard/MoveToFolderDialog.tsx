import React from 'react';
import { FolderInput, X } from 'lucide-react';

interface Folder {
    id: string;
    name: string;
    type: string;
}

interface MoveToFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    folders: Folder[];
    onMove: (folderId: string) => void;
    projectName: string;
}

export const MoveToFolderDialog = ({ isOpen, onClose, folders, onMove, projectName }: MoveToFolderDialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Subtle Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Industrial Panel */}
            <div className="relative bg-[#121212] border border-zinc-800 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header Bar */}
                <div className="flex justify-between items-center bg-zinc-900/50 border-b border-zinc-800 p-4 select-none">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 font-mono">
                            Move to Folder
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="">
                    <div className="p-4 border-b border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Target Project</span>
                        <div className="text-sm font-black uppercase tracking-tight truncate text-white">{projectName}</div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                        {folders.length === 0 ? (
                            <div className="p-6 text-center borderBorder border-dashed border-zinc-800 text-[10px] text-zinc-600 uppercase tracking-widest">
                                No Directories Available
                            </div>
                        ) : (
                            folders.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => { onMove(f.id); onClose(); }}
                                    className="w-full text-left px-3 py-3 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent rounded-sm flex items-center gap-3 transition-all group"
                                >
                                    <FolderInput size={14} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                    {f.name}
                                    <span className="ml-auto text-[9px] uppercase tracking-widest opacity-30">{f.type}</span>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
                        <button
                            onClick={() => { onMove(''); onClose(); }}
                            className="w-full text-center py-2 text-[10px] uppercase font-bold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors rounded-sm border border-transparent hover:border-zinc-700"
                        >
                            Remove from Folder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
