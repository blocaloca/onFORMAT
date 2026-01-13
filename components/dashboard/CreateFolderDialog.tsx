import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface CreateFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, type: string) => void;
}

export const CreateFolderDialog = ({ isOpen, onClose, onCreate }: CreateFolderDialogProps) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('General');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name, type);
            setName('');
            setType('General');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Subtle Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Industrial Panel */}
            <div className="relative bg-zinc-900 border border-zinc-700 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header Bar */}
                <div className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 p-3 select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
                            New Folder
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">
                                Directory Name
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ENTER FOLDER NAME..."
                                className="w-full p-3 bg-zinc-950 border border-zinc-800 text-sm font-bold text-white focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-zinc-600 rounded-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs font-bold text-zinc-300 focus:border-zinc-600 appearance-none rounded-sm outline-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Pitch">Pitch Projects</option>
                                    <option value="Active">Active Production</option>
                                    <option value="Archive">Archive</option>
                                    <option value="Personal">Personal</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    <FolderPlus size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 rounded-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="flex-[2] py-3 bg-emerald-500 text-black border border-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg rounded-sm"
                            >
                                Create Directory
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
