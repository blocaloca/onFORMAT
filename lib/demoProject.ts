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
        ON_SET: { locked: false, drafts: {} },
        POST: { locked: false, drafts: {} }
    },
    chat: {
        'brief': [
            {
                role: 'assistant',
                content: "👋 **Welcome to onFORMAT.**\n\nI've set up your workspace. Let's jump straight into the **Creative Brief**.\n\nFirst, choose a subject to demo:",
                actions: [
                    {
                        label: "Sustainable Surfboard",
                        type: "draft_prefill",
                        prominence: "primary",
                        payload: "**Subject/Product:** Reef-Zero Algae Boards"
                    },
                    {
                        label: "Coffee Flavored Gum",
                        type: "draft_prefill",
                        prominence: "primary",
                        payload: "**Subject/Product:** JitterChew - The Espresso Gum"
                    },
                    {
                        label: "Streetwear Brand",
                        type: "draft_prefill",
                        prominence: "primary",
                        payload: "**Subject/Product:** CONCRETE x FLOW Collection"
                    }
                ]
            }
        ]
    },
    persona: 'HYBRID',
    clientName: 'Demo Client',
    projectName: 'Demo Project',
    producer: 'onFORMAT Sytem'
};
