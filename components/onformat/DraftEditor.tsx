/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { getTemplateForTool } from '@/components/onformat/TemplateRegistry'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phases?: Record<string, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onGenerateFromVision?: (targetTool: any, visionText: string, promptPrefix: string) => void
    onOpenAi?: () => void
    latestNotification?: { msg: string, time: number } | null
    onMagicImport?: (sourceData: any) => void
    onOpenPrintRoom?: () => void
    isAiDocked?: boolean
    isOwner?: boolean
    orientation?: 'portrait' | 'landscape'
    onToggleOrientation?: () => void
}

const TOOL_ORIENTATIONS: Record<string, 'portrait' | 'landscape'> = {
    'project-vision': 'portrait',
    'brief': 'portrait',
    'directors-treatment': 'portrait',
    'lookbook': 'landscape',
    'storyboard': 'landscape',
    'av-script': 'portrait',
    'shot-scene-book': 'portrait',
    'ecomm-shot-list': 'landscape',
    'budget': 'landscape',
    'schedule': 'portrait',
    'crew-list': 'portrait',
    'locations-sets': 'landscape',
    'casting-talent': 'portrait',
    'wardrobe-styling': 'portrait',
    'props-list': 'portrait',
    'call-sheet': 'portrait',
    'dit-log': 'landscape',
    'sound-report': 'portrait',
    'camera-report': 'landscape',
    'on-set-notes': 'portrait',
    'script-notes': 'landscape',
    'budget-actual': 'landscape',
    'deliverables-licensing': 'portrait',
    'client-selects': 'landscape',
    'archive-log': 'portrait',
};

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
    phases,
    onGenerateFromVision,
    onOpenAi,
    latestNotification,
    onMagicImport,
    onOpenPrintRoom,
    isAiDocked,
    isOwner
}: DraftEditorProps) => {

    // Schedule Import Logic - Search all relevant phases (ON_SET is default in OnFormat, PRODUCTION in OnSet Mobile)
    let importedSchedule = null;
    const scheduleDraft = phases?.['ON_SET']?.drafts?.['schedule'] || phases?.['PRODUCTION']?.drafts?.['schedule'] || phases?.['PRE_PRODUCTION']?.drafts?.['schedule'];
    if (scheduleDraft) {
        try {
            const raw = JSON.parse(scheduleDraft);
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
    const ditLogDraft = phases?.['ON_SET']?.drafts?.['dit-log'] || phases?.['PRODUCTION']?.drafts?.['dit-log'];
    if (ditLogDraft) {
        try {
            const raw = JSON.parse(ditLogDraft);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedDITLog = arr[0];
        } catch { }
    }

    // Brief Import Logic (for Context)
    let importedBrief = null;
    const briefDraft = phases?.['DEVELOPMENT']?.drafts?.['brief'] || phases?.['STRATEGY']?.drafts?.['brief'] || phases?.['PRE_PRODUCTION']?.drafts?.['brief'];
    if (briefDraft) {
        try {
            const raw = JSON.parse(briefDraft);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedBrief = arr[0];
        } catch { }
    }

    // Project Vision Import Logic (for Context)
    let importedVision = null;
    const visionDraft = phases?.['DEVELOPMENT']?.drafts?.['project-vision'] || phases?.['STRATEGY']?.drafts?.['project-vision'];
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


    // Mobile Role Extraction (for Crew List assignment)
    let mobileRoles = [];
    const mobileControlRaw = phases?.['ON_SET']?.drafts?.['onset-mobile-control'] || phases?.['PRODUCTION']?.drafts?.['onset-mobile-control'];
    if (mobileControlRaw) {
        try {
            const raw = JSON.parse(mobileControlRaw);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0 && arr[0].roles) mobileRoles = arr[0].roles;
        } catch { }
    }

    // Locations Import Logic (for Call Sheet Sync)
    let importedLocations = null;
    const locationsDraft = phases?.['PRE_PRODUCTION']?.drafts?.['locations-sets'] || phases?.['ON_SET']?.drafts?.['locations-sets'];
    if (locationsDraft) {
        try {
            const raw = JSON.parse(locationsDraft);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedLocations = arr[0];
        } catch { }
    }

    // Shot List Import Logic (for Storyboard Breakdown)
    let importedShotList = null;
    if (phases?.['PRE_PRODUCTION']?.drafts?.['shot-scene-book']) {
        try {
            const raw = JSON.parse(phases['PRE_PRODUCTION'].drafts['shot-scene-book']);
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.length > 0) importedShotList = arr[0];
        } catch { }
    }

    // --- Document Stack Logic ---
    const [activeVersionIndex, setActiveVersionIndex] = useState(0);

    // Parse draft safely into an Array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdate = (updatedFields: any) => {
        if (isLocked) return;
        const newVersions = [...versions];
        // Ensure index exists
        if (!newVersions[safeIndex]) newVersions[safeIndex] = {};

        newVersions[safeIndex] = { ...newVersions[safeIndex], ...updatedFields };
        onDraftChange(JSON.stringify(newVersions));
    };

    // --- Nav Bar Actions ---
    // --- Nav Bar Actions ---
    const handleNew = () => {
        // Universal "Collection/Day" Mode: Append to End (Day 1, Day 2...)
        // Smart Date Increment Logic
        const lastItem = versions[versions.length - 1] || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newItem: any = {};

        if (lastItem.date) {
            try {
                // Try to parse MM/DD/YYYY
                const [m, d, y] = lastItem.date.split('/').map((n: string) => parseInt(n));
                if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
                    const dateObj = new Date(y, m - 1, d);
                    dateObj.setDate(dateObj.getDate() + 1);
                    const nextDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;
                    newItem.date = nextDate;
                }
            } catch (e) {
                console.warn("Could not increment date", e);
            }
        }

        const newVersions = [...versions, newItem];
        setActiveVersionIndex(newVersions.length - 1); // Jump to new last item
        onDraftChange(JSON.stringify(newVersions));
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

    // Orientation Support
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // Reset index & Sync Orientation when tool changes
    useEffect(() => {
        setActiveVersionIndex(0);
        // Smart Defaulting per tool type
        const defaultOrient = TOOL_ORIENTATIONS[activeToolKey] || 'portrait';
        setOrientation(defaultOrient);
    }, [activeToolKey]);






    const toggleOrientation = () => {
        setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
    };

    // --- Template Switcher ---
    const TemplateComponent = getTemplateForTool(activeToolKey);



    return (
        <section className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">

            <DocumentNavBar
                title={activeToolLabel}
                versions={versions}
                activeVersionIndex={safeIndex}
                onSelectVersion={setActiveVersionIndex}
                onNew={handleNew}
                onClear={handleClear}
                onOpenPrintRoom={onOpenPrintRoom}
                onToggleAi={onOpenAi}
                isAiDocked={isAiDocked}
                activeToolKey={activeToolKey}
                orientation={orientation}
                onToggleOrientation={toggleOrientation}
            />

            <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 flex flex-col" id="document-preview-area">
                <div className="w-full flex-1 flex flex-col max-w-5xl mx-auto p-4 sm:p-8">
                    <TemplateComponent
                        data={activeData}

                        onUpdate={handleUpdate}
                        isLocked={isLocked}
                        persona={persona}

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
                            importedShotList,
                            projectId,
                            isOwner,
                            latestNotification,
                            mobileRoles
                        }}

                        onGenerateFromVision={onGenerateFromVision}

                        onOpenAi={onOpenAi}

                        onMagicImport={onMagicImport}

                        onAddDay={handleNew}
                    />
                </div>
            </div>


            {/* Lock Overlay */}
            {
                isLocked && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 flex items-center justify-center cursor-not-allowed select-none">
                        <div className="bg-white/90 px-4 py-2 border border-zinc-200 shadow-xl rounded-full text-[10px] font-bold tracking-widest uppercase text-zinc-500 flex items-center gap-2">
                            <span>LOCKED</span>
                        </div>
                    </div>
                )
            }

            {/* Hidden Container for PDF Generation */}

        </section >
    )
}
