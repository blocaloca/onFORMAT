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
        // Migration: Convert legacy 'visions' to 'pages'
        if (data.visions && !data.pages) {
            const migrated = data.visions.map((v: any) => ({
                id: v.id,
                content: v.title ? `## ${v.title}\n\n${v.content}` : v.content
            }));
            onUpdate({
                pages: migrated.length > 0 ? migrated : [{ id: `page-${Date.now()}`, content: '' }],
                visions: undefined
            });
        } else if (!data.pages) {
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

    const handleDeletePage = (id: string) => {
        if (confirm('Delete this page?')) {
            onUpdate({ pages: pages.filter(p => p.id !== id) });
        }
    };

    const handleAction = (page: VisionPage, action: string) => {
        if (action === 'workshop') {
            onUpdate({ activePageId: page.id });
            if (onOpenAi) onOpenAi();
        } else if (action === 'brief' && onGenerateFromVision) {
            if (onOpenAi) onOpenAi();
            // "Creative brief becomes the single source of truth"
            onGenerateFromVision('brief', page.content, "Create a creative brief based on this vision");
        }
    };

    return (
        <>
            {pages.map((page, index) => (
                <DocumentLayout
                    key={page.id}
                    title="Project Vision"
                    subtitle={index === 0 ? "CONCEPT DRAFT" : `PAGE ${index + 1}`}
                    hideHeader={index > 0}
                    plain={plain}
                    orientation={orientation}
                    metadata={index === 0 ? metadata : undefined}
                >
                    <div className="flex flex-col h-full font-sans relative group">

                        {/* Page Header (Cont.) */}
                        {index > 0 && (
                            <div className="mb-4 text-center text-sm font-bold text-zinc-500">
                                Project Vision (Cont. Page {index + 1})
                            </div>
                        )}

                        {/* Controls (Delete Page) */}
                        {!isLocked && pages.length > 1 && (
                            <button
                                onClick={() => handleDeletePage(page.id)}
                                className="absolute top-0 right-0 p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Delete Page"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}

                        {/* Main Text Area */}
                        <textarea
                            value={page.content}
                            onChange={(e) => handleUpdatePage(page.id, e.target.value)}
                            placeholder={index === 0 ? "Start writing your project vision here..." : "Continue writing..."}
                            className={`flex-1 w-full bg-zinc-50/30 resize-none outline-none text-sm leading-relaxed p-6 border border-transparent focus:border-zinc-200 focus:bg-white rounded-sm transition-colors ${isPrinting ? 'hidden' : 'print:hidden'}`}
                            disabled={isLocked}
                        />
                        <div className={`${isPrinting ? 'block' : 'hidden print:block'} flex-1 w-full text-sm leading-relaxed p-6 whitespace-pre-wrap break-words text-black bg-zinc-50 border border-transparent rounded-sm`}>
                            {page.content || "—"}
                        </div>

                        {/* Footer Actions */}
                        {!isLocked && (
                            <div className="border-t border-zinc-100 pt-4 mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => handleAction(page, 'workshop')}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-industrial-accent transition-colors"
                                >
                                    <Sparkles size={12} />
                                    Workshop with AI
                                </button>

                                <button
                                    onClick={() => handleAction(page, 'brief')}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-100 px-3 py-2 rounded transition-colors"
                                >
                                    Create Brief <ArrowRight size={12} />
                                </button>
                            </div>
                        )}

                        {/* Add Page Button - Rendered OUTSIDE content flow if possible, or at bottom */}
                        {/* We put it inside but separate from text area */}
                        {index === pages.length - 1 && !isLocked && (
                            <div className="mt-4 flex justify-center print:hidden">
                                <button
                                    onClick={handleAddPage}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:text-black border border-dashed border-zinc-200 hover:border-black px-4 py-2 rounded-sm transition-all"
                                >
                                    <Plus size={12} /> Add Page
                                </button>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};

