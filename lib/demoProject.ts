import { WorkspaceState } from '@/components/onformat/WorkspaceEditor';

export const DEMO_PROJECT_DATA: Partial<WorkspaceState> = {
    activePhase: 'DEVELOPMENT',
    activeTool: 'project-vision',
    phases: {
        DEVELOPMENT: {
            locked: false,
            drafts: {
                'project-vision': `# Welcome to the onFORMAT Creative OS

**This is your Workspace.**
To the left is your **Project Vision** document. Think of this as your "War Room" or scratchpad.

### Two Ways to Work:
1.  **Manual Mode ("Old School"):**
    - Simply click anywhere in this document and start typing. 
    - It works just like a standard text editor.
    - Use the sidebar (left) to navigate to specific documents like **Creative Brief**, **Script**, or **Shot List**.

2.  **AI-Assisted Mode:**
    - Use the **AI Liaison** (chat panel on the right).
    - The AI is "context-aware"—it reads what you write here and can help you develop it.
    - Try clicking the **Action Buttons** in the chat to get started instantly.

*(Review the chat panel to the right for your first step)*
`,
                'brief': `# Creative Brief

**Objective:**
To demonstrate the capabilities of the onFORMAT operating system.

**Target Audience:**
Directors, Producers, and Creative Leads who need streamlined workflows.
`
            }
        },
        PRE_PRODUCTION: { locked: false, drafts: {} },
        ON_SET: { locked: false, drafts: {} },
        POST: { locked: false, drafts: {} }
    },
    chat: {
        'project-vision': [
            {
                role: 'assistant',
                content: "👋 **Welcome to onFORMAT.**\n\nI am your AI Liaison. I exist to help you move from **Idea** to **Production**.\n\nLet me show you how I work.\n\nI'm going to draft a concept for a **Hybrid Photo/Video Shoot** for a new eco-surfboard brand. Watch this:",
                actions: [
                    {
                        label: "Draft Concept",
                        type: "draft_prefill",
                        prominence: "primary",
                        payload: "# Concept: THE SUSTAINABLE SWELL\n\n**Goal:** Launch the 'Reef-Zero' biodegradable surfboard.\n**Format:** Hybrid (YouTube Vlog + Instagram Stills).\n**Logline:** A raw, day-in-the-life journey of a local shaper testing the world's first algae-based board.\n\n**Visual Style:** \n- Natural light, sunrise tones.\n- Handheld documentary video.\n- Grainy 35mm film stills.\n- GoPro POV surfing shots."
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
