/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { ImageUpload } from '../ImageUpload';
import { Plus, Trash2, LayoutGrid, RectangleVertical, Grid3x3 } from 'lucide-react';

interface TalentItem {
    id: string;
    imageUrl?: string;
    name: string;
    role: string;
    specs: {
        agency: string;
        union: string;
        contact: string;
        sizes: string;
    };
    notes?: string;
}

interface CastingData {
    items: TalentItem[];
}

interface CastingTemplateProps {
    data: Partial<CastingData>;
    onUpdate: (data: Partial<CastingData>) => void;
    isLocked: boolean;
    metadata?: any;
    orientation?: 'portrait' | 'landscape';
    plain?: boolean;
    isPrinting?: boolean;
}

export const CastingTemplate = ({ data, onUpdate, isLocked, metadata, orientation = 'portrait', plain, isPrinting }: CastingTemplateProps) => {

    useEffect(() => {
        if (!data.items || data.items.length === 0) {
            onUpdate({
                items: [{
                    id: crypto.randomUUID(),
                    name: '',
                    role: '',
                    specs: { agency: '', union: '', contact: '', sizes: '' },
                    notes: ''
                }]
            });
        }
    }, []);

    const items = data.items || [];
    const isPortrait = orientation === 'portrait';

    // Always use Single Layout (1 per page)
    const itemsPerPage = 1;
    const gridClass = isPortrait ? 'grid-cols-1 mx-auto max-w-md' : 'grid-cols-1 mx-auto max-w-3xl';

    const totalPages = Math.ceil(Math.max(items.length, 1) / itemsPerPage);
    const pages = Array.from({ length: totalPages }, (_, i) => items.slice(i * itemsPerPage, (i + 1) * itemsPerPage));

    const handleAddTalent = () => {
        onUpdate({
            items: [...items, {
                id: crypto.randomUUID(),
                name: '',
                role: '',
                specs: { agency: '', union: '', contact: '', sizes: '' },
                notes: ''
            }]
        });
    };

    const updateItem = (id: string, field: keyof TalentItem | 'specs', value: any) => {
        onUpdate({
            items: items.map(item => {
                if (item.id === id) {
                    if (field === 'specs') return { ...item, specs: { ...item.specs, ...value } };
                    return { ...item, [field]: value };
                }
                return item;
            })
        });
    };

    const deleteItem = (id: string) => {
        if (confirm('Remove this talent?')) {
            onUpdate({ items: items.filter(i => i.id !== id) });
        }
    };

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Talent"
                    hideHeader={false}
                    metadata={metadata}
                    orientation={orientation}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className={`grid ${gridClass} gap-8`}>
                        {pageItems.map((item) => (
                            <div key={item.id} className={`break-inside-avoid ${!isPortrait ? 'flex gap-8 items-center' : ''}`}>
                                {/* 4:5 Aspect Ratio Image Card */}
                                <div className={`relative bg-transparent mb-4 group overflow-hidden border border-zinc-200 ${!isPortrait ? 'w-1/2 aspect-[4/5] mb-0' : 'w-full aspect-[4/5]'}`}>
                                    <ImageUpload
                                        value={item.imageUrl}
                                        onChange={(url) => updateItem(item.id, 'imageUrl', url)}
                                        className="w-full h-full object-cover"
                                        placeholder={
                                            <div className="flex flex-col items-center justify-center h-full text-zinc-300/50 hover:text-zinc-400 transition-colors">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">+ HEADSHOT</span>
                                            </div>
                                        }
                                        isLocked={isLocked}
                                    />
                                    {!isLocked && (
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="absolute top-2 right-2 p-2 bg-transparent text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Details */}
                                <div className={`space-y-3 ${!isPortrait ? 'w-1/2' : ''}`}>
                                    <div>
                                        {isPrinting ? (
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 leading-tight block">{item.role}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.role}
                                                onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                                                placeholder="ROLE / CHARACTER"
                                                disabled={isLocked}
                                                className="w-full text-[10px] font-bold uppercase tracking-widest text-blue-600 outline-none placeholder:text-blue-200 bg-transparent border-b border-transparent hover:border-zinc-200 px-2 mb-1 text-zinc-900"
                                            />
                                        )}

                                        {isPrinting ? (
                                            <div className="text-xl font-bold text-black leading-tight block">{item.name}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                placeholder="Talent Name"
                                                disabled={isLocked}
                                                className="w-full text-xl font-bold text-black outline-none placeholder:text-zinc-300 bg-transparent border-b border-transparent hover:border-zinc-200 px-2"
                                            />
                                        )}
                                    </div>

                                    {/* Specs Grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-zinc-100 pt-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 font-bold uppercase block">Agency</label>
                                            {isPrinting ? (
                                                <div className="font-medium text-zinc-600 min-h-[1rem] block">{item.specs.agency}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={item.specs.agency}
                                                    onChange={(e) => updateItem(item.id, 'specs', { ...item.specs, agency: e.target.value })}
                                                    className="w-full font-medium outline-none text-zinc-600 placeholder:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-200 px-2 text-zinc-900"
                                                    placeholder="Agency Name"
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 font-bold uppercase block">Union Status</label>
                                            {isPrinting ? (
                                                <div className="font-medium text-zinc-600 min-h-[1rem] block">{item.specs.union}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={item.specs.union}
                                                    onChange={(e) => updateItem(item.id, 'specs', { ...item.specs, union: e.target.value })}
                                                    className="w-full font-medium outline-none text-zinc-600 placeholder:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-200 px-2 text-zinc-900"
                                                    placeholder="SAG / Non-Union"
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 font-bold uppercase block">Contact</label>
                                            {isPrinting ? (
                                                <div className="font-medium text-zinc-600 min-h-[1rem] block">{item.specs.contact}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={item.specs.contact}
                                                    onChange={(e) => updateItem(item.id, 'specs', { ...item.specs, contact: e.target.value })}
                                                    className="w-full font-medium outline-none text-zinc-600 placeholder:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-200 px-2 text-zinc-900"
                                                    placeholder="Email / Phone"
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 font-bold uppercase block">Sizes / Height</label>
                                            {isPrinting ? (
                                                <div className="font-medium text-zinc-600 min-h-[1rem] block">{item.specs.sizes}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={item.specs.sizes}
                                                    onChange={(e) => updateItem(item.id, 'specs', { ...item.specs, sizes: e.target.value })}
                                                    className="w-full font-medium outline-none text-zinc-600 placeholder:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-200 px-2 text-zinc-900"
                                                    placeholder="5'10, Shoe 10..."
                                                    disabled={isLocked}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-1 border-t border-zinc-100 pt-3 mt-2">
                                        <label className="text-[9px] text-zinc-400 font-bold uppercase block">Notes</label>
                                        {isPrinting ? (
                                            <div className="font-medium text-zinc-600 min-h-[1rem] whitespace-pre-wrap text-sm block">{item.notes}</div>
                                        ) : (
                                            <textarea
                                                value={item.notes || ''}
                                                onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                                                className="w-full font-medium outline-none text-zinc-600 placeholder:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-200 rounded-md p-2 text-sm resize-none h-16 text-zinc-900 transition-all font-sans"
                                                placeholder="Additional notes..."
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Button - Last Page */}

                </DocumentLayout>
            ))}

            {/* Add Button - Outside Document */}
            {!isLocked && (
                <div className="max-w-md mx-auto py-8 text-center print-hidden">
                    <button
                        onClick={handleAddTalent}
                        className="flex items-center justify-center gap-2 w-full border border-dashed border-zinc-300 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-zinc-100 hover:border-black transition-colors rounded-sm"
                    >
                        <Plus size={14} /> <span>Add Talent</span>
                    </button>
                </div>
            )}
        </>
    );
};
