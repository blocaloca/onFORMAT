'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Header } from '@/components/onformat/Header'
import { ExperimentalWorkspaceNav } from '@/components/onformat/ExperimentalNav'
import { ChatInterface } from '@/components/onformat/ChatInterface'
import { DraftEditor } from '@/components/onformat/DraftEditor'
import { supabase } from '@/lib/supabase'
import { FloatingMobileControl } from '@/components/onformat/FloatingMobileControl'
import { Smartphone } from 'lucide-react'

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
    | 'talent-release'

type ChatMsg = { role: 'user' | 'assistant'; content: string; actions?: any[] }

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
        { key: 'talent-release', label: 'Talent Release' },
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
    userSubscription?: { status: string, tier: string };
    userEmail?: string;
    userRole?: string;
}

export const WorkspaceEditor = ({ initialState, projectId, projectName, onSave, userSubscription, userEmail, userRole }: WorkspaceEditorProps) => {

    // Merge props into initial state if provided, with robust fallbacks
    const mergedInitialState = useMemo(() => {
        const defaults = makeInitialState();
        const base = initialState || defaults;

        // Ensure critical structures exist even if loaded state is partial
        if (!base.chat) base.chat = {};
        if (!base.phases) base.phases = defaults.phases;

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
            if (stored) {
                // Sanitize: ensure chat exists
                if (!stored.chat) stored.chat = {};
                if (!stored.phases) stored.phases = makeInitialState().phases;
                setState(stored)
            }
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

    // --- Realtime Subscriptions ---
    const [latestNotification, setLatestNotification] = useState<{ msg: string; time: number } | null>(null);
    const stateRef = React.useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Mobile Control Integration
    const [mobileControlDoc, setMobileControlDoc] = useState<any>(null)
    const [showMobileControl, setShowMobileControl] = useState(false)
    const [lastEventTime, setLastEventTime] = useState(0)
    const [isBlinking, setIsBlinking] = useState(false)

    useEffect(() => {
        if (lastEventTime > 0) {
            setIsBlinking(true)
            const timer = setTimeout(() => setIsBlinking(false), 1000)
            return () => clearTimeout(timer)
        }
    }, [lastEventTime])

    useEffect(() => {
        if (!projectId) return;
        const fetchMobileControl = async () => {
            let { data } = await supabase.from('documents').select('*').eq('project_id', projectId).eq('type', 'onset-mobile-control').single();
            if (data) setMobileControlDoc(data);
        };
        fetchMobileControl();

        const channel = supabase.channel('mobile-control-updates-workspace')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'documents', filter: `project_id=eq.${projectId}` }, (payload: any) => {
                if (payload.new.type === 'onset-mobile-control') setMobileControlDoc(payload.new);
                if (payload.new.type === 'shot-log' || payload.new.type === 'dit-log') setLastEventTime(Date.now());
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [projectId]);

    const updateMobileControl = async (newData: any) => {
        if (!mobileControlDoc) return;
        const updated = { ...mobileControlDoc, content: newData };
        setMobileControlDoc(updated);
        await supabase.from('documents').update({ content: newData, updated_at: new Date().toISOString() }).eq('id', mobileControlDoc.id);
    };

    useEffect(() => {
        if (!projectId) return;

        console.log("🔌 Subscribing to Realtime Changes for Project:", projectId);

        const channel = supabase
            .channel('project_updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
                (payload: any) => {
                    console.log("⚡️ Realtime Update Received:", payload);
                    const newData = payload.new?.data;
                    if (!newData) return;

                    // Check for DIT Log Updates specifically
                    const newDitLog = newData.phases?.ON_SET?.drafts?.['dit-log'];
                    const currentDitLog = stateRef.current.phases?.ON_SET?.drafts?.['dit-log'];

                    // Compare content lengths or simple equality
                    if (newDitLog && newDitLog !== currentDitLog) {
                        console.log("🔔 DIT Log Change Detected! Triggering Notification.");

                        // 1. Notify
                        setLatestNotification({ msg: 'New DIT Log Entry Received', time: Date.now() });

                        // 2. Update State (Merge)
                        setState(prev => ({
                            ...prev,
                            phases: {
                                ...prev.phases,
                                ON_SET: {
                                    ...prev.phases.ON_SET,
                                    drafts: {
                                        ...prev.phases.ON_SET.drafts,
                                        'dit-log': newDitLog
                                    }
                                }
                            },
                        }));
                    }
                }
            )
            .subscribe((status, err) => {
                console.log("🔌 Subscription Status:", status, err);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId]);

    // Auto-Prompt for Creative Brief & AV Script & Treatment (Existing Logic)
    useEffect(() => {
        if (state.activeTool === 'brief') {
            setState(s => {
                const currentChat = s.chat['brief'] || [];
                if (currentChat.length === 0) {
                    return {
                        ...s,
                        chat: { ...s.chat, 'brief': [{ role: 'assistant', content: "What is the subject or product you are shooting?" }] }
                    };
                }
                return s;
            });
        }
        else if (state.activeTool === 'av-script') {
            setState(s => {
                const currentChat = s.chat['av-script'] || [];
                if (currentChat.length === 0) {
                    return {
                        ...s,
                        chat: { ...s.chat, 'av-script': [{ role: 'assistant', content: "Describe Scene 1." }] }
                    };
                }
                return s;
            });
        }
        else if (state.activeTool === 'directors-treatment') {
            setState(s => {
                const currentChat = s.chat['directors-treatment'] || [];
                if (currentChat.length === 0) {
                    return {
                        ...s,
                        chat: { ...s.chat, 'directors-treatment': [{ role: 'assistant', content: "What do you want to call this treatment?" }] }
                    };
                }
                return s;
            });
        }
        else if (state.activeTool === 'shot-scene-book') {
            setState(s => {
                const currentChat = s.chat['shot-scene-book'] || [];
                if (currentChat.length === 0) {
                    return {
                        ...s,
                        chat: { ...s.chat, 'shot-scene-book': [{ role: 'assistant', content: "Scene 01 Describe the shot" }] }
                    };
                }
                return s;
            });
        }
        else if (state.activeTool === 'project-vision') {
            setState(s => {
                const currentChat = s.chat['project-vision'] || [];
                if (currentChat.length === 0) {
                    return {
                        ...s,
                        chat: {
                            ...s.chat,
                            'project-vision': [{
                                role: 'assistant',
                                content: "Welcome. I'm your Creative & Production Partner. I can help you develop concepts, characters, and visual styles, or help you scope budgets and logistics.\n\nWhere should we start?",
                                actions: [
                                    { label: "Creative Assist", type: "suggestion", payload: "Creative Assist", prominence: "primary" },
                                    { label: "Production Assist", type: "suggestion", payload: "Production Assist", prominence: "primary" },
                                    { label: "Create Brief", type: "suggestion", payload: "Draft Brief", prominence: "secondary" }
                                ]
                            }]
                        }
                    };
                }
                return s;
            });
        }
    }, [state.activeTool]);

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

    const phaseData = useMemo(() => buildHandoffPayload(state.phases), [state.phases]);

    // Role-based Access Control for Specific Tools
    const isToolLocked = useMemo(() => {
        // 1. Phase Lock (Global override)
        if (state.phases[state.activePhase]?.locked) return true;

        // 2. Tool Specific Locks
        if (state.activeTool === 'dit-log') {
            const allowed = ['Owner', 'Producer', 'DP', 'DIT', 'Director'].includes(userRole || '') || userEmail === 'casteelio@gmail.com';
            return !allowed;
        }

        return false;
    }, [state.phases, state.activePhase, state.activeTool, userRole, userEmail]);

    function setPhase(next: Phase) {
        // ACCESS CONTROL CHECK
        const isRestricted = next === 'ON_SET' || next === 'POST';

        // Define simple check locally or import
        const hasAccess = (() => {
            if (userEmail === 'casteelio@gmail.com') return true; // Founder
            if (userSubscription?.status === 'active') return true; // Any active sub allows access for now (or check tier === 'pro')
            return false;
        })();

        if (isRestricted && !hasAccess) {
            alert("Upgrade to PRO to access Production & Post phases.");
            return;
        }

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
            const titleMatch = incoming.match(/\*\*Title:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const noteMatch = incoming.match(/\*\*Notes?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const imagePromptMatch = incoming.match(/\*\*Image Prompt:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            // Legacy matchers fallback
            const arcMatch = incoming.match(/\*\*Narrative Arc:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (titleMatch || noteMatch || imagePromptMatch || arcMatch) {
                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    const currentScenes = Array.isArray(parsedCurrent.scenes) ? parsedCurrent.scenes : [];

                    // Ensure at least one scene exists
                    if (currentScenes.length === 0) {
                        currentScenes.push({
                            id: `scene-${Date.now()}`,
                            image: '',
                            image2: '', // Support 2 images
                            description: '',
                            type: 'Narrative',
                            content: ''
                        });
                    }

                    // Target the LAST scene by default for edits
                    const targetIndex = currentScenes.length - 1;
                    const targetScene = currentScenes[targetIndex];

                    // Map fields
                    if (titleMatch) {
                        targetScene.description = titleMatch[1].trim();
                    }

                    const contentToAdd = (noteMatch ? noteMatch[1].trim() : '') || (arcMatch ? arcMatch[1].trim() : '');

                    if (contentToAdd) {
                        // Append or replace? Let's Append with newline if content exists
                        targetScene.content = targetScene.content
                            ? targetScene.content + '\n\n' + contentToAdd
                            : contentToAdd;
                    }

                    if (imagePromptMatch) {
                        const promptText = `Image Prompt:\n${imagePromptMatch[1].trim()}`;
                        targetScene.content = targetScene.content
                            ? targetScene.content + '\n\n' + promptText
                            : promptText;
                    }

                    parsedCurrent.scenes = currentScenes;
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                } catch {
                    // Fallback Init if broken JSON
                    const newScene = {
                        id: `scene-${Date.now()}`,
                        image: '',
                        description: titleMatch ? titleMatch[1].trim() : '',
                        type: 'Narrative',
                        content: (noteMatch ? noteMatch[1].trim() : '') || (imagePromptMatch ? `Image Prompt:\n${imagePromptMatch[1].trim()}` : '')
                    };
                    newHeadRaw = JSON.stringify({ scenes: [newScene] }, null, 2);
                }

                // Generic "Title" property fallback for metadata if needed
                if (titleMatch) {
                    try {
                        const pc = JSON.parse(newHeadRaw);
                        pc.title = titleMatch[1].trim();
                        newHeadRaw = JSON.stringify(pc, null, 2);
                    } catch { }
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

        // SPECIAL HANDLING: Project Vision Parser
        else if (state.activeTool === 'project-vision') {
            const visionMatch = incoming.match(/\*\*Vision:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (visionMatch) {
                const contentToAdd = visionMatch[1].trim();
                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    // Vision Doc uses 'pages' array structure typically
                    let pages = parsedCurrent.pages || [];

                    if (pages.length === 0) {
                        pages = [{ id: 'vision-p1', content: '' }];
                    }

                    // Append to last page or create new? Append to last for running log.
                    const lastPageIdx = pages.length - 1;
                    const oldContent = pages[lastPageIdx].content || '';

                    // Add timestamp or divider? Maybe just newlines.
                    pages[lastPageIdx].content = oldContent
                        ? oldContent + '\n\n' + contentToAdd
                        : contentToAdd;

                    parsedCurrent.pages = pages;
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);

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

                } catch (e) {
                    // If structure fails, fallback to simple string append is tricky with JSON storage.
                    // Assume JSON structure is valid for now.
                }
            }
        }

        // SPECIAL HANDLING: Shot List Parser (shot-scene-book)
        else if (state.activeTool === 'shot-scene-book') {
            const sceneMatch = incoming.match(/\*\*Scene:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const sizeMatch = incoming.match(/\*\*Size:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const angleMatch = incoming.match(/\*\*Angle:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const moveMatch = incoming.match(/\*\*Movement:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const descMatch = incoming.match(/\*\*Description:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (descMatch || sceneMatch) {
                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    const currentShots = parsedCurrent.shots || [];

                    // Context Awareness: Inherit Scene from last shot if missing
                    let lastScene = '';
                    if (currentShots.length > 0) {
                        lastScene = currentShots[currentShots.length - 1].scene;
                    }

                    const newShot = {
                        id: `shot-${Date.now()}`,
                        scene: sceneMatch ? sceneMatch[1].trim() : lastScene,
                        size: sizeMatch ? sizeMatch[1].trim() : 'Wide',
                        angle: angleMatch ? angleMatch[1].trim() : 'Eye Level',
                        movement: moveMatch ? moveMatch[1].trim() : 'Static',
                        description: descMatch ? descMatch[1].trim() : (incoming.replace(/\*\*/g, '').trim())
                    };

                    parsedCurrent.shots = [...currentShots, newShot];
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);

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

                } catch (e) { console.error('Shot Parse Error', e); }
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
            const prodMatch = incoming.match(/\*\*(?:Subject\s*[/\\]\s*)?Product:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const objMatch = incoming.match(/\*\*Objective:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const audMatch = incoming.match(/\*\*Target Audience:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const toneMatch = incoming.match(/\*\*Tone(?: [&/\\,]+ Style)?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const msgMatch = incoming.match(/\*\*Key Message:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            // Deliverables & Usage logic
            const delMatch = incoming.match(/\*\*Deliverables:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const usageMatch = incoming.match(/\*\*Usage:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (prodMatch || objMatch || audMatch || toneMatch || msgMatch || delMatch || usageMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (prodMatch) parsedUpdate.product = prodMatch[1].trim();
                if (objMatch) parsedUpdate.objective = objMatch[1].trim();
                if (audMatch) parsedUpdate.targetAudience = audMatch[1].trim();
                if (toneMatch) parsedUpdate.tone = toneMatch[1].trim();
                if (msgMatch) parsedUpdate.keyMessage = msgMatch[1].trim();
                if (usageMatch) parsedUpdate.usage = usageMatch[1].trim();

                if (delMatch) {
                    parsedUpdate.deliverables = delMatch[1]
                        .split(/[,;\n]/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0)
                        // Map to objects if needed, but the template handles string[] migration. 
                        // Ideally we should parse into objects if format allows, but for now string array is safe.
                        // Wait, `saveDraftForActiveTool` merges into `currentHeadRaw`. 
                        // If current head is object with `deliverables: DeliverableItem[]`, sending strings might break it.
                        // The template effect handles `string[]` on load. 
                        // BUT, we are merging into state LIVE. 
                        // We should better map them to objects here to avoid flicker or type mismatch.
                        .map((s, i) => ({ id: `ai-del-${Date.now()}-${i}`, item: s, usage: '' }));
                }

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    // Special handling for deliverables array merge - replace or append?
                    // AI probably suggests a set. Let's replace if provided.
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
        // SPECIAL HANDLING: Shot List Parsing (shot-scene-book)
        else if (state.activeTool === 'shot-scene-book') {
            const sceneMatch = incoming.match(/\*\*Scene:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const sizeMatch = incoming.match(/\*\*Size:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const angleMatch = incoming.match(/\*\*Angle:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const moveMatch = incoming.match(/\*\*Movement:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const descMatch = incoming.match(/\*\*Description:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            // If we found at least a description or scene, treat as a Shot
            if (descMatch || sceneMatch) {
                const newShot = {
                    id: `shot-${Date.now()}`,
                    scene: sceneMatch ? sceneMatch[1].trim() : '',
                    size: sizeMatch ? sizeMatch[1].trim() : 'Wide',
                    angle: angleMatch ? angleMatch[1].trim() : 'Eye Level',
                    movement: moveMatch ? moveMatch[1].trim() : 'Static',
                    description: descMatch ? descMatch[1].trim() : (incoming.replace(/\*\*/g, '').trim()) // Fallback to raw text if only desc
                };

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    const currentShots = Array.isArray(parsedCurrent.shots) ? parsedCurrent.shots : [];
                    parsedCurrent.shots = [...currentShots, newShot];
                    newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                } catch {
                    // Init
                    newHeadRaw = JSON.stringify({ shots: [newShot] }, null, 2);
                }
            }
        }
        // SPECIAL HANDLING: AV Script Parsing (av-script)
        else if (state.activeTool === 'av-script') {
            const sceneMatch = incoming.match(/\*\*Scene:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const timeMatch = incoming.match(/\*\*Time:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const visualMatch = incoming.match(/\*\*Visual:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const audioMatch = incoming.match(/\*\*Audio:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (visualMatch || audioMatch || sceneMatch) {
                const incomingScene = sceneMatch ? sceneMatch[1].trim() : null;
                const incomingVisual = visualMatch ? visualMatch[1].trim() : null;
                const incomingAudio = audioMatch ? audioMatch[1].trim() : null;
                const incomingTime = timeMatch ? timeMatch[1].trim() : null;

                try {
                    const parsedCurrent = JSON.parse(currentHeadRaw);
                    const currentRows = Array.isArray(parsedCurrent.rows) ? parsedCurrent.rows : [];

                    const lastRowIndex = currentRows.length - 1;
                    const lastRow = lastRowIndex >= 0 ? currentRows[lastRowIndex] : null;

                    // Decision: Update Last Row OR Create New?
                    // Update if:
                    // 1. Last row exists AND
                    // 2. Incoming scene is missing (implied continuation) OR Incoming scene matches Last Row's scene
                    let shouldUpdate = false;
                    if (lastRow) {
                        if (!incomingScene) shouldUpdate = true; // Just adding audio/visual to current
                        else if (incomingScene === lastRow.scene) shouldUpdate = true; // Explicitly same scene
                    }

                    if (shouldUpdate && lastRow) {
                        // Merge fields. If field exists in incoming, overwrite/append?
                        // Usually overwrite for corrections, but maybe append for multi-step? 
                        // Let's Append if content exists, to be safe.
                        const updatedRow = { ...lastRow };
                        if (incomingVisual) updatedRow.visual = (updatedRow.visual ? updatedRow.visual + '\n' : '') + incomingVisual;
                        if (incomingAudio) updatedRow.audio = (updatedRow.audio ? updatedRow.audio + '\n' : '') + incomingAudio;
                        if (incomingTime) updatedRow.time = incomingTime;

                        currentRows[lastRowIndex] = updatedRow;
                        parsedCurrent.rows = currentRows;
                        newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                    } else {
                        // Create New Row
                        const newRow = {
                            id: `row-${Date.now()}`,
                            scene: incomingScene || (lastRow ? String(Number(lastRow.scene) + 1) : '1'), // Auto-increment if missing? No, default to '1' or user input.
                            time: incomingTime || '',
                            visual: incomingVisual || '',
                            audio: incomingAudio || ''
                        };
                        parsedCurrent.rows = [...currentRows, newRow];
                        newHeadRaw = JSON.stringify(parsedCurrent, null, 2);
                    }

                } catch {
                    // Init if broken
                    const newRow = {
                        id: `row-${Date.now()}`,
                        scene: sceneMatch ? sceneMatch[1].trim() : '1',
                        time: timeMatch ? timeMatch[1].trim() : '',
                        visual: visualMatch ? visualMatch[1].trim() : '',
                        audio: audioMatch ? audioMatch[1].trim() : ''
                    };
                    newHeadRaw = JSON.stringify({ rows: [newRow] }, null, 2);
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

    // Default to OPEN (false) for new projects
    // Default to OPEN (false)
    const [isAiDocked, setIsAiDocked] = useState(false);
    const [hasLoadedState, setHasLoadedState] = useState(false);

    // 1. Load State on Mount
    useEffect(() => {
        const savedDock = localStorage.getItem('onformat_ai_docked');
        if (savedDock !== null) {
            setIsAiDocked(JSON.parse(savedDock));
        }
        setHasLoadedState(true);
    }, []);

    // 2. Save State on Change (only after load)
    useEffect(() => {
        if (hasLoadedState) {
            localStorage.setItem('onformat_ai_docked', JSON.stringify(isAiDocked));
        }
    }, [isAiDocked, hasLoadedState]);

    // Auto-Context Logic: AI Mode is derived from Dock State + Active Phase
    const aiMode = isAiDocked ? 'OFF' : (state.activePhase === 'DEVELOPMENT' ? 'DEVELOP' : 'ASSIST');

    const toggleAiDock = () => {
        setIsAiDocked(!isAiDocked);
    };



    // Calculate Contextual Placeholder Hint
    const chatPlaceholderHint = useMemo(() => {
        if (!state.activeTool) return undefined;
        const currentDraftRaw = activePhaseState?.drafts?.[state.activeTool];
        if (!currentDraftRaw) return undefined;

        try {
            const data = JSON.parse(currentDraftRaw);
            const list = Array.isArray(data) ? data[0] : data; // Handle array stack

            if (state.activeTool === 'av-script' && list.rows?.length > 0) {
                const lastRow = list.rows[list.rows.length - 1];
                const lastScene = lastRow.scene || '1';
                // Check if last scene is numeric
                const sceneNum = parseInt(lastScene);
                const nextScene = isNaN(sceneNum) ? 'Next' : sceneNum + 1;
                return `Stats: Scene ${lastScene}. Any notes, or ready for Scene ${nextScene}?`;
            }
            if (state.activeTool === 'shot-scene-book' && list.shots?.length > 0) {
                const lastShot = list.shots[list.shots.length - 1];
                const lastScene = lastShot.scene || '1';
                return `Stats: Scene ${lastScene}. Add coverage or move to next?`;
            }
        } catch { }

        return undefined;
    }, [state.phases, state.activeTool]);

    return (
        <div className="h-screen bg-[var(--background)] flex flex-col font-sans text-[var(--foreground)]">

            <main className="flex-1 flex overflow-hidden relative bg-zinc-900">
                <ExperimentalWorkspaceNav
                    activeTool={state.activeTool}
                    activePhase={state.activePhase}
                    onToolSelect={(toolKey, phase) => {
                        if (toolKey === 'onset-mobile-control') {
                            setShowMobileControl(true);
                            return;
                        }
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
                    placeholderHint={chatPlaceholderHint} // Pass the hint
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
                    onNavigate={(targetTool, payload) => {
                        // Find the phase for this tool
                        let foundPhase: Phase | undefined;
                        for (const [p, tools] of Object.entries(TOOLS_BY_PHASE)) {
                            if (tools.some(t => t.key === targetTool)) {
                                foundPhase = p as Phase;
                                break;
                            }
                        }
                        if (foundPhase) {
                            setState(s => {
                                const newState = {
                                    ...s,
                                    activePhase: foundPhase!,
                                    activeTool: targetTool as ToolKey
                                };

                                // Data Carrier: Inject payload as AI message in new tool to trigger Auto-Parse
                                if (payload) {
                                    const existingChat = newState.chat[targetTool as ToolKey] || [];
                                    newState.chat = {
                                        ...newState.chat,
                                        [targetTool]: [
                                            ...existingChat,
                                            { role: 'assistant', content: `Transferring context...\n\n${payload}` }
                                        ]
                                    };
                                }
                                return newState;
                            });
                        } else {
                            console.warn(`Could not find phase for tool: ${targetTool}`);
                        }
                    }}
                />




                <DraftEditor
                    draft={currentDraft}
                    onDraftChange={saveDraftForActiveTool}
                    isLocked={isToolLocked}
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
                    // @ts-ignore
                    latestNotification={latestNotification}

                />


                {/* FLOATING MOBILE CONTROL */}
                {showMobileControl && mobileControlDoc && (
                    <FloatingMobileControl
                        data={mobileControlDoc.content}
                        onUpdate={updateMobileControl}
                        onClose={() => setShowMobileControl(false)}
                        metadata={{ projectId }}
                    />
                )}

                {/* MOBILE CONTROL TOGGLE FAB */}
                {mobileControlDoc && !showMobileControl && (
                    <button
                        onClick={() => setShowMobileControl(true)}
                        className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:bg-zinc-800 transition-all z-40 border border-zinc-700"
                        title="Open Mobile Control"
                    >
                        <Smartphone
                            size={24}
                            className={`transition-all duration-300 ${mobileControlDoc.content?.isLive
                                    ? (isBlinking ? 'text-emerald-400 fill-emerald-400 animate-pulse' : 'text-emerald-500 fill-emerald-500')
                                    : 'text-zinc-400'
                                }`}
                            strokeWidth={mobileControlDoc.content?.isLive ? 0 : 2}
                        />
                    </button>
                )}

            </main>
        </div>
    )
}
