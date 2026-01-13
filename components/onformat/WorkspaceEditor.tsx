'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { JumpStartDialog } from '@/components/onformat/JumpStartDialog'
import { Header } from '@/components/onformat/Header'
import { ExperimentalWorkspaceNav } from '@/components/onformat/ExperimentalNav'
import { ChatInterface } from '@/components/onformat/ChatInterface'
import { DraftEditor } from '@/components/onformat/DraftEditor'

type Phase = 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'ON_SET' | 'POST'

type ToolKey =
    | 'project-vision' // Renamed from creative-concept
    | 'brief'
    | 'directors-treatment'
    | 'lookbook'
    | 'storyboard' // Renamed from creative-direction
    | 'shot-scene-book'
    | 'budget'
    | 'schedule'
    | 'locations-sets'
    | 'crew-list'
    | 'casting-talent'
    | 'call-sheet'
    | 'shot-log'
    | 'on-set-notes'
    | 'script-notes'
    | 'dit-log'
    | 'client-selects'
    | 'deliverables-licensing'
    | 'archive-log'
    | 'wardrobe-styling'
    | 'props-list'
    | 'av-script'
    | 'sound-report'
    | 'equipment-list'
    | 'onset-mobile-control'
    | 'budget-actual'
    | 'supervising-producer'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const PHASES: Phase[] = ['DEVELOPMENT', 'PRE_PRODUCTION', 'ON_SET', 'POST']

const TOOLS_BY_PHASE: Record<Phase, { key: ToolKey; label: string }[]> = {
    DEVELOPMENT: [
        { key: 'project-vision', label: 'Project Vision' }, // Renamed
        { key: 'brief', label: 'Creative Brief' },
        { key: 'av-script', label: 'AV Script' }, // Moved from Plan
        { key: 'directors-treatment', label: "Treatment" },
        { key: 'storyboard', label: 'Storyboard' }, // Renamed from Moodboard
        { key: 'lookbook', label: "Lookbook" },
    ],
    PRE_PRODUCTION: [
        { key: 'shot-scene-book', label: 'Shot List' }, // Moved to top of Pre-Pro
        { key: 'schedule', label: 'Schedule' },
        { key: 'budget', label: 'Budget' },
        { key: 'crew-list', label: 'Crew List' },
        { key: 'casting-talent', label: 'Talent' },
        { key: 'locations-sets', label: 'Locations' },
        { key: 'equipment-list', label: 'Equipment List' },
        { key: 'wardrobe-styling', label: 'Wardrobe' },
        { key: 'props-list', label: 'Props' },
    ],
    ON_SET: [
        { key: 'call-sheet', label: 'Call Sheet' },
        { key: 'on-set-notes', label: 'On-Set Notes' },
        { key: 'shot-log', label: 'Shot Log' },
        { key: 'script-notes', label: 'Script Notes' },
        { key: 'sound-report', label: 'Sound Report' },
        { key: 'dit-log', label: 'DIT Log' },
        { key: 'onset-mobile-control', label: 'onSET Mobile' },
    ],
    POST: [
        { key: 'budget-actual', label: 'Actuals' },
        { key: 'client-selects', label: 'Client Selects' },
        { key: 'deliverables-licensing', label: 'Deliverables' },
        { key: 'archive-log', label: 'Archive Log' },
    ],
}

type PhaseState = {
    locked: boolean
    // drafts by tool key
    drafts: Partial<Record<ToolKey, string>>
}

export type WorkspaceState = {
    activePhase: Phase
    activeTool: ToolKey
    phases: Record<Phase, PhaseState>
    chat: Partial<Record<ToolKey, ChatMsg[]>>
    clientName?: string
    persona?: 'STILLS' | 'MOTION' | 'HYBRID'
    projectName?: string
    producer?: string
}

const STORAGE_KEY = 'onformat_v0_state'

