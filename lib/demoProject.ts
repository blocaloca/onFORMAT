import { WorkspaceState } from '@/components/onformat/WorkspaceEditor';

export const DEMO_PROJECT_DATA: Partial<WorkspaceState> = {
    activePhase: 'DEVELOPMENT',
    activeTool: 'brief',
    phases: {
        DEVELOPMENT: {
            locked: false,
            drafts: {
                'project-vision': `# Project Vision\n\n**Status:** Pending Creative Brief.\n\n(This document will be populated once we define our strategy in the Brief.)`,
                'brief': `# Creative Brief

**Subject/Product:**
**Objective:**
**Target Audience:**
**Key Message:**
**Tone:**
**Deliverables:**
`
            }
        },
        PRE_PRODUCTION: { locked: false, drafts: {} },
        PRODUCTION: { locked: false, drafts: {} },
        ON_SET: { locked: false, drafts: {} },
        POST: { locked: false, drafts: {} },
        STRATEGY: { locked: false, drafts: {} }
    },
    persona: 'HYBRID',
    clientName: 'Cadence Coffee',
    projectName: 'Demo',
    producer: 'onFORMAT System'
};
