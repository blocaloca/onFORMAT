import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DITLogItem {
    id: string;
    time: string;
    eventType: 'offload' | 'backup' | 'transcode' | 'transfer' | 'qc' | 'issue' | '';
    source: string;
    destination: string;
    description: string;
    status: 'pending' | 'complete' | 'failed';
}

interface DITLogData {
    ditName: string;
    date: string;
    items: DITLogItem[];
}

interface DITLogTemplateProps {
    data: Partial<DITLogData>;
    onUpdate: (data: Partial<DITLogData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const EVENT_OPTIONS = [
    { value: 'offload', label: 'OFFLOAD' },
    { value: 'backup', label: 'BACKUP' },
    { value: 'transcode', label: 'TRANSCODE' },
    { value: 'qc', label: 'QC CHECK' },
    { value: 'transfer', label: 'CLIENT SEND' },
    { value: 'issue', label: 'ISSUE / ERROR' },
];

export const DITLogTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: DITLogTemplateProps) => {

    // State for delete confirmation popover
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.items) {
            onUpdate({
                items: [],
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, []);

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: DITLogItem = {
            id: `dit-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventType: '',
            source: '',
            destination: '',
            description: '',
            status: 'pending'
        };
        onUpdate({ items: [...items, newItem] });
    };

    const handleUpdateItem = (index: number, updates: Partial<DITLogItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onUpdate({ items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate({ items: newItems });
        setDeleteConfirmIndex(null);
    };

    const updateField = (field: keyof DITLogData, value: string) => {
        onUpdate({ [field]: value });
    };

    const cycleStatus = (index: number) => {
        if (isLocked) return;
        const statuses: DITLogItem['status'][] = ['pending', 'complete', 'failed'];
        const currentIdx = statuses.indexOf(items[index].status);
        const nextStatus = statuses[(currentIdx + 1) % statuses.length];
        handleUpdateItem(index, { status: nextStatus });
    };

    const isLandscape = orientation === 'landscape';
    const ITEMS_FIRST_PAGE = isLandscape ? 9 : 12;
    const ITEMS_OTHER_PAGES = isLandscape ? 15 : 25;

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
                    title="DIT Log"
                    hideHeader={false}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Header Info - Only on first page */}
                        {pageIndex === 0 && (
                            <div className="border-b-2 border-black pb-4 mb-8">
                                {/* Title Section */}
                                <div className="mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        Digital Imaging Technician Report
                                    </p>
                                </div>

                                {/* Meta Fields */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
                                        <div className={`font-bold text-sm pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.date}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">DIT Name</label>
                                        <input
                                            value={data.ditName || ''}
                                            onChange={e => updateField('ditName', e.target.value)}
                                            placeholder="NAME"
                                            className={`font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            disabled={isLocked}
                                        />
                                        <div className={`font-bold text-sm pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.ditName}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Log Table Header */}
                        <div className="grid grid-cols-[60px_110px_80px_80px_1fr_80px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Time</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Event</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">From</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">To</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description / Verification</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Log Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex === 0) ? localIdx : ITEMS_FIRST_PAGE + ((pageIndex - 1) * ITEMS_OTHER_PAGES) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[60px_110px_80px_80px_1fr_80px_30px] gap-2 py-2 items-center hover:bg-zinc-50 transition-colors group">

                                        {/* Time */}
                                        <input
                                            type="text"
                                            value={item.time}
                                            onChange={e => handleUpdateItem(globalIdx, { time: e.target.value })}
                                            className={`text-center font-mono font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="00:00"
                                            disabled={isLocked}
                                        />
                                        <div className={`text-center font-mono font-bold text-[10px] pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.time}</div>

                                        {/* Event Type Select */}
                                        <div className="relative">
                                            <select
                                                value={item.eventType}
                                                onChange={e => handleUpdateItem(globalIdx, { eventType: e.target.value as any })}
                                                className={`appearance-none bg-transparent font-bold text-[10px] uppercase w-full cursor-pointer outline-none ${item.eventType === 'issue' ? 'text-red-600' : 'text-zinc-700'
                                                    } ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                disabled={isLocked}
                                            >
                                                <option value="" disabled className="text-zinc-300">SELECT TYPE</option>
                                                {EVENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className={`font-bold text-[10px] uppercase pt-0.5 leading-normal ${item.eventType === 'issue' ? 'text-red-600' : 'text-zinc-700'} ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                {EVENT_OPTIONS.find(o => o.value === item.eventType)?.label || ''}
                                            </div>
                                        </div>

                                        {/* From (Source) */}
                                        <input
                                            type="text"
                                            value={item.source}
                                            onChange={e => handleUpdateItem(globalIdx, { source: e.target.value })}
                                            className={`font-mono font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 text-zinc-600 block w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Source..."
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono font-bold text-[10px] px-1 text-zinc-600 pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.source}</div>

                                        {/* To (Destination) */}
                                        <input
                                            type="text"
                                            value={item.destination}
                                            onChange={e => handleUpdateItem(globalIdx, { destination: e.target.value })}
                                            className={`font-mono font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 text-zinc-600 block w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Dest..."
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono font-bold text-[10px] px-1 text-zinc-600 pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.destination}</div>

                                        {/* Description */}
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                            className={`bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-300 w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Verification hash, notes, or details..."
                                            disabled={isLocked}
                                        />
                                        <div className={`px-1 pt-0.5 leading-normal break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.description}</div>

                                        {/* Status Badge */}
                                        <button
                                            onClick={() => cycleStatus(globalIdx)}
                                            disabled={isLocked}
                                            className={`flex justify-center transition-opacity ${isLocked ? '' : 'hover:opacity-80'} ${isPrinting ? 'hidden' : ''} print:hidden`}
                                        >
                                            {item.status === 'complete' && <span className="px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded text-[9px] font-bold uppercase tracking-wider">DONE</span>}
                                            {item.status === 'failed' && <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[9px] font-bold uppercase tracking-wider">FAIL</span>}
                                            {item.status === 'pending' && <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded text-[9px] font-bold uppercase tracking-wider">...</span>}
                                        </button>
                                        <div className={`flex justify-center ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                            {item.status === 'complete' && <span className="px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded text-[9px] font-bold uppercase tracking-wider">DONE</span>}
                                            {item.status === 'failed' && <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[9px] font-bold uppercase tracking-wider">FAIL</span>}
                                            {item.status === 'pending' && <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded text-[9px] font-bold uppercase tracking-wider">...</span>}
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
                            {!isLocked && pageIndex === totalPages - 1 && (
                                <div className="pt-2 print:hidden">
                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
                                        <Plus size={10} className="mr-1" /> Add Log Entry
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {items.length === 0 && (
                            <div className="text-center py-12 text-zinc-300">
                                <p className="text-xs font-bold uppercase tracking-widest">No log entries generated</p>
                            </div>
                        )}
                    </div>
                </DocumentLayout>
            ))}
        </>
    );
};
