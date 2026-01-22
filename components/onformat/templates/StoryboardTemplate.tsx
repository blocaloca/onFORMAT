import React, { useState, useEffect } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Trash2, Square, Grid3x3, Grid2x2, RectangleHorizontal, Monitor, Smartphone, Maximize, Crop, Type, Pin } from 'lucide-react';

type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '5:4' | '3:2' | '2:3';
type ItemSize = 'small' | 'medium' | 'large';

interface StoryboardItem {
    id: string;
    url: string;
    caption: string; // Header/Shot Type
    notes?: string;  // Description
    title?: string;
    imageNumber?: string;
    sceneLink?: string; // Links to AV Script
    aspectRatio: AspectRatio;
    size: ItemSize;
}

interface StoryboardData {
    items: StoryboardItem[];
    overview: string;
}

interface StoryboardTemplateProps {
    data: Partial<StoryboardData>;
    onUpdate: (data: Partial<StoryboardData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const getAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
        case '3:2': return 'aspect-[3/2]';
        case '2:3': return 'aspect-[2/3]';
        case '16:9': return 'aspect-video';
        case '9:16': return 'aspect-[9/16]';
        case '1:1': return 'aspect-square';
        case '4:5': return 'aspect-[4/5]';
        case '5:4': return 'aspect-[5/4]';
        default: return 'aspect-[3/2]';
    }
};

const getSizeClass = (size: ItemSize) => {
    switch (size) {
        case 'small': return 'col-span-2'; // 3 per row (Standard Storyboard)
        case 'medium': return 'col-span-3'; // 2 per row
        case 'large': return 'col-span-6'; // 1 per row
        default: return 'col-span-2';
    }
};