export function makeInitialState(): WorkspaceState {
    const basePhaseState: PhaseState = { locked: false, drafts: {} }
    return {
        activePhase: 'DEVELOPMENT',
        activeTool: 'project-vision',
        phases: {
            DEVELOPMENT: { ...basePhaseState },
            PRE_PRODUCTION: { ...basePhaseState },
            ON_SET: { ...basePhaseState },
            POST: { ...basePhaseState },
        },
        chat: {},
        clientName: '',
        persona: 'MOTION',
        projectName: '',
        producer: ''
    }
}

function safeJsonParse<T>(s: string | null): T | null {
    if (!s) return null
    try {
        return JSON.parse(s) as T
    } catch {
        return null
    }
}

function buildHandoffPayload(phases: WorkspaceState['phases']): Record<string, any> {
    const payload: Record<string, any> = {}
    for (const p of PHASES) {
        payload[p] = {
            locked: phases[p].locked,
            drafts: phases[p].drafts,
        }
    }
    return payload
}

interface WorkspaceEditorProps {
    initialState?: WorkspaceState;
    projectId?: string;
    projectName?: string; // Passed from parent
    onSave?: (state: WorkspaceState) => void;
}

export const WorkspaceEditor = ({ initialState, projectId, projectName, onSave }: WorkspaceEditorProps) => {
    // Merge props into initial state if provided
    const [isJumpStartOpen, setIsJumpStartOpen] = useState(false);
    const [jumpStartStatus, setJumpStartStatus] = useState<string>('');
    const [isJumpStartProcessing, setIsJumpStartProcessing] = useState(false);

    const mergedInitialState = useMemo(() => {
        const base = initialState || makeInitialState();
        if (projectName) base.projectName = projectName;
        return base;
    }, [initialState, projectName]);

    const [state, setState] = useState<WorkspaceState>(mergedInitialState)

    // Sync projectName if it updates and wasn't in state
    useEffect(() => {
        if (projectName && state.projectName !== projectName) {
            setState(s => ({ ...s, projectName }));
        }
    }, [projectName]);

    // Hydration fix / LocalStorage fallback if no external state management
    useEffect(() => {
        if (!initialState && !projectId) {
            const stored = safeJsonParse<WorkspaceState>(localStorage.getItem(STORAGE_KEY))
            if (stored) setState(stored)
        }
    }, [initialState, projectId])

    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Persist
    useEffect(() => {
        // Logic: If onSave provided, use it. Else fall back to local storage if no Project ID (legacy DEV mode)
        if (onSave) {
            onSave(state);
        } else if (!projectId) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
            } catch { }
        }
    }, [state, onSave, projectId])

    // Derived from state now
    const persona = state.persona || 'MOTION';
    const setPersona = (p: 'STILLS' | 'MOTION' | 'HYBRID') => setState(s => ({ ...s, persona: p }));

    // Safety: ensure activePhaseState exists. If corrupt, fallback to safe state immediately
    const activePhaseState = state.phases ? state.phases[state.activePhase] : null;

    if (!activePhaseState) {
        // Critical State Corruption - Rendering impossible. 
        // We will trigger a reset effect but strictly return null to avoid crash.
        return <div className="p-10 font-bold text-red-500">State Corruption Detected. Resetting... (Please refresh if stuck)</div>;
    }

    // Fallback if phase is invalid in state
    const tools = TOOLS_BY_PHASE[state.activePhase] || TOOLS_BY_PHASE['DEVELOPMENT']

    const lockedPhases = useMemo(() => {
        const out: Record<Phase, boolean> = { DEVELOPMENT: false, PRE_PRODUCTION: false, ON_SET: false, POST: false }
        for (const p of PHASES) out[p] = state.phases[p].locked
        return out
    }, [state.phases])

    const phaseData = useMemo(() => buildHandoffPayload(state.phases), [state.phases])

    function setPhase(next: Phase) {
        setState((s) => {
            const nextTool = TOOLS_BY_PHASE[next][0]?.key ?? 'brief'
            return { ...s, activePhase: next, activeTool: nextTool }
        })
    }

    function setTool(tool: ToolKey) {
        // @ts-ignore
        setState((s) => ({ ...s, activeTool: tool }))
    }

    function resetAll() {
        setState(makeInitialState())
        setInput('')
        setError(null)
    }

    function lockPhase() {
        setState((s) => ({
            ...s,
            phases: {
                ...s.phases,
                [s.activePhase]: { ...s.phases[s.activePhase], locked: true },
            },
        }))
    }

    function unlockPhase() {
        setState((s) => ({
            ...s,
            phases: {
                ...s.phases,
                [s.activePhase]: { ...s.phases[s.activePhase], locked: false },
            },
        }))
    }

    function saveDraftForActiveTool(incoming: string) {
        const activePhaseState = state.phases[state.activePhase]
        const rawCurrent = activePhaseState.drafts[state.activeTool] || '[]' // Default to empty array string

        let currentStack: any[] = [];
        try {
            const parsed = JSON.parse(rawCurrent);
            if (Array.isArray(parsed)) {
                currentStack = parsed;
            } else {
                // Migration: Wrap legacy object in array
                currentStack = [parsed];
            }
        } catch {
            // Fallback for empty or invalid string
            currentStack = [{}];
        }

        // Ensure at least one item
        if (currentStack.length === 0) currentStack.push({});

        // CHECK: Is incoming a Full Stack Update (Array) from DraftEditor?
        try {
            const parsedIncoming = JSON.parse(incoming);
            if (Array.isArray(parsedIncoming)) {
                // If the editor sends an array, it is the Authority.
                // It means the user clicked New/Duplicate/Clear or Edited content.
                // We just save it.
                setState((s) => ({
                    ...s,
                    phases: {
                        ...s.phases,
                        [s.activePhase]: {
                            ...s.phases[s.activePhase],
                            drafts: {
                                ...s.phases[s.activePhase].drafts,
                                [s.activeTool]: incoming,
                            },
                        },
                    },
                }));
                return;
            }
        } catch {
            // Not JSON, continue to AI logic
        }

        // We only modify the "HEAD" (index 0) of the stack with AI updates
        const currentHeadRaw = JSON.stringify(currentStack[0]);
        let newHeadRaw = incoming;

        // --- AI Parsing Logic applied to Head ---
        // SPECIAL HANDLING: Parsing AI Markdown for Brief
        if (state.activeTool === 'brief') {
            const objectiveMatch = incoming.match(/\*\*Objective:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const audienceMatch = incoming.match(/\*\*(?:Target )?Audience:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const toneMatch = incoming.match(/\*\*Tone(?: [&/\\,]+ Style)?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const messageMatch = incoming.match(/\*\*(?:Key )?Message:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const deliverablesMatch = incoming.match(/\*\*Deliverables:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (objectiveMatch || audienceMatch || toneMatch || messageMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (objectiveMatch) parsedUpdate.objective = objectiveMatch[1].trim();
                // Map "Audience" to "targetAudience"
                if (audienceMatch) parsedUpdate.targetAudience = audienceMatch[1].trim();
                if (toneMatch) parsedUpdate.tone = toneMatch[1].trim();
                // Map "Message" to "keyMessage"
                if (messageMatch) parsedUpdate.keyMessage = messageMatch[1].trim();
                if (deliverablesMatch) {
                    // split by comma or newline
                    parsedUpdate.deliverables = deliverablesMatch[1]
                        .split(/[,;\n]/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                }

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    newHeadRaw = JSON.stringify({ ...parsedCurrent, ...parsedUpdate }, null, 2);
                } catch {
                    newHeadRaw = JSON.stringify(parsedUpdate, null, 2);
                }

                // Update Stack
                currentStack[0] = JSON.parse(newHeadRaw);
                const finalDraftString = JSON.stringify(currentStack);

                setState((s) => ({
                    ...s,
                    phases: {
                        ...s.phases,
                        [s.activePhase]: {
                            ...s.phases[s.activePhase],
                            drafts: {
                                ...s.phases[s.activePhase].drafts,
                                [s.activeTool]: finalDraftString,
                            },
                        },
                    },
                }));
                return;
            }
        }

        // SPECIAL HANDLING: Directors Treatment
        if (state.activeTool === 'directors-treatment') {
            const arcMatch = incoming.match(/\*\*Narrative Arc:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const charMatch = incoming.match(/\*\*Character Philosophy:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const visualMatch = incoming.match(/\*\*Visual Language:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (arcMatch || charMatch || visualMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (arcMatch) parsedUpdate.narrativeArc = arcMatch[1].trim();
                if (charMatch) parsedUpdate.characterPhilosophy = charMatch[1].trim();
                if (visualMatch) parsedUpdate.visualLanguage = visualMatch[1].trim();

                let newHeadRawWithUpdate = newHeadRaw;
                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    newHeadRawWithUpdate = JSON.stringify({ ...parsedCurrent, ...parsedUpdate }, null, 2);
                } catch {
                    newHeadRawWithUpdate = JSON.stringify(parsedUpdate, null, 2);
                }

                // Update Stack
                currentStack[0] = JSON.parse(newHeadRawWithUpdate);
                const finalDraftString = JSON.stringify(currentStack);

                setState((s) => ({
                    ...s,
                    phases: {
                        ...s.phases,
                        [s.activePhase]: {
                            ...s.phases[s.activePhase],
                            drafts: {
                                ...s.phases[s.activePhase].drafts,
                                [s.activeTool]: finalDraftString,
                            },
                        },
                    },
                }));
                return;
            }
        }

        // SPECIAL HANDLING: Visual Direction (Mood Board / Storyboard)
        if (state.activeTool === 'storyboard') {
            const themeMatch = incoming.match(/\*\*Theme:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const overviewMatch = incoming.match(/\*\*Overview:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const keywordsMatch = incoming.match(/\*\*Keywords:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (themeMatch || overviewMatch || keywordsMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (themeMatch) parsedUpdate.theme = themeMatch[1].trim();
                if (overviewMatch) parsedUpdate.overview = overviewMatch[1].trim();
                if (keywordsMatch) {
                    parsedUpdate.keywords = keywordsMatch[1]
                        .split(/[,;\n]/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                }

                let newHeadRawWithUpdate = newHeadRaw;
                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    newHeadRawWithUpdate = JSON.stringify({ ...parsedCurrent, ...parsedUpdate }, null, 2);
                } catch {
                    newHeadRawWithUpdate = JSON.stringify(parsedUpdate, null, 2);
                }

                // Update Stack
                currentStack[0] = JSON.parse(newHeadRawWithUpdate);
                const finalDraftString = JSON.stringify(currentStack);

                setState((s) => ({
                    ...s,
                    phases: {
                        ...s.phases,
                        [s.activePhase]: {
                            ...s.phases[s.activePhase],
                            drafts: {
                                ...s.phases[s.activePhase].drafts,
                                [s.activeTool]: finalDraftString,
                            },
                        },
                    },
                }));
                return;
            }
        }

        // Default Generic Merger
        try {
            const parsedIncoming = JSON.parse(incoming)
            try {
                const parsedCurrent = JSON.parse(currentHeadRaw)
                newHeadRaw = JSON.stringify({ ...parsedCurrent, ...parsedIncoming }, null, 2)
            } catch {
                newHeadRaw = JSON.stringify(parsedIncoming, null, 2)
            }
        } catch {
            // Fallback text appendage
            try {
                const parsedCurrent = JSON.parse(currentHeadRaw)
                if (typeof parsedCurrent.objective === 'string') {
                    parsedCurrent.objective = (parsedCurrent.objective ? parsedCurrent.objective + '\n\n' : '') + incoming
                } else {
                    parsedCurrent.notes = (parsedCurrent.notes ? parsedCurrent.notes + '\n\n' : '') + incoming
                }
                newHeadRaw = JSON.stringify(parsedCurrent, null, 2)
            } catch {
                if (currentHeadRaw === '{}') {
                    newHeadRaw = incoming
                } else {
                    newHeadRaw = currentHeadRaw + '\n\n' + incoming
                }
            }
        }

        // SPECIAL HANDLING: Project Vision (Creative Concept) v2
        if (state.activeTool === 'project-vision') {
            try {
                const parsedCurrent = JSON.parse(currentHeadRaw);
                const pages = Array.isArray(parsedCurrent.pages) ? parsedCurrent.pages : [];

                // Determine Target Page
                let targetPageIndex = -1;
                if (parsedCurrent.activePageId) {
                    targetPageIndex = pages.findIndex((p: any) => p.id === parsedCurrent.activePageId);
                }

                // Fallback to last page if active not found or not set
                if (targetPageIndex === -1 && pages.length > 0) {
                    targetPageIndex = pages.length - 1;
                }

                if (targetPageIndex !== -1) {
                    // Append to Page Content
                    const oldContent = pages[targetPageIndex].content || '';
                    const newContent = oldContent ? oldContent + '\n\n' + incoming : incoming;

                    pages[targetPageIndex] = { ...pages[targetPageIndex], content: newContent };
                    parsedCurrent.pages = pages;
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                } else {
                    // No pages exist - Create one
                    const newPage = {
                        id: `page-${Date.now()}`,
                        content: incoming
                    };
                    parsedCurrent.pages = [newPage];
                    parsedCurrent.activePageId = newPage.id;
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                }
            } catch {
                // Initialize if empty or broken
                const newPage = {
                    id: `page-${Date.now()}`,
                    content: incoming
                };
                newHeadRaw = JSON.stringify({
                    pages: [newPage],
                    activePageId: newPage.id
                }, null, 2)
            }
        }
        // SPECIAL HANDLING: Parsing for Brief
        else if (state.activeTool === 'brief') {
            // Heuristics for Brief Fields
            const objMatch = incoming.match(/\*\*Objective:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const audMatch = incoming.match(/\*\*Target Audience:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const toneMatch = incoming.match(/\*\*Tone & Style:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const msgMatch = incoming.match(/\*\*Key Message:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (objMatch || audMatch || toneMatch || msgMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (objMatch) parsedUpdate.objective = objMatch[1].trim();
                if (audMatch) parsedUpdate.targetAudience = audMatch[1].trim();
                if (toneMatch) parsedUpdate.tone = toneMatch[1].trim();
                if (msgMatch) parsedUpdate.keyMessage = msgMatch[1].trim();

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    newHeadRaw = JSON.stringify({ ...parsedCurrent, ...parsedUpdate }, null, 2);
                } catch {
                    newHeadRaw = JSON.stringify(parsedUpdate, null, 2);
                }
            }
        }
        // SPECIAL HANDLING: Director's Treatment Parsing
        else if (state.activeTool === 'directors-treatment') {
            const narrativeMatch = incoming.match(/\*\*Narrative Arc:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const charMatch = incoming.match(/\*\*Character Philosophy:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const visualMatch = incoming.match(/\*\*Visual Language:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const directorMatch = incoming.match(/\*\*(?:Director|DP|Director\s*\/\s*DP):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (narrativeMatch || charMatch || visualMatch || directorMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (narrativeMatch) parsedUpdate.narrativeArc = narrativeMatch[1].trim();
                if (charMatch) parsedUpdate.characterPhilosophy = charMatch[1].trim();
                if (visualMatch) parsedUpdate.visualLanguage = visualMatch[1].trim();
                if (directorMatch) parsedUpdate.directorNames = directorMatch[1].trim();

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    newHeadRaw = JSON.stringify({ ...parsedCurrent, ...parsedUpdate }, null, 2);
                } catch {
                    newHeadRaw = JSON.stringify(parsedUpdate, null, 2);
                }
            }
        }
        // SPECIAL HANDLING: Storyboard Parsing
        else if (state.activeTool === 'storyboard') {
            const sceneMatches = Array.from(incoming.matchAll(/\*\*Scene:?\*\*\s*([\s\S]*?)(?=\*\*|$)/g));
            if (sceneMatches.length > 0) {
                const newItems = sceneMatches.map((m, i) => ({
                    id: `item-${Date.now()}-${i}`,
                    url: '',
                    caption: m[1].trim(),
                    aspectRatio: '16:9',
                    size: 'medium',
                    showCaption: true
                }));

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    const currentItems = parsedCurrent.items || [];
                    parsedCurrent.items = [...currentItems, ...newItems];
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                } catch {
                    newHeadRaw = JSON.stringify({ items: newItems }, null, 2);
                }
            }
        }

        // Final Commit
        try {
            currentStack[0] = JSON.parse(newHeadRaw);
        } catch {
            // If result isn't JSON, just store it as is (rare case for raw text)
            currentStack[0] = newHeadRaw;
        }

        setState((s) => ({
            ...s,
            phases: {
                ...s.phases,
                [s.activePhase]: {
                    ...s.phases[s.activePhase],
                    drafts: {
                        ...s.phases[s.activePhase].drafts,
                        [s.activeTool]: JSON.stringify(currentStack),
                    },
                },
            },
        }))
    }


    const handleGenerateFromVision = (targetTool: ToolKey, visionText: string, promptPrefix: string) => {
        // 1. Create new version for Target
        // Note: Assumes targetTool is in the currently active phase (DEVELOPMENT), which is true for Brief, Treatment, AV Script, Storyboard.
        const currentDraftRaw = activePhaseState.drafts[targetTool] || '[{}]';
        let newDraftJSON = '[{}]';
        try {
            const parsed = JSON.parse(currentDraftRaw);
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            newDraftJSON = JSON.stringify([{}, ...arr]);
        } catch { }

        // Update drafts
        const nextDrafts = { ...activePhaseState.drafts, [targetTool]: newDraftJSON };
        const nextState = { ...state.phases[state.activePhase], drafts: nextDrafts };

        setState(s => ({
            ...s,
            phases: {
                ...s.phases,
                [state.activePhase]: nextState
            },
            activeTool: targetTool,
        }));

        // 3. Auto-send logic with specific formatting instructions
        let prompt = `${promptPrefix}:\n\n"${visionText}"`;

        if (targetTool === 'brief') {
            prompt = `Create a creative brief based on this vision. Output in Markdown with headers: **Objective**, **Target Audience**, **Tone & Style**, **Key Message**.\n\nVision:\n"${visionText}"`;
        } else if (targetTool === 'directors-treatment') {
            prompt = `Create a director's treatment based on this vision. Output in Markdown with headers: **Narrative Arc**, **Character Philosophy**, **Visual Language**. For each section, write a short paragraph.\n\nVision:\n"${visionText}"`;
        } else if (targetTool === 'storyboard') { // Moodboard / Storyboard
            prompt = `Create a storyboard shot list based on this vision. Output a list of 4-6 scenes. For each scene, start with "**Scene:**" followed by a detailed visual description suitable for an image caption.\n\nVision:\n"${visionText}"`;
        }

        send(prompt, targetTool);
    };

    async function send(overrideInput?: string, overrideTool?: ToolKey) {
        const textToUse = (typeof overrideInput === 'string') ? overrideInput : input;
        const trimmed = textToUse.trim()
        if (!trimmed) return
        setError(null)
        setIsSending(true)

        // Determine tool context
        const effectiveTool = overrideTool || state.activeTool;

        const currentToolChat = state.chat[effectiveTool] || []
        const nextChat: ChatMsg[] = [...currentToolChat, { role: 'user', content: trimmed }]

        const body = {
            phase: state.activePhase,
            toolType: effectiveTool,
            lockedPhases,
            phaseData,
            messages: nextChat,
            provider: 'openai',
            mode: aiMode,
        }

        try {
            const res = await fetch('/api/onformat-v0', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || `HTTP ${res.status}`)
            }
            const json = await res.json()
            const assistantMsg = String(json?.message ?? '')

            setState((s) => ({
                ...s,
                chat: {
                    ...s.chat,
                    [effectiveTool]: [...nextChat, { role: 'assistant', content: assistantMsg }]
                }
            }))
            if (overrideInput === undefined) setInput('')
        } catch (e: any) {
            setError(e?.message || 'Request failed')
        } finally {
            setIsSending(false)
        }
    }

    const currentDraft = activePhaseState.drafts[state.activeTool] ?? ''
    const activeToolLabel = tools?.find(t => t.key === state.activeTool)?.label || state.activeTool
    const activeChat = state.chat[state.activeTool] || []

    const [isAiDocked, setIsAiDocked] = useState(true);

    // Auto-Context Logic: AI Mode is derived from Dock State + Active Phase
    const aiMode = isAiDocked ? 'OFF' : (state.activePhase === 'DEVELOPMENT' ? 'DEVELOP' : 'ASSIST');

    const toggleAiDock = () => {
        setIsAiDocked(!isAiDocked);
    };

    const handleExecuteJumpStart = async (targets: string[]) => {
        setIsJumpStartProcessing(true);
        setJumpStartStatus('Initializing Production Protocol...');

        setIsAiDocked(false);

        const prompt = `JUMP START PROTOCOL: Acting as Supervising Producer, analyze this Creative Brief.
        
Then, I need you to sequentially generate preliminary drafts for the following documents:
${targets.map((t) => `- ${t.replace(/-/g, ' ').toUpperCase()}`).join('\n')}

Please provide the content for the first document now.`;

        setTimeout(() => {
            setJumpStartStatus('Analyzing Creative Brief...');
            setTimeout(() => {
                setJumpStartStatus('Generating Drafts...');
                send(prompt, 'supervising-producer');
                setTimeout(() => {
                    setIsJumpStartProcessing(false);
                    setIsJumpStartOpen(false);
                }, 1500);
            }, 1000);
        }, 1000);
    };

    return (
        <div className="h-screen bg-[var(--background)] flex flex-col font-sans text-[var(--foreground)]">

            <main className="flex-1 flex overflow-hidden relative bg-zinc-900">
                <ExperimentalWorkspaceNav
                    activeTool={state.activeTool}
                    activePhase={state.activePhase}
                    onToolSelect={(toolKey, phase) => {
                        // Direct state update to handle simultaneous phase+tool switch
                        // @ts-ignore
                        setState(s => ({ ...s, activePhase: phase, activeTool: toolKey as ToolKey }));
                    }}
                    darkMode={true}
                    producerName={state.producer}
                    onToggleAi={toggleAiDock}
                    isAiDocked={isAiDocked}
                />

                <ChatInterface
                    messages={activeChat}
                    input={input}
                    isSending={isSending}
                    error={error}
                    onInputChange={setInput}
                    onSend={send}
                    activeToolLabel={activeToolLabel}
                    activeToolKey={state.activeTool}
                    onInsertToDraft={saveDraftForActiveTool}
                    onClear={() => setState(s => ({
                        ...s,
                        chat: { ...s.chat, [s.activeTool]: [] }
                    }))}
                    isLocked={activePhaseState.locked}
                    // @ts-ignore
                    activePhase={state.activePhase}
                    persona={persona}
                    isDocked={isAiDocked}
                    onDock={() => setIsAiDocked(true)}
                    activeMode={aiMode}
                    onModeChange={() => { }}
                    onCreateBrief={(text) => handleGenerateFromVision('brief', text, 'Create a brief based on this Project Vision')}
                />




                <DraftEditor
                    draft={currentDraft}
                    onDraftChange={saveDraftForActiveTool}
                    isLocked={activePhaseState.locked}
                    activeToolLabel={activeToolLabel}
                    // @ts-ignore
                    activeToolKey={state.activeTool}
                    persona={persona}
                    projectId={projectId}
                    // @ts-ignore
                    projectName={state.projectName}
                    clientName={state.clientName}
                    producer={state.producer}
                    activePhase={state.activePhase}
                    phases={state.phases}
                    onToggleLock={() => activePhaseState.locked ? unlockPhase() : lockPhase()}
                    onGenerateFromVision={handleGenerateFromVision}
                    onOpenAi={() => {
                        setIsAiDocked(false);
                    }}
                    onJumpStart={() => {
                        setIsJumpStartOpen(true);
                    }}
                />

                <JumpStartDialog
                    isOpen={isJumpStartOpen}
                    onClose={() => setIsJumpStartOpen(false)}
                    onStart={handleExecuteJumpStart}
                    isProcessing={isJumpStartProcessing}
                    progress={jumpStartStatus}
                />
            </main>
        </div>
    )
}
