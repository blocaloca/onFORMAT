import React, { useEffect, useState } from 'react';
import { X, Printer, Settings, Layers, RectangleVertical, RectangleHorizontal, GripVertical, Check, Eye } from 'lucide-react';
import { PrintItem } from './types';
import { PrintPreview } from './PrintPreview';

interface PrintDashboardProps {
    onClose: () => void;
    phases: any; // Full project data to access all drafts
    projectName?: string;
    clientName?: string;
    producer?: string;
}

const TOOL_META: Record<string, { label: string, defaultOrient: 'portrait' | 'landscape' }> = {
    'brief': { label: 'Creative Brief', defaultOrient: 'landscape' },
    'directors-treatment': { label: 'Director\'s Treatment', defaultOrient: 'landscape' },
    'lookbook': { label: 'Lookbook', defaultOrient: 'landscape' },
    'schedule': { label: 'Production Schedule', defaultOrient: 'landscape' },
    'budget': { label: 'Budget', defaultOrient: 'landscape' },
    'shot-scene-book': { label: 'Shot List', defaultOrient: 'landscape' },
    'script-notes': { label: 'Script Notes', defaultOrient: 'landscape' },
    'call-sheet': { label: 'Call Sheet', defaultOrient: 'landscape' },
};


import { generatePdfFromDom } from './pdfExportUtils';

// ...

