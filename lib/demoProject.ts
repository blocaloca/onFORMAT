import { WorkspaceState } from '@/components/onformat/WorkspaceEditor';

export const DEMO_PROJECT_DATA: Partial<WorkspaceState> = {
    activePhase: 'DEVELOPMENT',
    activeTool: 'brief',
    phases: {
        DEVELOPMENT: {
            locked: false,
            drafts: {
                'project-vision': `# Concept: THE SUSTAINABLE SWELL

**Goal:** Launch the 'Reef-Zero' biodegradable surfboard.
**Format:** Hybrid (YouTube Vlog + Instagram Stills).
**Logline:** A raw, day-in-the-life journey of a local shaper testing the world's first algae-based board.

**Visual Style:** 
- Natural light, sunrise tones.
- Handheld documentary video.
- Grainy 35mm film stills.
- GoPro POV surfing shots.`,
                'brief': `# Creative Brief

**Subject/Product:** Reef-Zero Surfboard
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
                content: "👋 **Welcome to onFORMAT.**\n\nI've already set up your Project Vision (check the sidebar later).\n\nLet's jump straight into the **Creative Brief**.\n\nI need to define the **Objective** for this 'Reef-Zero' launch. What is the primary goal?",
                actions: [
                    {
                        label: "Brand Awareness",
                        type: "draft_prefill",
                        prominence: "primary",
                        payload: "**Objective:** To drive massive awareness within the eco-conscious surf community via authentic storytelling."
                    },
                    {
                        label: "Direct Sales",
                        type: "draft_prefill",
                        prominence: "secondary",
                        payload: "**Objective:** To generate pre-orders for the limited first run of boards."
                    }
                ]
            }
        ]
    },
    persona: 'HYBRID',
    clientName: 'Reef & Root',
    projectName: 'Demo: Eco-Surf Launch',
    producer: 'onFORMAT System'
};
