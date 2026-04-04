/* eslint-disable */
'use client'

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'

import { Header } from '@/components/onformat/Header'
import { ExperimentalWorkspaceNav } from '@/components/onformat/ExperimentalNav'
import { ChatInterface } from '@/components/onformat/ChatInterface'
import { ProjectOverview } from '@/components/onformat/ProjectOverview'
import { DraftEditor } from '@/components/onformat/DraftEditor'
import { PrintDashboard } from '@/components/onformat/print/PrintDashboard'
import { supabase } from '@/lib/supabase'
import { useTrialStatus } from '@/lib/useTrialStatus'
import { useRouter } from 'next/navigation'

type Phase = 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'PRODUCTION' | 'ON_SET' | 'POST' | 'STRATEGY'

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
    | 'camera-report'
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
    | 'project-export'
    | 'project-overview'
    | 'ecomm-shot-list'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChatMsg = { role: 'user' | 'assistant'; content: string; actions?: any[] }

const PHASES: Phase[] = ['STRATEGY', 'DEVELOPMENT', 'PRE_PRODUCTION', 'PRODUCTION', 'ON_SET', 'POST']

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
        { key: 'schedule', label: 'Schedule' },
        { key: 'call-sheet', label: 'Call Sheet' },
        { key: 'ecomm-shot-list', label: 'eComm Shot List' },
        { key: 'on-set-notes', label: 'On-Set Notes' },
        { key: 'camera-report', label: 'Camera Report' },
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
    PRODUCTION: [], // Compatibility with OnSet Mobile
    STRATEGY: [], // Compatibility with legacy briefs
}

type PhaseState = {
    locked: boolean
    // drafts by tool key
    drafts: Partial<Record<ToolKey, string>>
}

