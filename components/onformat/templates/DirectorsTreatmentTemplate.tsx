import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Plus, Trash2, Layout, Type, Image as LucideImage, Columns, ChevronDown } from 'lucide-react';

// --- 1. New Types ---
export type TreatmentCategory =
    | 'Introduction/Vision'
    | 'Story/Narrative'
    | 'Characters/Casting'
    | 'Production Design'
    | 'Cinematography/Editing';

export type TreatmentLayout = 'Text' | 'Image' | 'Split';

export interface TreatmentSlide {
    id: string;
    category: TreatmentCategory;
    layout: TreatmentLayout;
    title: string; // The header/label
    content: string; // Main text
    modules: {
        image1?: string;
        caption1?: string;
        image2?: string;
        caption2?: string;
    }
}

// --- 2. Updated Data Interface ---
interface DirectorsTreatmentData {
    slides: TreatmentSlide[];
    // Legacy fields (kept for safety during migration, but we will migrate them to slides)
    scenes?: any[];
    approach?: string;
    tone?: string;
    narrativeArc?: string;
}

interface DirectorsTreatmentTemplateProps {
    data: Partial<DirectorsTreatmentData>;
    onUpdate?: (d: Partial<DirectorsTreatmentData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const DirectorsTreatmentTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: DirectorsTreatmentTemplateProps) => {

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // --- 3. Migration Logic (Legacy -> Slides) ---
    useEffect(() => {
        // Safe-guard: If we already have slides, do absolutely nothing.
        // This prevents overwriting valid data.
        if (data.slides && data.slides.length > 0) return;

        // If we have legacy scenes but no slides, migrate them.
        if (data.scenes && data.scenes.length > 0) {
            const migratedSlides: TreatmentSlide[] = data.scenes.map((scene: any) => ({
                id: scene.id,
                category: scene.type === 'Narrative' ? 'Story/Narrative' : 'Cinematography/Editing', // Rough mapping
                layout: 'Split', // Default to split to match old look
                title: scene.description || 'Treatment Note',
                content: scene.content || '',
                modules: {
                    image1: scene.image,
                    image2: scene.image2
                }
            }));

            // Also migrate the "Top Level" fields (Approach, Tone) into an Intro slide if they exist
            if (data.approach || data.tone) {
                const introSlide: TreatmentSlide = {
                    id: 'intro-slide-migration',
                    category: 'Introduction/Vision',
                    layout: 'Text',
                    title: 'Executive Summary',
                    content: `APPROACH:\n${data.approach || ''}\n\nTONE:\n${data.tone || ''}\n\nNARRATIVE:\n${data.narrativeArc || ''}`,
                    modules: {}
                };
                migratedSlides.unshift(introSlide);
            }

            onUpdate?.({ slides: migratedSlides });
        }
    }, [data.scenes, data.slides]); // Re-run if data loads asynchronously

    const updateSlides = (newSlides: TreatmentSlide[]) => {
        onUpdate?.({ ...data, slides: newSlides });
    };

    const slides = data.slides || [];
    const [showAddMenu, setShowAddMenu] = useState(false);

    // --- CRUD Handlers ---
    const updateSlide = (id: string, partial: Partial<TreatmentSlide> | any) => {
        // Deep merge module updates if needed, simple for now
        const newSlides = slides.map(s => {
            if (s.id === id) {
                // Special handling for modules merge if partial has modules
                if ((partial as any).modules) {
                    return { ...s, ...partial, modules: { ...s.modules, ...(partial as any).modules } };
                }
                return { ...s, ...partial };
            }
            return s;
        });
        updateSlides(newSlides);
    };

    const addSlide = (category: TreatmentCategory = 'Story/Narrative') => {
        let defaultLayout: TreatmentLayout = 'Split';
        if (category === 'Introduction/Vision' || category === 'Story/Narrative') defaultLayout = 'Text';
        if (category === 'Production Design' || category === 'Cinematography/Editing') defaultLayout = 'Image';
        if (category === 'Characters/Casting') defaultLayout = 'Split';

        const newSlide: TreatmentSlide = {
            id: `slide-${Date.now()}`,
            category: category,
            layout: defaultLayout,
            title: category.split('/')[0],
            content: '',
            modules: { image1: '', image2: '' }
        };
        updateSlides([...slides, newSlide]);
        setShowAddMenu(false);
    };

    const removeSlide = (id: string) => {
        updateSlides(slides.filter(s => s.id !== id));
        setDeleteConfirmId(null);
    };

    // --- Render Helpers ---

    const renderLayoutControls = (slide: TreatmentSlide) => {
        if (isPrinting || plain || isLocked) return null;
        return (
            <div className="absolute top-0 right-0 flex items-center gap-1 bg-white border border-zinc-200 p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button title="Text Layout" onClick={() => updateSlide(slide.id, { layout: 'Text' })} className={`p-1 rounded hover:bg-zinc-100 ${slide.layout === 'Text' ? 'text-black' : 'text-zinc-400'}`}><Type size={14} /></button>
                <button title="Split Layout" onClick={() => updateSlide(slide.id, { layout: 'Split' })} className={`p-1 rounded hover:bg-zinc-100 ${slide.layout === 'Split' ? 'text-black' : 'text-zinc-400'}`}><Columns size={14} /></button>
                <button title="Image Layout" onClick={() => updateSlide(slide.id, { layout: 'Image' })} className={`p-1 rounded hover:bg-zinc-100 ${slide.layout === 'Image' ? 'text-black' : 'text-zinc-400'}`}><LucideImage size={14} /></button>
            </div>
        );
    };

    const renderSlideContent = (slide: TreatmentSlide) => {
        // Shared Title Input
        const TitleBlock = (
            <div className="mb-4">
                <input
                    className="w-full bg-transparent text-xl font-black uppercase tracking-tight outline-none placeholder-zinc-300"
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                    placeholder="SLIDE TITLE"
                    readOnly={isLocked || isPrinting}
                />
                <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-2">{slide.category}</div>
                <div className="w-full h-px bg-zinc-200" />
            </div>
        );

        // 1. Text Layout
        if (slide.layout === 'Text') {
            return (
                <div className="flex flex-col h-full relative group">
                    {TitleBlock}
                    {renderLayoutControls(slide)}
                    <textarea
                        className="w-full h-full bg-transparent text-lg leading-relaxed outline-none resize-none placeholder-zinc-200 font-serif whitespace-pre-wrap"
                        value={slide.content}
                        onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                        placeholder="Write your narrative here..."
                        readOnly={isLocked || isPrinting}
                    />
                </div>
            );
        }

        // 2. Image Layout (Hero)
        if (slide.layout === 'Image') {
            return (
                <div className="flex flex-col h-full relative group">
                    {TitleBlock}
                    {renderLayoutControls(slide)}
                    <div className="flex-1 bg-zinc-50 border border-dashed border-zinc-200 relative min-h-0">
                        <ImageUploader
                            currentUrl={slide.modules.image1 || ''}
                            onUpload={(url) => updateSlide(slide.id, { modules: { image1: url } })}
                            className="w-full h-full object-contain bg-black"
                        />
                    </div>
                    <div className="mt-4 h-24 shrink-0">
                        <textarea
                            className="w-full h-full bg-transparent text-sm leading-relaxed outline-none resize-none placeholder-zinc-300 font-sans"
                            value={slide.content}
                            onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                            placeholder="Add a caption or brief description..."
                            readOnly={isLocked || isPrinting}
                        />
                    </div>
                </div>
            );
        }

        // 3. Split Layout (Default / Classic)
        return (
            <div className="flex flex-col h-full relative group gap-4">
                {TitleBlock}
                {renderLayoutControls(slide)}
                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Left: Images */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex-1 bg-zinc-50 border border-dashed border-zinc-200 relative">
                            <ImageUploader
                                currentUrl={slide.modules.image1 || ''}
                                onUpload={(url) => updateSlide(slide.id, { modules: { image1: url } })}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 bg-zinc-50 border border-dashed border-zinc-200 relative">
                            <ImageUploader
                                currentUrl={slide.modules.image2 || ''}
                                onUpload={(url) => updateSlide(slide.id, { modules: { image2: url } })}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    {/* Right: Text */}
                    <div className="h-full">
                        <textarea
                            className="w-full h-full bg-transparent text-sm leading-relaxed outline-none resize-none placeholder-zinc-300 font-sans whitespace-pre-wrap"
                            value={slide.content}
                            onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                            placeholder="Describe the visual approach, key beat, or character note..."
                            readOnly={isLocked || isPrinting}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {slides.map((slide, index) => (
                <DocumentLayout
                    key={slide.id}
                    title="Treatment"
                    subtitle={`Page ${index + 1}`}
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="h-full relative">
                        {renderSlideContent(slide)}

                        {/* Slide Controls (Delete) */}
                        {!isLocked && !isPrinting && !plain && (
                            <div className="absolute top-0 right-0 mt-0 mr-0">
                                <button
                                    onClick={() => setDeleteConfirmId(deleteConfirmId === slide.id ? null : slide.id)}
                                    className="text-zinc-300 hover:text-red-500 transition-colors p-2"
                                >
                                    <Trash2 size={14} />
                                </button>
                                {deleteConfirmId === slide.id && (
                                    <div className="absolute right-0 top-8 z-50 bg-white shadow-xl border border-zinc-200 p-2 rounded w-32 animate-in fade-in zoom-in-95">
                                        <button
                                            onClick={() => removeSlide(slide.id)}
                                            className="w-full bg-red-500 text-white text-[10px] font-bold py-2 rounded mb-1"
                                        >
                                            CONFIRM DELETE
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="w-full bg-zinc-100 text-black text-[10px] font-bold py-2 rounded"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}

            {/* Empty State / Add Slide Menu */}
            {!plain && !isPrinting && !isLocked && (
                <div className="max-w-md mx-auto py-12 text-center print-hidden relative">
                    {!showAddMenu ? (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setShowAddMenu(true)}
                                className="flex items-center justify-center gap-2 w-full border border-dashed border-zinc-300 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black transition-all rounded-sm group"
                            >
                                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                <span>Add New Slide</span>
                            </button>
                            <p className="text-[10px] text-zinc-400 font-mono">
                                Add a new page to your Treatment Deck.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white border border-zinc-200 shadow-xl rounded-lg p-2 animate-in fade-in zoom-in-95">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-2 pt-2">Choose Page Type</div>
                            <div className="grid grid-cols-1 gap-1">
                                {['Introduction/Vision', 'Story/Narrative', 'Characters/Casting', 'Production Design', 'Cinematography/Editing'].map((cat: any) => (
                                    <button
                                        key={cat}
                                        onClick={() => addSlide(cat)}
                                        className="text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-600 hover:bg-zinc-100 hover:text-black rounded transition-colors"
                                    >
                                        {cat.split('/')[0]}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-zinc-100 mt-2 pt-2">
                                <button onClick={() => setShowAddMenu(false)} className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