export const PrintDashboard = ({
    onClose,
    phases,
    projectName = 'Untitled Project',
    clientName = 'Client Name',
    producer
}: PrintDashboardProps) => {

    const [playlist, setPlaylist] = useState<PrintItem[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [coverSettings, setCoverSettings] = useState({
        showCover: true,
        title: projectName,
        subtitle: 'Production Package',
        date: new Date().toLocaleDateString(),
        orientation: 'landscape' as 'portrait' | 'landscape'
    });

    const handleExport = async () => {
        setIsExporting(true);
        // Small delay to let UI show spinner
        setTimeout(async () => {
            try {
                const selectedItems = playlist.filter(i => i.isSelected);
                await generatePdfFromDom(
                    selectedItems,
                    coverSettings,
                    `${projectName || 'Project'} - Package.pdf`
                );
            } catch (e) {
                console.error("Export Failed", e);
                alert('Export failed. See console.');
            } finally {
                setIsExporting(false);
            }
        }, 100);
    };

    // --- 1. Initialization Logic ---
    useEffect(() => {
        const foundItems: PrintItem[] = [];
        const processedTools = new Set<string>();

        // Iterate through phases to find populated drafts
        if (phases) {
            Object.values(phases).forEach((phase: any) => {
                if (phase.drafts) {
                    Object.keys(phase.drafts).forEach(toolKey => {
                        // Only add known tools and avoid duplicates
                        if (TOOL_META[toolKey] && !processedTools.has(toolKey)) {
                            // Check if draft has content (basic check)
                            const draftContent = phase.drafts[toolKey];
                            const hasContent = draftContent && draftContent.length > 5; // minimal check

                            if (hasContent) {
                                processedTools.add(toolKey);
                                const meta = TOOL_META[toolKey];
                                foundItems.push({
                                    id: toolKey,
                                    toolKey: toolKey,
                                    label: meta.label,
                                    isSelected: true, // Default to select all found docs
                                    orientation: meta.defaultOrient,
                                    pageCountEstimate: 1
                                });
                            }
                        }
                    });
                }
            });
        }

        setPlaylist(foundItems);
    }, [phases]);

    // --- 2. Handlers ---
    const toggleSelection = (id: string) => {
        setPlaylist(items => items.map(item =>
            item.id === id ? { ...item, isSelected: !item.isSelected } : item
        ));
    };

    const toggleOrientation = (id: string) => {
        setPlaylist(items => items.map(item =>
            item.id === id ? { ...item, orientation: item.orientation === 'portrait' ? 'landscape' : 'portrait' } : item
        ));
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-zinc-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 print:h-auto print:overflow-visible print:bg-white">

            {/* --- Header (Dark Mode) --- */}
            <header className="h-14 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-20 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-emerald-500">
                        <Printer size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-0.5">Print Room</h1>
                        <p className="text-[10px] text-zinc-500 font-mono">Layout & Export Studio</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
                        title="Close Print Room"
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex overflow-hidden print:overflow-visible print:h-auto print:block">

                {/* 1. Sidebar (Playlist & Settings) */}
                <aside className="w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col overflow-y-auto print:hidden">

                    {/* Cover Page Settings */}
                    <div className="p-4 border-b border-zinc-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                <Settings size={14} />
                                <span>Cover Page</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {coverSettings.showCover && (
                                    <button
                                        onClick={() => setCoverSettings(s => ({ ...s, orientation: s.orientation === 'portrait' ? 'landscape' : 'portrait' }))}
                                        className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                                        title="Toggle Cover Orientation"
                                    >
                                        {coverSettings.orientation === 'portrait' ? <RectangleVertical size={12} /> : <RectangleHorizontal size={12} />}
                                    </button>
                                )}
                                <div
                                    onClick={() => setCoverSettings(s => ({ ...s, showCover: !s.showCover }))}
                                    className={`w-8 h-4 rounded-full cursor-pointer relative transition-colors ${coverSettings.showCover ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${coverSettings.showCover ? 'left-4.5' : 'left-0.5'}`} style={{ left: coverSettings.showCover ? '18px' : '2px' }} />
                                </div>
                            </div>
                        </div>

                        {coverSettings.showCover && (
                            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-zinc-600 mb-1 block">Package Title</label>
                                    <input
                                        value={coverSettings.title}
                                        onChange={(e) => setCoverSettings(s => ({ ...s, title: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                                        placeholder="Project Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-zinc-600 mb-1 block">Subtitle</label>
                                    <input
                                        value={coverSettings.subtitle}
                                        onChange={(e) => setCoverSettings(s => ({ ...s, subtitle: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                                        placeholder="e.g. Pre-Production Deck"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-zinc-600 mb-1 block">Date</label>
                                    <input
                                        value={coverSettings.date}
                                        onChange={(e) => setCoverSettings(s => ({ ...s, date: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Document Playlist */}
                    <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                            <Layers size={14} />
                            <span>Documents</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {playlist.length === 0 && (
                                <div className="text-center py-8 text-zinc-600 text-xs italic">
                                    No populated documents found.
                                </div>
                            )}

                            {playlist.map(item => (
                                <div
                                    key={item.id}
                                    className={`group flex items-center gap-3 p-2 rounded border transition-all ${item.isSelected ? 'bg-zinc-900 border-zinc-800' : 'bg-transparent border-transparent opacity-50 hover:opacity-80'}`}
                                >
                                    <div className="cursor-grab text-zinc-700 hover:text-zinc-500">
                                        <GripVertical size={12} />
                                    </div>

                                    <div
                                        className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-colors ${item.isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-700 hover:border-zinc-500'}`}
                                        onClick={() => toggleSelection(item.id)}
                                    >
                                        {item.isSelected && <Check size={10} strokeWidth={4} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-zinc-200 truncate select-none">{item.label}</div>
                                        {item.isSelected && <div className="text-[9px] text-zinc-500 font-mono">Est. 1 Page</div>}
                                    </div>

                                    {/* Orientation Toggle */}
                                    {item.isSelected && (
                                        <button
                                            onClick={() => toggleOrientation(item.id)}
                                            className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                                            title="Toggle Orientation"
                                        >
                                            {item.orientation === 'portrait' ? <RectangleVertical size={12} /> : <RectangleHorizontal size={12} />}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-zinc-900 mt-auto">
                        <button
                            onClick={handleExport}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs rounded-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Printer size={14} />
                            <span>System Print</span>
                        </button>
                        <p className="text-[9px] text-zinc-500 text-center mt-2">
                            Use system dialog to Save as PDF
                        </p>
                    </div>

                </aside>

                {/* 2. Preview Area (Stage) */}
                <main className="flex-1 bg-zinc-900/50 relative overflow-y-auto flex flex-col items-center py-12 print:bg-white print:p-0 print:block print:overflow-visible">
                    <div className="transform scale-[0.65] origin-top pb-20 print:transform-none print:pb-0 print:w-full">
                        <PrintPreview
                            items={playlist}
                            phases={phases}
                            coverSettings={coverSettings}
                        />
                    </div>
                </main>

            </div>
        </div>
    );
};
