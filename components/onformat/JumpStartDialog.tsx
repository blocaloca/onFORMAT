import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Circle } from 'lucide-react';

interface JumpStartDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (selectedDocs: string[]) => void;
    isProcessing: boolean;
    progress: string;
}

const AVAILABLE_DOCS = [
    { id: 'directors-treatment', label: "Director's Treatment", desc: "Script breakdown and visual approach" },
    { id: 'shot-scene-book', label: "Shot & Scene Book", desc: "Key visual beats and shot list" },
    { id: 'crew-list', label: "Crew List", desc: "Standard crew requirements" },
    { id: 'schedule', label: "Preliminary Schedule", desc: "Day-by-day shooting plan" },
    { id: 'budget', label: "Budget structure", desc: "Resource allocation outline" }
];

export const JumpStartDialog = ({ isOpen, onClose, onStart, isProcessing, progress }: JumpStartDialogProps) => {
    const [selected, setSelected] = useState<string[]>(['directors-treatment', 'crew-list', 'schedule']);

    if (!isOpen) return null;

    const toggleSelection = (id: string) => {
        if (isProcessing) return;
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={!isProcessing ? onClose : undefined}
            />

            {/* Dialog Panel */}
            <div className="relative bg-[#121212] border border-zinc-800 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center bg-zinc-900/50 border-b border-zinc-800 p-6 select-none">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 font-mono">
                            {isProcessing ? 'Jump Start In Progress' : 'Project Jump Start'}
                        </span>
                    </div>
                    {!isProcessing && (
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {!isProcessing ? (
                        <>
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                Select the documents you want to <strong>prefill</strong> based on the Creative Brief. The AI will analyze your intent and generate starting drafts for each.
                            </p>

                            <div className="space-y-3 mb-8">
                                {AVAILABLE_DOCS.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => toggleSelection(doc.id)}
                                        className={`w-full flex items-start gap-4 p-4 text-left border rounded-sm transition-all duration-200 group
                                            ${selected.includes(doc.id)
                                                ? 'bg-zinc-900 border-zinc-700'
                                                : 'bg-transparent border-transparent hover:bg-zinc-900/50'
                                            }`}
                                    >
                                        <div className={`mt-0.5 ${selected.includes(doc.id) ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                                            {selected.includes(doc.id) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold uppercase tracking-wide mb-1 transition-colors ${selected.includes(doc.id) ? 'text-white' : 'text-zinc-500'}`}>
                                                {doc.label}
                                            </div>
                                            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                                                {doc.desc}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => onStart(selected)}
                                disabled={selected.length === 0}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Sparkles size={14} />
                                Start Production (Prefill)
                            </button>
                        </>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden mb-8">
                                <div className="h-full bg-emerald-500 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '50%' }} />
                            </div>

                            <h3 className="text-xl font-light text-white mb-2 animate-pulse">
                                Analyzing Brief...
                            </h3>
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                                {progress || "Initializing..."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};
