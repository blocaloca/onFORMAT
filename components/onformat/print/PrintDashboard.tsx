/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Printer, Eye, Layers, Check, ChevronDown } from 'lucide-react';
import { PrintPreview } from './PrintPreview';
import { PrintContext } from './PrintContext';
import { getTemplateForTool } from '../TemplateRegistry';
import { ProjectProvider, useProject } from '../ProjectContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintDashboardProps {
    onClose: () => void;
    phases: any;
    projectName?: string;
    clientName?: string;
    producer?: string;
    projectId?: string;
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------
const TOOL_TYPES: Record<string, { label: string; defaultOrient: 'portrait' | 'landscape' }> = {
    'project-vision':         { label: 'Project Vision',     defaultOrient: 'portrait' },
    'brief':                  { label: 'Creative Brief',      defaultOrient: 'portrait' },
    'directors-treatment':    { label: 'Treatment',           defaultOrient: 'landscape' },
    'lookbook':               { label: 'Lookbook',            defaultOrient: 'landscape' },
    'storyboard':             { label: 'Storyboard',          defaultOrient: 'landscape' },
    'av-script':              { label: 'AV Script',           defaultOrient: 'portrait' },
    'shot-scene-book':        { label: 'Shot List',           defaultOrient: 'landscape' },
    'ecomm-shot-list':        { label: 'eComm Shot List',     defaultOrient: 'landscape' },
    'budget':                 { label: 'Budget',              defaultOrient: 'landscape' },
    'schedule':               { label: 'Production Schedule', defaultOrient: 'landscape' },
    'crew-list':              { label: 'Crew List',           defaultOrient: 'landscape' },
    'locations-sets':         { label: 'Locations',           defaultOrient: 'landscape' },
    'casting-talent':         { label: 'Talent',              defaultOrient: 'portrait' },
    'wardrobe-styling':       { label: 'Wardrobe',            defaultOrient: 'portrait' },
    'props-list':             { label: 'Props',               defaultOrient: 'portrait' },
    'call-sheet':             { label: 'Call Sheet',          defaultOrient: 'landscape' },
    'dit-log':                { label: 'DIT Log',             defaultOrient: 'landscape' },
    'sound-report':           { label: 'Sound Report',        defaultOrient: 'portrait' },
    'camera-report':          { label: 'Camera Report',       defaultOrient: 'landscape' },
    'on-set-notes':           { label: 'On-Set Notes',        defaultOrient: 'portrait' },
    'script-notes':           { label: 'Script Notes',        defaultOrient: 'landscape' },
    'budget-actual':          { label: 'Actuals',             defaultOrient: 'landscape' },
    'deliverables-licensing': { label: 'Deliverables',        defaultOrient: 'portrait' },
    'client-selects':         { label: 'Client Selects',      defaultOrient: 'landscape' },
    'archive-log':            { label: 'Archive Log',         defaultOrient: 'portrait' },
};

const PHASE_GROUPS: Record<string, string[]> = {
    'Development':     ['project-vision', 'brief', 'directors-treatment', 'lookbook', 'storyboard', 'av-script'],
    'Pre-Production':  ['shot-scene-book', 'budget', 'schedule', 'crew-list', 'locations-sets', 'casting-talent', 'wardrobe-styling', 'props-list'],
    'Production':      ['call-sheet', 'ecomm-shot-list', 'dit-log', 'sound-report', 'camera-report', 'on-set-notes', 'script-notes'],
    'Post-Production': ['budget-actual', 'deliverables-licensing', 'client-selects', 'archive-log'],
};

