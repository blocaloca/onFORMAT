import React from 'react'
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

// Helper for Plain Text (Default)
// Exporting this so DraftEditor logic can fall back to it explicitly if needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PlainTemplate = ({ data, onUpdate, isLocked, activeToolLabel, orientation }: any) => {
    const text = typeof data === 'string' ? data : (data?.text || JSON.stringify(data, null, 2));
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

// Registry Mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TEMPLATE_REGISTRY: Record<string, React.ComponentType<any>> = {
    'brief': BriefTemplate,
    'directors-treatment': DirectorsTreatmentTemplate,
    'lookbook': LookbookTemplate,
    'creative-direction': MoodBoardTemplate,
    'shot-scene-book': ShotListTemplate,
    'budget': BudgetTemplate,
    'schedule': ScheduleTemplate,
    'locations-sets': LocationsTemplate,
    'crew-list': CrewListTemplate,
    'casting-talent': CastingTemplate,
    'call-sheet': CallSheetTemplate,
    'camera-report': CameraReportTemplate,
    'on-set-notes': OnSetNotesTemplate,
    'script-notes': ScriptNotesTemplate,
    'dit-log': DITLogTemplate,
    'client-selects': ClientSelectsTemplate,
    'deliverables-licensing': DeliverablesTemplate,
    'archive-log': ArchiveLogTemplate,
    'wardrobe-styling': WardrobeTemplate,
    'props-list': PropsListTemplate,
    'av-script': AVScriptTemplate,
    'sound-report': SoundReportTemplate,
    'equipment-list': EquipmentListTemplate,
    'project-vision': CreativeConceptTemplate,
    'storyboard': StoryboardTemplate,
    'budget-actual': BudgetActualTemplate,
    'onset-mobile-control': OnSetControlPanelTemplate,
    'talent-release': TalentReleaseTemplate,
    'releases': ReleasesManagerTemplate,
};

// Helper Getter
export const getTemplateForTool = (toolKey: string) => {
    return TEMPLATE_REGISTRY[toolKey] || PlainTemplate;
};
