import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
// Templates
import { DocumentLayout } from '@/components/onformat/templates/DocumentLayout'
import { BriefTemplate } from '@/components/onformat/templates/BriefTemplate'
import { DirectorsTreatmentTemplate } from '@/components/onformat/templates/DirectorsTreatmentTemplate'
import { MoodBoardTemplate } from '@/components/onformat/templates/MoodBoardTemplate'
import { LookbookTemplate } from '@/components/onformat/templates/LookbookTemplate'
import { ShotListTemplate } from '@/components/onformat/templates/ShotListTemplate'
import { CameraReportTemplate } from '@/components/onformat/templates/CameraReportTemplate'
import { BudgetTemplate } from '@/components/onformat/templates/BudgetTemplate'
import { ScheduleTemplate } from '@/components/onformat/templates/ScheduleTemplate'
import { LocationsTemplate } from '@/components/onformat/templates/LocationsTemplate'
import { CrewListTemplate } from '@/components/onformat/templates/CrewListTemplate'
import { CastingTemplate } from '@/components/onformat/templates/CastingTemplate'
import { CallSheetTemplate } from '@/components/onformat/templates/CallSheetTemplate'
import { OnSetNotesTemplate } from '@/components/onformat/templates/OnSetNotesTemplate'
import { ScriptNotesTemplate } from '@/components/onformat/templates/ScriptNotesTemplate'
import { DITLogTemplate } from '@/components/onformat/templates/DITLogTemplate'
import { ClientSelectsTemplate } from '@/components/onformat/templates/ClientSelectsTemplate'
import { DeliverablesTemplate } from '@/components/onformat/templates/DeliverablesTemplate'
import { ArchiveLogTemplate } from '@/components/onformat/templates/ArchiveLogTemplate'
import { WardrobeTemplate } from '@/components/onformat/templates/WardrobeTemplate'
import { PropsListTemplate } from '@/components/onformat/templates/PropsListTemplate'
import { AVScriptTemplate } from '@/components/onformat/templates/AVScriptTemplate'
import { SoundReportTemplate } from '@/components/onformat/templates/SoundReportTemplate'
import { EquipmentListTemplate } from '@/components/onformat/templates/EquipmentListTemplate'
import { CreativeConceptTemplate } from '@/components/onformat/templates/CreativeConceptTemplate'
import { StoryboardTemplate } from '@/components/onformat/templates/StoryboardTemplate'
import { OnSetControlPanelTemplate } from '@/components/onformat/templates/OnSetControlPanelTemplate'
import { BudgetActualTemplate } from '@/components/onformat/templates/BudgetActualTemplate'
import { TalentReleaseTemplate } from '@/components/onformat/templates/TalentReleaseTemplate'
import { ReleasesManagerTemplate } from '@/components/onformat/templates/ReleasesManagerTemplate'
import { DocumentNavBar } from './DocumentNavBar'

interface DraftEditorProps {
    draft: string
    onDraftChange: (newDraft: string) => void
    isLocked: boolean
    activeToolLabel: string
    activeToolKey: string
    persona?: string
    clientName?: string
    projectId?: string
    projectName?: string
    producer?: string
    activePhase?: string
    phases?: any
    onToggleLock: () => void
    onGenerateFromVision?: (targetTool: any, visionText: string, promptPrefix: string) => void
    onOpenAi?: () => void
    latestNotification?: { msg: string, time: number } | null
}

// Helper Template for Plain Text
const PlainTemplate = ({ data, onUpdate, isLocked, activeToolLabel, orientation }: any) => {
    // If data is object, stringify it, else use it as string
    const text = typeof data === 'string' ? data : (data?.text || JSON.stringify(data, null, 2));

    // Safety for empty object string "{}"
    const displayText = text === '{}' ? '' : text;

    return (
        <DocumentLayout
            title={activeToolLabel || "Notes"}
            hideHeader={false}
            plain={true}
            orientation={orientation}
        >
            <textarea
                className="w-full h-full bg-transparent p-0 resize-none outline-none font-mono text-xs leading-relaxed text-zinc-800 border-none"
                placeholder="// Start writing..."
                value={displayText}
                onChange={(e) => onUpdate(e.target.value)}
                disabled={isLocked}
                spellCheck={false}
            />
        </DocumentLayout>
    )
}