export const StoryboardTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: StoryboardTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [activePinTargetId, setActivePinTargetId] = useState<string | null>(null);

    // Derived Data for Sync
    const avScriptRows = metadata?.importedAVScript?.rows || [];
    const validScenes = new Set(avScriptRows.map((r: any) => String(r.scene).trim()));
    const lookbookItems = metadata?.importedLookbook?.items || [];

    const isSceneValid = (val?: string) => {
        if (!val || validScenes.size === 0) return true;
        return validScenes.has(val.trim());
    };

    // Initial Population
    useEffect(() => {
        const items = data.items || [];
        // Migration logic for existing items
        const migratedItems = items.map((item, idx) => ({
            ...item,
            imageNumber: item.imageNumber || (idx + 1).toString().padStart(2, '0'),
            title: item.title || '',
            size: item.size || 'small',
            sceneLink: item.sceneLink || ''
        }));

        if (JSON.stringify(migratedItems) !== JSON.stringify(items)) {
            onUpdate({ items: migratedItems });
        } else if (!data.items || data.items.length === 0) {
            const count = orientation === 'landscape' ? 6 : 9;
            const newItems: StoryboardItem[] = Array.from({ length: count }).map((_, i) => ({
                id: `sb-${Date.now()}-${i}`,
                url: '',
                caption: '',
                notes: '',
                title: '',
                imageNumber: (i + 1).toString().padStart(2, '0'),
                aspectRatio: '3:2',
                size: 'small',
                sceneLink: ''
            }));
            onUpdate({ items: newItems });
        }
    }, []); // Run once on mount 

    const items = data.items || [];

    const handleAddItem = () => {
        const nextNum = (items.length + 1).toString().padStart(2, '0');
        const newItem: StoryboardItem = {
            id: `sb-${Date.now()}`,
            url: '',
            caption: '',
            notes: '',
            title: '',
            imageNumber: nextNum,
            aspectRatio: '3:2',
            size: 'small',
            sceneLink: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<StoryboardItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
        setActivePinTargetId(null);
    };

    const handlePin = (itemId: string, lookbookUrl: string) => {
        const idx = items.findIndex(i => i.id === itemId);
        if (idx > -1) {
            handleUpdateItem(idx, { url: lookbookUrl });
        }
        setActivePinTargetId(null);
    };

    // Pagination Logic
    const getColSpan = (size: ItemSize = 'small') => {
        switch (size) {
            case 'small': return 2;
            case 'large': return 6;
            default: return 3;
        }
    };

    // Tuned Height Limit
    // Landscape Page: 816px. Content area ~600-700px.
    // Small Item (3:2) width ~33% (~230px). Height ~150px + Text (~100px) = ~250px.
    // 2 Rows = 500px. 3 Rows = 750px (Might overflow).
    // So 6 items (2 rows) is safe.
    // Portrait Page: 1056px. Content ~900px.
    // 3 Rows = 750px. 4 Rows = 1000px.
    // So 9 items (3 rows) is safe.
    // We use a "Score" system where 1 Row of Small items = Score 2.
    // Landscape Max Score = 5 (2 rows fits easily, 3rd row might spill).
    // Portrait Max Score = 8 (3 rows fits easily, 4th might spill).
    // Reduced slightly to 4.5/7.5 to handle new header row height.
    const MAX_PAGE_HEIGHT_SCORE = orientation === 'landscape' ? 4.5 : 7.5;

    const pages: StoryboardItem[][] = [];
    let currentPage: StoryboardItem[] = [];
    let currentPageHeight = 0;

    let currentRowItems: StoryboardItem[] = [];
    let currentRowWidth = 0;

    const flushRowToPage = () => {
        if (currentRowItems.length === 0) return;

        // Calculate Row Height Score
        let rowHeight = 0;
        currentRowItems.forEach(i => {
            // Heuristic Height Score
            // Small (3:2) -> 2
            // Medium (3:2) -> 3
            // Large -> 5
            let h = 2;
            if (i.size === 'medium') h = 3;
            if (i.size === 'large') h = 5;
            if (h > rowHeight) rowHeight = h;
        });

        // Check overflow
        if (currentPageHeight + rowHeight > MAX_PAGE_HEIGHT_SCORE && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [];
            currentPageHeight = 0;
        }

        currentPage.push(...currentRowItems);
        currentPageHeight += rowHeight;

        currentRowItems = [];
        currentRowWidth = 0;
    };

    items.forEach((item) => {
        const itemW = getColSpan(item.size);
        if (currentRowWidth + itemW > 6) {
            flushRowToPage();
        }
        currentRowItems.push(item);
        currentRowWidth += itemW;
    });
    flushRowToPage();

    if (currentPage.length > 0 || items.length === 0) {
        pages.push(currentPage);
    }

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Storyboard"
                    hideHeader={pageIndex > 0}
                    plain={plain}
                    orientation={orientation}
                    metadata={pageIndex === 0 ? metadata : undefined}
                >
                    <div className="flex flex-col h-full">

                        <div className="grid grid-cols-6 gap-x-6 gap-y-4 content-start flex-1 mt-4">
                            {pageItems.map((item) => {
                                const originalIndex = items.findIndex(i => i.id === item.id);
                                const isPinOpen = activePinTargetId === item.id;
                                const invalidScene = !isSceneValid(item.sceneLink);

                                return (
                                    <div key={item.id} className={`relative group flex flex-col gap-1.5 ${getSizeClass(item.size)}`}>

                                        {/* Lookbook Picker Overlay */}
                                        {isPinOpen && (
                                            <div className="absolute inset-0 z-50 bg-white border border-black shadow-xl rounded-sm flex flex-col p-2 animate-in fade-in zoom-in-95 duration-100 h-[300px] overflow-hidden">
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-100">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Reference</span>
                                                    <button onClick={() => setActivePinTargetId(null)} className="text-zinc-600 hover:text-red-500 text-[10px] uppercase font-bold">Close</button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2">
                                                    {lookbookItems.length > 0 ? lookbookItems.map((lb: any) => (
                                                        <button
                                                            key={lb.id}
                                                            onClick={() => handlePin(item.id, lb.url)}
                                                            className="aspect-square bg-zinc-50 relative group/lb border border-transparent hover:border-black transition-colors"
                                                        >
                                                            {lb.url ? (
                                                                <img src={lb.url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-300">No Img</div>
                                                            )}
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] p-1 truncate opacity-0 group-hover/lb:opacity-100">
                                                                {lb.title || 'Untitled'}
                                                            </div>
                                                        </button>
                                                    )) : (
                                                        <div className="col-span-2 text-center text-[10px] text-zinc-400 pt-4">No Lookbook items found.</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Header Row: Number + Title */}
                                        <div className="flex items-center gap-2 w-full mb-1 border-b border-zinc-100 pb-1">
                                            {isPrinting ? (
                                                <div className="w-6 flex-shrink-0 text-[10px] font-bold text-black text-left uppercase tracking-widest h-4 leading-4">
                                                    {item.imageNumber}
                                                </div>
                                            ) : (
                                                <input
                                                    className="w-6 flex-shrink-0 text-[10px] font-bold text-black bg-transparent outline-none focus:border-black text-left uppercase tracking-widest h-4 leading-4"
                                                    placeholder="00"
                                                    value={item.imageNumber || ''}
                                                    onChange={(e) => handleUpdateItem(originalIndex, { imageNumber: e.target.value })}
                                                    disabled={isLocked}
                                                />
                                            )}

                                            {isPrinting ? (
                                                <div className="flex-1 text-[10px] font-bold text-zinc-900 uppercase tracking-wider h-4 leading-4">
                                                    {item.title}
                                                </div>
                                            ) : (
                                                <input
                                                    className="flex-1 text-[10px] font-bold text-zinc-900 bg-transparent outline-none focus:text-black uppercase tracking-wider h-4 leading-4"
                                                    placeholder="SCENE / SHOT TITLE"
                                                    value={item.title || ''}
                                                    onChange={(e) => handleUpdateItem(originalIndex, { title: e.target.value })}
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {!isLocked && (
                                            <div className="absolute top-10 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur-sm rounded-md p-1 border border-zinc-200 shadow-sm print:hidden">
                                                {/* Pin Button */}
                                                <div className="flex items-center border-r border-zinc-200 pr-1 mr-1 gap-1">
                                                    <button onClick={() => setActivePinTargetId(isPinOpen ? null : item.id)} className={`p-1 rounded hover:bg-zinc-100 ${isPinOpen ? 'text-blue-600 bg-blue-50' : 'text-zinc-400'}`} title="Pin from Lookbook"><Pin size={12} /></button>
                                                </div>
                                                <div className="flex items-center border-r border-zinc-200 pr-1 mr-1 gap-1">
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '3:2' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '3:2' ? 'text-black' : 'text-zinc-400'}`} title="3:2"><Monitor size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '16:9' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '16:9' ? 'text-black' : 'text-zinc-400'}`} title="16:9"><Crop size={12} /></button>
                                                </div>
                                                <div className="flex items-center border-r border-zinc-200 pr-1 mr-1 gap-1">
                                                    <button onClick={() => handleUpdateItem(originalIndex, { size: 'small' })} className={`p-1 rounded hover:bg-zinc-100 ${item.size === 'small' ? 'text-black' : 'text-zinc-400'}`} title="Small"><Grid3x3 size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { size: 'medium' })} className={`p-1 rounded hover:bg-zinc-100 ${item.size === 'medium' ? 'text-black' : 'text-zinc-400'}`} title="Medium"><Grid2x2 size={12} /></button>
                                                </div>
                                                <button onClick={() => handleDeleteItem(originalIndex)} className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        )}

                                        <div className={`w-full bg-zinc-50 ${getAspectClass(item.aspectRatio)} border ${invalidScene && item.sceneLink ? 'border-red-500 border-2' : 'border-zinc-200'} relative overflow-hidden transition-all`}>
                                            <ImageUploader
                                                currentUrl={item.url}
                                                onUpload={(url) => handleUpdateItem(originalIndex, { url })}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                            />
                                            {invalidScene && item.sceneLink && !isPrinting && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                    SCENE DELETED
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-start gap-2 pt-0.5">
                                            <div className="flex-1">
                                                {isPrinting ? (
                                                    <div className="w-full text-[9px] font-bold uppercase tracking-widest text-zinc-500 py-0.5">
                                                        {item.caption}
                                                    </div>
                                                ) : (
                                                    <input
                                                        className="w-full text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-transparent border-none focus:text-black outline-none placeholder-zinc-300 py-0.5"
                                                        placeholder="SHOT TYPE / ANGLE"
                                                        value={item.caption}
                                                        onChange={(e) => handleUpdateItem(originalIndex, { caption: e.target.value })}
                                                        disabled={isLocked}
                                                    />
                                                )}
                                            </div>

                                            {/* Scene Link Input */}
                                            <div className="w-16 shrink-0 flex flex-col items-end">
                                                {isPrinting ? (
                                                    <div className="text-[9px] font-mono text-zinc-400 ">{item.sceneLink ? `SC: ${item.sceneLink}` : ''}</div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[8px] font-bold text-zinc-300 uppercase">SC</span>
                                                        <input
                                                            className={`w-8 text-[9px] font-mono text-right bg-transparent outline-none border-b ${invalidScene && item.sceneLink ? 'border-red-400 text-red-500' : 'border-zinc-200 text-zinc-600 focus:border-black focus:text-black'}`}
                                                            placeholder="#"
                                                            value={item.sceneLink || ''}
                                                            onChange={(e) => handleUpdateItem(originalIndex, { sceneLink: e.target.value })}
                                                            disabled={isLocked}
                                                            title={invalidScene && item.sceneLink ? "Scene not found in AV Script" : "Link to Scene Number"}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </DocumentLayout>
            ))}

            {!isLocked && (
                <div className="py-8 flex justify-center print:hidden pb-20">
                    <button
                        onClick={handleAddItem}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black border border-dashed border-zinc-300 hover:border-black bg-white px-8 py-3 transition-all rounded-full hover:shadow-lg shadow-sm"
                    >
                        <span>+ Add Frame</span>
                    </button>
                </div>
            )}
        </>
    );
};
