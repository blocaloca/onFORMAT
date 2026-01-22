import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Plus, Trash2 } from 'lucide-react';

interface TreatmentScene {
    id: string;
    image: string;
    image2?: string;
    description: string;
    type: 'Narrative' | 'Character' | 'Cinematography' | 'Grading';
    content: string;
}

// Update Interface
interface DirectorsTreatmentData {
    scenes: TreatmentScene[];
    approach?: string;
    tone?: string;
    narrativeArc?: string;
    // Legacy
    heroImage?: string;
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

// ... imports remain the same

export const DirectorsTreatmentTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: DirectorsTreatmentTemplateProps) => {

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const updateField = (field: keyof DirectorsTreatmentData, value: string) => {
        if (onUpdate) onUpdate({ ...data, [field]: value });
    };

    const handleChange = (scenes: TreatmentScene[]) => {
        if (onUpdate) {
            onUpdate({ ...data, scenes });
        }
    };

    // ... scene handlers (handleSceneUpdate, addScene, removeScene) same as before ...
    const handleSceneUpdate = (id: string, field: keyof TreatmentScene, value: string) => {
        const currentScenes = data.scenes || [];
        const updated = currentScenes.map(s => s.id === id ? { ...s, [field]: value } : s);
        handleChange(updated);
    };

    const addScene = () => {
        const currentScenes = data.scenes || [];
        const newScene: TreatmentScene = {
            id: `scene-${Date.now()}`,
            image: '',
            image2: '',
            description: '',
            type: 'Narrative',
            content: ''
        };
        handleChange([...currentScenes, newScene]);
    };

    const removeScene = (id: string) => {
        const currentScenes = data.scenes || [];
        handleChange(currentScenes.filter(s => s.id !== id));
        setDeleteConfirmId(null);
    };

    // Migration Effect (Keep as is just to be safe, or simplify)
    useEffect(() => {
        if (!data.scenes || data.scenes.length === 0) {
            // ... logic from before needed? 
            // Simplification: Just ensure scenes array exists
            if (!data.scenes) handleChange([]);
        }
    }, []);

    // Pagination Logic
    // Page 1: Top Level Fields (Approach, Tone, Narrative) + maybe 1 Scene?
    // Let's just put the Top Level fields on Page 1, and Scenes start on Page 2?
    // OR put them above scenes on Page 1.
    // Given layout constraints, let's put them on Page 1.

    const ITEMS_PER_PAGE = 1;
    const scenes = data.scenes || [];
    const totalPages = Math.max(1, Math.ceil(scenes.length / ITEMS_PER_PAGE));

    // We render pages based on Scenes, but Page 1 includes the Header fields.
    const pages = Array.from({ length: totalPages }, (_, i) => {
        return scenes.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
    });

    return (
        <>
            {pages.map((pageScenes, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Treatment"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="flex flex-col h-full relative gap-6">

                        {/* FIRST PAGE HEADER FIELDS */}
                        {pageIndex === 0 && (
                            <div className="grid grid-cols-3 gap-4 h-48 shrink-0 mb-4">
                                {/* Approach */}
                                <div className="bg-zinc-50 border border-zinc-200 relative p-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Approach</h4>
                                    <textarea
                                        value={data.approach || ''}
                                        onChange={(e) => updateField('approach', e.target.value)}
                                        className={`w-full h-[120px] bg-transparent text-xs leading-relaxed outline-none resize-none placeholder-zinc-300 ${isPrinting ? 'hidden' : ''}`}
                                        placeholder="Define the approach..."
                                        disabled={isLocked}
                                    />
                                    {isPrinting && <div className="text-xs leading-relaxed">{data.approach}</div>}
                                </div>
                                {/* Tone */}
                                <div className="bg-zinc-50 border border-zinc-200 relative p-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Tone</h4>
                                    <textarea
                                        value={data.tone || ''}
                                        onChange={(e) => updateField('tone', e.target.value)}
                                        className={`w-full h-[120px] bg-transparent text-xs leading-relaxed outline-none resize-none placeholder-zinc-300 ${isPrinting ? 'hidden' : ''}`}
                                        placeholder="Define the tone..."
                                        disabled={isLocked}
                                    />
                                    {isPrinting && <div className="text-xs leading-relaxed">{data.tone}</div>}
                                </div>
                                {/* Narrative Arc */}
                                <div className="bg-zinc-50 border border-zinc-200 relative p-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Narrative Arc</h4>
                                    <textarea
                                        value={data.narrativeArc || ''}
                                        onChange={(e) => updateField('narrativeArc', e.target.value)}
                                        className={`w-full h-[120px] bg-transparent text-xs leading-relaxed outline-none resize-none placeholder-zinc-300 ${isPrinting ? 'hidden' : ''}`}
                                        placeholder="Construct the narrative..."
                                        disabled={isLocked}
                                    />
                                    {isPrinting && <div className="text-xs leading-relaxed">{data.narrativeArc}</div>}
                                </div>
                            </div>
                        )}

                        {/* SCENES */}
                        {pageScenes.map((scene) => (
                            <div key={scene.id} className="flex flex-col h-full gap-4 group flex-1 min-h-0">
                                {/* Header / Title Section */}
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex justify-between items-end">
                                        <div className="flex-1 mr-4">
                                            {isPrinting ? (
                                                <div className="text-sm font-bold uppercase tracking-widest pb-1">
                                                    {scene.description || 'Treatment'}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={scene.description}
                                                    onChange={(e) => handleSceneUpdate(scene.id, 'description', e.target.value)}
                                                    className="w-full bg-transparent text-sm font-bold uppercase tracking-widest focus:text-black outline-none pb-1 placeholder-zinc-300"
                                                    placeholder="TREATMENT TITLE"
                                                />
                                            )}
                                        </div>

                                        {/* Delete Button (Top Right aligned with text) */}
                                        {!plain && !isPrinting && !isLocked && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setDeleteConfirmId(deleteConfirmId === scene.id ? null : scene.id)}
                                                    className={`hover:text-red-500 transition-opacity ${deleteConfirmId === scene.id ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                                    title="Delete this treatment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {deleteConfirmId === scene.id && (
                                                    <div className="absolute right-0 top-8 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                        <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                        <button
                                                            onClick={() => removeScene(scene.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Backdrop */}
                                                {deleteConfirmId === scene.id && (
                                                    <div
                                                        className="fixed inset-0 z-40 bg-transparent"
                                                        onClick={() => setDeleteConfirmId(null)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* Full Width Dividing Line */}
                                    <div className={`w-full border-b ${isPrinting ? 'border-black' : 'border-zinc-200'} mb-2`} />
                                </div>

                                {/* Images Grid - 2x 16:9 Images */}
                                <div className="grid grid-cols-2 gap-4 h-48 shrink-0">
                                    {/* Image 1 */}
                                    <div className="w-full h-full bg-zinc-50 border border-dashed border-zinc-200 relative shrink-0">
                                        <ImageUploader
                                            currentUrl={scene.image}
                                            onUpload={(url) => handleSceneUpdate(scene.id, 'image', url)}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Image 2 */}
                                    <div className="w-full h-full bg-zinc-50 border border-dashed border-zinc-200 relative shrink-0">
                                        <ImageUploader
                                            currentUrl={scene.image2 || ''}
                                            onUpload={(url) => handleSceneUpdate(scene.id, 'image2', url)}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Notes Below */}
                                <div className="flex-1 flex flex-col min-h-0 mt-2">
                                    {isPrinting ? (
                                        <div className="w-full h-full text-xs leading-relaxed whitespace-pre-wrap p-3 border border-transparent break-words">
                                            {scene.content}
                                        </div>
                                    ) : (
                                        <div className="w-full bg-zinc-50 border border-zinc-200 relative flex-1">
                                            <label className="absolute top-2 left-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pointer-events-none">Notes</label>
                                            <textarea
                                                value={scene.content}
                                                onChange={(e) => handleSceneUpdate(scene.id, 'content', e.target.value)}
                                                className="w-full h-full bg-transparent p-3 pt-6 text-xs leading-relaxed outline-none resize-none placeholder-zinc-300 whitespace-pre-wrap break-words"
                                                placeholder="Add notes for this treatment..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DocumentLayout>
            ))}

            {/* Add Treatment Button - Outside of document pages */}
            {!plain && !isPrinting && !isLocked && (
                <div className="max-w-md mx-auto py-8 text-center print-hidden">
                    <button
                        onClick={addScene}
                        className="flex items-center justify-center gap-2 w-full border border-dashed border-zinc-300 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black transition-colors rounded-sm"
                    >
                        <Plus size={14} /> <span>Add Treatment</span>
                    </button>
                </div>
            )}
        </>
    );
};
