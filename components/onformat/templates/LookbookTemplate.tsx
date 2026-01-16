import React, { useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Trash2, Square, Grid3x3, Grid2x2, RectangleHorizontal, Monitor, Smartphone, Maximize, Crop, Type } from 'lucide-react';

// In a real app, images would be uploaded and URLs stored in json
type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '5:4';
type ItemSize = 'small' | 'medium' | 'large';

interface LookbookItem {
    id: string;
    url: string;
    caption: string;
    title?: string;
    imageNumber?: string;
    aspectRatio: AspectRatio;
    size: ItemSize;
    showCaption?: boolean;
}

interface LookbookData {
    items: LookbookItem[];
}

interface LookbookTemplateProps {
    data: Partial<LookbookData>;
    onUpdate: (data: Partial<LookbookData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const getAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
        case '16:9': return 'aspect-video';
        case '9:16': return 'aspect-[9/16]';
        case '1:1': return 'aspect-square';
        case '4:5': return 'aspect-[4/5]';
        case '5:4': return 'aspect-[5/4]';
        default: return 'aspect-video';
    }
};

const getSizeClass = (size: ItemSize) => {
    switch (size) {
        case 'small': return 'col-span-2'; // 1/3 width (in 6-col grid)
        case 'medium': return 'col-span-3'; // 1/2 width
        case 'large': return 'col-span-6'; // Full width
        default: return 'col-span-3';
    }
};

