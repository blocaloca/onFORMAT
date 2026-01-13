export type ToolKey =
    // DEVELOPMENT
    | 'project-vision'    // Was creative-concept
    | 'brief'
    | 'script'            // Was av-script (consolidated?) or keep distinct
    | 'av-script'
    | 'directors-treatment'
    | 'moodboard'         // Was creative-direction
    | 'lookbook'

    // PRE-PRODUCTION
    | 'shot-list'         // Was shot-scene-book
    | 'schedule'
    | 'budget'
    | 'crew-list'
    | 'casting-talent'
    | 'locations-sets'
    | 'equipment-list'
    | 'wardrobe-styling'
    | 'props-list'

    // ON SET
    | 'call-sheet'
    | 'on-set-notes'
    | 'shot-log'
    | 'sound-report'
    | 'dit-log'

    // POST
    | 'client-selects'
    | 'deliverables-licensing'
    | 'archive-log';

export const PHASE_LABELS = {
    DEVELOPMENT: 'Development',
    PRE_PRODUCTION: 'Pre-Production',
    ON_SET: 'On Set',
    POST: 'Post-Production'
};

/*
    Logic for "Project Vision" availability:
    Ideally controlled by a flag in the WorkspaceState: `useAiCoach: boolean`.
    If true, 'project-vision' is the first tool in DEVELOPMENT.
    If false, 'brief' is the first tool.
*/
