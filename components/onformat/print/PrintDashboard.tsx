import React, { useEffect, useMemo, useState } from 'react';
import { X, Printer, Settings, Layers, RectangleVertical, RectangleHorizontal, GripVertical, Check, Eye, AlertCircle, FileText } from 'lucide-react';
import { PrintItem } from './types';
import { PrintPreview } from './PrintPreview';
import { ProjectProvider, useProject } from '../ProjectContext'; // Adjust path if needed
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { GlobalPdfDocument } from './pdf-factory/PdfDocumentFactory';

interface PrintDashboardProps {
    onClose: () => void;
    phases: any; // Full project data
    projectName?: string;
    clientName?: string;
    producer?: string;
}

// ---------------------------------------------------------------------------
// Tool Metadata Registry (Expanded)
// ---------------------------------------------------------------------------
const TOOL_TYPES: Record<string, { label: string, defaultOrient: 'portrait' | 'landscape' }> = {
    // Development
    'project-vision': { label: 'Project Vision', defaultOrient: 'portrait' },
    'brief': { label: 'Creative Brief', defaultOrient: 'landscape' },
    'directors-treatment': { label: 'Director\'s Treatment', defaultOrient: 'landscape' },
    'lookbook': { label: 'Lookbook', defaultOrient: 'landscape' },
    'storyboard': { label: 'Storyboard', defaultOrient: 'landscape' },
    'av-script': { label: 'AV Script', defaultOrient: 'portrait' },

    // Pre-Production
    'shot-scene-book': { label: 'Shot List', defaultOrient: 'landscape' },
    'budget': { label: 'Budget', defaultOrient: 'landscape' },
    'schedule': { label: 'Production Schedule', defaultOrient: 'landscape' },
    'crew-list': { label: 'Crew List', defaultOrient: 'portrait' },
    'locations-sets': { label: 'Locations', defaultOrient: 'landscape' },
    'casting-talent': { label: 'Talent', defaultOrient: 'portrait' },
    'wardrobe-styling': { label: 'Wardrobe', defaultOrient: 'portrait' },
    'props-list': { label: 'Props', defaultOrient: 'portrait' },

    // On-Set
    'call-sheet': { label: 'Call Sheet', defaultOrient: 'landscape' },
    'dit-log': { label: 'DIT Log', defaultOrient: 'landscape' },
    'sound-report': { label: 'Sound Report', defaultOrient: 'portrait' },
    'camera-report': { label: 'Camera Report', defaultOrient: 'landscape' },
    'on-set-notes': { label: 'On-Set Notes', defaultOrient: 'portrait' },
    'script-notes': { label: 'Script Notes', defaultOrient: 'landscape' },

    // Post
    'budget-actual': { label: 'Actuals', defaultOrient: 'landscape' },
    'deliverables-licensing': { label: 'Deliverables', defaultOrient: 'portrait' },
    'client-selects': { label: 'Client Selects', defaultOrient: 'landscape' },
    'archive-log': { label: 'Archive Log', defaultOrient: 'portrait' },
};