export type WorkspaceState = {
    activePhase: Phase
    activeTool: ToolKey
    lastActiveTool?: ToolKey
    lastActivePhase?: Phase
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
            STRATEGY: { ...basePhaseState },
            DEVELOPMENT: { ...basePhaseState },
            PRE_PRODUCTION: { ...basePhaseState },
            PRODUCTION: { ...basePhaseState },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildHandoffPayload(phases: WorkspaceState['phases']): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {}
    for (const p of PHASES) {
        payload[p] = {
            locked: phases[p]?.locked || false,
            drafts: phases[p]?.drafts || {},
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
    isReadOnly?: boolean;
}

export const WorkspaceEditor = ({ initialState, projectId, projectName, onSave, userRole, userEmail, isReadOnly }: WorkspaceEditorProps) => {

    // Merge props into initial state if provided, with robust fallbacks
    const mergedInitialState = useMemo(() => {
        const defaults = makeInitialState();
        const base = initialState ? { ...initialState } : { ...defaults };

        // Ensure critical structures exist even if loaded state is partial
        if (!base.chat) base.chat = {};
        if (!base.phases) base.phases = defaults.phases;

        if (projectName) base.projectName = projectName;
        return base;
    }, [initialState, projectName]);

    const [state, setState] = useState<WorkspaceState>(mergedInitialState)
    // Removed duplicate supabase client init

    // Sync projectName if it updates and wasn't in state
    useEffect(() => {
        if (projectName && state.projectName !== projectName) {
            setState(s => ({ ...s, projectName }));
        }
    }, [projectName]);

    const [latestNotification, setLatestNotification] = useState<{ msg: string; time: number } | null>(null);
    const [navAlerts, setNavAlerts] = useState<Record<string, boolean>>({});

    const stateRef = React.useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

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

    useEffect(() => {
        if (!projectId) return;

        const channel = supabase.channel(`project-updates-${projectId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (payload: any) => {
                    const newData = payload.new.data;
                    const newCrewDraft = newData?.phases?.PRE_PRODUCTION?.drafts?.['crew-list'];

                    if (newCrewDraft) {
                        // NOTIFICATION LOGIC (Signal)



                        setState(current => {
                            const currentDraft = current.phases?.PRE_PRODUCTION?.drafts?.['crew-list'];
                            if (newCrewDraft !== currentDraft) {
                                // Smart Merging to prevent 'erratic' behavior while typing.
                                // We preserve local text modifications (Name, Email, etc.) but accept Remote 'Status' updates.
                                try {
                                    const localData = JSON.parse(currentDraft || '{}');
                                    const remoteData = JSON.parse(newCrewDraft || '{}');

                                    if (localData.crew && Array.isArray(localData.crew) && remoteData.crew && Array.isArray(remoteData.crew)) {
                                        // 1. Update existing locals with remote status
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const mergedCrew = localData.crew.map((localItem: any) => {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            let remoteItem = remoteData.crew.find((r: any) => r.id === localItem.id);

                                            // Fallback: Match by Email for robust Status Sync (even if IDs drifted)
                                            if (!remoteItem && localItem.email) {
                                                const localEmail = localItem.email.toLowerCase().trim();
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                remoteItem = remoteData.crew.find((r: any) => r.email?.toLowerCase().trim() === localEmail);
                                            }

                                            if (remoteItem) {
                                                return {
                                                    ...localItem,
                                                    status: remoteItem.status
                                                };
                                            }
                                            return localItem;
                                        });

                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const newRows = remoteData.crew.filter((r: any) => !localData.crew.find((l: any) => l.id === r.id));

                                        const finalCrew = [...mergedCrew, ...newRows];
                                        const mergedDraft = JSON.stringify({ ...localData, crew: finalCrew });

                                        return {
                                            ...current,
                                            phases: {
                                                ...current.phases,
                                                PRE_PRODUCTION: {
                                                    ...(current.phases?.[ 'PRE_PRODUCTION' ] || {}),
                                                    drafts: {
                                                        ...(current.phases?.[ 'PRE_PRODUCTION' ]?.drafts || {}),
                                                        'crew-list': mergedDraft
                                                    }
                                                }
                                            }
                                        };
                                    }
                                } catch (e) { console.warn('Merge failed', e); }

                                // Fallback: simple overwrite
                                return {
                                    ...current,
                                    phases: {
                                        ...current.phases,
                                        PRE_PRODUCTION: {
                                            ...(current.phases?.[ 'PRE_PRODUCTION' ] || {}),
                                            drafts: {
                                                ...(current.phases?.[ 'PRE_PRODUCTION' ]?.drafts || {}),
                                                'crew-list': newCrewDraft
                                            }
                                        }
                                    }
                                };
                            }
                            return current;
                        });
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [projectId]);

    // --- ROLLCALL ALERTS (REMOVED) ---
    // The CrewListTemplate handles the Status Light visualization.
    // Global Key-Value Ref is no longer needed here as we use direct DB subscription in CrewList.
    useEffect(() => {
    }, []);

    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)


    // Persist
    // Persist (Debounced)
    useEffect(() => {


        const timeoutId = setTimeout(() => {
            // Logic: If onSave provided, use it. Else fall back to local storage if no Project ID (legacy DEV mode)
            if (onSave && !isReadOnly) {
                onSave(state);
            } else if (!projectId && !isReadOnly) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
                } catch { }
            }
        }, 1000); // 1s Debounce to prevent rapid DB writes & Realtime Echo loops

        return () => clearTimeout(timeoutId);
    }, [state, onSave, projectId])

    // --- Realtime Subscriptions ---


    // Mobile Control Integration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [mobileControlDoc, setMobileControlDoc] = useState<any>(null)




    useEffect(() => {
        if (!projectId) return;
        const fetchMobileControl = async () => {
            // 1. Try to fetch existing
            const { data } = await supabase.from('documents').select('*').eq('project_id', projectId).eq('type', 'onset-mobile-control').maybeSingle();

            // 2. If missing, DO NOT create default to avoid errors
            if (data) setMobileControlDoc(data);
        };
        fetchMobileControl();

        const channel = supabase.channel(`mobile-control-updates-workspace-${projectId}`) // Jackson: Scoped channel name for mobile control
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'documents', filter: `project_id=eq.${projectId}` }, (payload: any) => {
                if (payload.new.type === 'onset-mobile-control') setMobileControlDoc(payload.new);
                if (payload.new.type === 'camera-report') {
                    // Update state but NO notification
                }
                if (payload.new.type === 'dit-log') {


                    setNavAlerts(prev => ({ ...prev, 'dit-log': true }));
                    setTimeout(() => setNavAlerts(prev => ({ ...prev, 'dit-log': false })), 10000);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [projectId]);








    useEffect(() => {
        if (!projectId) return;

        console.log("🔌 Subscribing to Realtime Activity for Project:", projectId);

        // CHANNEL 1: DATABASE UPDATES
        const dbChannel = supabase
            .channel(`project_updates:${projectId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
                (payload: any) => {
                    const newData = payload.new?.data;
                    if (!newData) return;

                    let hasUpdates = false;

                    // Sync DIT Log
                    const newDitLog = newData.phases?.ON_SET?.drafts?.['dit-log'] || newData.phases?.PRODUCTION?.drafts?.['dit-log'];
                    const currentDitLog = stateRef.current.phases?.ON_SET?.drafts?.['dit-log'] || stateRef.current.phases?.PRODUCTION?.drafts?.['dit-log'];
                    if (newDitLog && newDitLog !== currentDitLog) hasUpdates = true;

                    // Sync Camera Report
                    const newCameraReport = newData.phases?.ON_SET?.drafts?.['camera-report'] || newData.phases?.PRODUCTION?.drafts?.['camera-report'];
                    const currentCameraReport = stateRef.current.phases?.ON_SET?.drafts?.['camera-report'] || stateRef.current.phases?.PRODUCTION?.drafts?.['camera-report'];
                    if (newCameraReport && newCameraReport !== currentCameraReport) hasUpdates = true;

                    // Sync Notes
                    const newNotes = newData.phases?.ON_SET?.drafts?.['on-set-notes'] || newData.phases?.PRODUCTION?.drafts?.['on-set-notes'];
                    const currentNotes = stateRef.current.phases?.ON_SET?.drafts?.['on-set-notes'] || stateRef.current.phases?.PRODUCTION?.drafts?.['on-set-notes'];
                    if (newNotes && newNotes !== currentNotes) hasUpdates = true;

                    // Sync EComm Shot List
                    const newEcomm = newData.phases?.PRODUCTION?.drafts?.['ecomm-shot-list'];
                    const currentEcomm = stateRef.current.phases?.PRODUCTION?.drafts?.['ecomm-shot-list'];
                    if (newEcomm && newEcomm !== currentEcomm) hasUpdates = true;

                    if (hasUpdates) {
                        setState(prev => ({
                            ...prev,
                            phases: {
                                ...prev.phases,
                                ON_SET: {
                                    ...(prev.phases?.['ON_SET'] || {}),
                                    drafts: {
                                        ...(prev.phases?.['ON_SET']?.drafts || {}),
                                        ...(newDitLog && newDitLog !== currentDitLog ? { 'dit-log': newDitLog } : {}),
                                        ...(newCameraReport && newCameraReport !== currentCameraReport ? { 'camera-report': newCameraReport } : {}),
                                        ...(newNotes && newNotes !== currentNotes ? { 'on-set-notes': newNotes } : {})
                                    }
                                },
                                PRODUCTION: {
                                    ...(prev.phases?.['PRODUCTION'] || {}),
                                    drafts: {
                                        ...(prev.phases?.['PRODUCTION']?.drafts || {}),
                                        ...(newEcomm && newEcomm !== currentEcomm ? { 'ecomm-shot-list': newEcomm } : {})
                                    }
                                }
                            },
                        }));
                    }
                }
            )
            .subscribe();

        // CHANNEL 2: REAL-TIME PULSE BROADCASTS (PRODUCER ALERTS)
        const pulseChannel = supabase.channel(`production_pulse:${projectId}`)
            .on('broadcast', { event: 'DIT_ALERT' }, (payload) => {
                setLatestNotification({ msg: payload.payload.msg, time: Date.now() });
                setNavAlerts(prev => ({ ...prev, 'dit-log': true }));
                setTimeout(() => setNavAlerts(prev => ({ ...prev, 'dit-log': false })), 10000);
            })
            .on('broadcast', { event: 'CAMERA_ALERT' }, (payload) => {
                setLatestNotification({ msg: payload.payload.msg, time: Date.now() });
                setNavAlerts(prev => ({ ...prev, 'camera-report': true, 'shot-scene-book': true }));
                setTimeout(() => setNavAlerts(prev => ({ ...prev, 'camera-report': false, 'shot-scene-book': false })), 10000);
            })
            .on('broadcast', { event: 'NOTE_ALERT' }, (payload) => {
                setLatestNotification({ msg: payload.payload.msg, time: Date.now() });
                setNavAlerts(prev => ({ ...prev, 'on-set-notes': true }));
                setTimeout(() => setNavAlerts(prev => ({ ...prev, 'on-set-notes': false })), 10000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(dbChannel);
            supabase.removeChannel(pulseChannel);
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
                    // Check Brief for Context
                    const briefDraftRaw = s.phases['DEVELOPMENT']?.drafts['brief'];
                    let briefContext = '';
                    if (briefDraftRaw) {
                        try {
                            const b = JSON.parse(briefDraftRaw);
                            const d = Array.isArray(b) ? b[0] : b;
                            if (d.product) briefContext = `Vision: ${d.product || 'TBD'}\nObjective: ${d.objective || 'TBD'}\nAudience: ${d.targetAudience || 'TBD'}`;
                        } catch { }
                    }

                    if (briefContext) {
                        return {
                            ...s,
                            chat: {
                                ...s.chat, 'av-script': [{
                                    role: 'assistant',
                                    content: "I see a Creative Brief available. Would you like generated script ideas?",
                                    actions: [
                                        {
                                            label: "Yes, offer 3 ideas",
                                            type: "suggestion",
                                            payload: `Using the brief context:\n${briefContext}\n\nPlease generate 3 distinct script concepts. Output them as numbered options.`,
                                            prominence: "primary"
                                        },
                                        {
                                            label: "No, just write scenes",
                                            type: "suggestion",
                                            payload: `Using the brief context:\n${briefContext}\n\nPlease start writing scenes immediately in **Scene**, **Visual**, **Audio** format.`,
                                            prominence: "secondary"
                                        }
                                    ]
                                }]
                            }
                        };
                    }

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
                                content: "I can help you realize your vision. Just ask."
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


    // Safety: ensure activePhaseState exists. If corrupt, fallback to safe state immediately
    const activePhaseState = (state.phases && state.phases[state.activePhase]) ? state.phases[state.activePhase] : { locked: false, drafts: {} };

    // if (!activePhaseState) {
    //     // Critical State Corruption - Rendering impossible. 
    //     // We will trigger a reset effect but strictly return null to avoid crash.
    //     // return <div className="p-10 font-bold text-red-500">State Corruption Detected. Resetting... (Please refresh if stuck)</div>;
    // }

    // Fallback if phase is invalid in state
    const tools = TOOLS_BY_PHASE[state.activePhase] || TOOLS_BY_PHASE['DEVELOPMENT']

    const lockedPhases = useMemo(() => {
        const out: Record<Phase, boolean> = { STRATEGY: false, DEVELOPMENT: false, PRE_PRODUCTION: false, PRODUCTION: false, ON_SET: false, POST: false }
        for (const p of PHASES) {
            out[p] = state.phases?.[p]?.locked || false
        }
        return out
    }, [state.phases])

    const phaseData = useMemo(() => buildHandoffPayload(state.phases), [state.phases]);

    // Role-based Access Control for Specific Tools
    const isToolLocked = useMemo(() => {
        // 1. Phase Lock (Global override)
        if (state.phases?.[state.activePhase]?.locked) return true;

        // 2. Tool Specific Locks
        if (state.activeTool === 'dit-log') {
            const allowed = ['Owner', 'Producer', 'DP', 'DIT', 'Director'].includes(userRole || '');
            // NOTE: Founder no longer has implicit access here unless Role is granted
            return !allowed;
        }

        return false;
    }, [state.phases, state.activePhase, state.activeTool, userRole]);

    const saveDraftForActiveTool = useCallback((incoming: string) => {
        if (isReadOnly) {
            console.warn("Read-only mode: Save ignored.");
            return;
        }

        setState(s => {
            let newState = { ...s };
            const activePhaseState = (newState.phases && newState.phases[newState.activePhase]) ? newState.phases[newState.activePhase] : { locked: false, drafts: {} };
            const rawCurrent = activePhaseState.drafts[newState.activeTool] || '[]' 

            if (incoming === rawCurrent) return s;

            // --- AI VISION: Manual Paste Architecture ---
            // We no longer attempt to auto-parse AI responses into document fields.
            // This ensures stability and gives the Producer full creative control over what gets 'committed' to the official doc.
            
            let currentStack: any[] = [];
            try {
                const parsed = JSON.parse(rawCurrent);
                currentStack = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                currentStack = [{}];
            }
            if (currentStack.length === 0) currentStack.push({});

            // 1. Check if incoming is Full Batch (Array) or Single Draft (Object)
            try {
                const parsedIncoming = JSON.parse(incoming);
                if (Array.isArray(parsedIncoming)) {
                    newState = {
                        ...s,
                        phases: {
                            ...newState.phases,
                            [newState.activePhase]: {
                                ...newState.phases[newState.activePhase],
                                drafts: {
                                    ...newState.phases[newState.activePhase].drafts,
                                    [newState.activeTool]: incoming,
                                },
                            },
                        },
                    };

                    // AUTO-SYNC: Schedule -> Call Sheet (Purely Data-Driven)
                    if (newState.activeTool === 'schedule' && parsedIncoming.length > 0) {
                        try {
                            const schedData = parsedIncoming[0];
                            for (const p of PHASES) {
                                if (newState.phases[p]?.drafts?.['call-sheet']) {
                                    const csRaw = newState.phases[p].drafts['call-sheet'] || '[]';
                                    let csStack = JSON.parse(csRaw);
                                    if (!Array.isArray(csStack)) csStack = [csStack];
                                    if (csStack.length === 0) csStack = [{}];

                                    csStack[0] = {
                                        ...csStack[0],
                                        date: schedData.date || csStack[0].date,
                                        crewCall: schedData.callTime || csStack[0].crewCall,
                                        events: (schedData.items && Array.isArray(schedData.items)) ? schedData.items.map((item: any, i: number) => ({
                                            id: item.id || `evt-sync-${i}-${Date.now()}`,
                                            time: item.time || '',
                                            type: item.intExt === 'BREAK' ? 'Break' : 'Shoot',
                                            description: item.description || (item.scene ? `Scene ${item.scene}` : ''),
                                            location: item.set || ''
                                        })) : csStack[0].events
                                    };
                                    newState.phases[p].drafts['call-sheet'] = JSON.stringify(csStack);
                                }
                            }
                        } catch (e) { }
                    }
                    return newState;
                }
            } catch { }

            // 2. Default Path: Update current tool's draft directly
            return {
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
            };
        });
    }, [isReadOnly]);

    const handleGenerateFromVision = (targetTool: ToolKey, visionText: string, promptPrefix: string) => {
        // AI VISION: Creative Playground Logic
        // Instead of auto-populating fields (unstable), we switch tools and 
        // prompt AI VISION to brainstorm content tailored to the new context.
        
        setState(s => ({
            ...s,
            activeTool: targetTool,
            chat: {
                ...s.chat,
                [targetTool]: [
                    ...(s.chat[targetTool] || []),
                    { 
                        role: 'assistant', 
                        content: `Switched to **${TOOLS_BY_PHASE[s.activePhase]?.find(t => t.key === targetTool)?.label || targetTool}**. I am analyzing the Project Vision to help you structure your content here. What specific ideas from the vision should we expand on?` 
                    }
                ]
            }
        }));

        setIsAiDocked(false);
    };

    const handleMagicImport = (sourceData: any) => {
        if (!sourceData || !Array.isArray(sourceData.rows)) return;

        const newShots = sourceData.rows.map((row: any, i: number) => {
            const visual = (row.visual || '').toLowerCase();

            // Heuristic Analysis (Simulated AI)
            let size = 'Wide';
            if (visual.match(/(close|cu|detail|face|eyes)/)) size = 'Close Up';
            else if (visual.match(/(med|waist|torso)/)) size = 'Medium';
            else if (visual.match(/(extreme|macro)/)) size = 'Extreme CU';
            else if (visual.match(/(full|body)/)) size = 'Full';

            let angle = 'Eye Level';
            if (visual.match(/(low|up)/)) angle = 'Low Angle';
            else if (visual.match(/(high|down|bird)/)) angle = 'High Angle';
            else if (visual.match(/(over|top)/)) angle = 'Overhead';

            let movement = 'Static';
            if (visual.match(/(pan|scan)/)) movement = 'Pan';
            else if (visual.match(/(track|dolly|follow|walk)/)) movement = 'Tracking';
            else if (visual.match(/(hand|shaky|run)/)) movement = 'Handheld';

            return {
                id: `shot-magic-${Date.now()}-${i}`,
                sourceId: row.id,
                scene: row.scene || '',
                size,
                angle,
                movement,
                description: row.visual || ''
            };
        });

        // Save
        const targetTool = 'shot-scene-book';
        const currentDraftRaw = activePhaseState.drafts[targetTool] || '[]';
        let currentStack: any[] = [];
        try {
            const parsed = JSON.parse(currentDraftRaw);
            if (Array.isArray(parsed)) currentStack = parsed;
            else currentStack = [parsed];
        } catch { currentStack = [{}]; }

        if (currentStack.length === 0) currentStack.push({});

        const currentHead = currentStack[0];
        const existingShots = currentHead.shots || [];
        const updatedHead = { ...currentHead, shots: [...existingShots, ...newShots] };
        currentStack[0] = updatedHead;

        const nextDrafts = { ...(state.phases?.[state.activePhase]?.drafts || {}), [targetTool]: JSON.stringify(currentStack) };
        const nextPhaseState = { ...(state.phases?.[state.activePhase] || {}), drafts: nextDrafts };

        setState(s => ({
            ...s,
            phases: {
                ...s.phases,
                [state.activePhase]: nextPhaseState
            }
        }));
        setLatestNotification({ msg: `AI: Analyzed & Generated ${newShots.length} Shots`, time: Date.now() });
    };

    const handleGenerateFromBrief = (targetTool: ToolKey) => {
        // AI VISION: Manual Handoff Model
        // We simply switch the tool. The context remains in the Project Vision 
        // for the Producer to copy/paste as needed.
        setState(s => ({ ...s, activeTool: targetTool }));
        setIsAiDocked(true); // Close AI when leaving Vision
    };

    async function send(overrideInput?: string, overrideTool?: ToolKey) {
        const textToUse = (typeof overrideInput === 'string') ? overrideInput : input;

        // Note: Legacy legacy brief->execution intercept removed to enforce Vision-first workflow.
        
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

            // INTERCEPT: AV Script Ideas Response - Attach Selection Buttons
            let finalActions: any[] | undefined = undefined;
            const lastUserPayload = nextChat[nextChat.length - 1]?.content.toLowerCase();

            if (effectiveTool === 'av-script' && lastUserPayload.includes('generate 3 distinct script concepts')) {
                finalActions = [
                    { label: "Select Option 1", type: "suggestion", payload: "I choose Option 1. Break it down into scenes (Storyline, Characters, Dialog) using **Scene**, **Visual**, **Audio** format to be added to the script.", prominence: "primary" },
                    { label: "Select Option 2", type: "suggestion", payload: "I choose Option 2. Break it down into scenes (Storyline, Characters, Dialog) using **Scene**, **Visual**, **Audio** format to be added to the script.", prominence: "primary" },
                    { label: "Select Option 3", type: "suggestion", payload: "I choose Option 3. Break it down into scenes (Storyline, Characters, Dialog) using **Scene**, **Visual**, **Audio** format to be added to the script.", prominence: "primary" }
                ];
            }

            setState((s) => ({
                ...s,
                chat: {
                    ...s.chat,
                    [effectiveTool]: [...nextChat, { role: 'assistant', content: assistantMsg, actions: finalActions }]
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
    const [isAiDocked, setIsAiDocked] = useState(true)

    const { isLocked: trialLocked } = useTrialStatus()
    const router = useRouter();
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

    // Auto-Open AI for Project Vision
    useEffect(() => {
        if (state.activeTool === 'project-vision') {
            setIsAiDocked(false);
        } else {
            // Close AI when leaving Project Vision
            setIsAiDocked(true);
        }
    }, [state.activeTool]);



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
    }, [state.activeTool, activePhaseState?.drafts]);



    return (
        <div className="h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans text-foreground transition-colors duration-300">

            <main className="flex-1 flex overflow-hidden relative bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
                {trialLocked && (
                    <div className="absolute inset-0 z-50 bg-zinc-100/70 dark:bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-zinc-50 border border-zinc-200 shadow-xl rounded-xl p-8 max-w-md text-center">
                            <h2 className="font-sans font-bold text-2xl mb-2 text-zinc-800 tracking-tight">TRIAL CONCLUDED</h2>
                            <p className="text-zinc-600 text-sm mb-6">Upgrade your workspace to unlock the production console.</p>
                            <button
                                onClick={() => router.push('/pricing')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors text-xs uppercase tracking-widest shadow-md"
                            >
                                VIEW PLANS
                            </button>
                        </div>
                    </div>
                )}
                {/* Standby Banner Removed */}

                <ExperimentalWorkspaceNav
                    userEmail={userEmail}
                    activeTool={state.activeTool}
                    activePhase={state.activePhase}
                    onToolSelect={(toolKey, phase) => {
                        // Toggle Logic for Mobile Control
                        if (toolKey === 'onset-mobile-control') {
                            setState(s => {
                                // If already open -> Close (Toggle Back)
                                if (s.activeTool === 'onset-mobile-control' && s.lastActiveTool) {
                                    return { 
                                        ...s, 
                                        activeTool: s.lastActiveTool,
                                        activePhase: s.lastActivePhase || s.activePhase 
                                    };
                                }
                                // If closed -> Open & Save State
                                return {
                                    ...s,
                                    activePhase: phase,
                                    activeTool: toolKey as ToolKey,
                                    lastActiveTool: s.activeTool, // Capture underlying doc
                                    lastActivePhase: s.activePhase // Capture underlying phase
                                };
                            });
                            return;
                        }

                        // Direct state update to handle simultaneous phase+tool switch

                        setState(s => ({ ...s, activePhase: phase, activeTool: toolKey as ToolKey }));
                    }}
                    producerName={state.producer}
                    mobileStatus={{
                        isLive: mobileControlDoc?.content?.isLive || false,
                        hasAlert: !!latestNotification,
                        alertMsg: latestNotification?.msg
                    }}
                    alerts={navAlerts}
                />

                {/* AI VISION: Isolated to Project Vision Tool */}
                {(state.activeTool === 'project-vision') && (
                    <ChatInterface
                        messages={activeChat}
                        input={input}
                        isSending={isSending}
                        error={error}
                        onInputChange={setInput}
                        onSend={send}
                        activeToolLabel="Creative Lab"
                        activeToolKey={state.activeTool}
                        placeholderHint="Architect your vision..."
                        onInsertToDraft={(text: string) => {
                            // Smart Append Logic for AI VISION
                            // This ensures AI snippets don't corrupt the document stack JSON structure.
                            setState(s => {
                                const activePhaseKey = s.activePhase;
                                const activeToolKey = s.activeTool;
                                const raw = s.phases[activePhaseKey]?.drafts?.[activeToolKey] || '[]';
                                
                                let stack: any[] = [];
                                try {
                                    const parsed = JSON.parse(raw);
                                    stack = Array.isArray(parsed) ? parsed : [parsed];
                                } catch {
                                    stack = [{}];
                                }
                                if (stack.length === 0) stack.push({});

                                const head = { ...stack[0] };

                                if (activeToolKey === 'project-vision') {
                                    // Lab Logic: Append to active page content
                                    const pages = head.pages || [{ id: `p-${Date.now()}`, content: '' }];
                                    const activeId = head.activePageId || pages[0].id;
                                    const updatedPages = pages.map((p: any) => {
                                        if (p.id === activeId) {
                                            return { ...p, content: p.content + (p.content ? '\n\n' : '') + text };
                                        }
                                        return p;
                                    });
                                    stack[0] = { ...head, pages: updatedPages, activePageId: activeId };
                                } else {
                                    // Generic Logic: Append to text or primary field
                                    const currentText = typeof head === 'string' ? head : (head.content || head.text || '');
                                    const newText = currentText + (currentText ? '\n\n' : '') + text;
                                    if (typeof head === 'object') {
                                        stack[0] = { ...head, content: newText };
                                    } else {
                                        stack[0] = newText;
                                    }
                                }

                                return {
                                    ...s,
                                    phases: {
                                        ...s.phases,
                                        [activePhaseKey]: {
                                            ...s.phases[activePhaseKey],
                                            drafts: {
                                                ...s.phases[activePhaseKey].drafts,
                                                [activeToolKey]: JSON.stringify(stack)
                                            }
                                        }
                                    }
                                };
                            });
                        }}
                        onClear={() => setState(s => ({
                            ...s,
                            chat: { ...s.chat, [s.activeTool]: [] }
                        }))}
                        isLocked={!!(activePhaseState.locked || isReadOnly)}
                        isDocked={isAiDocked}
                        onDock={() => setIsAiDocked(true)}
                        activeMode="DEVELOP"
                        onModeChange={() => { }}
                        onNavigate={(targetTool: string, payload?: string) => {
                            // Manual Handoff: Switch tool and let user paste
                            let foundPhase: Phase | undefined;
                            for (const [p, tools] of Object.entries(TOOLS_BY_PHASE)) {
                                if (tools.some(t => t.key === targetTool)) {
                                    foundPhase = p as Phase;
                                    break;
                                }
                            }
                            if (foundPhase) {
                                setState(s => ({
                                    ...s,
                                    activePhase: foundPhase!,
                                    activeTool: targetTool as ToolKey
                                }));
                                // We no longer auto-parse into the new tool.
                                // The AI message will be in the vision chat history, ready for copy-paste.
                            }
                        }}
                    />
                )}

                {/* Floating Mobile Control (Simulator) Removed */}


                {/* --- Main Content Area --- */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                    <Header
                        projectName={state.projectName}
                        activeToolLabel={activeToolLabel}
                    />

                    {isReadOnly && (
                        <div className="bg-amber-500/10 border-b border-amber-200 py-1 px-4 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-amber-700 tracking-widest uppercase">READ-ONLY DEMO</span>
                            <span className="text-[10px] text-amber-600/80 italic font-medium">Cloned from Master Template</span>
                        </div>
                    )}

                    {state.activeTool === 'project-export' ? (
                        <PrintDashboard
                            onClose={() => setState(s => ({ ...s, activeTool: 'brief' }))}
                            phases={state.phases}
                            projectName={state.projectName}
                            clientName={state.clientName}
                            producer={state.producer}
                        />
                    ) : state.activeTool === 'project-overview' ? (
                        <ProjectOverview
                            phases={state.phases}
                            activePhaseKey={state.activePhase}
                            onOpenTool={(phaseKey) => {
                                const DEFAULTS: any = {
                                    'STRATEGY': 'project-vision',
                                    'DEVELOPMENT': 'brief',
                                    'PRE_PRODUCTION': 'shot-scene-book',
                                    'PRODUCTION': 'call-sheet',
                                    'POST_PRODUCTION': 'client-selects',
                                    'WRAP': 'archive-log'
                                };
                                const targetTool = DEFAULTS[phaseKey] || 'brief';
                                setState(s => ({ ...s, activePhase: phaseKey as Phase, activeTool: targetTool }));
                            }}
                        />
                    ) : (
                        <DraftEditor
                            draft={currentDraft}
                            onDraftChange={saveDraftForActiveTool}
                            isLocked={!!(isToolLocked || trialLocked || isReadOnly)}
                            activeToolLabel={activeToolLabel}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            activeToolKey={state.activeTool as any}
                            persona={persona}
                            isOwner={userRole === 'Owner'}
                            projectId={projectId}
                            projectName={state.projectName}
                            clientName={state.clientName}
                            producer={state.producer}

                            phases={state.phases}

                            onGenerateFromVision={handleGenerateFromVision}
                            onOpenAi={state.activePhase === 'DEVELOPMENT' ? toggleAiDock : undefined}
                            isAiDocked={isAiDocked}
                            latestNotification={latestNotification}
                            onMagicImport={handleMagicImport}
                            onOpenPrintRoom={() => setState(s => ({ ...s, activeTool: 'project-export' }))}
                        />
                    )}
                </div>


            </main>



        </div>
    )
}
