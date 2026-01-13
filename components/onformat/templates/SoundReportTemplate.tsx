import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Plus, Trash2, Mic2 } from 'lucide-react';

interface SoundTake {
    id: string;
    scene: string;
    take: string;
    timecode: string;
    description: string;
    tracks: string; // "1, 2, Boom"
    notes: string;
    circled: boolean;
}

interface SoundReportData {
    date: string;
    roll: string;
    sampleRate: string; // 48kHz
    bitDepth: string; // 24bit
    fps: string; // 23.98
    mixer: string;
    contact: string;
    takes: SoundTake[];
}

interface SoundReportTemplateProps {
    data: Partial<SoundReportData>;
    onUpdate: (data: Partial<SoundReportData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const SoundReportTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: SoundReportTemplateProps) => {

    // State for delete confirmation popover
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!data.takes) {
            onUpdate({
                takes: [],
                sampleRate: '48kHz',
                bitDepth: '24bit',
                fps: '23.98',
                roll: '1'
            });
        }
    }, []);

    const takes = data.takes || [];

    const handleAddTake = () => {
        const lastTake = takes[takes.length - 1];
        const nextTakeNum = lastTake ? String(parseInt(lastTake.take || '0') + 1) : '1';

        const newTake: SoundTake = {
            id: `snd-${Date.now()}`,
            scene: lastTake?.scene || '',
            take: nextTakeNum,
            timecode: '',
            description: '',
            tracks: lastTake?.tracks || '',
            notes: '',
            circled: false
        };
        onUpdate({ takes: [...takes, newTake] });
    };

    const handleUpdateTake = (index: number, updates: Partial<SoundTake>) => {
        const newTakes = [...takes];
        newTakes[index] = { ...newTakes[index], ...updates };
        onUpdate({ takes: newTakes });
    };

    const handleDeleteTake = (index: number) => {
        const newTakes = takes.filter((_, i) => i !== index);
        onUpdate({ takes: newTakes });
        setDeleteConfirmIndex(null);
    };

    const updateField = (field: keyof SoundReportData, value: string) => {
        onUpdate({ [field]: value });
    };

    const ITEMS_PER_PAGE = 25;
    const totalPages = Math.ceil(Math.max(takes.length, 1) / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, i) => takes.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

    return (
        <>
            {pages.map((pageTakes, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Sound Report"
                    hideHeader={false}
                    plain={plain}
                    orientation={orientation}
                    metadata={metadata}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Header Tech Specs */}
                        <div className="border-b-2 border-black pb-4 mb-4">
                            <div className="grid grid-cols-6 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Date</label>
                                    <input value={data.date || ''} onChange={e => updateField('date', e.target.value)} className={`font-bold bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="YYYY-MM-DD" disabled={isLocked} />
                                    <div className={`font-bold pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.date}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Roll #</label>
                                    <input value={data.roll || ''} onChange={e => updateField('roll', e.target.value)} className={`font-bold bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="1" disabled={isLocked} />
                                    <div className={`font-bold pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.roll}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Sample Rate</label>
                                    <input value={data.sampleRate || ''} onChange={e => updateField('sampleRate', e.target.value)} className={`font-bold bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="48kHz" disabled={isLocked} />
                                    <div className={`font-bold pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.sampleRate}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Bit Depth</label>
                                    <input value={data.bitDepth || ''} onChange={e => updateField('bitDepth', e.target.value)} className={`font-bold bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="24bit" disabled={isLocked} />
                                    <div className={`font-bold pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.bitDepth}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">FPS</label>
                                    <input value={data.fps || ''} onChange={e => updateField('fps', e.target.value)} className={`font-bold bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="23.98" disabled={isLocked} />
                                    <div className={`font-bold pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.fps}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Mixer</label>
                                    <input value={data.mixer || ''} onChange={e => updateField('mixer', e.target.value)} className={`font-bold bg-transparent outline-none w-full ${isPrinting ? 'hidden' : ''} print:hidden`} placeholder="Name" disabled={isLocked} />
                                    <div className={`font-bold pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{data.mixer}</div>
                                </div>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-[50px_40px_80px_60px_1fr_1fr_30px_30px] gap-2 border-b border-black pb-2 items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Scn</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Tk</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">TC</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Cir</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tracks / Notes</span>
                            <span className="w-full"></span>
                            <span className="w-full"></span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-0 divide-y divide-zinc-100 flex-1">
                            {pageTakes.map((take, localIdx) => {
                                const globalIdx = (pageIndex * ITEMS_PER_PAGE) + localIdx;
                                return (
                                    <div key={take.id} className="grid grid-cols-[50px_40px_80px_60px_1fr_1fr_30px_30px] gap-2 py-2 items-center hover:bg-zinc-50 transition-colors group">

                                        {/* Scene */}
                                        <input
                                            type="text"
                                            value={take.scene}
                                            onChange={e => handleUpdateTake(globalIdx, { scene: e.target.value })}
                                            className={`font-bold text-center bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="-"
                                            disabled={isLocked}
                                        />
                                        <div className={`font-bold text-center text-xs pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{take.scene}</div>

                                        {/* Take */}
                                        <input
                                            type="text"
                                            value={take.take}
                                            onChange={e => handleUpdateTake(globalIdx, { take: e.target.value })}
                                            className={`font-mono font-bold text-center bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="-"
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono font-bold text-center text-xs pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{take.take}</div>

                                        {/* TC */}
                                        <input
                                            type="text"
                                            value={take.timecode}
                                            onChange={e => handleUpdateTake(globalIdx, { timecode: e.target.value })}
                                            className={`font-mono text-[10px] text-center bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="00:00:00:00"
                                            disabled={isLocked}
                                        />
                                        <div className={`font-mono text-[10px] text-center pt-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>{take.timecode}</div>

                                        {/* Circled */}
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => !isLocked && handleUpdateTake(globalIdx, { circled: !take.circled })}
                                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${take.circled ? 'bg-black border-black text-white' : 'border-zinc-300 text-transparent hover:border-black'} ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            >
                                                <span className="text-[8px]">★</span>
                                            </button>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${take.circled ? 'bg-black border-black text-white' : 'border-zinc-300 text-transparent'} ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                <span className="text-[8px]">★</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <input
                                            type="text"
                                            value={take.description}
                                            onChange={e => handleUpdateTake(globalIdx, { description: e.target.value })}
                                            className={`bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                            placeholder="Details..."
                                            disabled={isLocked}
                                        />
                                        <div className={`text-xs pt-0.5 leading-normal break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{take.description}</div>

                                        {/* Tracks/Notes */}
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={take.tracks}
                                                onChange={e => handleUpdateTake(globalIdx, { tracks: e.target.value })}
                                                className={`font-mono text-[9px] bg-transparent outline-none w-full placeholder:text-zinc-300 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="Trk: Boom, Lav1..."
                                                disabled={isLocked}
                                            />
                                            <div className={`font-mono text-[9px] leading-normal break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{take.tracks}</div>

                                            <input
                                                type="text"
                                                value={take.notes}
                                                onChange={e => handleUpdateTake(globalIdx, { notes: e.target.value })}
                                                className={`text-[9px] italic text-zinc-400 bg-transparent outline-none w-full placeholder:text-zinc-200 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                placeholder="Notes..."
                                                disabled={isLocked}
                                            />
                                            <div className={`text-[9px] italic text-zinc-400 leading-normal break-words ${isPrinting ? 'block' : 'hidden'} print:block`}>{take.notes}</div>
                                        </div>

                                        {/* Blank */}
                                        <span></span>

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
                                                            onClick={() => handleDeleteTake(globalIdx)}
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
                                <div className="pt-2">
                                    <button onClick={handleAddTake} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 py-2 rounded-sm w-full">
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