export const DraftEditor = ({
    draft,
    onDraftChange,
    isLocked,
    activeToolLabel,
    activeToolKey,
    persona,
    clientName,
    projectId,
    projectName,
    producer,
    activePhase,
    phases,
    onToggleLock,
    onGenerateFromVision,
    onOpenAi,
    latestNotification
}: DraftEditorProps) => {

    // Schedule Import Logic
    let importedSchedule = null;
    if (phases?.['PRE_PRODUCTION']?.drafts?.['schedule']) {
        try {
            const raw = JSON.parse(phases['PRE_PRODUCTION'].drafts['schedule']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedSchedule = arr[0];
        } catch { }
    }

    // AV Script Import Logic (for Script Notes)
    let importedAVScript = null;
    if (phases?.['DEVELOPMENT']?.drafts?.['av-script']) {
        try {
            const raw = JSON.parse(phases['DEVELOPMENT'].drafts['av-script']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedAVScript = arr[0];
        } catch { }
    }

    // Budget Import Logic (for Actuals)
    let importedBudget = null;
    if (phases?.['PRE_PRODUCTION']?.drafts?.['budget']) {
        try {
            const raw = JSON.parse(phases['PRE_PRODUCTION'].drafts['budget']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedBudget = arr[0];
        } catch { }
    }

    // DIT Log Import Logic (for Control Panel Alerts)
    let importedDITLog = null;
    if (phases?.['ON_SET']?.drafts?.['dit-log']) {
        try {
            const raw = JSON.parse(phases['ON_SET'].drafts['dit-log']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedDITLog = arr[0];
        } catch { }
    }

    // Brief Import Logic (for Context)
    let importedBrief = null;
    const briefDraft = phases?.['STRATEGY']?.drafts?.['brief'] || phases?.['DEVELOPMENT']?.drafts?.['brief'];
    if (briefDraft) {
        try {
            const raw = JSON.parse(briefDraft);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedBrief = arr[0];
        } catch { }
    }

    // Project Vision Import Logic (for Context)
    let importedVision = null;
    const visionDraft = phases?.['STRATEGY']?.drafts?.['project-vision'] || phases?.['DEVELOPMENT']?.drafts?.['project-vision'];
    if (visionDraft) {
        try {
            const raw = JSON.parse(visionDraft);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedVision = arr[0];
        } catch { }
    }

    // Lookbook Import Logic (for Storyboard Sync)
    let importedLookbook = null;
    if (phases?.['DEVELOPMENT']?.drafts?.['lookbook']) {
        try {
            const raw = JSON.parse(phases['DEVELOPMENT'].drafts['lookbook']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedLookbook = arr[0];
        } catch { }
    }

    // --- Nav Mode Logic ---
    const COLLECTION_TOOLS = [
        'call-sheet',
        'on-set-notes',
        'script-notes',
        'camera-report',
        'sound-report',
        'dit-log',
        'archive-log'
    ];

    const HIDDEN_NAV_TOOLS = [
        'onset-mobile-control',
        'project-vision',
        'creative-direction', // Moodboard
        'lookbook',
        'storyboard',
        'crew-list',
        'casting-talent',
        'locations-sets',
        'wardrobe-styling',
        'props-list',
        'equipment-list',
        'client-selects',
        'deliverables-licensing',
        'budget-actual',
        'releases'
    ];

    let navMode: 'stack' | 'collection' | 'hidden' = 'stack';
    if (COLLECTION_TOOLS.includes(activeToolKey)) navMode = 'collection';
    if (HIDDEN_NAV_TOOLS.includes(activeToolKey)) navMode = 'hidden';

    // Locations Import Logic (for Call Sheet Sync)
    let importedLocations = null;
    if (phases?.['PRE_PRODUCTION']?.drafts?.['locations-sets']) {
        try {
            const raw = JSON.parse(phases['PRE_PRODUCTION'].drafts['locations-sets']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedLocations = arr[0];
        } catch { }
    }

    // --- Document Stack Logic ---
    const [activeVersionIndex, setActiveVersionIndex] = useState(0);

    // Parse draft safely into an Array
    const getVersions = (): any[] => {
        if (!draft) return [{}];
        try {
            const parsed = JSON.parse(draft);
            if (Array.isArray(parsed)) return parsed;
            return [parsed]; // Migration for legacy single objects
        } catch {
            return [{}]; // Fallback
        }
    };

    const versions = getVersions();
    // Safety: ensure activeVersionIndex is within bounds
    const safeIndex = Math.min(activeVersionIndex, versions.length - 1);
    // Handle empty versions array or null entries case
    const activeData = (versions.length > 0 && versions[safeIndex]) ? versions[safeIndex] : {};

    const handleUpdate = (updatedFields: any) => {
        if (isLocked) return;
        const newVersions = [...versions];
        // Ensure index exists
        if (!newVersions[safeIndex]) newVersions[safeIndex] = {};

        newVersions[safeIndex] = { ...newVersions[safeIndex], ...updatedFields };
        onDraftChange(JSON.stringify(newVersions));
    };

    // --- Nav Bar Actions ---
    const handleNew = () => {
        if (navMode === 'collection') {
            // Collection Mode: Append to End (Day 1, Day 2...)
            const newVersions = [...versions, {}];
            setActiveVersionIndex(newVersions.length - 1); // Jump to new last item
            onDraftChange(JSON.stringify(newVersions));
        } else {
            // Stack Mode: Prepend to Start (v2, v1...)
            const newVersions = [{}, ...versions];
            setActiveVersionIndex(0); // Jump to new first item
            onDraftChange(JSON.stringify(newVersions));
        }
    };

    const handleDuplicate = () => {
        const copy = { ...activeData };

        if (navMode === 'collection') {
            // Collection Mode: Append Copy to End
            // Remove ID to avoid conflicts if present
            if (copy.id) delete copy.id;
            const newVersions = [...versions, copy];
            setActiveVersionIndex(newVersions.length - 1);
            onDraftChange(JSON.stringify(newVersions));
        } else {
            // Stack Mode: Prepend Copy to Start
            const newVersions = [copy, ...versions];
            setActiveVersionIndex(0);
            onDraftChange(JSON.stringify(newVersions));
        }
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear this document? Content will be erased.')) {
            const newVersions = [...versions];

            // Define Empty State based on Tool
            let emptyState = {};

            if (activeToolKey === 'project-vision') {
                // Preserve structure for Vision Board
                emptyState = {
                    pages: [{ id: `page-${Date.now()}`, content: '' }],
                    activePageId: `page-${Date.now()}`
                };
            }
            else if (activeToolKey === 'directors-treatment') {
                // Return to 1 empty scene
                emptyState = {
                    scenes: [{
                        id: `scene-${Date.now()}`,
                        image: '',
                        description: '',
                        content: '',
                        type: 'Narrative'
                    }]
                };
            }
            else if (activeToolKey === 'av-script') {
                emptyState = {
                    rows: [{
                        id: `row-${Date.now()}`,
                        scene: '1',
                        visual: '',
                        audio: '',
                        time: ''
                    }]
                };
            }
            else if (activeToolKey === 'shot-scene-book') {
                emptyState = {
                    shots: [{
                        id: `shot-${Date.now()}`,
                        scene: '1',
                        size: 'Wide',
                        angle: 'Eye Level',
                        movement: 'Static',
                        description: ''
                    }]
                };
            }

            newVersions[safeIndex] = emptyState;
            onDraftChange(JSON.stringify(newVersions));
        }
    };

    // Reset index when tool changes to avoid confusion
    useEffect(() => {
        setActiveVersionIndex(0);
    }, [activeToolKey]);



    // --- PDF Export Logic ---
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleExportPdf = async (scope: 'current' | 'all' = 'current') => {
        if (isExportingPdf) return;
        setIsExportingPdf(true);

        try {
            // Dynamically import libraries to prevent SSR/Webpack crashes
            const html2canvas = (await import('html2canvas')).default;
            const jsPDFModule = await import('jspdf');
            // Handle both default (v2) and named (v3) exports for reliability
            const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF;

            // Wait for render of hidden pages
            await new Promise(resolve => setTimeout(resolve, 800));

            const pageWidth = orientation === 'landscape' ? 1056 : 816;
            const pageHeight = orientation === 'landscape' ? 816 : 1056;

            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'px',
                format: [pageWidth, pageHeight],
                hotfixes: ['px_scaling']
            });

            // Determine which versions to export
            const versionsToExport = scope === 'all'
                ? versions.map((_, i) => i)
                : [safeIndex]; // Only current

            let pageAdded = false;
            let capturedPagesCount = 0;

            for (const i of versionsToExport) {
                const container = document.getElementById(`pdf-page-${i}`);
                if (!container) continue;

                // Find all individual pages within this version/draft
                const pages = container.querySelectorAll('.document-page');

                if (pages.length > 0) {
                    for (let p = 0; p < pages.length; p++) {
                        const pageEl = pages[p] as HTMLElement;

                        const canvas = await html2canvas(pageEl, {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                            width: pageWidth,
                            height: pageHeight,
                            windowWidth: pageWidth,
                            windowHeight: pageHeight
                        });

                        const imgData = canvas.toDataURL('image/jpeg', 0.95);

                        if (pageAdded) {
                            pdf.addPage([pageWidth, pageHeight], orientation);
                        }

                        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
                        pageAdded = true;
                    }
                }
            }

            pdf.save(`${(activeToolLabel || 'Document').replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error('PDF Generation Failed:', error);
            alert('Failed to generate PDF. Check console for details.');
        } finally {
            setIsExportingPdf(false);
        }
    };


    // --- Orientation Support ---
    // --- Orientation Support ---
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('onformat_orientation') as 'portrait' | 'landscape') || 'portrait';
        }
        return 'portrait';
    });

    // Removed auto-sync from data to enforce global persistence
    // useEffect(() => { ... }, [activeVersionIndex, activeToolKey]);

    const handleOrientationToggle = (newOrientation: 'portrait' | 'landscape') => {
        setOrientation(newOrientation);
        localStorage.setItem('onformat_orientation', newOrientation);
        handleUpdate({ orientation: newOrientation });
    };

    // --- Template Switcher ---
    let TemplateComponent = PlainTemplate // Default to PlainTemplate
    switch (activeToolKey) {
        case 'brief': TemplateComponent = BriefTemplate; break;
        case 'directors-treatment': TemplateComponent = DirectorsTreatmentTemplate; break;
        case 'lookbook': TemplateComponent = LookbookTemplate; break;
        case 'creative-direction': TemplateComponent = MoodBoardTemplate; break;
        case 'shot-scene-book': TemplateComponent = ShotListTemplate; break;
        case 'budget': TemplateComponent = BudgetTemplate; break;
        case 'schedule': TemplateComponent = ScheduleTemplate; break;
        case 'locations-sets': TemplateComponent = LocationsTemplate; break;
        case 'crew-list': TemplateComponent = CrewListTemplate; break;
        case 'casting-talent': TemplateComponent = CastingTemplate; break;
        case 'call-sheet': TemplateComponent = CallSheetTemplate; break;
        case 'camera-report': TemplateComponent = CameraReportTemplate; break;
        case 'on-set-notes': TemplateComponent = OnSetNotesTemplate; break;
        case 'script-notes': TemplateComponent = ScriptNotesTemplate; break;
        case 'dit-log': TemplateComponent = DITLogTemplate; break;
        case 'client-selects': TemplateComponent = ClientSelectsTemplate; break;
        case 'deliverables-licensing': TemplateComponent = DeliverablesTemplate; break;
        case 'archive-log': TemplateComponent = ArchiveLogTemplate; break;
        case 'wardrobe-styling': TemplateComponent = WardrobeTemplate; break;
        case 'props-list': TemplateComponent = PropsListTemplate; break;
        case 'av-script': TemplateComponent = AVScriptTemplate; break;
        case 'sound-report': TemplateComponent = SoundReportTemplate; break;
        case 'equipment-list': TemplateComponent = EquipmentListTemplate; break;
        case 'project-vision': TemplateComponent = CreativeConceptTemplate; break;
        case 'storyboard': TemplateComponent = StoryboardTemplate; break;
        case 'budget-actual': TemplateComponent = BudgetActualTemplate; break;
        case 'onset-mobile-control': TemplateComponent = OnSetControlPanelTemplate; break;
        case 'talent-release': TemplateComponent = TalentReleaseTemplate; break;
        case 'releases': TemplateComponent = ReleasesManagerTemplate; break;
        default: TemplateComponent = PlainTemplate;
    }

    const containerStyle = orientation === 'landscape'
        ? "w-[1056px] h-[816px]"
        : "w-[816px] h-[1056px]";

    return (
        <section className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">

            <DocumentNavBar
                title={activeToolLabel}
                versions={versions}
                activeVersionIndex={safeIndex}
                onSelectVersion={setActiveVersionIndex}
                onNew={handleNew}
                onDuplicate={handleDuplicate}
                onClear={handleClear}
                onSave={() => { }} // "Save" is implicit
                orientation={orientation}
                onToggleOrientation={handleOrientationToggle}
                onExportPdf={handleExportPdf}
                isExportingPdf={isExportingPdf}
                projectId={projectId}
                navMode={navMode}
            />

            <div className="flex-1 overflow-y-auto bg-transparent p-8 flex flex-col items-center" id="document-preview-area">

                {/* Document Area */}
                <div className="w-full flex justify-center pb-20">
                    <div className="relative z-10">
                        <TemplateComponent
                            data={activeData}
                            // @ts-ignore
                            onUpdate={handleUpdate}
                            isLocked={isLocked}
                            persona={persona}
                            // @ts-ignore
                            plain={false}
                            orientation={orientation}
                            metadata={{
                                projectName,
                                clientName,
                                date: new Date().toLocaleDateString(),
                                producer,
                                directorNames: activeData.directorNames,
                                isTreatment: activeToolKey === 'directors-treatment',
                                importedSchedule,
                                importedAVScript,
                                importedBudget,
                                importedDITLog,
                                importedBrief,
                                importedVision,
                                importedLookbook,
                                importedLocations,
                                projectId,
                                latestNotification
                            }}
                            // @ts-ignore
                            onGenerateFromVision={onGenerateFromVision}
                            // @ts-ignore
                            onOpenAi={onOpenAi}
                        />
                    </div>
                </div>
            </div>

            {/* Lock Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 flex items-center justify-center cursor-not-allowed select-none">
                    <div className="bg-white/90 px-4 py-2 border border-zinc-200 shadow-xl rounded-full text-[10px] font-bold tracking-widest uppercase text-zinc-500 flex items-center gap-2">
                        <span>LOCKED</span>
                    </div>
                </div>
            )}

            {/* Hidden Container for PDF Generation */}
            <div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: -50,
                    opacity: 1,
                    pointerEvents: 'none'
                }}
            >
                {isExportingPdf && versions.map((v, i) => (
                    // Only render if we are exporting 'all' or this is the active version
                    // Note: We don't have 'exportScope' state here easily, so we usually render all.
                    // But if the loop only picks one, it should work.
                    // If the user says it downloads ALL, then the loop is iterating ALL.
                    // Which means scope is 'all'.
                    <div
                        key={i}
                        id={`pdf-page-${i}`}
                        style={{
                            width: orientation === 'landscape' ? '1056px' : '816px',
                            backgroundColor: 'white',
                            padding: '0'
                        }}
                    >
                        <TemplateComponent
                            data={v}
                            // @ts-ignore
                            onUpdate={() => { }}
                            isLocked={true}
                            persona={persona}
                            // @ts-ignore
                            plain={false}
                            orientation={orientation}
                            isPrinting={true}
                            metadata={{
                                projectName,
                                clientName,
                                date: new Date().toLocaleDateString(),
                                producer,
                                directorNames: activeData.directorNames,
                                isTreatment: activeToolKey === 'directors-treatment',
                                projectId,
                                importedBudget
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}
