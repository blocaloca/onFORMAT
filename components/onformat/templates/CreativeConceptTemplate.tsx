/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
import React, { useEffect } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Sparkles, Plus, ArrowRight, Trash2 } from 'lucide-react';

interface VisionPage {
    id: string;
    content: string;
}

interface CreativeConceptData {
    pages: VisionPage[];
    activePageId?: string;
    // Legacy support
    visions?: any[];
    chatHistory?: any[];
}

interface CreativeConceptTemplateProps {
    data: Partial<CreativeConceptData>;
    onUpdate: (data: Partial<CreativeConceptData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    onGenerateFromVision?: (targetTool: string, visionText: string, promptPrefix: string) => void;
    onOpenAi?: () => void;
    isPrinting?: boolean;
}

export const CreativeConceptTemplate = ({
    data,
    onUpdate,
    isLocked = false,
    plain,
    orientation,
    metadata,
    onGenerateFromVision,
    onOpenAi,
    isPrinting
}: CreativeConceptTemplateProps) => {

    useEffect(() => {
        // Migration: Ensure at least one page exists
        if (!data.pages || data.pages.length === 0) {
            onUpdate({ pages: [{ id: `page-${Date.now()}`, content: '' }] });
        }
    }, []);

    const pages = data.pages || [];

    const handleUpdatePage = (id: string, content: string) => {
        const updated = pages.map(p => p.id === id ? { ...p, content } : p);
        onUpdate({ pages: updated });
    };

    const handleAddPage = () => {
        const newPage: VisionPage = {
            id: `page-${Date.now()}`,
            content: ''
        };
        onUpdate({ pages: [...pages, newPage] });
    };

    return (
        <div className="space-y-12 pb-20">
            {pages.map((page, index) => (
                <DocumentLayout
                    key={page.id}
                    title="AI VISION LAB"
                    subtitle={index === 0 ? "ARCHITECTURAL DRAFT" : `EXPANSION PAGE ${index + 1}`}
                    hideHeader={index > 0}
                    plain={plain}
                    orientation={orientation}
                    metadata={index === 0 ? metadata : undefined}
                >
                    <div className="flex flex-col h-full font-sans relative group min-h-[600px]">
                        
                        {/* Lab Design Accents */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-50" />
                        
                        {index > 0 && (
                            <div className="mb-6 px-6 py-2 border-l border-zinc-200">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                    Laboratory Continuation / {index + 1}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col bg-white rounded-lg p-1 border border-zinc-200 shadow-inner group-hover:border-zinc-300 transition-all duration-300">
                            <textarea
                                value={page.content}
                                onChange={(e) => handleUpdatePage(page.id, e.target.value)}
                                placeholder={index === 0 ? "// Architect your vision here... \n// Paste conceptual seeds from the AI Strategist and refine them into your North Star." : "Continue the architectural blueprint..."}
                                className={`flex-1 w-full bg-white resize-none outline-none text-sm leading-relaxed p-8 rounded-md transition-all font-mono tracking-tight text-black placeholder:text-zinc-400 focus:bg-white`}
                                disabled={isLocked}
                                spellCheck={false}
                            />
                        </div>

                        {/* Lab Footer / Manual Handoff Hints */}
                        {!isLocked && (
                            <div className="mt-8 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                                        Creative Hub / Non-Destructive Drafting
                                    </span>
                                </div>

                                {index === pages.length - 1 && (
                                    <button
                                        onClick={handleAddPage}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-blue-500 py-2 transition-all"
                                    >
                                        <Plus size={12} /> Extend Blueprint
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Print Version */}
                        <div className="hidden print:block text-sm leading-relaxed p-8 whitespace-pre-wrap font-mono text-black">
                            {page.content || "—"}
                        </div>
                    </div>
                </DocumentLayout>
            ))}
        </div>
    );
};

