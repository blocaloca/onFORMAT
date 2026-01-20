import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, GripVertical, CheckCircle2 } from 'lucide-react';

interface ShotLogItem {
    id: string;
    scene: string;
    shot: string;
    take: string;
    description: string;
    lens: string;
    fps: string;
    iso: string;
    status: 'good' | 'bad' | 'circle' | '';
    timecode: string;
    notes: string;
}

interface ShotLogData {
    date: string;
    project: string;
    roll: string;
    camera: string;
    operator: string;
    items: ShotLogItem[];
}

interface ShotLogTemplateProps {
    data: Partial<ShotLogData>;
    onUpdate: (data: Partial<ShotLogData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const STATUS_OPTIONS = [
    { value: '', label: '-', color: 'text-zinc-300' },
    { value: 'good', label: 'OK', color: 'text-green-600' },
    { value: 'bad', label: 'NG', color: 'text-red-500' },
    { value: 'circle', label: 'BUY', color: 'text-yellow-500' },
];

const ITEMS_PER_PAGE = 20;

export const ShotLogTemplate = ({ data, onUpdate, isLocked = false, plain, orientation = 'portrait', metadata, isPrinting = false }: ShotLogTemplateProps) => {

    // State for delete confirmation popover
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        // Init if empty
        if (!data.items) {
            onUpdate({
                items: [],
                date: new Date().toISOString().split('T')[0],
                roll: 'A001'
            });
        }
    }, []);

    const items = data.items || [];