// ---------------------------------------------------------------------------
// Inner component — inside ProjectProvider, has context access
// ---------------------------------------------------------------------------
const PrintRoomContent = ({
    onClose, projectName, clientName, projectId,
}: {
    onClose: () => void;
    projectName: string;
    clientName?: string;
    producer?: string;
    projectId?: string;
}) => {
    const { getToolData, getToolStack, activeProject } = useProject();

    // Per-item orientation — initialised from TOOL_TYPES defaults
    const [itemOrientations, setItemOrientations] = useState<Record<string, 'portrait' | 'landscape'>>(() => {
        const d: Record<string, 'portrait' | 'landscape'> = {};
        Object.entries(TOOL_TYPES).forEach(([k, v]) => { d[k] = v.defaultOrient; });
        return d;
    });

    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
    const [previewId, setPreviewId] = useState<string | null>(null); // null = cover page
    const [masterDay, setMasterDay] = useState(-1); // -1 = all days, 0 = Day 1, etc.
    const [isExporting, setIsExporting] = useState(false);

    const [coverSettings, setCoverSettings] = useState({
        showCover: true,
        title: projectName,
        subtitle: clientName || '',
        date: new Date().toLocaleDateString(),
    });

    const exportAreaRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(0.65);

    // Force light mode while printroom is open
    useEffect(() => {
        const wasDark = document.documentElement.classList.contains('dark');
        if (wasDark) document.documentElement.classList.remove('dark');
        return () => { if (wasDark) document.documentElement.classList.add('dark'); };
    }, []);

    // Dynamic preview scale — responds to panel resize and preview target change
    useEffect(() => {
        const update = () => {
            if (!previewContainerRef.current) return;
            const containerW = previewContainerRef.current.clientWidth - 64;
            const orient = previewId ? (itemOrientations[previewId] || 'portrait') : 'portrait';
            const docW = orient === 'landscape' ? 1056 : 816;
            setPreviewScale(Math.min(1, Math.max(0.3, containerW / docW)));
        };
        update();
        const ro = new ResizeObserver(update);
        if (previewContainerRef.current) ro.observe(previewContainerRef.current);
        return () => ro.disconnect();
    }, [previewId, itemOrientations]);

    // Build document list with data status
    const documentList = useMemo(() => {
        return Object.entries(TOOL_TYPES).map(([key, meta]) => {
            const stack = getToolStack ? (getToolStack(key) || []) : [];
            const currentDraft = getToolData(key);
            let versions: any[] = [...stack];
            if (currentDraft && Object.keys(currentDraft).length > 0) {
                const last = versions[versions.length - 1];
                if (!last || JSON.stringify(last) !== JSON.stringify(currentDraft)) {
                    versions.push(currentDraft);
                }
            }
            versions = versions.filter(v => {
                if (!v || Object.keys(v).length === 0) return false;
                if (v.slides && Array.isArray(v.slides) && v.slides.length === 0) return false;
                if (v.scenes && Array.isArray(v.scenes) && v.scenes.length === 0) return false;
                if (v.rows  && Array.isArray(v.rows)   && v.rows.length === 0)   return false;
                if (v.shots && Array.isArray(v.shots)  && v.shots.length === 0)  return false;
                return true;
            });
            return { id: key, label: meta.label, hasData: versions.length > 0, versions };
        });
    }, [getToolData, getToolStack]);

    // Max production days across all docs with data
    const maxDays = useMemo(() => {
        const counts = documentList.filter(d => d.hasData).map(d => d.versions.length);
        return counts.length > 0 ? Math.max(...counts) : 1;
    }, [documentList]);

    // Selected docs in phase order (for export)
    const orderedSelectedDocs = useMemo(() => {
        const result: typeof documentList = [];
        Object.values(PHASE_GROUPS).flat().forEach(toolId => {
            if (selectedTools.has(toolId)) {
                const doc = documentList.find(d => d.id === toolId);
                if (doc) result.push(doc);
            }
        });
        return result;
    }, [selectedTools, documentList]);

    // Select All (docs with data) / Deselect All
    const selectAll = () => setSelectedTools(new Set(documentList.filter(d => d.hasData).map(d => d.id)));
    const deselectAll = () => { setSelectedTools(new Set()); setPreviewId(null); };

    // Row click: auto-select + set preview. Click active row again to deselect back to cover.
    const handleRowClick = (toolId: string) => {
        if (previewId === toolId) { setPreviewId(null); return; }
        setSelectedTools(prev => { const n = new Set(prev); n.add(toolId); return n; });
        setPreviewId(toolId);
    };

    // Checkbox click: toggle selection only
    const handleCheckboxClick = (e: React.MouseEvent, toolId: string) => {
        e.stopPropagation();
        setSelectedTools(prev => {
            const n = new Set(prev);
            if (n.has(toolId)) {
                n.delete(toolId);
                if (previewId === toolId) setPreviewId(null);
            } else {
                n.add(toolId);
            }
            return n;
        });
    };

    // Orientation pill click
    const handleOrientToggle = (e: React.MouseEvent, toolId: string, orient: 'portrait' | 'landscape') => {
        e.stopPropagation();
        setItemOrientations(prev => ({ ...prev, [toolId]: orient }));
    };

    // Export: capture from hidden area → jsPDF + footer text layer
    const handleExport = async () => {
        if (!exportAreaRef.current) return;
        setIsExporting(true);
        try {
            const pages = Array.from(
                exportAreaRef.current.querySelectorAll('.print-page-capture')
            ) as HTMLElement[];

            if (pages.length === 0) {
                throw new Error('Nothing to export. Enable Cover Page or select at least one document.');
            }

            const total = pages.length;
            let pdf: jsPDF | null = null;

            for (let i = 0; i < pages.length; i++) {
                const el = pages[i];
                const orient = el.dataset.orientation === 'landscape' ? 'l' : 'p';
                const pdfW = orient === 'l' ? 792 : 612;
                const pdfH = orient === 'l' ? 612 : 792;

                if (i === 0) {
                    pdf = new jsPDF({ orientation: orient as 'l' | 'p', unit: 'pt', format: 'letter' });
                } else {
                    pdf!.addPage('letter', orient as 'l' | 'p');
                }

                const canvas = await html2canvas(el, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#FFFFFF',
                    logging: false,
                });

                pdf!.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH);

                // Footer text layer — added after image, not captured in canvas
                pdf!.setFontSize(7);
                pdf!.setTextColor(190, 190, 190);
                pdf!.text(
                    `onFORMAT  ·  Page ${i + 1} of ${total}`,
                    pdfW / 2,
                    pdfH - 10,
                    { align: 'center' }
                );
            }

            pdf!.save(`${coverSettings.title || 'Project'} — Package.pdf`);
        } catch (err) {
            console.error('Export failed', err);
            alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Derived display values
    const previewOrientation: 'portrait' | 'landscape' = previewId
        ? (itemOrientations[previewId] || 'portrait')
        : 'portrait';
    const previewLabel = previewId ? (TOOL_TYPES[previewId]?.label || previewId) : 'Cover Page';

    // Pre-fetch the correct data slice for the preview panel — pulled from documentList
    // so PrintPreview doesn't need to re-lookup via useProject() (avoids stale context reads)
    const previewDocData: any = useMemo(() => {
        if (!previewId) return undefined;
        const doc = documentList.find(d => d.id === previewId);
        if (!doc || doc.versions.length === 0) return {};
        const idx = masterDay >= 0 ? masterDay : doc.versions.length - 1;
        return doc.versions[idx] ?? {};
    }, [previewId, documentList, masterDay]);
    const selectedCount = selectedTools.size;
    const coverPageCount = coverSettings.showCover ? 1 : 0;
    const totalPageCount = coverPageCount + orderedSelectedDocs.reduce(
        (sum, doc) => sum + Math.max(1, doc.versions.length), 0
    );

    // Shared metadata for template rendering
    const templateMetadata = {
        projectName: coverSettings.title,
        date: coverSettings.date,
        producer: activeProject?.owner_name,
    };

    // Cover page HTML (shared between preview and export area)
    const CoverContent = () => (
        <div className="bg-white w-full h-full flex items-center justify-center relative">
            <div className="text-center p-12 flex flex-col items-center justify-center w-full h-full relative">
                <h1 className="text-5xl font-black uppercase tracking-normal text-zinc-900 max-w-2xl leading-tight">
                    {coverSettings.title || 'Untitled Project'}
                </h1>
                <div className="w-24 h-1.5 bg-black mx-auto my-8" />
                <h2 className="text-lg font-bold tracking-[0.3em] uppercase text-zinc-500">
                    {coverSettings.subtitle}
                </h2>
                <p className="mt-8 font-mono text-xs text-zinc-400 font-bold tracking-widest">
                    {coverSettings.date}
                </p>
                <div className="absolute bottom-10 left-0 right-0 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold">
                        Created with onFORMAT
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-zinc-50 z-50 flex flex-col overflow-hidden text-zinc-950">

            {/* ── TOP BAR ── */}
            <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <Printer size={15} className="text-zinc-700" />
                    </div>
                    <div>
                        <h1 className="text-xs font-bold uppercase tracking-widest text-zinc-950 leading-none mb-0.5">
                            Printroom
                        </h1>
                        <p className="text-[10px] text-zinc-400 font-mono">
                            {totalPageCount} page{totalPageCount !== 1 ? 's' : ''} · {selectedCount} doc{selectedCount !== 1 ? 's' : ''} selected
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Day selector — pills for ≤4 days, dropdown for >4 */}
                    {maxDays <= 4 ? (
                        <div className="flex items-center gap-1">
                            {[{ label: 'ALL', value: -1 }, ...Array.from({ length: maxDays }, (_, i) => ({ label: `DAY ${i + 1}`, value: i }))].map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => setMasterDay(value)}
                                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
                                        masterDay === value
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                value={masterDay}
                                onChange={e => setMasterDay(Number(e.target.value))}
                                className="appearance-none bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-700 pl-3 pr-7 py-1.5 rounded-sm focus:outline-none focus:border-zinc-400 cursor-pointer"
                            >
                                <option value={-1}>VIEW: ALL</option>
                                {Array.from({ length: maxDays }, (_, i) => (
                                    <option key={i} value={i}>VIEW: DAY {i + 1}</option>
                                ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-zinc-900 hover:bg-zinc-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                    >
                        {isExporting ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Printer size={13} />
                        )}
                        Export PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* ── SPLIT PANE ── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── LEFT RAIL ── */}
                <aside className="w-[280px] shrink-0 bg-white border-r border-zinc-200 flex flex-col overflow-hidden">

                    {/* Select All / Deselect All */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {selectedCount} selected
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectAll}
                                className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-600 transition-colors"
                            >
                                Select All
                            </button>
                            <span className="text-zinc-300 text-xs">·</span>
                            <button
                                onClick={deselectAll}
                                className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 transition-colors"
                            >
                                None
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 py-5 px-4 space-y-6">

                        {/* Cover Page */}
                        <section>
                            <div className="flex items-center justify-between mb-2.5">
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                    <Layers size={11} />
                                    Cover Page
                                </h2>
                                <button
                                    onClick={() => setCoverSettings(s => ({ ...s, showCover: !s.showCover }))}
                                    className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${coverSettings.showCover ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${coverSettings.showCover ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            {coverSettings.showCover && (
                                <div className="space-y-2">
                                    <input
                                        value={coverSettings.title}
                                        onChange={e => setCoverSettings(s => ({ ...s, title: e.target.value }))}
                                        placeholder="Project title"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs font-bold text-zinc-900 uppercase tracking-wide focus:outline-none focus:border-zinc-400"
                                    />
                                    <input
                                        value={coverSettings.subtitle}
                                        onChange={e => setCoverSettings(s => ({ ...s, subtitle: e.target.value }))}
                                        placeholder="Client / Agency"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-600 focus:outline-none focus:border-zinc-400"
                                    />
                                    <p className="text-[10px] text-zinc-400 font-mono px-0.5">{coverSettings.date}</p>
                                </div>
                            )}
                        </section>

                        {/* Phase-grouped document playlist */}
                        <section className="space-y-5">
                            {/* Cover page row */}
                            {coverSettings.showCover && (() => {
                                const isCoverActive = previewId === null;
                                return (
                                    <div
                                        onMouseDown={() => setPreviewId(null)}
                                        className={`group flex items-center justify-between py-1.5 rounded cursor-pointer transition-colors mb-1 ${
                                            isCoverActive
                                                ? 'bg-zinc-900 border-l-2 border-blue-500 pl-1.5 pr-2'
                                                : 'hover:bg-zinc-100 border-l-2 border-transparent pl-1.5 pr-2'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Layers size={11} className={isCoverActive ? 'text-white/70 shrink-0' : 'text-zinc-400 shrink-0'} />
                                            <span className={`text-[11px] font-bold uppercase tracking-wide ${isCoverActive ? 'text-white' : 'text-zinc-600'}`}>
                                                Cover Page
                                            </span>
                                        </div>
                                        {!isCoverActive && (
                                            <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                Preview →
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}

                            {Object.entries(PHASE_GROUPS).map(([phase, tools]) => (
                                <div key={phase}>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 border-b border-zinc-100 pb-1.5 mb-1.5">
                                        {phase}
                                    </h3>
                                    <div className="space-y-0.5">
                                        {tools.map(toolId => {
                                            const doc = documentList.find(d => d.id === toolId) || {
                                                id: toolId,
                                                label: TOOL_TYPES[toolId]?.label || toolId,
                                                hasData: false,
                                                versions: [],
                                            };
                                            const isSelected = selectedTools.has(toolId);
                                            const isPreviewing = previewId === toolId;
                                            const orient = itemOrientations[toolId] || 'portrait';

                                            return (
                                                <div
                                                    key={toolId}
                                                    onMouseDown={() => handleRowClick(toolId)}
                                                    className={`group flex items-center justify-between py-1.5 rounded cursor-pointer transition-colors ${
                                                        isPreviewing
                                                            ? 'bg-zinc-900 border-l-2 border-blue-500 pl-1.5 pr-2'
                                                            : 'hover:bg-zinc-100 border-l-2 border-transparent pl-1.5 pr-2'
                                                    }`}
                                                >
                                                    {/* Left: checkbox + status dot + name */}
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {/* Checkbox */}
                                                        <div
                                                            onMouseDown={e => { e.stopPropagation(); handleCheckboxClick(e, toolId); }}
                                                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                                                isSelected
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : isPreviewing
                                                                    ? 'border-white/30 bg-white/10'
                                                                    : 'border-zinc-300 bg-white group-hover:border-zinc-400'
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <Check size={9} strokeWidth={3} className="text-white" />
                                                            )}
                                                        </div>

                                                        {/* Status dot */}
                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                            doc.hasData
                                                                ? 'bg-emerald-500'
                                                                : isPreviewing
                                                                ? 'bg-white/20'
                                                                : 'bg-zinc-200'
                                                        }`} />

                                                        {/* Label */}
                                                        <span className={`text-[11px] font-bold uppercase tracking-wide truncate ${
                                                            isPreviewing
                                                                ? 'text-white'
                                                                : doc.hasData
                                                                ? 'text-zinc-800'
                                                                : 'text-zinc-400'
                                                        }`}>
                                                            {doc.label}
                                                        </span>
                                                    </div>

                                                    {/* Right side: PREVIEW → label on hover, P/L toggle always */}
                                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                        {!isPreviewing && (
                                                            <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                Preview →
                                                            </span>
                                                        )}
                                                        <div className={`flex rounded overflow-hidden border shrink-0 ${
                                                            isPreviewing ? 'border-white/20' : 'border-zinc-200'
                                                        }`}>
                                                        <button
                                                            onMouseDown={e => e.stopPropagation()}
                                                            onClick={e => handleOrientToggle(e, toolId, 'portrait')}
                                                            className={`px-1.5 py-0.5 text-[9px] font-bold transition-colors leading-none ${
                                                                orient === 'portrait'
                                                                    ? isPreviewing
                                                                        ? 'bg-white text-zinc-900'
                                                                        : 'bg-zinc-900 text-white'
                                                                    : isPreviewing
                                                                    ? 'text-white/40 hover:text-white/70'
                                                                    : 'text-zinc-400 hover:text-zinc-700'
                                                            }`}
                                                        >
                                                            P
                                                        </button>
                                                        <button
                                                            onMouseDown={e => e.stopPropagation()}
                                                            onClick={e => handleOrientToggle(e, toolId, 'landscape')}
                                                            className={`px-1.5 py-0.5 text-[9px] font-bold transition-colors leading-none ${
                                                                orient === 'landscape'
                                                                    ? isPreviewing
                                                                        ? 'bg-white text-zinc-900'
                                                                        : 'bg-zinc-900 text-white'
                                                                    : isPreviewing
                                                                    ? 'text-white/40 hover:text-white/70'
                                                                    : 'text-zinc-400 hover:text-zinc-700'
                                                            }`}
                                                        >
                                                            L
                                                        </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </section>

                    </div>
                </aside>

                {/* ── RIGHT PANEL: WYSIWYG PREVIEW ── */}
                <main className="flex-1 flex flex-col overflow-hidden bg-zinc-100">

                    {/* Preview toolbar */}
                    <div className="h-10 border-b border-zinc-200 bg-white flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <Eye size={12} className={previewId ? 'text-zinc-700' : 'text-zinc-300'} />
                            {previewId ? (
                                <>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Previewing</span>
                                    <span className="text-[9px] text-zinc-300">·</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">
                                        {previewLabel}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                                    No document selected
                                </span>
                            )}
                        </div>
                        {previewId && (
                            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                                {previewOrientation}
                            </span>
                        )}
                    </div>

                    {/* Scrollable preview area — single document WYSIWYG */}
                    <div
                        ref={previewContainerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center pt-10 pb-20 px-8"
                    >
                        {!previewId && !coverSettings.showCover ? (
                            <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 select-none pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
                                    <Eye size={22} className="text-zinc-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-zinc-500">
                                        Select a document to preview
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Click any item in the playlist to flightcheck before export
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <PrintPreview
                                toolId={previewId}
                                orientation={previewOrientation}
                                coverSettings={coverSettings}
                                scale={previewScale}
                                previewData={previewDocData}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* ── HIDDEN EXPORT AREA ──
                position:fixed keeps it out of any overflow:hidden parent.
                Positioned far off-screen so it's invisible but fully rendered
                (opacity would make html2canvas capture transparent images).
                Templates render their own DocumentLayout instances — each
                DocumentLayout.document-page div carries print-page-capture
                so querySelectorAll finds one element per page, unclipped.    */}
            <div
                ref={exportAreaRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: -9999,
                    width: 1200,
                    pointerEvents: 'none',
                }}
                aria-hidden="true"
            >
                <PrintContext.Provider value={true}>

                    {/* Cover page — no DocumentLayout, so needs explicit capture div */}
                    {coverSettings.showCover && (
                        <div
                            className="print-page-capture bg-white"
                            data-orientation="portrait"
                            style={{ width: 816, height: 1056 }}
                        >
                            <CoverContent />
                        </div>
                    )}

                    {/* Selected documents — each Template renders DocumentLayout pages.
                        Each DocumentLayout.document-page has print-page-capture, so the
                        export loop finds all pages without overflow clipping.             */}
                    {orderedSelectedDocs.flatMap(doc => {
                        const Template = getTemplateForTool(doc.id);
                        const orientation = itemOrientations[doc.id] || 'portrait';
                        const allVersions = doc.versions.length > 0
                            ? doc.versions
                            : [getToolData(doc.id) || {}];
                        const versions = masterDay === -1
                            ? allVersions
                            : allVersions.slice(masterDay, masterDay + 1);

                        return versions.map((versionData: any, idx: number) => (
                            Template ? (
                                <Template
                                    key={`${doc.id}-${idx}`}
                                    data={versionData}
                                    plain={false}
                                    orientation={orientation}
                                    isPrinting={true}
                                    metadata={templateMetadata}
                                    onUpdate={() => {}}
                                />
                            ) : null
                        ));
                    })}

                </PrintContext.Provider>
            </div>

        </div>
    );
};

// ---------------------------------------------------------------------------
// Public export — wraps in ProjectProvider
// ---------------------------------------------------------------------------
export const PrintDashboard = ({
    phases, projectName, clientName, producer, onClose, projectId,
}: PrintDashboardProps) => (
    <ProjectProvider phases={phases} projectMetadata={{ name: projectName, producer }}>
        <PrintRoomContent
            onClose={onClose}
            projectName={projectName || 'Untitled'}
            clientName={clientName}
            producer={producer}
            projectId={projectId}
        />
    </ProjectProvider>
);
