import React, { useEffect, useState } from 'react';
import { DocumentLayout, DocumentMetadata } from './DocumentLayout';
import { Plus, Trash2, HardDrive, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DITLogItem {
    id: string;
    time: string;
    eventType: 'offload' | 'backup' | 'transcode' | 'transfer' | 'qc' | 'issue' | '';
    source: string;
    destination: string;
    dataSize: string;
    checksum: string;
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
    metadata?: DocumentMetadata;
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
            // Priority: Imported Schedule > Current Date
            let initialDate = '';

            if ((metadata as any)?.importedSchedule?.date) {
                initialDate = (metadata as any).importedSchedule.date;
            } else {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                initialDate = `${month}/${day}/${year}`;
            }

            onUpdate({
                items: [],
                date: initialDate
            });
        }
    }, []);



    // ---------------------------------------------------------------------------
    // DIT ALERT SYSTEM
    // ---------------------------------------------------------------------------
    const [mediaAlerts, setMediaAlerts] = useState<any[]>([]);

    useEffect(() => {
        if (!metadata?.projectId) return;

        console.log("Subscribing to DIT Alerts for project:", metadata.projectId);

        const channel = supabase.channel(`project-live-${metadata.projectId}`)
            .on('broadcast', { event: 'NEW_ROLL_PULLED' }, (payload) => {
                console.log("New Roll Alert Received:", payload);
                setMediaAlerts(prev => {
                    // Avoid duplicates if needed, though roll IDs should be unique usually
                    if (prev.find(a => a.roll === payload.payload.roll)) return prev;
                    return [...prev, payload.payload];
                });
            })
            .subscribe();

        // Also broadcast to production_pulse (for Nav Alert)
        const pulse = supabase.channel('production_pulse');
        pulse.subscribe();

        // Listener for pulse
        // Note: The NAV system listens to this. We mainly need to SEND it from the Mobile side when generating the roll.
        // Wait, DIT Log is desktop... Mobile app Generates the alert? 
        // If "New Roll" is triggered here, we should broadcast it.
        // But "New Roll" usually comes FROM Mobile. 
        // If this component RECEIVES it, it means Mobile sent it.
        // The LEFT NAV needs to know about it.

        // Actually, the WorkspaceEditor listens to Document Updates.
        // We should ensure that when we ADD the item, it saves to the JSON.
        // The DraftEditor handles 'onUpdate'.
        return () => { supabase.removeChannel(channel); };
    }, [metadata?.projectId]);

    const handleStartIngest = (alert: any) => {
        // Create new log entry from alert
        const newItem: DITLogItem = {
            id: `dit-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            eventType: 'offload',
            source: `Roll ${alert.roll} (${alert.camera})`,
            destination: '',
            dataSize: '',
            checksum: '',
            description: `Start Ingest: ${alert.mediaType} / ${alert.fps}fps / ${alert.iso}ISO`,
            status: 'pending'
        };
        // Add to list
        onUpdate({ items: [...(data.items || []), newItem] });

        // Remove from alerts
        setMediaAlerts(prev => prev.filter(a => a.roll !== alert.roll));

        // RESET INGEST PENDING FLAG (Global)
        if (metadata?.projectId) {
            const resetFlag = async () => {
                const { data: proj } = await supabase.from('projects').select('data').eq('id', metadata.projectId).single();
                if (proj?.data?.phases?.ON_SET?.metadata) {
                    const newData = { ...proj.data };
                    newData.phases.ON_SET.metadata.ingest_pending = false;
                    await supabase.from('projects').update({ data: newData }).eq('id', metadata.projectId);
                }
            };
            resetFlag();
        }
    };

    const dismissAlert = (roll: string) => {
        setMediaAlerts(prev => prev.filter(a => a.roll !== roll));
    };

    const items = data.items || [];

    const handleAddItem = () => {
        const newItem: DITLogItem = {
            id: `dit-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventType: '',
            source: '',
            destination: '',
            dataSize: '',
            checksum: '',
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

    const formatDate = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const chars = digits.split('');
        if (chars.length > 2) chars.splice(2, 0, '/');
        if (chars.length > 5) chars.splice(5, 0, '/');
        return chars.join('').slice(0, 10);
    };

    const updateField = (field: keyof DITLogData, value: string) => {
        if (field === 'date') {
            onUpdate({ [field]: formatDate(value) });
        } else {
            onUpdate({ [field]: value });
        }
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
                                            placeholder="MM/DD/YYYY"
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
                        <div className="grid grid-cols-[60px_100px_70px_70px_60px_120px_1fr_80px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Time</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Event</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">From</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">To</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Size (GB)</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Checksum / Hash</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Status</span>
                            <span className="w-full"></span>
                        </div>

                        {/* Log Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageItems.map((item, localIdx) => {
                                const globalIdx = (pageIndex === 0) ? localIdx : ITEMS_FIRST_PAGE + ((pageIndex - 1) * ITEMS_OTHER_PAGES) + localIdx;
                                return (
                                    <div key={item.id} className="grid grid-cols-[60px_100px_70px_70px_60px_120px_1fr_80px_30px] gap-2 py-2 items-center hover:bg-zinc-50 transition-colors group">

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

                                        {/* Size (GB) */}
                                        <input
                                            type="text"
                                            value={item.dataSize || ''}
                                            onChange={e => handleUpdateItem(globalIdx, { dataSize: e.target.value })}
                                            className={`font-mono font-bold text-[10px] bg-transparent outline-none focus:bg-white rounded px-1 text-zinc-600 block w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="0 GB"
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono font-bold text-[10px] px-1 text-zinc-600 pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.dataSize}</div>

                                        {/* Checksum */}
                                        <input
                                            type="text"
                                            value={item.checksum || ''}
                                            onChange={e => handleUpdateItem(globalIdx, { checksum: e.target.value })}
                                            className={`font-mono text-[9px] bg-transparent outline-none focus:bg-white rounded px-1 text-zinc-500 block w-full truncate ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="xxhash..."
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono text-[9px] px-1 text-zinc-500 pt-0.5 leading-normal truncate ${isPrinting ? 'block' : 'hidden'} print:block`}>{item.checksum}</div>

                                        {/* Description */}
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={e => handleUpdateItem(globalIdx, { description: e.target.value })}
                                            className={`bg-transparent outline-none focus:bg-white rounded px-1 placeholder:text-zinc-300 w-full ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Notes..."
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
                                <div className="pt-4 flex items-center gap-4 print:hidden border-t border-zinc-100 mt-2">
                                    <button
                                        onClick={handleAddItem}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-3 py-2 rounded-sm transition-colors border border-transparent hover:border-zinc-200"
                                    >
                                        <Plus size={10} /> Add Log Entry
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
            {/* MEDIA ALERTS WIDGET (Fixed) */}
            {mediaAlerts.length > 0 && !isPrinting && (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {mediaAlerts.map((alert, idx) => (
                        <div key={idx} className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-lg shadow-2xl flex flex-col gap-3 relative overflow-hidden">
                            {/* Decorative stripe */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">New Roll Pulled</span>
                                    </div>
                                    <h3 className="text-lg font-bold leading-none">{alert.roll} <span className="text-zinc-500 text-sm">Cam {alert.camera}</span></h3>
                                </div>
                                <button onClick={() => dismissAlert(alert.roll)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="pl-2 grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-mono uppercase">
                                <div>{alert.mediaType}</div>
                                <div>{alert.fps} FPS</div>
                            </div>

                            <button
                                onClick={() => handleStartIngest(alert)}
                                className="ml-2 mt-1 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors"
                            >
                                <HardDrive size={14} /> Start Ingest
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