export const LookbookTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: LookbookTemplateProps) => {

    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    // Migration: ensure items have IDs, aspect ratios, SIZES, and showCaption
    // Migration: ensure items have IDs, aspect ratios, SIZES, and showCaption
    React.useEffect(() => {
        const items = data.items || [];
        let hasChanges = false;
        const newItems = items.map((item, idx) => {
            const anyItem = item as any;
            // Check for missing new props (or old format)
            if (!anyItem.id || !anyItem.aspectRatio || !anyItem.size || anyItem.showCaption === undefined || !anyItem.imageNumber || anyItem.title === undefined) {
                hasChanges = true;
                return {
                    ...item,
                    id: anyItem.id || `item-${Date.now()}-${idx}`,
                    aspectRatio: anyItem.aspectRatio || '1:1', // Default to square for Lookbook usually? Or 16:9? Let's stick to 16:9 to match Visual Direction base if desired, but 1:1 is common for lookbooks. Let's use 16:9 to match the "same tools" request perfectly unless specified.
                    size: 'medium',
                    showCaption: anyItem.showCaption !== undefined ? anyItem.showCaption : false, // Default NO caption
                    imageNumber: anyItem.imageNumber || (idx + 1).toString().padStart(2, '0'),
                    title: anyItem.title || ''
                };
            }
            return item;
        });

        if (hasChanges) {
            onUpdate({ items: newItems as LookbookItem[] });
        }
    }, [data.items]);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: LookbookItem = {
            id: `item-${Date.now()}`,
            url: '',
            caption: '',
            title: '',
            imageNumber: ((data.items?.length || 0) + 1).toString().padStart(2, '0'),
            aspectRatio: '16:9',
            size: 'medium',
            showCaption: false
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<LookbookItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    // Pagination Logic - Row Aware
    const getColSpan = (size: ItemSize = 'medium') => {
        switch (size) {
            case 'small': return 2;
            case 'large': return 6;
            default: return 3;
        }
    };

    // Height score approximates relative height of the row.
    // Reduced to prevent footer overlap (Original: 12/7)
    const MAX_PAGE_HEIGHT_SCORE = orientation === 'landscape' ? 6 : 10;

    const pages: LookbookItem[][] = [];
    let currentPage: LookbookItem[] = [];
    let currentPageHeight = 0;

    // Temporary row tracking
    let currentRowItems: LookbookItem[] = [];
    let currentRowWidth = 0;

    // Helper to flush current row to page
    const flushRowToPage = () => {
        if (currentRowItems.length === 0) return;

        let rowHeight = 0;
        currentRowItems.forEach(i => {
            const h = getColSpan(i.size);
            if (h > rowHeight) rowHeight = h;
        });

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

    (data.items || []).forEach((item) => {
        const itemW = getColSpan(item.size);
        if (currentRowWidth + itemW > 6) {
            flushRowToPage();
        }
        currentRowItems.push(item);
        currentRowWidth += itemW;
    });
    flushRowToPage();
    if (currentPage.length > 0 || (data.items || []).length === 0) {
        pages.push(currentPage);
    }

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Lookbook"
                    hideHeader={pageIndex > 0}
                    plain={plain}
                    orientation={orientation}
                    metadata={pageIndex === 0 ? metadata : undefined}
                >
                    <div className="space-y-4 h-full flex flex-col">

                        {/* Sub-page Header */}
                        {pageIndex > 0 && (
                            <div className="text-center text-sm font-bold text-zinc-500 mb-2">
                                Lookbook (Cont. Page {pageIndex + 1})
                            </div>
                        )}

                        {/* Grid Container - GAP 0 for Lookbook */}
                        <div className="grid grid-cols-6 gap-0 flex-1 content-start">
                            {pageItems.map((item) => {
                                const originalIndex = (data.items || []).findIndex(i => i.id === item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className={`relative group flex flex-col ${getSizeClass(item.size || 'medium')} ${item.showCaption ? 'p-4 gap-3' : 'p-4 gap-2'}`}
                                    >
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
                                                    placeholder="IMAGE TITLE"
                                                    value={item.title || ''}
                                                    onChange={(e) => handleUpdateItem(originalIndex, { title: e.target.value })}
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>

                                        {/* Toolbar (Hover) */}
                                        {!isLocked && (
                                            <div className="absolute top-12 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur-sm rounded-md p-1 border border-zinc-200 shadow-sm">
                                                {/* Aspect Ratio Selector */}
                                                <div className="flex items-center border-r border-zinc-200 pr-1 mr-1 gap-1">
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '16:9' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '16:9' ? 'text-black' : 'text-zinc-400'}`} title="16:9"><Monitor size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '9:16' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '9:16' ? 'text-black' : 'text-zinc-400'}`} title="9:16"><Smartphone size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '1:1' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '1:1' ? 'text-black' : 'text-zinc-400'}`} title="1:1"><Square size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '4:5' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '4:5' ? 'text-black' : 'text-zinc-400'}`} title="4:5"><Crop size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { aspectRatio: '5:4' })} className={`p-1 rounded hover:bg-zinc-100 ${item.aspectRatio === '5:4' ? 'text-black' : 'text-zinc-400'}`} title="5:4"><Maximize size={12} className="rotate-90" /></button>
                                                </div>

                                                {/* Size Selector */}
                                                <div className="flex items-center border-r border-zinc-200 pr-1 mr-1 gap-1">
                                                    <button onClick={() => handleUpdateItem(originalIndex, { size: 'small' })} className={`p-1 rounded hover:bg-zinc-100 ${item.size === 'small' ? 'text-black' : 'text-zinc-400'}`} title="Small"><Grid3x3 size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { size: 'medium' })} className={`p-1 rounded hover:bg-zinc-100 ${(!item.size || item.size === 'medium') ? 'text-black' : 'text-zinc-400'}`} title="Medium"><Grid2x2 size={12} /></button>
                                                    <button onClick={() => handleUpdateItem(originalIndex, { size: 'large' })} className={`p-1 rounded hover:bg-zinc-100 ${item.size === 'large' ? 'text-black' : 'text-zinc-400'}`} title="Large"><RectangleHorizontal size={12} /></button>
                                                </div>

                                                {/* Caption Toggle */}
                                                <div className="flex items-center border-r border-zinc-200 pr-1 mr-1 gap-1">
                                                    <button onClick={() => handleUpdateItem(originalIndex, { showCaption: !item.showCaption })} className={`p-1 rounded hover:bg-zinc-100 ${item.showCaption ? 'text-black' : 'text-zinc-400'}`} title="Notes"><Type size={12} /></button>
                                                </div>

                                                {/* Delete Button with Confirmation Popover */}
                                                <div className="relative">
                                                    <button onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === originalIndex ? null : originalIndex)} className={`p-1 rounded hover:bg-red-50 ml-1 hover:text-red-500 ${deleteConfirmIndex === originalIndex ? 'text-red-500' : 'text-zinc-400'}`} title="Remove"><Trash2 size={12} /></button>
                                                    {deleteConfirmIndex === originalIndex && (
                                                        <div className="absolute right-0 top-8 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                            <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                            <button
                                                                onClick={() => handleDeleteItem(originalIndex)}
                                                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Backdrop to close when clicking outside (transparent) */}
                                                    {deleteConfirmIndex === originalIndex && (
                                                        <div
                                                            className="fixed inset-0 z-40 bg-transparent"
                                                            onClick={() => setDeleteConfirmIndex(null)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Image Container */}
                                        <div className={`w-full bg-zinc-50 ${getAspectClass(item.aspectRatio)} shadow-sm relative overflow-hidden`}>
                                            <ImageUploader
                                                currentUrl={item.url}
                                                onUpload={(url) => handleUpdateItem(originalIndex, { url })}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                            />
                                        </div>

                                        {/* Caption */}
                                        {item.showCaption && (
                                            <textarea
                                                className="w-full text-[10px] font-mono text-gray-500 bg-transparent outline-none border-b border-transparent focus:border-black placeholder-gray-300 resize-none overflow-hidden"
                                                placeholder="Add notes..."
                                                rows={2}
                                                value={item.caption}
                                                onChange={(e) => handleUpdateItem(originalIndex, { caption: e.target.value })}
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Image Button */}
                        {!isLocked && pageIndex === pages.length - 1 && (
                            <div className="pt-8 flex justify-center print-hidden">
                                <button
                                    onClick={handleAddItem}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black border border-dashed border-zinc-300 hover:border-black px-6 py-3 transition-colors rounded-sm"
                                >
                                    <span>+ Add Image</span>
                                </button>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
