import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface NewProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, client: string, producer: string, color: string) => void;
    mode?: 'create' | 'duplicate';
    initialData?: {
        name: string;
        client: string;
        producer: string;
        color?: string;
    };
}

export const PROJECT_COLORS = [
    { id: 'green', bg: 'bg-emerald-900', border: 'border-emerald-700', label: '#064e3b' },
    { id: 'purple', bg: 'bg-purple-900', border: 'border-purple-700', label: '#581c87' },
    { id: 'orange', bg: 'bg-orange-900', border: 'border-orange-700', label: '#7c2d12' },
    { id: 'blue', bg: 'bg-blue-900', border: 'border-blue-700', label: '#1e3a8a' },
    { id: 'red', bg: 'bg-red-900', border: 'border-red-700', label: '#7f1d1d' },
];

export const NewProjectDialog = ({ isOpen, onClose, onCreate, mode = 'create', initialData }: NewProjectDialogProps) => {
    const [name, setName] = useState('');
    const [client, setClient] = useState('');
    const [producer, setProducer] = useState('');
    const [selectedColor, setSelectedColor] = useState('green');

    useEffect(() => {
        if (isOpen) {
            if (mode === 'duplicate' && initialData) {
                setName(initialData.name);
                setClient(initialData.client);
                setProducer(initialData.producer);
                setSelectedColor(initialData.color || 'green');
            } else {
                setName('');
                setClient('');
                setProducer('');
                setSelectedColor('green');
            }
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), client.trim(), producer.trim(), selectedColor);
            setName('');
            setClient('');
            setProducer('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Dark Charcoal Panel */}
            <div className="relative bg-zinc-900 border border-zinc-700 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 rounded-sm">

                {/* Header Bar */}
                <div className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 p-4 select-none rounded-t-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
                            {mode === 'duplicate' ? 'Duplicate Project' : 'New Project'}
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
                                {mode === 'duplicate' ? 'New Project Designation' : 'Project Designation'} <span className="text-emerald-500">*</span>
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ENTER PROJECT NAME..."
                                className="w-full p-3 bg-zinc-950 border border-zinc-800 text-sm font-bold text-white focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-zinc-500 rounded-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">
                                    Client Identity
                                </label>
                                <input
                                    type="text"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    placeholder="CLIENT NAME..."
                                    className="w-full p-2 bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-300 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-500 rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">
                                    Producer
                                </label>
                                <input
                                    type="text"
                                    value={producer}
                                    onChange={(e) => setProducer(e.target.value)}
                                    placeholder="PRODUCER NAME..."
                                    className="w-full p-2 bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-300 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-500 rounded-sm"
                                />
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3 pt-2">
                            <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider block">
                                Project Color Signature
                            </label>
                            <div className="flex gap-3">
                                {PROJECT_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => setSelectedColor(color.id)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.bg} ${selectedColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                                    >
                                        {selectedColor === color.id && <Check size={12} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent rounded-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="flex-[2] py-3 bg-emerald-900 text-emerald-100 border border-emerald-800 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg rounded-sm"
                            >
                                {mode === 'duplicate' ? 'Duplicate Project' : 'Initialize Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