    const handleAddItem = () => {
        // Auto-increment logic
        const lastItem = items[items.length - 1];
        const nextTake = lastItem ? String(parseInt(lastItem.take || '0') + 1) : '1';

        const newItem: ShotLogItem = {
            id: `log-${Date.now()}`,
            scene: lastItem?.scene || '',
            shot: lastItem?.shot || '',
            take: nextTake,
            description: lastItem?.description || '',
            lens: lastItem?.lens || '',
            fps: lastItem?.fps || '24',
            iso: lastItem?.iso || '',
            status: '',
            timecode: '',
            notes: ''
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<ShotLogItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const updateField = (field: keyof ShotLogData, value: string) => {
        onUpdate({ [field]: value });
    };

    // Pagination Logic
    const isPortrait = orientation === 'portrait';
    const ITEMS_FIRST_PAGE = isPortrait ? 18 : 10;
    const ITEMS_OTHER_PAGES = isPortrait ? 18 : 10;

    const remainingItems = Math.max(0, items.length - ITEMS_FIRST_PAGE);
    const extraPages = Math.ceil(remainingItems / ITEMS_OTHER_PAGES);
    const totalPages = 1 + extraPages;

    const pages = Array.from({ length: totalPages }, (_, i) => {
        if (i === 0) return items.slice(0, ITEMS_FIRST_PAGE);
        const start = ITEMS_FIRST_PAGE + (i - 1) * ITEMS_OTHER_PAGES;
        return items.slice(start, start + ITEMS_OTHER_PAGES);
    });

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Shot Log"
                    hideHeader={false}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `(Cont. Page ${pageIndex + 1})` : ''}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Header Grid */}
                        <div className="border-b-2 border-black pb-4 mb-4">
                            <div className="grid grid-cols-4 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Shoot Date</label>
                                    <input
                                        type="text"
                                        value={data.date || ''}
                                        onChange={e => updateField('date', e.target.value)}
                                        placeholder="YYYY-MM-DD"
                                        className={`font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                        disabled={isLocked}
                                    />
                                    <div className={`font-bold text-sm pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                        {data.date}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Camera Op</label>
                                    <input
                                        value={data.operator || ''}
                                        onChange={e => updateField('operator', e.target.value)}
                                        placeholder="NAME"
                                        className={`font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                        disabled={isLocked}
                                    />
                                    <div className={`font-bold text-sm pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                        {data.operator}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Roll</label>
                                    <input
                                        type="text"
                                        value={data.roll || ''}
                                        onChange={e => updateField('roll', e.target.value)}
                                        placeholder="A001"
                                        className={`font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                        disabled={isLocked}
                                    />
                                    <div className={`font-bold text-sm pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                        {data.roll}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Camera</label>
                                    <input
                                        value={data.camera || ''}
                                        onChange={e => updateField('camera', e.target.value)}
                                        placeholder="A-CAM"
                                        className={`font-bold text-sm bg-transparent outline-none w-full text-right placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                        disabled={isLocked}
                                    />
                                    <div className={`font-bold text-sm pt-0.5 leading-normal text-right ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                        {data.camera}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-[40px_40px_40px_1fr_60px_40px_40px_80px_100px_30px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Scn</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Shot</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Tk</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Lens</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">FPS</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">ISO</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">TC</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Stat</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex === 0) ? localIdx : ITEMS_FIRST_PAGE + ((pageIndex - 1) * ITEMS_OTHER_PAGES) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[40px_40px_40px_1fr_60px_40px_40px_80px_100px_30px_30px] gap-2 py-1.5 items-center hover:bg-zinc-50 transition-colors group">
                                        <input type="text" value={item.scene} onChange={e => handleUpdateItem(globalIdx, { scene: e.target.value })} className={`text-center font-bold bg-transparent outline-none focus:bg-white rounded w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="-" disabled={isLocked} />
                                        <div className={`text-center font-bold text-xs pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.scene}</div>

                                        <input type="text" value={item.shot} onChange={e => handleUpdateItem(globalIdx, { shot: e.target.value })} className={`text-center font-bold bg-transparent outline-none focus:bg-white rounded w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="-" disabled={isLocked} />
                                        <div className={`text-center font-bold text-xs pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.shot}</div>

                                        <input type="text" value={item.take} onChange={e => handleUpdateItem(globalIdx, { take: e.target.value })} className={`text-center font-mono font-bold bg-transparent outline-none focus:bg-white rounded w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="-" disabled={isLocked} />
                                        <div className={`text-center font-mono font-bold text-xs pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.take}</div>

                                        <input type="text" value={item.description} onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })} className={`bg-transparent outline-none focus:bg-white rounded px-1 w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="Shot description..." disabled={isLocked} />
                                        <div className={`text-xs px-1 pt-0.5 leading-normal break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.description}</div>

                                        <input type="text" value={item.lens} onChange={e => handleUpdateItem(globalIdx, { lens: e.target.value })} className={`text-center font-mono text-[10px] bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="mm" disabled={isLocked} />
                                        <div className={`text-center font-mono text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.lens}</div>

                                        <input type="text" value={item.fps} onChange={e => handleUpdateItem(globalIdx, { fps: e.target.value })} className={`text-center font-mono text-[10px] bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="fps" disabled={isLocked} />
                                        <div className={`text-center font-mono text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.fps}</div>

                                        <input type="text" value={item.iso} onChange={e => handleUpdateItem(globalIdx, { iso: e.target.value })} className={`text-center font-mono text-[10px] bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="iso" disabled={isLocked} />
                                        <div className={`text-center font-mono text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.iso}</div>

                                        <input type="text" value={item.timecode} onChange={e => handleUpdateItem(globalIdx, { timecode: e.target.value })} className={`text-center font-mono text-[10px] bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="00:00:00:00" disabled={isLocked} />
                                        <div className={`text-center font-mono text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.timecode}</div>

                                        <input type="text" value={item.notes} onChange={e => handleUpdateItem(globalIdx, { notes: e.target.value })} className={`bg-transparent outline-none focus:bg-white rounded px-1 text-zinc-500 italic w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="..." disabled={isLocked} />
                                        <div className={`text-xs px-1 pt-0.5 leading-normal text-zinc-500 italic break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.notes}</div>

                                        <div className="relative flex justify-center">
                                            <select
                                                value={item.status}
                                                onChange={e => handleUpdateItem(globalIdx, { status: e.target.value as any })}
                                                className={`appearance-none bg-transparent font-bold text-center w-full cursor-pointer outline-none ${item.status === 'circle' ? 'text-yellow-500' :
                                                    item.status === 'good' ? 'text-green-600' :
                                                        item.status === 'bad' ? 'text-red-500 text-opacity-50' : 'text-zinc-200'
                                                    } ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                disabled={isLocked}
                                            >
                                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className={`text-center font-bold text-xs pt-0.5 ${item.status === 'circle' ? 'text-yellow-500' : item.status === 'good' ? 'text-green-600' : item.status === 'bad' ? 'text-red-500' : 'text-zinc-300'} ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {STATUS_OPTIONS.find(o => o.value === item.status)?.label || '-'}
                                            </div>
                                        </div>

                                        {/* Delete Button with Confirmation Popover */}
                                        {!isLocked && (
                                            <div className="relative flex justify-center w-full">
                                                <button
                                                    onClick={() => setDeleteConfirmIndex(deleteConfirmIndex === globalIdx ? null : globalIdx)}
                                                    className={`hover:text-red-500 transition-opacity flex justify-center w-full ${deleteConfirmIndex === globalIdx ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-zinc-300'}`}
                                                >
                                                    <Trash2 size={12} />
                                                </button>

                                                {deleteConfirmIndex === globalIdx && (
                                                    <div className="absolute right-0 top-6 z-50 bg-white shadow-xl border border-zinc-200 p-3 rounded-md w-[140px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                                        <span className="text-[10px] font-bold text-center uppercase tracking-widest text-black">Remove?</span>
                                                        <button
                                                            onClick={() => handleDeleteItem(globalIdx)}
                                                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 px-2 rounded-sm uppercase w-full transition-colors tracking-wider"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Backdrop to close when clicking outside (transparent) */}
                                                {deleteConfirmIndex === globalIdx && (
                                                    <div
                                                        className="fixed inset-0 z-40 bg-transparent"
                                                        onClick={() => setDeleteConfirmIndex(null)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Add Button - Only on Last Page */}
                            {!isLocked && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print:hidden">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full justification-center">
                                        <Plus size={10} className="mr-1" /> Add Take
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
