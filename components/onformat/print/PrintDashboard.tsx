import React, { useEffect, useMemo, useState } from 'react';
import { X, Printer, Settings, Layers, RectangleVertical, RectangleHorizontal, GripVertical, Check, Eye, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
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
    'directors-treatment': { label: 'Treatment', defaultOrient: 'landscape' },
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

const PHASE_GROUPS: Record<string, string[]> = {
    'Development': ['project-vision', 'brief', 'directors-treatment', 'lookbook', 'storyboard', 'av-script'],
    'Pre-Production': ['shot-scene-book', 'budget', 'schedule', 'crew-list', 'locations-sets', 'casting-talent', 'wardrobe-styling', 'props-list'],
    'Production': ['call-sheet', 'dit-log', 'sound-report', 'camera-report', 'on-set-notes', 'script-notes'],
    'Post-Production': ['budget-actual', 'deliverables-licensing', 'client-selects', 'archive-log']
};


// ---------------------------------------------------------------------------
// Inner Component (Accesses Context)
// ---------------------------------------------------------------------------
const PrintRoomContent = ({ onClose, projectName }: { onClose: () => void, projectName: string }) => {
    const { activeProject, getToolData, getToolStack } = useProject();

    // Selection State
    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
    const [previewId, setPreviewId] = useState<string | null>(null);

    // Master Day State (-1 = All, 0 = Day 1, 1 = Day 2, etc.)
    // Default to Day 1
    const [masterDay, setMasterDay] = useState<number>(0);

    // Master Orientation State (Default to Landscape)
    const [masterOrientation, setMasterOrientation] = useState<'portrait' | 'landscape'>('landscape');

    // Persistence: Load preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('printroom_orientation');
        if (saved === 'portrait' || saved === 'landscape') {
            setMasterOrientation(saved);
        }
    }, []);

    // Persistence: Save preference on change
    useEffect(() => {
        localStorage.setItem('printroom_orientation', masterOrientation);
    }, [masterOrientation]);

    // UI State
    const [isExporting, setIsExporting] = useState(false);
    const [coverSettings, setCoverSettings] = useState({
        showCover: true,
        title: projectName,
        subtitle: 'Production Package',
        date: new Date().toLocaleDateString(),
        orientation: 'landscape' as 'portrait' | 'landscape' // Will be overridden by masterOrientation in preview
    });

    // 1. Build List regarding Context Data
    const documentList = useMemo(() => {
        return Object.entries(TOOL_TYPES).map(([key, meta]) => {
            // Always fetch full stack to ensure index alignment with Factory
            // Fetch Stack (History) and Current Draft (Active)
            const stack = getToolStack ? getToolStack(key) || [] : [];
            const currentDraft = getToolData(key);

            let versions: any[] = [...stack];

            // Always ensure the active draft is included if valid, as it represents the latest edits
            if (currentDraft && Object.keys(currentDraft).length > 0) {
                const lastVer = versions[versions.length - 1];
                // Simple JSON compare to avoid exact duplicates
                if (!lastVer || JSON.stringify(lastVer) !== JSON.stringify(currentDraft)) {
                    versions.push(currentDraft);
                }
            }
            // Filter out purely empty objects or empty content structure
            versions = versions.filter(v => {
                if (!v) return false;
                if (Object.keys(v).length === 0) return false;
                // Specific checks for known array-based tools
                if (v.slides && Array.isArray(v.slides) && v.slides.length === 0) return false;
                if (v.scenes && Array.isArray(v.scenes) && v.scenes.length === 0) return false;
                if (v.content && Array.isArray(v.content) && v.content.length === 0) return false;
                return true;
            });

            const hasData = versions.length > 0;

            return {
                id: key,
                label: meta.label,
                defaultOrient: meta.defaultOrient,
                hasData: hasData,
                status: hasData ? (versions.length > 1 ? `${versions.length} Versions` : 'Drafted') : 'Empty',
                versions: versions
            };
        });
    }, [activeProject, getToolData, getToolStack]);

    // Calculate Max Days available across all docs
    const maxDays = useMemo(() => {
        let max = 1;
        documentList.forEach(doc => {
            if (doc.versions.length > max) max = doc.versions.length;
        });
        return max;
    }, [documentList]);

    // Initial Selection (Start Empty, Show Cover)
    useEffect(() => {
        setSelectedTools(new Set());
        setPreviewId(null);
    }, []);

    const toggleSelection = (id: string) => {
        const next = new Set(selectedTools);
        if (next.has(id)) {
            next.delete(id);
            if (previewId === id) setPreviewId(null);
        } else {
            next.add(id);
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
                    pageCountEstimate: 1,
                    selectedVersions: masterDay === -1
                        ? doc.versions.map((_: any, i: number) => i)
                        : (doc.versions.length === 1 ? [0] : (masterDay < doc.versions.length ? [masterDay] : []))
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

    // --- Status Helper ---
    const getStatusColor = (doc: any) => {
        if (!doc.hasData) return 'bg-red-500';
        if (doc.versions.length > 1) return 'bg-emerald-500';
        return 'bg-yellow-500';
    };

    return (
        <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col animate-in fade-in duration-200 overflow-hidden text-zinc-200">

            {/* TOP BAR */}
            <header className="h-14 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-emerald-500">
                        <Printer size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-0.5">Print Room</h1>
                        <p className="text-[10px] text-zinc-500 font-mono">Unified Document Manager</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Day Selector */}
                    {maxDays > 0 && (
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors">
                                <span className="text-zinc-500">View:</span>
                                {masterDay === -1 ? 'All Days' : `Day ${masterDay + 1}`}
                                <ChevronDown size={12} className="text-zinc-500" />
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded shadow-xl overflow-hidden hidden group-hover:block z-50">
                                <button
                                    onClick={() => setMasterDay(-1)}
                                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-900 ${masterDay === -1 ? 'text-emerald-500' : 'text-zinc-400'}`}
                                >
                                    All Days
                                </button>
                                {Array.from({ length: maxDays }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMasterDay(i)}
                                        className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-900 ${masterDay === i ? 'text-emerald-500' : 'text-zinc-400'}`}
                                    >
                                        Day {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <div className="w-3 h-3 animate-spin border-2 border-white/30 border-t-white rounded-full" /> : <Printer size={14} />}
                        <span>Export PDF</span>
                    </button>
                    <button onClick={onClose} className="p-2 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </header>

            <div className="flex-1 h-full overflow-hidden grid grid-cols-12 divide-x divide-zinc-900 max-w-[1600px] w-full mx-auto border-x border-zinc-900">

                {/* --- Sidebar: The "List" --- */}
                {/* LEFT COL: CONTROLS (Span 7) */}
                <div className="col-span-5 overflow-y-auto bg-zinc-950/50 py-6 pl-6 pr-6 mr-4 md:py-8 md:pl-8 md:pr-8 md:mr-6 space-y-12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700">

                    {/* 1. COVER PAGE CONTROLS */}
                    <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                                <Layers size={14} className="text-emerald-500" />
                                Cover Page
                            </h2>
                            <div
                                onClick={() => setCoverSettings(s => ({ ...s, showCover: !s.showCover }))}
                                className={`w-10 h-5 rounded-full cursor-pointer relative transition-all duration-300 ${coverSettings.showCover ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${coverSettings.showCover ? 'left-[22px]' : 'left-1'}`} />
                            </div>
                        </div>

                        {coverSettings.showCover && (
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Project Title</label>
                                    <input
                                        value={coverSettings.title}
                                        onChange={(e) => setCoverSettings(s => ({ ...s, title: e.target.value }))}
                                        className="w-full bg-black border border-zinc-800 rounded px-4 py-3 text-sm font-bold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all uppercase tracking-wide"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Client</label>
                                    <input
                                        value={coverSettings.subtitle}
                                        onChange={(e) => setCoverSettings(s => ({ ...s, subtitle: e.target.value }))}
                                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2.5 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-700"
                                        placeholder="Client Name / Agency"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Producer / Owner</label>
                                    <input
                                        value={activeProject?.owner_name || ''}
                                        readOnly
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2.5 text-xs text-zinc-500 focus:outline-none font-mono cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 2. PHASED LIST */}
                    <div className="space-y-10">
                        {Object.entries(PHASE_GROUPS).map(([phase, tools]) => (
                            <div key={phase} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-[10px] font-black uppercase text-zinc-600 mb-4 tracking-[0.2em] border-b border-zinc-900 pb-2">
                                    {phase}
                                </h3>
                                <div className="space-y-1">
                                    {tools.map(toolId => {
                                        const doc = documentList.find(d => d.id === toolId);
                                        if (!doc) return null;

                                        const isSelected = selectedTools.has(toolId);
                                        const statusColor = getStatusColor(doc);

                                        return (
                                            <div
                                                key={toolId}
                                                className="group flex items-center justify-between p-3 rounded-md hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
                                                onClick={() => toggleSelection(toolId)}
                                            >
                                                {/* Left: Checkbox & Name */}
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-black shadow-[0_0_10px_rgba(5,150,105,0.4)]' : 'border-zinc-700 bg-transparent text-transparent group-hover:border-zinc-500'}`}
                                                    >
                                                        <Check size={12} strokeWidth={4} className={`transform transition-transform ${isSelected ? 'scale-100' : 'scale-50 opacity-0'}`} />
                                                    </div>

                                                    <span className={`text-xs font-bold uppercase transition-colors tracking-wide ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                                        {doc.label}
                                                    </span>
                                                </div>

                                                {/* Right: Status Light */}
                                                <div className="flex items-center gap-4">
                                                    <div className="relative flex items-center justify-center w-4 h-4" title={statusColor.includes('red') ? 'Empty' : statusColor.includes('yellow') ? 'Drafting' : 'Ready'}>
                                                        <div className={`w-2 h-2 rounded-full ${statusColor} transition-colors duration-300 group-hover:ring-2 ring-white/10`} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COL: PREVIEW STACK (Span 5) */}
                <div className="col-span-7 h-full overflow-hidden bg-zinc-950 border-l border-zinc-900 relative flex flex-col">

                    {/* Preview Toolbar */}
                    <div className="h-12 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-4 shrink-0">
                        <h2 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                            <Eye size={12} className="text-zinc-600" />
                            Output Preview
                        </h2>
                        <div className="flex bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
                            <button
                                onClick={() => setMasterOrientation('portrait')}
                                className={`p-1.5 rounded transition-all ${masterOrientation === 'portrait' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
                                title="Portrait"
                            >
                                <RectangleVertical size={12} />
                            </button>
                            <button
                                onClick={() => setMasterOrientation('landscape')}
                                className={`p-1.5 rounded transition-all ${masterOrientation === 'landscape' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
                                title="Landscape"
                            >
                                <RectangleHorizontal size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Preview Area */}
                    <div className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-zinc-900/50 flex flex-col items-center py-12">
                        <div className="flex flex-col items-center gap-8 w-full">
                            {/* Render the actual content but scaled */}
                            <PrintPreview
                                scale={0.45}
                                items={documentList
                                    .filter(doc => selectedTools.has(doc.id))
                                    .map(doc => ({
                                        id: doc.id,
                                        toolKey: doc.id,
                                        label: doc.label,
                                        isSelected: true,
                                        orientation: masterOrientation,
                                        pageCountEstimate: 1,
                                        selectedVersions: masterDay === -1
                                            ? doc.versions.map((_: any, i: number) => i)
                                            : (doc.versions.length === 1 ? [0] : (masterDay < doc.versions.length ? [masterDay] : []))
                                    }))
                                }
                                coverSettings={{
                                    ...coverSettings,
                                    orientation: masterOrientation
                                }}
                                orientationOverride={masterOrientation}
                            />
                        </div>
                    </div>
                </div>



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
