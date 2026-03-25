/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
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

    // --- 3. Migration Logic (Legacy -> Slides) - ON THE FLY for Read-Only Contexts ---
    const activeSlides = React.useMemo(() => {
        // 1. If we have modern slides, use them.
        if (data.slides && data.slides.length > 0) return data.slides;

        // 2. If valid legacy scenes exist, migrate them in-memory.
        if (data.scenes && data.scenes.length > 0) {
            const migrated: TreatmentSlide[] = data.scenes.map((scene: any) => ({
                id: scene.id,
                category: scene.type === 'Visual' ? 'Cinematography/Editing' : 'Story/Narrative',
                layout: 'Image', // Force 'Hero' layout (One Image, One Text) as requested
                title: scene.description || 'Treatment Note',
                content: scene.content || '',
                modules: {
                    image1: scene.image || scene.img || scene.url || '',
                    image2: scene.image2 || ''
                }
            }));

            /* 
            // Intro Slide disabled per user request ("Keep the one image, one text box")
            if (data.approach || data.tone) {
                migrated.unshift({ ... });
            }
            */
            return migrated;
        }

        return [];
    }, [data.slides, data.scenes, data.approach, data.tone, data.narrativeArc]);

    // Keep the useEffect for PERSISTENCE when editable
    useEffect(() => {
        if (!onUpdate || (data.slides && data.slides.length > 0)) return;
        if (activeSlides.length > 0) {
            onUpdate({ slides: activeSlides });
        }
    }, [activeSlides, data.slides, onUpdate]);

    const updateSlides = (newSlides: TreatmentSlide[]) => {
        onUpdate?.({ ...data, slides: newSlides });
    };

    const slides = activeSlides;
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

    const addSlide = () => {
        const newSlide: TreatmentSlide = {
            id: `slide-${Date.now()}`,
            category: 'Treatment Note' as any, // Using generic category or just ignore going forward
            layout: 'Image', // Force to 16x9 Image + Text Layout
            title: 'New Treatment Note',
            content: '',
            modules: { image1: '', image2: '' }
        };
        updateSlides([...slides, newSlide]);
    };

    const removeSlide = (id: string) => {
        updateSlides(slides.filter(s => s.id !== id));
        setDeleteConfirmId(null);
    };

    // --- Render Helpers ---

    const renderLayoutControls = (slide: TreatmentSlide) => {
        // Layout controls removed to simplify to one uniform 16x9 option.
        return null;
    };

    const renderSlideContent = (slide: TreatmentSlide) => {
        const TitleBlock = (
            <div className="mb-4">
                {isPrinting ? (
                    <div className="w-full text-xl font-black uppercase tracking-normal text-black bg-transparent">
                        {slide.title}
                    </div>
                ) : (
                    <input
                        className="w-full bg-white rounded-sm border-zinc-200 border text-xl font-black uppercase tracking-normal outline-none placeholder-zinc-300 text-zinc-900"
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                        placeholder="SLIDE TITLE"
                        readOnly={isLocked}
                    />
                )}
                {isPrinting ? (
                    <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-2">
                        {slide.category || 'Treatment Note'}
                    </div>
                ) : (
                    <input
                        className="w-full bg-white rounded-sm border-zinc-200 border text-[10px] uppercase tracking-widest text-emerald-600 font-bold outline-none placeholder-emerald-300/50 mb-2 text-zinc-900"
                        value={slide.category}
                        onChange={(e) => updateSlide(slide.id, { category: e.target.value })}
                        placeholder="TYPE OF TREATMENT (E.G. CINEMATOGRAPHY, WARDROBE)"
                        readOnly={isLocked}
                    />
                )}
                <div className="w-full h-px bg-zinc-200" />
            </div>
        );

        // 1. Text Layout
        if (slide.layout === 'Text') {
            return (
                <div className="flex flex-col h-full relative group">
                    {TitleBlock}
                    {renderLayoutControls(slide)}
                    {isPrinting ? (
                        <div className="w-full h-full bg-transparent text-lg leading-relaxed font-serif whitespace-pre-wrap text-black">
                            {slide.content}
                        </div>
                    ) : (
                        <textarea
                            className="w-full h-full bg-white rounded-sm border-zinc-200 border text-lg leading-relaxed outline-none resize-none placeholder-zinc-200 font-serif whitespace-pre-wrap text-zinc-900"
                            value={slide.content}
                            onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                            placeholder="Write your narrative here..."
                            readOnly={isLocked}
                        />
                    )}
                </div>
            );
        }

        // 2. Image Layout (Hero)
        if (slide.layout === 'Image') {
            return (
                <div className="flex flex-col h-full relative group">
                    {TitleBlock}
                    {renderLayoutControls(slide)}
                    <div className="w-full aspect-video bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 relative print:border-none print:bg-white overflow-hidden shrink-0">
                        {isPrinting ? (
                            <img
                                src={slide.modules.image1 || ''}
                                className="w-full h-full object-cover"
                                alt="Slide Hero Visual"
                            />
                        ) : (
                            <ImageUploader
                                currentUrl={slide.modules.image1 || ''}
                                onUpload={(url) => updateSlide(slide.id, { modules: { image1: url } })}
                                className="w-full h-full object-cover bg-black print:bg-transparent"
                            />
                        )}
                    </div>
                    <div className="mt-4 flex-1">
                        {isPrinting ? (
                            <div className="w-full h-full bg-transparent text-sm leading-relaxed font-sans whitespace-pre-wrap text-black">
                                {slide.content}
                            </div>
                        ) : (
                            <textarea
                                className="w-full h-full bg-white rounded-sm border-zinc-200 border text-sm leading-relaxed outline-none resize-none placeholder-zinc-300 font-sans text-zinc-900"
                                value={slide.content}
                                onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                                placeholder="Add a caption or brief description..."
                                readOnly={isLocked}
                            />
                        )}
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
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 relative print:border-none print:bg-white overflow-hidden">
                            {isPrinting ? (
                                <img
                                    src={slide.modules.image1 || ''}
                                    className="w-full h-full object-cover"
                                    alt="Slide Visual 1"
                                />
                            ) : (
                                <ImageUploader
                                    currentUrl={slide.modules.image1 || ''}
                                    onUpload={(url) => updateSlide(slide.id, { modules: { image1: url } })}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 relative print:border-none print:bg-white overflow-hidden">
                            {isPrinting ? (
                                <img
                                    src={slide.modules.image2 || ''}
                                    className="w-full h-full object-cover"
                                    alt="Slide Visual 2"
                                />
                            ) : (
                                <ImageUploader
                                    currentUrl={slide.modules.image2 || ''}
                                    onUpload={(url) => updateSlide(slide.id, { modules: { image2: url } })}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                    {/* Right: Text */}
                    <div className="h-full">
                        {isPrinting ? (
                            <div className="w-full h-full bg-transparent text-sm leading-relaxed font-sans whitespace-pre-wrap text-black">
                                {slide.content}
                            </div>
                        ) : (
                            <textarea
                                className="w-full h-full bg-white rounded-sm border-zinc-200 border text-sm leading-relaxed outline-none resize-none placeholder-zinc-300 font-sans whitespace-pre-wrap text-zinc-900"
                                value={slide.content}
                                onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                                placeholder="Describe the visual approach, key beat, or character note..."
                                readOnly={isLocked}
                            />
                        )}
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
                                            className="w-full bg-zinc-100 dark:bg-zinc-900 text-black text-[11px] font-bold py-2 rounded"
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
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => addSlide()}
                            className="flex items-center justify-center gap-2 w-full border border-dashed border-zinc-300 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-zinc-100 hover:border-black transition-all rounded-sm group"
                        >
                            <Plus size={16} className="group-hover:scale-110 transition-transform" />
                            <span>Add New Slide</span>
                        </button>
                        <p className="text-[10px] text-zinc-400 font-mono">
                            Add a new page to your Treatment Deck.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