// ---------------------------------------------------------------------------
// Inner Component (Accesses Context)
// ---------------------------------------------------------------------------
const PrintRoomContent = ({ onClose, projectName }: { onClose: () => void, projectName: string }) => {
    const { activeProject, getToolData } = useProject();

    // Selection State
    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
    const [previewId, setPreviewId] = useState<string | null>(null);

    // Master Orientation State (Default to Portrait)
    const [masterOrientation, setMasterOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // UI State
    const [isExporting, setIsExporting] = useState(false);
    const [coverSettings, setCoverSettings] = useState({
        showCover: true,
        title: projectName,
        subtitle: 'Production Package',
        date: new Date().toLocaleDateString(),
        orientation: 'portrait' as 'portrait' | 'landscape'
    });

    // 1. Build List regarding Context Data
    const documentList = useMemo(() => {
        return Object.entries(TOOL_TYPES).map(([key, meta]) => {
            const data = getToolData(key);
            const hasData = data && Object.keys(data).length > 0;

            return {
                id: key,
                label: meta.label,
                defaultOrient: meta.defaultOrient,
                hasData: hasData,
                status: hasData ? 'Drafted' : 'Empty'
            };
        });
    }, [activeProject, getToolData]);

    // Initial Selection (Start Empty, Show Cover)
    useEffect(() => {
        // No auto-selection of tools
        setSelectedTools(new Set());
        setPreviewId(null); // Shows cover by default
    }, []); // Run once on mount

    const toggleSelection = (id: string) => {
        const next = new Set(selectedTools);
        if (next.has(id)) {
            next.delete(id);
            // If we uncheck the currently previewed item, go back to Cover
            if (previewId === id) setPreviewId(null);
        } else {
            next.add(id);
            // Auto-preview when checking ON
            setPreviewId(id);
        }
        setSelectedTools(next);
    };

    const handlePreviewSelect = (doc: any) => {
        setPreviewId(doc.id);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Construct Playlist for Factory
            const playlist: PrintItem[] = documentList
                .filter(doc => selectedTools.has(doc.id))
                .map(doc => ({
                    id: doc.id,
                    toolKey: doc.id,
                    label: doc.label,
                    isSelected: true,
                    // FORCE Master Orientation for all items
                    orientation: masterOrientation,
                    pageCountEstimate: 1
                }));

            const blob = await pdf(
                <GlobalPdfDocument
                    items={playlist}
                    phases={activeProject?.data?.phases}
                    coverSettings={{
                        ...coverSettings,
                        orientation: masterOrientation // Ensure cover matches
                    }}
                />
            ).toBlob();

            saveAs(blob, `${coverSettings.title || 'Project'} - Package.pdf`);

        } catch (e) {
            console.error("Export Failed", e);
            alert("Export failed. Please check console.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-zinc-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 print:h-auto print:overflow-visible print:bg-white">

            {/* Header */}
            <header className="h-14 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-20 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-emerald-500">
                        <Printer size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-0.5">Print Room</h1>
                        <p className="text-[10px] text-zinc-500 font-mono">Unified Document Manager</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden print:overflow-visible print:h-auto print:block">

                {/* --- Sidebar: The "List" --- */}
                <aside className="w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col overflow-y-auto print:hidden">

                    {/* Master Actions (Orientation) */}
                    <div className="p-4 border-b border-zinc-900 bg-zinc-950/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Master Settings</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMasterOrientation('portrait')}
                                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border text-xs font-medium transition-all ${masterOrientation === 'portrait' ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <RectangleVertical size={14} />
                                <span>Portrait</span>
                            </button>
                            <button
                                onClick={() => setMasterOrientation('landscape')}
                                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border text-xs font-medium transition-all ${masterOrientation === 'landscape' ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <RectangleHorizontal size={14} />
                                <span>Landscape</span>
                            </button>
                        </div>
                    </div>

                    {/* Cover Settings */}
                    <div className="p-4 border-b border-zinc-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                <Settings size={14} />
                                <span>Cover Page</span>
                            </div>
                            <div
                                onClick={() => setCoverSettings(s => ({ ...s, showCover: !s.showCover }))}
                                className={`w-8 h-4 rounded-full cursor-pointer relative transition-colors ${coverSettings.showCover ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${coverSettings.showCover ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                        </div>
                        {coverSettings.showCover && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <input
                                    value={coverSettings.title}
                                    onChange={e => setCoverSettings(s => ({ ...s, title: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="Title"
                                />
                                <input
                                    value={coverSettings.subtitle}
                                    onChange={e => setCoverSettings(s => ({ ...s, subtitle: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="Subtitle"
                                />
                            </div>
                        )}
                    </div>

                    {/* Document Registry */}
                    <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                            <Layers size={14} />
                            <span>Documents</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            {documentList.map(doc => {
                                const isSelected = selectedTools.has(doc.id);
                                const isPreviewing = previewId === doc.id;

                                return (
                                    <div
                                        key={doc.id}
                                        className={`group flex items-center gap-3 p-2 rounded border transition-all cursor-pointer ${isPreviewing ? 'bg-zinc-800/50 border-zinc-700' : 'bg-transparent border-transparent hover:bg-zinc-900/50'}`}
                                        onClick={() => handlePreviewSelect(doc)}
                                    >
                                        {/* Selection Checkbox */}
                                        <div
                                            className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-700 hover:border-zinc-500'}`}
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(doc.id); }}
                                        >
                                            {isSelected && <Check size={10} strokeWidth={4} />}
                                        </div>

                                        {/* Label & Status */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-medium truncate ${doc.hasData ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                                {doc.label}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${doc.hasData ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">
                                                    {doc.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Preview Indicator */}
                                        {isPreviewing && <Eye size={12} className="text-zinc-400" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-zinc-900 mt-auto bg-zinc-950">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-xs rounded-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isExporting ? <div className="w-3 h-3 animate-spin border-2 border-white/30 border-t-white rounded-full" /> : <Printer size={14} />}
                            <span>Export Selection</span>
                        </button>
                    </div>
                </aside>

                {/* --- Preview Pane --- */}
                <main className="flex-1 bg-zinc-900/50 relative overflow-y-auto flex flex-col items-center py-12 print:bg-white print:p-0 print:block print:overflow-visible">
                    <div className="transform scale-[0.65] origin-top pb-20 print:transform-none print:pb-0 print:w-full transition-transform duration-300">

                        {/* Render Active Preview */}
                        <PrintPreview
                            targetToolId={previewId}
                            coverSettings={{
                                ...coverSettings,
                                orientation: masterOrientation
                            }}
                            orientationOverride={masterOrientation}
                        />

                    </div>
                </main>

            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------
export const PrintDashboard = ({ phases, projectName, producer, onClose }: PrintDashboardProps) => {
    return (
        <ProjectProvider phases={phases} projectMetadata={{ name: projectName, producer: producer }}>
            <PrintRoomContent onClose={onClose} projectName={projectName || 'Untitled'} />
        </ProjectProvider>
    );
};
