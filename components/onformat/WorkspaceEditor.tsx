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
}

export const WorkspaceEditor = ({ initialState, projectId, projectName, onSave, userRole, userEmail }: WorkspaceEditorProps) => {

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
                            const currentDraft = current.phases.PRE_PRODUCTION.drafts['crew-list'];
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
                                                    ...current.phases.PRE_PRODUCTION,
                                                    drafts: {
                                                        ...current.phases.PRE_PRODUCTION.drafts,
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
                                            ...current.phases.PRE_PRODUCTION,
                                            drafts: {
                                                ...current.phases.PRE_PRODUCTION.drafts,
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
            if (onSave) {
                onSave(state);
            } else if (!projectId) {
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

        console.log("🔌 Subscribing to Realtime Changes for Project:", projectId);

        const channel = supabase
            .channel(`project_updates:${projectId}`) // Jackson: Scoped channel name for project updates
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (payload: any) => {
                    console.log("⚡️ Realtime Update Received:", payload);
                    const newData = payload.new?.data;
                    if (!newData) return;

                    // Check for DIT Log Updates (Check both possible phase keys)
                    const newDitLog = newData.phases?.ON_SET?.drafts?.['dit-log'] || newData.phases?.PRODUCTION?.drafts?.['dit-log'];
                    const currentDitLog = stateRef.current.phases?.ON_SET?.drafts?.['dit-log'] || stateRef.current.phases?.PRODUCTION?.drafts?.['dit-log'];

                    // Check for Camera Report Updates
                    const newCameraReport = newData.phases?.ON_SET?.drafts?.['camera-report'] || newData.phases?.PRODUCTION?.drafts?.['camera-report'];
                    const currentCameraReport = stateRef.current.phases?.ON_SET?.drafts?.['camera-report'] || stateRef.current.phases?.PRODUCTION?.drafts?.['camera-report'];

                    const currentPhaseKey = stateRef.current.phases?.ON_SET ? 'ON_SET' : 'PRODUCTION';
                    const updatedDrafts = { ...stateRef.current.phases?.[currentPhaseKey]?.drafts };
                    let hasUpdates = false;
                    let notifMsg = '';

                    if (newDitLog && newDitLog !== currentDitLog) {
                        console.log("🔔 DIT Log Change Detected!");
                        updatedDrafts['dit-log'] = newDitLog;
                        hasUpdates = true;
                        notifMsg = 'New DIT Log Entry Received';

                        // Parse for Issues
                        try {
                            const parsed = JSON.parse(newDitLog);
                            const list = Array.isArray(parsed) ? parsed : (parsed.items || []);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const hasIssue = list.some((i: any) => i.eventType === 'issue' && i.status !== 'complete');
                            if (hasIssue) notifMsg = 'DIT ALERT: Issue Reported';
                        } catch { }
                    }

                    // Check for On-Set Notes Updates
                    const newNotes = newData.phases?.ON_SET?.drafts?.['on-set-notes'] || newData.phases?.PRODUCTION?.drafts?.['on-set-notes'];
                    const currentNotes = stateRef.current.phases?.ON_SET?.drafts?.['on-set-notes'] || stateRef.current.phases?.PRODUCTION?.drafts?.['on-set-notes'];

                    if (newNotes && newNotes !== currentNotes) {
                        console.log("🔔 On-Set Notes Change Detected!");
                        updatedDrafts['on-set-notes'] = newNotes;
                        hasUpdates = true;
                        notifMsg = 'New On-Set Note Received';
                        setNavAlerts(prev => ({ ...prev, 'on-set-notes': true }));
                        setTimeout(() => setNavAlerts(prev => ({ ...prev, 'on-set-notes': false })), 10000);
                    }

                    if (newCameraReport && newCameraReport !== currentCameraReport) {
                        console.log("🔔 Camera Report Change Detected!");
                        updatedDrafts['camera-report'] = newCameraReport;
                        hasUpdates = true;
                        // No Notification for Camera Report
                    }

                    if (hasUpdates) {
                        if (notifMsg) setLatestNotification({ msg: notifMsg, time: Date.now() });

                        setState(prev => ({
                            ...prev,
                            phases: {
                                ...prev.phases,
                                ON_SET: {
                                    ...prev.phases.ON_SET,
                                    drafts: updatedDrafts
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
            const allowed = ['Owner', 'Producer', 'DP', 'DIT', 'Director'].includes(userRole || '');
            // NOTE: Founder no longer has implicit access here unless Role is granted
            return !allowed;
        }

        return false;
    }, [state.phases, state.activePhase, state.activeTool, userRole]);

    const saveDraftForActiveTool = useCallback((incoming: string) => {
        setState(s => {
            let newState = { ...s };
            const activePhaseState = (newState.phases && newState.phases[newState.activePhase]) ? newState.phases[newState.activePhase] : { locked: false, drafts: {} };
            const rawCurrent = activePhaseState.drafts[newState.activeTool] || '[]' 

            if (incoming === rawCurrent) return s;

            let currentStack: any[] = [];
            try {
                const parsed = JSON.parse(rawCurrent);
                currentStack = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                currentStack = [{}];
            }
            if (currentStack.length === 0) currentStack.push({});

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

                    // AUTO-SYNC: Schedule -> Call Sheet
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
                        } catch (e) { console.error("Schedule to Call Sheet sync failed", e); }
                    }
                    return newState;
                }
            } catch { }

            try {
                const parsedIncoming = JSON.parse(incoming);
                if (typeof parsedIncoming === 'object' && parsedIncoming !== null) {
                // PARTIAL UPDATE (Patch) from AI Action
                // Merge into the HEAD (Index 0)
                const currentHead = currentStack[0] || {};
                const newHead = { ...currentHead, ...parsedIncoming };
                currentStack[0] = newHead;
                const finalDraftString = JSON.stringify(currentStack);
                newState = {
                    ...newState,
                    phases: {
                        ...newState.phases,
                        [newState.activePhase]: {
                            ...newState.phases[newState.activePhase],
                            drafts: {
                                ...newState.phases[newState.activePhase].drafts,
                                [newState.activeTool]: finalDraftString,
                            },
                        },
                    },
                };

                // AUTO-SYNC: Schedule -> Call Sheet (Partial AI Update)
                if (newState.activeTool === 'schedule') {
                    try {
                        const schedData = newHead;
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
                    } catch (e) { console.error("Schedule to Call Sheet sync (AI Partial) failed", e); }
                }
                return newState;
            }
        } catch {
            // Not JSON, continue to AI logic
        }

        // We only modify the "HEAD" (index 0) of the stack with AI updates
        const currentHeadRaw = JSON.stringify(currentStack[0]);
        let newHeadRaw = incoming;

        // --- AI Parsing Logic applied to Head ---
        // SPECIAL HANDLING: Parsing AI Markdown for Brief
        if (newState.activeTool === 'brief') {
            const visionMatch = incoming.match(/\*\*(?:Vision|Subject\/Product|Subject|Product|Client\/Brand|Project):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const objectiveMatch = incoming.match(/\*\*Objective:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const audienceMatch = incoming.match(/\*\*(?:Target )?Audience:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const toneMatch = incoming.match(/\*\*Tone(?: [&/\\,]+ Style)?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const messageMatch = incoming.match(/\*\*(?:Key )?Message:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const narrativeMatch = incoming.match(/\*\*(?:Narrative(?: \/ Creative Approach)?|Creative Approach|Concept):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const talentMatch = incoming.match(/\*\*(?:Talent(?: \/ Casting)?|Casting):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const locationMatch = incoming.match(/\*\*(?:Location|Setting):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
            const deliverablesMatch = incoming.match(/\*\*Deliverables:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

            if (visionMatch || objectiveMatch || audienceMatch || toneMatch || messageMatch || narrativeMatch || talentMatch || locationMatch || deliverablesMatch) {
                const parsedUpdate: Record<string, any> = {};
                if (visionMatch) parsedUpdate.product = visionMatch[1].trim();
                if (objectiveMatch) parsedUpdate.objective = objectiveMatch[1].trim();
                if (audienceMatch) parsedUpdate.targetAudience = audienceMatch[1].trim();
                if (toneMatch) parsedUpdate.tone = toneMatch[1].trim();
                if (messageMatch) parsedUpdate.keyMessage = messageMatch[1].trim();
                if (narrativeMatch) parsedUpdate.narrative = narrativeMatch[1].trim();
                if (talentMatch) parsedUpdate.talent = talentMatch[1].trim();
                if (locationMatch) parsedUpdate.location = locationMatch[1].trim();
                if (deliverablesMatch) {
                    // Keep deliverables as a string block
                    parsedUpdate.deliverables = deliverablesMatch[1].trim();
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

                newState = {
                    ...newState,
                    phases: {
                        ...newState.phases,
                        [newState.activePhase]: {
                            ...newState.phases[newState.activePhase],
                            drafts: {
                                ...newState.phases[newState.activePhase].drafts,
                                [newState.activeTool]: finalDraftString,
                            },
                        },
                    },
                };
                return newState;
            }
        }

        // SPECIAL HANDLING: Directors Treatment
        if (newState.activeTool === 'directors-treatment') {
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

                newState = {
                    ...newState,
                    phases: {
                        ...newState.phases,
                        [newState.activePhase]: {
                            ...newState.phases[newState.activePhase],
                            drafts: {
                                ...newState.phases[newState.activePhase].drafts,
                                [newState.activeTool]: finalDraftString,
                            },
                        },
                    },
                };
                return newState;
            }
        }

        // SPECIAL HANDLING: Project Vision Parser
        else if (newState.activeTool === 'project-vision') {
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

                    newState = {
                        ...newState,
                        phases: {
                            ...newState.phases,
                            [newState.activePhase]: {
                                ...newState.phases[newState.activePhase],
                                drafts: {
                                    ...newState.phases[newState.activePhase].drafts,
                                    [newState.activeTool]: finalDraftString,
                                },
                            },
                        },
                    };
                    return newState;

                } catch (e) {
                    // If structure fails, fallback to simple string append is tricky with JSON storage.
                    // Assume JSON structure is valid for now.
                }
            }
        }

        // SPECIAL HANDLING: Shot List Parser (shot-scene-book)
        else if (newState.activeTool === 'shot-scene-book') {
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

                    newState = {
                        ...newState,
                        phases: {
                            ...newState.phases,
                            [newState.activePhase]: {
                                ...newState.phases[newState.activePhase],
                                drafts: {
                                    ...newState.phases[newState.activePhase].drafts,
                                    [newState.activeTool]: finalDraftString,
                                },
                            },
                        },
                    };
                    return newState;

                } catch (e) { console.error('Shot Parse Error', e); }
            }
        }

        // SPECIAL HANDLING: Visual Direction (Mood Board / Storyboard)
        if (newState.activeTool === 'storyboard') {
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

                newState = {
                    ...newState,
                    phases: {
                        ...newState.phases,
                        [newState.activePhase]: {
                            ...newState.phases[newState.activePhase],
                            drafts: {
                                ...newState.phases[newState.activePhase].drafts,
                                [newState.activeTool]: finalDraftString,
                            },
                        },
                    },
                };
                return newState;
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
        if (newState.activeTool === 'project-vision') {
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
        else if (newState.activeTool === 'brief') {
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
        else if (newState.activeTool === 'directors-treatment') {
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
        else if (newState.activeTool === 'storyboard') {
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
        else if (newState.activeTool === 'shot-scene-book') {
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
        else if (newState.activeTool === 'av-script') {
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

        return {
            ...newState,
            phases: {
                ...newState.phases,
                [newState.activePhase]: {
                    ...newState.phases[newState.activePhase],
                    drafts: {
                        ...newState.phases[newState.activePhase].drafts,
                        [newState.activeTool]: JSON.stringify(currentStack),
                    },
                },
            },
        };
        });
    }, []);


    const handleGenerateFromVision = (targetTool: ToolKey, visionText: string, promptPrefix: string) => {
        const activePhaseState = state.phases[state.activePhase];
        // 1. Data Extraction
        let startingData: any = {};
        if (targetTool === 'brief') {
            // Paste Full Vision Text into 'product' (Vision) field
            startingData = {
                product: visionText,
                objective: "Derived from Vision.",
                targetAudience: "TBD",
                tone: "See Vision field",
                keyMessage: "TBD"
            };
        } else if (targetTool === 'directors-treatment') {
            const lines = visionText.split('\n').filter(l => l.trim().length > 0);
            startingData = {
                approach: "Based on Vision Board...",
                tone: "See Vision Board",
                narrativeArc: lines.slice(0, 5).join('\n')
            };
        }

        // 2. Create new version
        const currentDraftRaw = activePhaseState.drafts[targetTool] || '[]';
        let newDraftJSON = JSON.stringify([startingData]);

        try {
            const parsed = JSON.parse(currentDraftRaw);
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            newDraftJSON = JSON.stringify([startingData, ...arr]);
        } catch { }

        // Update drafts & Switch Tool
        const nextDrafts = { ...activePhaseState.drafts, [targetTool]: newDraftJSON };
        const nextPhaseState = { ...state.phases[state.activePhase], drafts: nextDrafts };

        setState(s => ({
            ...s,
            phases: {
                ...s.phases,
                [state.activePhase]: nextPhaseState
            },
            activeTool: targetTool,
        }));
        setIsAiDocked(false);

        // 3. Trigger AI Assistant with Handoff Instruction
        const chatHistory = state.chat['project-vision'] || [];
        const chatContext = chatHistory
            .filter(m => m.role === 'user' || (m.role === 'assistant' && !m.content.includes("Let's capture")))
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n');

        const fullContext = `${visionText}\n\n[Context from Conversation]:\n${chatContext}`;

        let prompt = `${promptPrefix}:\n\n"${fullContext}"`;
        if (targetTool === 'brief') {
            prompt = `Based on our previous conversation, please generate a structured "First Draft" of the Creative Brief by acting as a "Silent Scribe".
            
EXTRACT and SYNTHESIZE the following fields from our chat context. Use this EXACT format (bold keys) so the system can auto-populate the document:

**Product:** [Project Name/Brand]
**Objective:** [Primary Goal]
**Target Audience:** [Who is this for?]
**Tone:** [Adjectives]
**Key Message:** [Core Takeaway]
**Narrative:** [The Story/Concept Arc]
**Talent:** [Characters/Casting Notes]
**Location:** [Setting/Environment]
**Deliverables:** [Formats/Assets]

If any info is missing, make a creative best guess based on the "Vibe" of our chat.

Context:\n"${fullContext}"`;
        } else if (targetTool === 'directors-treatment') {
            prompt = `I have started a new Treatment. Please analyze the Vision text below and ask me questions to help flesh out the **Visual Language** and **Character Philosophy**.\n\nVision & Context:\n"${fullContext}"`;
        }

        send(prompt, targetTool);
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

        const nextDrafts = { ...activePhaseState.drafts, [targetTool]: JSON.stringify(currentStack) };
        const nextPhaseState = { ...state.phases[state.activePhase], drafts: nextDrafts };

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
        // 1. Retrieve Context
        const briefDraftRaw = activePhaseState.drafts['brief'];
        let briefContext = "Brief not found.";
        try {
            const b = JSON.parse(briefDraftRaw || '{}');
            const d = Array.isArray(b) ? b[0] : b;
            briefContext = `Vision: ${d.product}\nObjective: ${d.objective}\nAudience: ${d.targetAudience}\nTone: ${d.tone}`;
        } catch { }

        // 2. Switch Tool
        setState(s => ({ ...s, activeTool: targetTool }));
        setIsAiDocked(false);

        // 3. Prompt Generation logic for AV Script vs Storyboard
        if (targetTool === 'av-script') {
            // Inject Assistant Question with Actions
            const assistantMsg: ChatMsg = {
                role: 'assistant',
                content: "I have your Creative Brief context. Would you like generated script ideas?",
                actions: [
                    {
                        label: "Yes, offer 3 ideas",
                        type: "suggestion",
                        payload: `Using the brief context:\n${briefContext}\n\nPlease generate 3 distinct script concepts/angles. Output them as numbered options.`,
                        prominence: "primary"
                    },
                    {
                        label: "No, just write scenes",
                        type: "suggestion",
                        payload: `Using the brief context:\n${briefContext}\n\nPlease start writing scenes immediately in **Scene**, **Visual**, **Audio** format.`,
                        prominence: "secondary"
                    }
                ]
            };

            setState(s => ({
                ...s,
                chat: { ...s.chat, [targetTool]: [...(s.chat[targetTool] || []), assistantMsg] }
            }));
            return;
        }

        let systemPrompt = `We are transitioning from Strategy to Execution (Storyboard).\n\nCreative Brief Context:\n${briefContext}\n\nTask: Using your knowledge of storytelling arcs and structure, please generate the initial scenes/frames.`;
        systemPrompt += `\nOutput format: **Frame:** [Number], **Visual:** [Visual Description]. Create 6 key frames that visualized the narrative arc.`;

        send(systemPrompt, targetTool);
    };

    async function send(overrideInput?: string, overrideTool?: ToolKey) {
        const textToUse = (typeof overrideInput === 'string') ? overrideInput : input;

        // INTERCEPT: Brief -> Execution Handoff
        if (state.activeTool === 'brief' && !overrideTool && textToUse) {
            const lower = textToUse.toLowerCase();
            // Detect user intent to switch tools
            const isScriptMatches = lower.includes('script');
            const isBoardMatches = lower.includes('storyboard') || lower.includes('board');
            const isCommand = lower.includes('switch') || lower.includes('move') || lower.includes('generate') || lower.includes('create') || lower.includes('go to') || (textToUse.length < 25 && (isScriptMatches || isBoardMatches));

            if (isCommand) {
                if (isScriptMatches) {
                    handleGenerateFromBrief('av-script');
                    setInput('');
                    return;
                } else if (isBoardMatches) {
                    handleGenerateFromBrief('storyboard');
                    setInput('');
                    return;
                }
            }
        }

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
        }
    }, [state.activeTool]);

    // PREVENT PERSISTENCE: Close AI when leaving Development
    useEffect(() => {
        if (state.activePhase !== 'DEVELOPMENT') {
            setIsAiDocked(true);
        }
    }, [state.activePhase]);



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
        <div className="h-screen bg-white flex flex-col font-sans text-foreground transition-colors duration-300">

            <main className="flex-1 flex overflow-hidden relative bg-zinc-50 transition-colors duration-300">
                {trialLocked && (
                    <div className="absolute inset-0 z-50 bg-zinc-100/70 backdrop-blur-sm flex items-center justify-center">
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
                    onToggleAi={toggleAiDock}
                    isAiDocked={isAiDocked}
                    mobileStatus={{
                        isLive: mobileControlDoc?.content?.isLive || false,
                        hasAlert: !!latestNotification,
                        alertMsg: latestNotification?.msg
                    }}
                    alerts={navAlerts}
                />

                {/* HIDE AI LIAISON IN ALL PHASES EXCEPT DEVELOPMENT */}
                {(state.activePhase === 'DEVELOPMENT') && (
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


                        isDocked={isAiDocked}
                        onDock={() => setIsAiDocked(true)}
                        activeMode={aiMode}
                        onModeChange={() => { }}

                        onNavigate={(targetTool: string, payload?: string) => {
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
                                        // 1. Add to Chat History
                                        const existingChat = newState.chat[targetTool as ToolKey] || [];
                                        newState.chat = {
                                            ...newState.chat,
                                            [targetTool as ToolKey]: [
                                                ...existingChat,
                                                { role: 'assistant', content: `Transferring context...\n\n${payload}` }
                                            ]
                                        };

                                        // 2. Direct Draft Update (SPECIAL HANDLING FOR BRIEF)
                                        if (targetTool === 'brief') {
                                            // ... Brief Parsing Logic ...
                                            const subjectMatch = payload.match(/\*\*(?:Subject|Product)(?:\/Product)?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const objectiveMatch = payload.match(/\*\*Objective:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const audienceMatch = payload.match(/\*\*(?:Target )?Audience:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const toneMatch = payload.match(/\*\*Tone(?: [&/\\,]+ Style)?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const messageMatch = payload.match(/\*\*(?:Key )?Message:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const narrativeMatch = payload.match(/\*\*(?:Narrative|Creative Approach|Story):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const talentMatch = payload.match(/\*\*(?:Talent|Casting|Characters):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const locationMatch = payload.match(/\*\*(?:Location|Setting):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
                                            const deliverablesMatch = payload.match(/\*\*(?:Deliverables|Assets):\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

                                            if (subjectMatch || objectiveMatch || audienceMatch || toneMatch || messageMatch || narrativeMatch || talentMatch || locationMatch || deliverablesMatch) {
                                                const existingDraftJSON = newState.phases[foundPhase!].drafts[targetTool as ToolKey] || '[]';
                                                let currentStack: any[] = [{}];

                                                try {
                                                    const parsed = JSON.parse(existingDraftJSON);
                                                    if (Array.isArray(parsed)) currentStack = parsed;
                                                    else if (typeof parsed === 'object') currentStack = [parsed];
                                                } catch { /* ignore */ }

                                                if (currentStack.length === 0) currentStack.push({});

                                                const update: any = {};
                                                if (subjectMatch) update.product = subjectMatch[1].trim();
                                                if (objectiveMatch) update.objective = objectiveMatch[1].trim();
                                                if (audienceMatch) update.targetAudience = audienceMatch[1].trim();
                                                if (toneMatch) update.tone = toneMatch[1].trim();
                                                if (messageMatch) update.keyMessage = messageMatch[1].trim();
                                                if (narrativeMatch) update.narrative = narrativeMatch[1].trim();
                                                if (talentMatch) update.talent = talentMatch[1].trim();
                                                if (locationMatch) update.location = locationMatch[1].trim();
                                                if (deliverablesMatch) update.deliverables = deliverablesMatch[1].trim();

                                                currentStack[0] = { ...currentStack[0], ...update };

                                                // Commit Update
                                                newState.phases[foundPhase!].drafts[targetTool as ToolKey] = JSON.stringify(currentStack);
                                            }
                                        }
                                    }
                                    return newState;
                                });
                            } else {
                                console.warn(`Could not find phase for tool: ${targetTool}`);
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
                            isLocked={isToolLocked || trialLocked}
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
