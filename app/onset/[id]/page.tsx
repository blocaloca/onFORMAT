'use client';
// Mobile Polish Update - RETRY 2 - 10:47 AM
import React, { useEffect, useState, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { getClient } from '@/lib/supabase';
import { Menu, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { ProjectDataProvider } from '@/lib/useProjectData';

// Import Views
import {
    DOC_LABELS,
    ScriptView,
    ShotListView,
    CallSheetView,
    MobileDITLogView,
    EmptyState,
    EmailEntryGate,
    CrewListView,
    ScheduleView,
    MobileCameraReportView,
    MobileOnSetNotesView,
    MobileLocationsView,
    MobileReleasesView,
    MobileScriptNotesView,
    MobileSoundReportView,
    MobileReadOnlyListView,
    MobileBriefView,
    MobileTreatmentView,
    MobileLookbookView,
    MobileWardrobeView,
    MobileCastingView,
    MobilePropsView,
    MobileClientSelectsView,
    MobileControlView
} from './components';
import { LogOut, Wifi, UserCircle, AlertCircle, HardDrive, RefreshCw, ChevronLeft, Save } from 'lucide-react';
import { BetaFeedbackTrigger } from '@/components/feedback/BetaFeedbackTrigger';

/* --------------------------------------------------------------------------------
 * COMPONENTS
 * -------------------------------------------------------------------------------- */
const MobileLanding = ({ projectName, status }: any) => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8 animate-in fade-in duration-700">
        <h1 className="text-xl font-bold uppercase tracking-widest text-white mb-2">
            {projectName}
        </h1>
        <div className="h-px w-12 bg-zinc-800 my-4 mx-auto" />
        <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
            {status}
        </p>
    </div>
);

const safeParse = (json: string) => {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
};

/* --------------------------------------------------------------------------------
 * TYPES
 * -------------------------------------------------------------------------------- */
type Tab = string;

interface MobileState {
    project: any | null;
    docs: Record<string, any>;
    availableKeys?: string[];
}

/* --------------------------------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------------------------------- */
export default function OnSetMobilePage() {
    const supabase = getClient()
    const params = useParams();
    const pathname = usePathname();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('');
    const [data, setData] = useState<MobileState>({ project: null, docs: {} });
    const [mediaAlerts, setMediaAlerts] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const [userEmail, setUserEmail] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');
    const [showLogin, setShowLogin] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
    const [myProjects, setMyProjects] = useState<any[]>([]);

    const activeTabRef = useRef(activeTab);
    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

    useEffect(() => {
        if (!id) return;
        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel(`project-live-${id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${id}` },
                (payload) => {
                    console.log("Live update received!", payload);
                    fetchData();
                }
            )
            .on('broadcast', { event: 'NEW_ROLL_PULLED' }, (payload) => {
                console.log("Media Alert Received (Page):", payload);
                setMediaAlerts(prev => [...prev, payload.payload]);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                } else {
                    setIsConnected(false);
                }
            });

        // Offline Network Listeners (Enhanced Polling)
        const checkConnectivity = async () => {
            if (!navigator.onLine) {
                setIsOffline(true);
                return;
            }
            // Safari cache busting ping to a static asset (avoids 405 error on API route)
            try {
                const res = await fetch('/onset_logo.png?ping=' + new Date().getTime(), { method: 'HEAD', cache: 'no-store' });
                setIsOffline(!res.ok);
            } catch (err) {
                setIsOffline(true);
            }
        };

        const handleOnline = () => { setIsOffline(false); checkConnectivity(); };
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Setup a 5-second polling interval to forcefully override the green LED if data drops
        const offlineInterval = setInterval(checkConnectivity, 5000);
        checkConnectivity();

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(offlineInterval);
        };
    }, [id]);

    // PRESENCE & STATUS LOGIC
    useEffect(() => {
        if (!id || !userEmail) return;

        // Fetch My Projects
        const fetchMyProjects = async () => {
            try {
                const res = await fetch(`/api/onset/my-projects?email=${encodeURIComponent(userEmail)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.projects) {
                        setMyProjects(data.projects.filter((p: any) => p.id !== id));
                    }
                }
            } catch (e) {
                console.error("Failed to load my projects", e);
            }
        };
        fetchMyProjects();

        // 1. Update DB Status (On Join)
        const updateStatus = async (online: boolean) => {
            await supabase
                .from('crew_membership')
                .update({
                    is_online: online,
                    last_seen_at: new Date().toISOString()
                })
                .eq('project_id', id)
                .eq('user_email', userEmail);
        };

        updateStatus(true);

        // 2. Realtime Presence (Scoped to Project)
        const presenceChannel = supabase.channel(`production_presence:${id}`);

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                console.log('Presence Sync:', state);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        user_email: userEmail,
                        online_at: new Date().toISOString(),
                        role: userRole
                    });
                }
            });

        // 3. Heartbeat (Update last_seen_at every 30s to prevent timeout)
        const heartbeat = setInterval(() => {
            updateStatus(true);
        }, 30000);

        return () => {
            clearInterval(heartbeat);
            updateStatus(false); // Mark offline on unmount
            presenceChannel.unsubscribe();
        };
    }, [id, userEmail, userRole]);

    const fetchData = async () => {
        try {
            // 0. Identity Check
            const storedEmail = localStorage.getItem('onset_user_email');
            let emailToUse = storedEmail;

            // Try to get from Auth if not in local storage
            if (!emailToUse) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    emailToUse = session.user.email!;
                    localStorage.setItem('onset_user_email', emailToUse);
                }
            }

            if (!emailToUse) {
                setShowLogin(true);
                setLoading(false);
                return;
            } else {
                setUserEmail(emailToUse);
            }

            // 1. Fetch Project with Timeout
            const fetchProjectPromise = supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000));

            const { data: projectData, error } = await Promise.race([fetchProjectPromise, timeoutPromise]) as any;

            if (error || !projectData) {
                throw new Error("Project not found or network offline");
            }

            // 2. Fetch Role if email exists
            let role = 'Crew';
            if (emailToUse) {
                // Identity Alignment: the explicit project Owner skips Crew table checks
                const { data: { session } } = await supabase.auth.getSession();
                const isOwnerDataMatch = session?.user && (projectData.user_id === session.user.id);
                const isFounderMatch = emailToUse.toLowerCase() === 'casteelio@gmail.com';

                if (isOwnerDataMatch || isFounderMatch) {
                    role = 'Owner';
                } else {
                    const { data: crew } = await supabase.from('crew_membership')
                        .select('role')
                        .eq('project_id', id)
                        .ilike('user_email', emailToUse)
                        .maybeSingle();
                    if (crew) role = crew.role;
                }
                setUserRole(role);
            }

            // 3. Parse Drafts with Reverse Phase Search & Array Unwrapping
            const allDrafts: Record<string, any> = {};
            const phaseOrder = ['DEVELOPMENT', 'PRE_PRODUCTION', 'PRODUCTION', 'ON_SET', 'POST'];

            phaseOrder.forEach(phaseKey => {
                const phase = projectData.data?.phases?.[phaseKey];
                if (phase?.drafts) {
                    Object.entries(phase.drafts).forEach(([key, val]) => {
                        const parsed = safeParse(val as string);
                        // Array Unwrapping: Take the LATEST index (Day 3 > Day 1)
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            allDrafts[key] = parsed[parsed.length - 1];
                        } else if (parsed) {
                            allDrafts[key] = parsed;
                        }
                    });
                }
            });

            // VIRTUAL MIGRATION: Support legacy Shot Log data
            if (allDrafts['shot-log'] && !allDrafts['camera-report']) allDrafts['camera-report'] = allDrafts['shot-log'];
            // VIRTUAL MIGRATION: Alias to simpler names for mobile
            if (allDrafts['locations-sets'] && !allDrafts['locations']) allDrafts['locations'] = allDrafts['locations-sets'];
            if (allDrafts['casting-talent'] && !allDrafts['casting']) allDrafts['casting'] = allDrafts['casting-talent'];
            if (allDrafts['wardrobe-styling'] && !allDrafts['wardrobe']) allDrafts['wardrobe'] = allDrafts['wardrobe-styling'];
            if (allDrafts['project-vision'] && !allDrafts['storyboard']) allDrafts['storyboard'] = allDrafts['project-vision'];
            if (allDrafts['budget-actual'] && !allDrafts['budget']) allDrafts['budget'] = allDrafts['budget-actual'];
            if (allDrafts['brief'] && !allDrafts['creative-brief']) allDrafts['creative-brief'] = allDrafts['brief'];
            if (allDrafts['deliverables-licensing'] && !allDrafts['deliverables']) allDrafts['deliverables'] = allDrafts['deliverables-licensing'];
            if (allDrafts['archive-log'] && !allDrafts['archive']) allDrafts['archive'] = allDrafts['archive-log'];

            const computedData = {
                project: projectData,
                docs: allDrafts,
                _role: role, // Save role silently for offline recovery
                _email: emailToUse // Save email silently for offline recovery
            };

            // LOG each successfully mapped document
            Object.keys(allDrafts).forEach((docId) => {
                if (allDrafts[docId]) {
                    console.log(`[OnsetMobile] Connected: toolId [${docId}]`);
                }
            });

            // Identify empty or missing mobile layouts
            const knownDocs = Object.keys(DOC_LABELS);
            const emptyDocs = knownDocs.filter((k) => !allDrafts[k] || (Array.isArray(allDrafts[k]) && allDrafts[k].length === 0) || (typeof allDrafts[k] === 'object' && Object.keys(allDrafts[k]).length === 0));
            if (emptyDocs.length > 0) {
                console.warn('[OnsetMobile] Empty or missing mobile layouts for:', emptyDocs);
            }

            // Determine Tabs: Support new 'toolGroups' or legacy 'selectedTools'
            const mobileControl = allDrafts['onset-mobile-control'];

            let computedAvailableKeys: string[] = [];
            const isLive = mobileControl?.isLive;

            const isOwner = role === 'Owner';
            const MOBILE_SUPPORTED = [
                'av-script', 'shot-scene-book', 'call-sheet', 'schedule', 'dit-log',
                'camera-report', 'on-set-notes', 'locations', 'crew-list', 'releases',
                'script-notes', 'sound-report',
                'budget', 'equipment-list', 'casting', 'wardrobe', 'props-list', 'storyboard',
                'creative-brief', 'treatment', 'client-selects', 'deliverables', 'lookbook', 'archive'
            ];

            // SECURITY: Respect "Go Live" toggle. If Offline, show nothing (unless Owner).
            const mapMobileKey = (k: string) => {
                const map: Record<string, string> = {
                    'shot-log': 'camera-report',
                    'locations-sets': 'locations',
                    'casting-talent': 'casting',
                    'wardrobe-styling': 'wardrobe',
                    'project-vision': 'storyboard',
                    'budget-actual': 'budget',
                    'brief': 'creative-brief',
                    'deliverables-licensing': 'deliverables',
                    'archive-log': 'archive'
                };
                return map[k] || k;
            };

            if (mobileControl && !isLive && !isOwner) {
                computedAvailableKeys = [];
            } else if (mobileControl?.toolGroups) {
                // New System: Group-Based Access (A/B/C)
                const crewListDoc = allDrafts['crew-list'];
                // Find current user in the Crew List document
                const me = crewListDoc?.crew?.find((c: any) =>
                    c.email && c.email.toLowerCase() === emailToUse?.toLowerCase()
                );

                const myGroups = me?.onSetGroups || [];

                if (isOwner) {
                    // Owner sees ALL supported tools that are registered in the mobile control, OR have data.
                    computedAvailableKeys = MOBILE_SUPPORTED.filter(k =>
                        allDrafts[k] ||
                        (mobileControl?.selectedTools || []).map(mapMobileKey).includes(k) ||
                        (mobileControl?.toolGroups && Object.keys(mobileControl.toolGroups).map(mapMobileKey).includes(k))
                    );
                } else {
                    // Crew sees tools matching their groups, regardless of data (Empty State Standard)
                    computedAvailableKeys = Object.entries(mobileControl.toolGroups)
                        .filter(([_, allowedGroups]: any) => {
                            if (!Array.isArray(allowedGroups)) return false;
                            if (allowedGroups.length === 0) return false;
                            return allowedGroups.some((g: string) => myGroups.includes(g));
                        })
                        .map(([key]) => mapMobileKey(key));
                }
            } else if (mobileControl) {
                // Legacy system if toolGroups is undefined but mobileControl exists
                computedAvailableKeys = (mobileControl.selectedTools || []).map((k: string) => mapMobileKey(k));
            }

            // Strict Permission: No defaults.
            let availableKeys = computedAvailableKeys;

            // DEFAULT FALLBACK: If there's NO mobileControl object at all, default to showing everything that has data
            if (availableKeys.length === 0 && !mobileControl) {
                availableKeys = MOBILE_SUPPORTED.filter(k => allDrafts[k]);
            }

            const currentTab = activeTabRef.current;

            if (availableKeys.length > 0 && !currentTab) {
                // Default Priority
                const priority = ['call-sheet', 'shot-scene-book', 'av-script'];
                const bestStart = priority.find(k => availableKeys.includes(k)) || availableKeys[0];
                setActiveTab(bestStart);

            } else if (availableKeys.length > 0 && availableKeys.includes(currentTab) === false) {
                // Current tab is no longer available? Reset.
                setActiveTab(availableKeys[0]);
            } else if (availableKeys.length === 0) {
                // No keys available (e.g. Offline) -> Reset to Landing
                setActiveTab('');
            }

            const finalData = { ...computedData, availableKeys };
            setData(finalData);

            // CACHE FOR OFFLINE SAFETY NET (NOW INCLUDES AVAILABLE KEYS)
            localStorage.setItem(`onset_cache_data_${id}`, JSON.stringify(finalData));
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSyncTime(nowTime);
            localStorage.setItem(`onset_cache_time_${id}`, nowTime);

            setLoading(false);
        } catch (err) {
            console.error("Fetch Data Error (Potentially Offline):", err);

            // ATTEMPT TO LOAD FROM CACHE IF FETCH FAILS (OFFLINE RESCUE)
            const cachedDataStr = localStorage.getItem(`onset_cache_data_${id}`);
            const cachedTime = localStorage.getItem(`onset_cache_time_${id}`);

            if (cachedDataStr) {
                console.log("Loading OnSET from Offline Cache Safety Net");
                const parsedCachedData = JSON.parse(cachedDataStr);
                setData(parsedCachedData);
                if (parsedCachedData._role) setUserRole(parsedCachedData._role);
                if (parsedCachedData._email) setUserEmail(parsedCachedData._email);
                setLastSyncTime(cachedTime || 'Unknown');
                setIsOffline(true);

                // Keep UI functional assuming last known state
                const mobileControl = parsedCachedData.docs['onset-mobile-control'];
                if (mobileControl && mobileControl.isLive) {
                    const fallbackTab = mobileControl.selectedTools ? mobileControl.selectedTools[0] : (Object.keys(mobileControl.toolGroups || {})[0] || '');
                    if (fallbackTab && !activeTabRef.current) setActiveTab(fallbackTab);
                }
            }

            setLoading(false);
        }
    };

    const handleJoin = (email: string) => {
        if (!email) return;
        localStorage.setItem('onset_user_email', email);
        setUserEmail(email);
        setShowLogin(false);
        setLoading(true);
        fetchData(); // Retry fetch with identity
    };

    const handleUpdateDIT = async (newItem: any) => {
        if (!data.project) return;
        try {
            // 1. Get fresh project to minimize conflicts
            const { data: fresh, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !fresh) return;

            const existingPhase = fresh.data?.phases?.ON_SET || {};
            const existingDrafts = existingPhase.drafts || {};

            // 2. Parse existing Log
            let logData = { items: [] };
            let history: any[] = [];

            try {
                const raw = existingDrafts['dit-log'];
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        if (parsed.length > 0) logData = parsed[0];
                        history = parsed.slice(1);
                    } else {
                        logData = parsed;
                    }
                }
            } catch { }

            // 3. Append Item
            const updatedHead = {
                ...logData, // Preserve other props
                // @ts-ignore
                items: [newItem, ...(logData['items'] || [])]
            };

            // Re-wrap in Array for consistency with Desktop Editor
            const finalDraftString = JSON.stringify([updatedHead, ...history]);

            // 4. Save
            const mergedPhase = {
                ...existingPhase,
                drafts: {
                    ...existingDrafts,
                    'dit-log': finalDraftString
                }
            };

            const updatedProjectData = {
                ...fresh.data,
                phases: {
                    ...fresh.data.phases,
                    ON_SET: mergedPhase
                }
            };

            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);

            // 5. Reload local
            fetchData();

        } catch (e) { console.error(e); }
    };

    const handleUpdateCameraReport = async (item: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const logPhaseKey = 'ON_SET';
            let updatedPhases = { ...phases };

            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let logDoc = safeParse(updatedPhases[logPhaseKey].drafts['camera-report'] || updatedPhases[logPhaseKey].drafts['shot-log']);
            if (Array.isArray(logDoc)) logDoc = logDoc[0];
            if (!logDoc || !logDoc.items) logDoc = { items: [] };

            // Ensure backward compatibility or migration if needed
            if (!logDoc.items && logDoc.entries) {
                logDoc.items = logDoc.entries;
                delete logDoc.entries;
            }

            logDoc.items.unshift(item);

            updatedPhases[logPhaseKey].drafts['camera-report'] = JSON.stringify(logDoc);
            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);

            // REALTIME BROADCAST: Trigger DIT Alert if new roll pulled
            if (item.roll) {
                const channel = supabase.channel(`project-live-${id}`);
                channel.subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        channel.send({
                            type: 'broadcast',
                            event: 'NEW_ROLL_PULLED',
                            payload: {
                                roll: item.roll,
                                camera: item.camera || 'A',
                                mediaType: item.mediaType || 'ProRes 4444',
                                fps: item.fps || '23.98',
                                iso: item.iso || '800'
                            }
                        });
                        // Also signal pulse for Workspace Nav
                        const pulse = supabase.channel('production_pulse');
                        pulse.subscribe(() => {
                            pulse.send({
                                type: 'broadcast',
                                event: 'DIT_ALERT',
                                payload: { projectId: id, msg: `Roll ${item.roll} Pulled` }
                            });
                        });
                    }
                });
            }

            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleAddOnSetNote = async (item: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const logPhaseKey = 'ON_SET';
            let updatedPhases = { ...phases };

            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let raw = updatedPhases[logPhaseKey].drafts['on-set-notes'];
            let logDoc = safeParse(raw);
            let history: any[] = [];

            if (Array.isArray(logDoc)) {
                if (logDoc.length > 0) history = logDoc.slice(1);
                logDoc = logDoc[0];
            }

            if (!logDoc || !logDoc.items) logDoc = { items: [] };

            // Add new item
            logDoc.items.push(item);

            // Save with history wrapper
            updatedPhases[logPhaseKey].drafts['on-set-notes'] = JSON.stringify([logDoc, ...history]);

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleEditOnSetNote = async (updatedItem: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const logPhaseKey = 'ON_SET';
            let updatedPhases = { ...phases };

            let raw = updatedPhases[logPhaseKey]?.drafts?.['on-set-notes'];
            let logDoc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(logDoc)) {
                if (logDoc.length > 0) history = logDoc.slice(1);
                logDoc = logDoc[0];
            }
            if (!logDoc || !logDoc.items) return;

            const idx = logDoc.items.findIndex((i: any) => i.id === updatedItem.id);
            if (idx >= 0) {
                logDoc.items[idx] = { ...logDoc.items[idx], ...updatedItem };
                updatedPhases[logPhaseKey].drafts['on-set-notes'] = JSON.stringify([logDoc, ...history]);
                await supabase.from('projects').update({ data: { ...latest.data, phases: updatedPhases } }).eq('id', id);
                fetchData();
            }
        } catch (e) { console.error(e) }
    }

    const handleDeleteOnSetNote = async (itemId: string) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const logPhaseKey = 'ON_SET';
            let updatedPhases = { ...phases };

            let raw = updatedPhases[logPhaseKey]?.drafts?.['on-set-notes'];
            let logDoc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(logDoc)) {
                if (logDoc.length > 0) history = logDoc.slice(1);
                logDoc = logDoc[0];
            }
            if (!logDoc || !logDoc.items) return;

            logDoc.items = logDoc.items.filter((i: any) => i.id !== itemId);
            updatedPhases[logPhaseKey].drafts['on-set-notes'] = JSON.stringify([logDoc, ...history]);

            await supabase.from('projects').update({ data: { ...latest.data, phases: updatedPhases } }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleUpdateReleases = async (updatedList: any[]) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            // Assuming Releases live in ON_SET or PRE_PRODUCTION depending on setup.
            // Based on template update, they are in 'execute' -> ON_SET likely.
            // But we should check where it exists or default to ON_SET.
            const phaseKey = 'ON_SET';
            let updatedPhases = { ...phases };
            if (!updatedPhases[phaseKey]) updatedPhases[phaseKey] = { drafts: {} };
            if (!updatedPhases[phaseKey].drafts) updatedPhases[phaseKey].drafts = {};

            const releaseDoc = { releases: updatedList };
            updatedPhases[phaseKey].drafts['releases'] = JSON.stringify(releaseDoc);

            await supabase.from('projects').update({ data: { ...latest.data, phases: updatedPhases } }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleCheckShot = async (shotId: string, status: string = 'COMPLETE', addToLog: boolean = true) => {
        if (!data.project) return;

        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;

            let updatedPhases = { ...phases };
            let shotFound = false;

            Object.keys(updatedPhases).forEach(pKey => {
                if (updatedPhases[pKey].drafts && updatedPhases[pKey].drafts['shot-scene-book']) {
                    const raw = updatedPhases[pKey].drafts['shot-scene-book'];
                    // It might be string or array
                    let doc = safeParse(raw);
                    if (Array.isArray(doc)) doc = doc[0];

                    if (doc && doc.shots) {
                        const idx = doc.shots.findIndex((s: any) => s.id === shotId);
                        if (idx >= 0) {
                            doc.shots[idx].status = status;
                            // Save back
                            updatedPhases[pKey].drafts['shot-scene-book'] = JSON.stringify(doc);
                            shotFound = true;
                        }
                    }
                }
            });

            if (!shotFound) return;

            // 2. Add to Shot Log ONLY if requested
            if (addToLog) {
                const logPhaseKey = 'ON_SET';
                if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
                if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

                let logDoc = safeParse(updatedPhases[logPhaseKey].drafts['camera-report'] || updatedPhases[logPhaseKey].drafts['shot-log']);
                if (Array.isArray(logDoc)) logDoc = logDoc[0];
                if (!logDoc || !logDoc.items) logDoc = { items: [] };

                // Migration
                if (!logDoc.items && logDoc.entries) {
                    logDoc.items = logDoc.entries;
                    delete logDoc.entries;
                }

                logDoc.items.unshift({
                    id: `log-${Date.now()}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                    type: 'SHOT',
                    status: status === 'COMPLETE' ? 'good' : '', // Map status
                    shot: shotId, // Auto-log uses shotId as shot name?
                    scene: '', // No scene known unless looked up?
                    description: `Shot ${shotId} marked as ${status}`
                });

                updatedPhases[logPhaseKey].drafts['camera-report'] = JSON.stringify(logDoc);
                console.log("Adding to Camera Report:", logDoc);
            }

            // SAVE
            const updatedProjectData = {
                ...latest.data,
                phases: updatedPhases
            };

            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();

        } catch (e) { console.error(e); }
    };

    const handleUpdateCallSheet = async (updatedDoc: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const phaseOrder = ['DEVELOPMENT', 'PRE_PRODUCTION', 'PRODUCTION', 'ON_SET', 'POST'];
            let phaseKey = 'PRODUCTION';
            for (const p of phaseOrder) {
                if (phases[p]?.drafts?.['call-sheet']) {
                    phaseKey = p;
                    break;
                }
            }

            let updatedPhases = { ...phases };
            if (!updatedPhases[phaseKey]) updatedPhases[phaseKey] = { drafts: {} };

            let raw = updatedPhases[phaseKey].drafts['call-sheet'];
            let docList = safeParse(raw);
            let history: any[] = [];

            if (Array.isArray(docList)) {
                if (docList.length > 0) history = docList.slice(1);
                // Head is docList[0], but we are replacing it with updatedDoc
            } else if (docList) {
                // Single object case (legacy)
            }

            const finalDraft = JSON.stringify([updatedDoc, ...history]);
            updatedPhases[phaseKey].drafts['call-sheet'] = finalDraft;

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleUpdateDraft = async (toolId: string, updatedDoc: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const reverseMap: Record<string, string> = {
                'creative-brief': 'brief',
                'storyboard': 'project-vision',
                'budget': 'budget-actual',
                'deliverables': 'deliverables-licensing',
                'archive': 'archive-log'
            };
            const originalKey = reverseMap[toolId] || toolId;

            const phaseOrder = ['DEVELOPMENT', 'PRE_PRODUCTION', 'PRODUCTION', 'ON_SET', 'POST'];
            let phaseKey = 'PRODUCTION';
            for (const p of phaseOrder) {
                if (phases[p]?.drafts?.[originalKey]) {
                    phaseKey = p;
                    break;
                }
            }

            let updatedPhases = { ...phases };
            if (!updatedPhases[phaseKey]) updatedPhases[phaseKey] = { drafts: {} };

            let raw = updatedPhases[phaseKey].drafts[originalKey];
            let docList = safeParse(raw);
            let history: any[] = [];

            if (Array.isArray(docList)) {
                if (docList.length > 0) history = docList.slice(1);
            }

            const finalDraft = JSON.stringify([updatedDoc, ...history]);
            updatedPhases[phaseKey].drafts[originalKey] = finalDraft;

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleUpdateScriptNotes = async (action: 'add' | 'update' | 'delete', payload: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const logPhaseKey = phases.ON_SET ? 'ON_SET' : 'PRODUCTION'; // Fallback check
            let updatedPhases = { ...phases };
            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let raw = updatedPhases[logPhaseKey].drafts['script-notes'];
            let doc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(doc)) {
                if (doc.length > 0) history = doc.slice(1);
                doc = doc[0];
            }
            if (!doc) doc = {};
            if (!doc.items) doc.items = [];

            let list = [...doc.items];
            if (action === 'add') list.push(payload);
            else if (action === 'update') {
                const idx = list.findIndex((i: any) => i.id === payload.id);
                if (idx >= 0) list[idx] = payload;
            } else if (action === 'delete') {
                list = list.filter((i: any) => i.id !== payload);
            }

            doc.items = list;
            updatedPhases[logPhaseKey].drafts['script-notes'] = JSON.stringify([doc, ...history]);

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    };

    const handleUpdateSoundReport = async (action: 'add' | 'update' | 'delete', payload: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const logPhaseKey = phases.ON_SET ? 'ON_SET' : 'PRODUCTION';
            let updatedPhases = { ...phases };
            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let raw = updatedPhases[logPhaseKey].drafts['sound-report'];
            let doc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(doc)) {
                if (doc.length > 0) history = doc.slice(1);
                doc = doc[0];
            }
            if (!doc) doc = {};
            if (!doc.takes) doc.takes = [];

            let list = [...doc.takes];
            if (action === 'add') list.push(payload);
            else if (action === 'update') {
                const idx = list.findIndex((i: any) => i.id === payload.id);
                if (idx >= 0) list[idx] = payload;
            } else if (action === 'delete') {
                list = list.filter((i: any) => i.id !== payload);
            }

            doc.takes = list;
            updatedPhases[logPhaseKey].drafts['sound-report'] = JSON.stringify([doc, ...history]);

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    };

    const handleUpdateClientSelects = async (action: 'add' | 'update' | 'delete', payload: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            let logPhaseKey = 'POST';

            Object.keys(phases).forEach(p => {
                if (phases[p]?.drafts?.['client-selects']) logPhaseKey = p;
            });

            let updatedPhases = { ...phases };
            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let raw = updatedPhases[logPhaseKey].drafts['client-selects'];
            let doc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(doc)) {
                if (doc.length > 0) history = doc.slice(1);
                doc = doc[0];
            }
            if (!doc) doc = {};
            if (!doc.items) doc.items = [];

            let list = [...doc.items];
            if (action === 'add') list.push(payload);
            else if (action === 'update') {
                const idx = list.findIndex((i: any) => i.id === payload.id);
                if (idx >= 0) list[idx] = payload;
            } else if (action === 'delete') {
                list = list.filter((i: any) => i.id !== payload);
            }

            doc.items = list;
            updatedPhases[logPhaseKey].drafts['client-selects'] = JSON.stringify([doc, ...history]);

            await supabase.from('projects').update({ data: { ...latest.data, phases: updatedPhases } }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    };

    const handleUpdateCrewList = async (action: 'add' | 'update' | 'delete', payload: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            let logPhaseKey = 'PRE_PRODUCTION';
            Object.keys(phases).forEach(p => {
                if (phases[p]?.drafts?.['crew-list']) logPhaseKey = p;
            });

            let updatedPhases = { ...phases };
            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let raw = updatedPhases[logPhaseKey].drafts['crew-list'];
            let doc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(doc)) {
                if (doc.length > 0) history = doc.slice(1);
                doc = doc[0];
            }
            if (!doc) doc = {};
            if (!doc.crew) doc.crew = [];

            let list = [...doc.crew];
            if (action === 'add') list.push(payload);
            else if (action === 'update') {
                const idx = list.findIndex((i: any) => i.id === payload.id);
                if (idx >= 0) list[idx] = payload;
            } else if (action === 'delete') {
                list = list.filter((i: any) => i.id !== payload);
            }

            doc.crew = list;
            updatedPhases[logPhaseKey].drafts['crew-list'] = JSON.stringify([doc, ...history]);

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    };

    const handleUpdateList = async (toolId: string, action: 'add' | 'update' | 'delete', payload: any, listKey: string = 'items') => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const reverseMap: Record<string, string> = {
                'creative-brief': 'brief',
                'storyboard': 'project-vision',
                'budget': 'budget-actual',
                'deliverables': 'deliverables-licensing',
                'archive': 'archive-log',
                'locations': 'locations-sets',
                'wardrobe': 'wardrobe-styling',
                'props-list': 'props-list',
                'casting': 'casting-talent',
                'equipment-list': 'equipment-list'
            };
            const originalKey = reverseMap[toolId] || toolId;

            let logPhaseKey = 'PRODUCTION';
            Object.keys(phases).forEach(p => {
                if (phases[p]?.drafts?.[originalKey]) logPhaseKey = p;
            });

            let updatedPhases = { ...phases };
            if (!updatedPhases[logPhaseKey]) updatedPhases[logPhaseKey] = { drafts: {} };
            if (!updatedPhases[logPhaseKey].drafts) updatedPhases[logPhaseKey].drafts = {};

            let raw = updatedPhases[logPhaseKey].drafts[originalKey];
            let doc = safeParse(raw);
            let history: any[] = [];
            if (Array.isArray(doc)) {
                if (doc.length > 0) history = doc.slice(1);
                doc = doc[0];
            }
            if (!doc) doc = {};
            if (!doc[listKey]) doc[listKey] = [];

            let list = [...doc[listKey]];
            if (action === 'add') list.push(payload);
            else if (action === 'update') {
                const idx = list.findIndex((i: any) => i.id === payload.id);
                if (idx >= 0) list[idx] = payload;
            } else if (action === 'delete') {
                list = list.filter((i: any) => i.id !== payload);
            }

            doc[listKey] = list;
            updatedPhases[logPhaseKey].drafts[originalKey] = JSON.stringify([doc, ...history]);

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);
            fetchData();
        } catch (e) { console.error(e) }
    };

    if (showLogin) {
        return <EmailEntryGate onJoin={handleJoin} projectName={data.project?.name} />;
    }

    if (loading) {
        return (
            <div className="h-screen bg-zinc-200 text-zinc-900 flex flex-col items-center justify-center gap-4">
                <img src="/onset_logo.png" className="w-16 animate-pulse opacity-50 contrast-0" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Connecting/...</p>
            </div>
        );
    }

    if (!data.project) {
        return (
            <div className="h-screen bg-zinc-200 text-black flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-bold uppercase text-red-500">Project Not Found</p>
            </div>
        );
    }

    return (
        <ProjectDataProvider data={data} userEmail={userEmail}>
            <div className="w-full h-full max-w-md mx-auto min-w-0 flex flex-col bg-zinc-200 text-black font-sans font-inter overflow-hidden md:h-[90dvh] md:rounded-2xl md:border border-zinc-300 relative z-10">

                {/* TOP ROW: Header & Alerts */}
                <div className="flex flex-col z-50 shrink-0">
                    {/* HEADER */}
                    <header className="bg-zinc-100/90 backdrop-blur-md border-b border-slate-500/80 pt-safe transition-all w-full relative">
                        <div className="h-16 md:h-18 flex items-center justify-between px-6">
                            <div className="flex flex-col items-start mt-2 shrink-0">
                                <span className="font-sans font-inter font-bold text-xl leading-none tracking-tight">ONSET</span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 leading-none mt-1">by onFORMAT</span>
                            </div>
                            <div className="h-4 w-[1px] bg-zinc-300 mx-3 shrink-0"></div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 leading-none mb-0.5 truncate">{data.project.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`w-[10px] h-[10px] rounded-full shadow-sm ${isConnected && data.docs['onset-mobile-control']?.isLive && !isOffline ? 'animate-pulse' : ''}`}
                                            style={{ backgroundColor: isOffline ? '#F59E0B' : (!data.docs['onset-mobile-control']?.isLive ? '#EF4444' : (isConnected ? '#22C55E' : '#71717a')) }}
                                        ></span>
                                        <span className={`text-[9px] font-mono uppercase leading-none font-bold ${isOffline ? 'text-[#F59E0B]' : 'text-zinc-600'}`}>
                                            {isOffline ? 'OFFLINE' : (data.docs['onset-mobile-control']?.isLive ? 'LIVE' : 'STANDBY')}
                                        </span>
                                        {isOffline && lastSyncTime && (
                                            <span className="text-[9px] font-mono text-zinc-400 ml-1 leading-none">{lastSyncTime}</span>
                                        )}
                                    </div>

                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                                <BetaFeedbackTrigger variant="icon" />
                                <button
                                    onClick={() => setShowMenu(true)}
                                    className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 md:hover:text-zinc-900 transition-colors border border-transparent md:hover:border-zinc-300 shrink-0">
                                    <Menu size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* GLOBAL MEDIA ALERT BANNER */}
                    {mediaAlerts.length > 0 && activeTab !== 'dit-log' && (
                        <button
                            onClick={() => setActiveTab('dit-log')}
                            className="w-full bg-[#EAB308] text-black px-4 py-3 flex items-center justify-between animate-in slide-in-from-top-2 z-40 relative shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-black/10 p-1.5 rounded-full">
                                    <HardDrive size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-wider leading-none mb-0.5 text-black">Media Alert</p>
                                    <p className="text-xs font-bold leading-none text-black">{mediaAlerts.length} New Roll{mediaAlerts.length > 1 ? 's' : ''} Pulled</p>
                                </div>
                            </div>
                            <div className="bg-black/10 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide text-black border border-black/20">
                                View
                            </div>
                        </button>
                    )}

                    {/* SYSTEM MENU DRAWER */}
                    {showMenu && (
                        <div className="absolute inset-0 z-[100] flex justify-end">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                                onClick={() => setShowMenu(false)}
                            />

                            {/* Drawer */}
                            <div className="relative w-4/5 max-w-sm h-full bg-zinc-50 border-l border-slate-500 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 pointer-events-auto">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">System</h2>
                                    <button onClick={() => setShowMenu(false)} className="bg-zinc-200/50 hover:bg-zinc-200 p-2 rounded-full text-zinc-600 transition-colors">
                                        <Menu size={14} />
                                    </button>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {/* Identity Card */}
                                    <div className="bg-zinc-100 shadow-inner p-4 rounded-xl border border-slate-500">
                                        <div className="flex items-center gap-3 mb-2">
                                            <UserCircle size={20} className="text-emerald-500" />
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900">{userRole || 'Crew Member'}</p>
                                                <p className="text-[10px] font-mono text-zinc-500 break-all">{userEmail}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-bold tracking-wider">
                                            <span>Permissions</span>
                                            {(() => {
                                                const crew = data.docs['crew-list']?.crew || [];
                                                const me = crew.find((c: any) => c.email?.toLowerCase() === userEmail?.toLowerCase());
                                                let units = me?.onSetGroups || [];
                                                if (userRole === 'Owner') units = ['A', 'B', 'C', 'D'];

                                                if (units.length === 0) return <span className="text-zinc-500">None</span>;

                                                return (
                                                    <div className="flex items-center gap-1">
                                                        {units.includes('A') && <span className="flex items-center justify-center w-4 h-4 text-[9px] font-black bg-[#22C55E] text-white rounded-[2px]">A</span>}
                                                        {units.includes('B') && <span className="flex items-center justify-center w-4 h-4 text-[9px] font-black bg-[#3B82F6] text-white rounded-[2px]">B</span>}
                                                        {units.includes('C') && <span className="flex items-center justify-center w-4 h-4 text-[9px] font-black bg-[#EAB308] text-white rounded-[2px]">C</span>}
                                                        {units.includes('D') && <span className="flex items-center justify-center w-4 h-4 text-[9px] font-black bg-[#EF4444] text-white rounded-[2px]">D</span>}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-bold tracking-wider mt-4">
                                            <span>Sync Status</span>
                                            <span className={data.docs['onset-mobile-control']?.isLive ? "text-emerald-600" : "text-amber-600"}>
                                                {data.docs['onset-mobile-control']?.isLive ? 'Live' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {myProjects.length > 0 && (
                                    <div className="space-y-2 mt-2 pt-6 border-t border-slate-500">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Other Active Sets</h3>
                                        <div className="space-y-2">
                                            {myProjects.map(p => (
                                                <Link key={p.id} href={`/onset/${p.id}`} className="block">
                                                    <div className="bg-zinc-100 hover:bg-zinc-200 transition-colors p-3 rounded-lg border border-zinc-300 flex items-center justify-between group">
                                                        <span className="text-xs font-bold text-zinc-900 truncate flex-1 pr-4">{p.name}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse"></div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-slate-500 mt-6 pt-6 space-y-3">
                                    <button
                                        onClick={async () => {
                                            // Explicit Presence Cleanup for Mobile
                                            if (userEmail && id) {
                                                const { error } = await supabase
                                                    .from('crew_membership')
                                                    .update({ is_online: false })
                                                    .eq('project_id', id)
                                                    .eq('user_email', userEmail);

                                                // Untrack from all channels
                                                const channels = supabase.getChannels();
                                                for (const channel of channels) {
                                                    await channel.untrack();
                                                }
                                                await supabase.removeAllChannels();
                                            }

                                            localStorage.removeItem('onset_user_email');
                                            window.location.reload();
                                        }}
                                        className="w-full bg-zinc-200/50 text-zinc-600 border border-zinc-300 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                                        <LogOut size={14} /> Disconnect from Set
                                    </button>

                                    <button
                                        onClick={async () => {
                                            // Explicit Presence Cleanup for Mobile
                                            if (userEmail && id) {
                                                await supabase
                                                    .from('crew_membership')
                                                    .update({ is_online: false })
                                                    .eq('project_id', id)
                                                    .eq('user_email', userEmail);
                                                const channels = supabase.getChannels();
                                                for (const channel of channels) {
                                                    await channel.untrack();
                                                }
                                                await supabase.removeAllChannels();
                                            }
                                            localStorage.removeItem('onset_user_email');
                                            await supabase.auth.signOut();
                                            localStorage.clear();
                                            window.location.href = '/api/auth/logout';
                                        }}
                                        className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                                        <LogOut size={14} /> Log Out Completely
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                    }

                    {/* CONFIDENTIAL BANNER */}
                    <div className="bg-stripes-zinc text-center py-1 border-b border-slate-500 shadow-sm relative z-40 bg-zinc-100/50">
                        <p className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">Confidential Materials • {new Date().getFullYear()}</p>
                    </div>
                </div>

                {/* WATERMARK OVERLAY */}
                {
                    userEmail && (
                        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden opacity-[0.03] flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-24 -rotate-12 transform scale-150">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="text-xl font-black uppercase text-white whitespace-nowrap select-none">
                                        {userEmail} • {userRole || 'Crew'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* MAIN CONTENT SCROLLER */}
                <main
                    className="flex-1 overflow-y-auto w-full max-w-[400px] mx-auto px-4 pb-[env(safe-area-inset-bottom)] relative z-10 no-scrollbar"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <div className="w-full mx-auto py-8">
                        {/* BACK BUTTON REMOVED */}

                        {activeTab === '' ? (
                            <MobileLanding
                                projectName={data.project?.name}
                                // Determine status message based on whether there ARE keys but none selected, or NO keys
                                status={(() => {
                                    // Re-run small check or assume 'availableKeys' from context? 
                                    // We don't have availableKeys in scope here easily without re-calc.
                                    // But if activeTab is empty, likely we are in landing mode.
                                    return "Production Standby";
                                })()}
                            />
                        ) : (
                            <>
                                {activeTab === 'av-script' && <ScriptView data={data.docs['av-script']} />}
                                {activeTab === 'shot-scene-book' && <ShotListView data={data.docs['shot-scene-book']} onCheckShot={handleCheckShot} />}
                                {activeTab === 'call-sheet' && (
                                    <CallSheetView
                                        data={data.docs['call-sheet']}
                                        scheduleData={data.docs['schedule']}
                                        onUpdate={handleUpdateCallSheet}
                                    />
                                )}
                                {activeTab === 'dit-log' && <MobileDITLogView
                                    data={data.docs['dit-log']}
                                    onAdd={handleUpdateDIT}
                                    projectId={id}
                                    mediaAlerts={mediaAlerts}
                                    setMediaAlerts={setMediaAlerts}
                                />}
                                {activeTab === 'camera-report' && <MobileCameraReportView data={data.docs['camera-report']} onAdd={handleUpdateCameraReport} projectId={id} />}
                                {activeTab === 'crew-list' && (
                                    <CrewListView
                                        data={data.docs['crew-list']}
                                        onAdd={(m) => handleUpdateCrewList('add', m)}
                                        onUpdate={(m) => handleUpdateCrewList('update', m)}
                                        onDelete={(id) => handleUpdateCrewList('delete', id)}
                                    />
                                )}
                                {activeTab === 'schedule' && <ScheduleView data={data.docs['schedule']} />}
                                {activeTab === 'on-set-notes' && <MobileOnSetNotesView
                                    data={data.docs['on-set-notes']}
                                    onAdd={handleAddOnSetNote}
                                    onUpdate={handleEditOnSetNote}
                                    onDelete={handleDeleteOnSetNote}
                                />}
                                {activeTab === 'locations' && <MobileLocationsView data={data.docs['locations']} onAdd={(m) => handleUpdateList('locations', 'add', m)} onUpdate={(m) => handleUpdateList('locations', 'update', m)} onDelete={(id) => handleUpdateList('locations', 'delete', id)} />}
                                {activeTab === 'releases' && <MobileReleasesView data={data.docs['releases']} onUpdate={handleUpdateReleases} />}
                                {activeTab === 'script-notes' && <MobileScriptNotesView
                                    data={data.docs['script-notes']}
                                    onAdd={(item: any) => handleUpdateScriptNotes('add', item)}
                                    onUpdate={(item: any) => handleUpdateScriptNotes('update', item)}
                                    onDelete={(id: string) => handleUpdateScriptNotes('delete', id)}
                                />}
                                {activeTab === 'sound-report' && <MobileSoundReportView
                                    data={data.docs['sound-report']}
                                    onAdd={(item: any) => handleUpdateSoundReport('add', item)}
                                    onUpdate={(item: any) => handleUpdateSoundReport('update', item)}
                                    onDelete={(id: string) => handleUpdateSoundReport('delete', id)}
                                />}

                                {activeTab === 'dashboard' && <MobileReadOnlyListView data={data.docs['dashboard'] || {}} titleKey="title" onAdd={(m) => handleUpdateList('dashboard', 'add', m)} onUpdate={(m) => handleUpdateList('dashboard', 'update', m)} onDelete={(id) => handleUpdateList('dashboard', 'delete', id)} />}
                                {activeTab === 'budget' && <MobileReadOnlyListView data={data.docs['budget']} titleKey="description" subtitleKey="category" detailKeys={['rate', 'quantity']} onAdd={(m) => handleUpdateList('budget', 'add', m)} onUpdate={(m) => handleUpdateList('budget', 'update', m)} onDelete={(id) => handleUpdateList('budget', 'delete', id)} />}
                                {activeTab === 'equipment-list' && <MobileReadOnlyListView data={data.docs['equipment-list']} titleKey="description" subtitleKey="category" detailKeys={['quantity', 'vendor', 'total']} onAdd={(m) => handleUpdateList('equipment-list', 'add', m)} onUpdate={(m) => handleUpdateList('equipment-list', 'update', m)} onDelete={(id) => handleUpdateList('equipment-list', 'delete', id)} />}
                                {activeTab === 'storyboard' && <MobileReadOnlyListView data={data.docs['storyboard']} titleKey="title" subtitleKey="caption" imageKey="url" onAdd={(m) => handleUpdateList('storyboard', 'add', m)} onUpdate={(m) => handleUpdateList('storyboard', 'update', m)} onDelete={(id) => handleUpdateList('storyboard', 'delete', id)} />}

                                {/* Phase 2: Missing Documents leveraging lists */}
                                {activeTab === 'client-selects' && <MobileClientSelectsView data={data.docs['client-selects']} onAdd={(item: any) => handleUpdateClientSelects('add', item)} onUpdate={(item: any) => handleUpdateClientSelects('update', item)} onDelete={(id: string) => handleUpdateClientSelects('delete', id)} />}
                                {activeTab === 'deliverables' && <MobileReadOnlyListView data={data.docs['deliverables']} titleKey="item" subtitleKey="format" detailKeys={['usage', 'specs']} onAdd={(m) => handleUpdateList('deliverables', 'add', m)} onUpdate={(m) => handleUpdateList('deliverables', 'update', m)} onDelete={(id) => handleUpdateList('deliverables', 'delete', id)} />}
                                {activeTab === 'archive' && <MobileReadOnlyListView data={data.docs['archive']} titleKey="itemName" subtitleKey="date" detailKeys={['activity', 'destination', 'status']} onAdd={(m) => handleUpdateList('archive', 'add', m)} onUpdate={(m) => handleUpdateList('archive', 'update', m)} onDelete={(id) => handleUpdateList('archive', 'delete', id)} />}

                                {/* Phase 3: Missing Document Views & Visual Cards */}
                                {activeTab === 'creative-brief' && (
                                    <MobileBriefView
                                        data={data.docs['creative-brief']}
                                        onUpdate={(newData) => handleUpdateDraft('creative-brief', newData)}
                                    />
                                )}
                                {activeTab === 'treatment' && <MobileTreatmentView data={data.docs['treatment']} onAdd={(m) => handleUpdateList('treatment', 'add', m, 'slides')} onUpdate={(m) => handleUpdateList('treatment', 'update', m, 'slides')} onDelete={(id) => handleUpdateList('treatment', 'delete', id, 'slides')} />}
                                {activeTab === 'lookbook' && <MobileLookbookView data={data.docs['lookbook']} onAdd={(m) => handleUpdateList('lookbook', 'add', m)} onUpdate={(m) => handleUpdateList('lookbook', 'update', m)} onDelete={(id) => handleUpdateList('lookbook', 'delete', id)} />}
                                {activeTab === 'wardrobe' && <MobileWardrobeView data={data.docs['wardrobe']} onAdd={(m) => handleUpdateList('wardrobe', 'add', m)} onUpdate={(m) => handleUpdateList('wardrobe', 'update', m)} onDelete={(id) => handleUpdateList('wardrobe', 'delete', id)} />}
                                {activeTab === 'casting' && <MobileCastingView data={data.docs['casting']} onAdd={(m) => handleUpdateList('casting', 'add', m)} onUpdate={(m) => handleUpdateList('casting', 'update', m)} onDelete={(id) => handleUpdateList('casting', 'delete', id)} />}
                                {activeTab === 'props-list' && <MobilePropsView data={data.docs['props-list']} onAdd={(m) => handleUpdateList('props-list', 'add', m)} onUpdate={(m) => handleUpdateList('props-list', 'update', m)} onDelete={(id) => handleUpdateList('props-list', 'delete', id)} />}

                                {/* Fallback for other docs */}
                                {!['av-script', 'shot-scene-book', 'call-sheet', 'dit-log', 'camera-report', 'crew-list', 'schedule', 'on-set-notes', 'locations', 'releases', 'script-notes', 'sound-report', 'budget', 'equipment-list', 'casting', 'wardrobe', 'props-list', 'storyboard', 'client-selects', 'deliverables', 'creative-brief', 'treatment', 'lookbook', 'archive', 'dashboard'].includes(activeTab) && (
                                    <EmptyState label={DOC_LABELS[activeTab] || 'Document'} />
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* BOTTOM NAV ROWS */}
                <nav className="shrink-0 w-full min-w-0 bg-zinc-100 border-t border-zinc-300 z-[100] pb-[env(safe-area-inset-bottom)] transition-all pl-safe pr-safe">
                    <div className="flex items-center h-16 w-full overflow-x-auto px-4 gap-3 no-scrollbar md:justify-center">
                        {(() => {
                            const availableKeys = data.availableKeys || [];
                            if (availableKeys.length === 0) return null;

                            const mappedKeys = Array.from(new Set(availableKeys.map((k: string) => {
                                if (k === 'shot-log') return 'camera-report';
                                if (k === 'locations-sets') return 'locations';
                                if (k === 'casting-talent') return 'casting';
                                if (k === 'wardrobe-styling') return 'wardrobe';
                                if (k === 'project-vision') return 'storyboard';
                                if (k === 'budget-actual') return 'budget';
                                return k;
                            })));

                            const crew = data.docs['crew-list']?.crew || [];
                            const me = crew.find((c: any) => c.email?.toLowerCase() === userEmail?.toLowerCase());
                            const isDelegate = me?.onSetGroups?.includes('D') || userRole === 'Owner';


                            return mappedKeys.map((key: string) => {
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`
                                    flex-shrink-0 px-4 py-2 rounded-lg text-[10px] font-sans font-inter font-bold uppercase tracking-widest transition-transform tactile active:scale-[0.96] active:bg-zinc-200 relative
                                    ${activeTab === key
                                                ? 'bg-zinc-200 text-zinc-900 shadow-sm border border-zinc-300' // Active State
                                                : 'bg-zinc-100 text-zinc-600 border border-transparent hover:bg-zinc-200/50' // Inactive
                                            }
                                `}
                                    >
                                        {DOC_LABELS[key] || key}
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </nav>
            </div>
        </ProjectDataProvider>
    );
}

