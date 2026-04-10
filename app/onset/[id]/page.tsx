'use client';
// Mobile Polish Update - RETRY 2 - 10:47 AM
import React, { useEffect, useState, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { getClient } from '@/lib/supabase';
import { Menu, LayoutGrid, FileText, Edit3, Eye, Activity, Video, HardDrive, Users, MapPin, Calendar, Sparkles, Film, Smartphone, History, Globe, PieChart, Box, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { ProjectDataProvider } from '@/lib/useProjectData';
import { deriveMobileRoleId } from '@/lib/roleUtils';

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
    MobileControlView,
    MobileVisionView,
    MobileStoryboardView
} from './components';
import { ECommShotListTemplate } from '@/components/onformat/templates/ECommShotListTemplate';
import { LogOut, Wifi, UserCircle, AlertCircle, RefreshCw, ChevronLeft, Save, Moon, Sun } from 'lucide-react';
import { BetaFeedbackTrigger } from '@/components/feedback/BetaFeedbackTrigger';
import { useTheme } from '@/components/ThemeProvider';

/* --------------------------------------------------------------------------------
 * UTILS
 * -------------------------------------------------------------------------------- */
const mapMobileKey = (k: string) => {
    const map: Record<string, string> = {
        'shot-log': 'camera-report',
        'locations-sets': 'locations',
        'casting-talent': 'casting',
        'wardrobe-styling': 'wardrobe',
        'budget-actual': 'budget',
        'brief': 'creative-brief',
        'directors-treatment': 'treatment',
        'creative-direction': 'lookbook',
        'deliverables-licensing': 'deliverables',
        'archive-log': 'archive'
    };
    return map[k] || k;
};

/* --------------------------------------------------------------------------------
 * COMPONENTS
 * -------------------------------------------------------------------------------- */
const MobileLanding = ({ projectName, roleId, roleMatrix, availableKeys, onSelectTab, isMasterOwner }: any) => {
    const ROLE_ICONS: Record<string, string> = {
        'producer': '👑',
        'dit': '💾',
        'dp': '🎥',
        'director': '🎬',
        'scripty': '✍️',
        'client': '💼',
        'crew': '👤',
        'owner': '👑'
    };

    const SILO_ICONS: Record<string, any> = {
        'av-script': Sparkles,
        'shot-scene-book': Video,
        'ecomm-shot-list': Box,
        'call-sheet': FileText,
        'schedule': Calendar,
        'dit-log': HardDrive,
        'camera-report': History,
        'on-set-notes': Edit3,
        'locations': MapPin,
        'crew-list': Users,
        'releases': Globe,
        'script-notes': FileText,
        'sound-report': Activity,
        'budget': PieChart,
        'equipment-list': Box,
        'casting': Users,
        'wardrobe': Sparkles,
        'props-list': Box,
        'storyboard': Film,
        'project-vision': Sparkles,
        'treatment': Film,
        'lookbook': Eye,
        'deliverables': Smartphone,
        'archive': History,
        'client-selects': Eye
    };

    const ROLE_NAMES: Record<string, string> = {
        'producer': 'Producer',
        'dit': 'DIT',
        'dp': 'Director of Photography',
        'director': 'Director',
        'scripty': 'Script Supervisor',
        'client': 'Client / Agency',
        'crew': 'Crew Member',
        'owner': 'Director / Owner'
    };

    const displayRole = ROLE_NAMES[roleId] || roleId.toUpperCase();
    const displayIcon = ROLE_ICONS[roleId] || '👤';

    return (
        <div className="flex flex-col space-y-10 animate-in fade-in duration-500 pt-2 pb-12">
            {/* Authorized Documents */}
            <div className="space-y-4 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Authorized Documents</label>
                <div className="grid grid-cols-2 gap-4">
                    {availableKeys.map((key: string) => {
                        const IconComp = SILO_ICONS[key] || FileText;
                        const permission = roleMatrix[key] || (() => {
                            const legacyKey = Object.keys(roleMatrix).find(mk => mapMobileKey(mk) === key);
                            return legacyKey ? roleMatrix[legacyKey] : 'none';
                        })();
                        
                        const isEdit = permission === 'edit' || isMasterOwner; // Corrected Master Access bypass
                        
                        return (
                            <button
                                key={key}
                                onClick={() => onSelectTab(key)}
                                className="relative bg-white dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl text-left transition-all active:scale-95 active:bg-zinc-50 dark:active:bg-black hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xl group overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 opacity-60">
                                    {isEdit ? <Edit3 size={11} className="text-emerald-600 dark:text-emerald-500" /> : <Eye size={11} className="text-blue-600 dark:text-blue-500" />}
                                </div>

                                <div className="mb-4">
                                    <IconComp size={22} className={isEdit ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500"} />
                                </div>

                                <div className="space-y-0.5">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white leading-tight">{DOC_LABELS[key] || key.replace(/-/g, ' ')}</h3>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

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
    _canEdit?: boolean;
    _isMasterOwner?: boolean;
    _isTestMode?: boolean;
    _roleId?: string;
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
    const { theme, toggleTheme } = useTheme();

    const [userEmail, setUserEmail] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');
    const [showLogin, setShowLogin] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [isTestMode, setIsTestMode] = useState(false);
    const [liveUsers, setLiveUsers] = useState<string[]>([]);
    const [systemTaps, setSystemTaps] = useState(0);

    // Hardware Override: Jump to Glitch Lab
    useEffect(() => {
        if (systemTaps === 3) {
            setSystemTaps(0);
            window.location.href = '/lab/glitch';
        }
        const timer = setTimeout(() => setSystemTaps(0), 1000);
        return () => clearTimeout(timer);
    }, [systemTaps]);

    // --------------------------------------------------------------------------------
    // RECOVERY: Load test mode on mount
    // --------------------------------------------------------------------------------
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTestMode = localStorage.getItem('onset_test_mode') === 'true';
            setIsTestMode(storedTestMode);
        }
    }, []);

    const activeTabRef = useRef(activeTab);
    useEffect(() => {
        activeTabRef.current = activeTab;
        if (activeTab && id) {
            localStorage.setItem(`onset_active_tab_${id}`, activeTab);
        }
    }, [activeTab, id]);

    useEffect(() => {
        if (!id) return;

        const resetFlag = localStorage.getItem(`onset_v2_reset_${id}`);
        if (!resetFlag) {
            localStorage.removeItem(`onset_active_tab_${id}`);
            localStorage.setItem(`onset_v2_reset_${id}`, 'true');
        }

        const savedTab = localStorage.getItem(`onset_active_tab_${id}`);
        if (savedTab) {
            setActiveTab(savedTab as Tab);
            activeTabRef.current = savedTab as Tab;
        }

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
                    setIsOffline(false);
                } else {
                    setIsConnected(false);
                }
            });

        // Offline Network Listeners (Enhanced Polling)
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [id]);

    // --------------------------------------------------------------------------------
    // PRESENCE & STATUS LOGIC
    // --------------------------------------------------------------------------------
    useEffect(() => {
        if (!id || !userEmail) return;

        // Persist for Hardware Override (e.g. Glitch Lab presence)
        localStorage.setItem('onset_last_active_project', id);

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

                // Extract all currently connected emails
                const onlineEmails = Object.values(state)
                    .flat()
                    .map((p: any) => p.user_email)
                    .filter(Boolean);

                setLiveUsers(onlineEmails);
                console.log('Presence Sync: Active Users:', onlineEmails);
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

            // Try to get from Auth if not in local storage - REMOVED FOR IDENTITY RECOVERY
            // if (!emailToUse) {
            //     const { data: { session } } = await supabase.auth.getSession();
            //     if (session?.user) {
            //         emailToUse = session.user.email!;
            //         localStorage.setItem('onset_user_email', emailToUse);
            //     }
            // }

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

            // 2. Fetch Role Identity from Crew Membership if email exists
            let role = 'Crew';
            if (emailToUse) {
                const { data: { session } } = await supabase.auth.getSession();
                const isOwnerDataMatch = session?.user && (projectData.user_id === session.user.id);
                
                // FIRST: Consult the explicit Production Crew Membership
                const { data: crew } = await supabase.from('crew_membership')
                    .select('role')
                    .eq('project_id', id)
                    .ilike('user_email', emailToUse)
                    .maybeSingle();

                if (crew) {
                    role = crew.role;
                } else if (isOwnerDataMatch) {
                    // SECOND: Default to Owner identity if not in the Crew List
                    role = 'Owner';
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
                        // Array Unwrapping: Take the LATEST version (Index 0 in OnSet standard)
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            allDrafts[key] = parsed[0];
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
            // Removed destructive project-vision alias
            if (allDrafts['budget-actual'] && !allDrafts['budget']) allDrafts['budget'] = allDrafts['budget-actual'];
            if (allDrafts['brief'] && !allDrafts['creative-brief']) allDrafts['creative-brief'] = allDrafts['brief'];
            if (allDrafts['directors-treatment'] && !allDrafts['treatment']) allDrafts['treatment'] = allDrafts['directors-treatment'];
            if (allDrafts['creative-direction'] && !allDrafts['lookbook']) allDrafts['lookbook'] = allDrafts['creative-direction'];
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

            const MOBILE_SUPPORTED = [
                'project-vision', 'creative-brief', 'av-script', 'treatment', 'storyboard', 'lookbook',
                'shot-scene-book', 'ecomm-shot-list', 'budget', 'crew-list', 'releases', 'casting', 'locations', 'equipment-list', 'wardrobe', 'props-list',
                'schedule', 'call-sheet', 'on-set-notes', 'camera-report', 'script-notes', 'sound-report', 'dit-log',
                'client-selects', 'deliverables', 'archive'
            ];


            const mobileControl = allDrafts['onset-mobile-control'];
            const matrix = mobileControl?.matrix || {};
            const isLive = mobileControl?.isLive;

            // PERMISSIONS: Confirm if the user is the project's true administrative owner
            const { data: { session } } = await supabase.auth.getSession();
            const isMasterOwner = session?.user && (projectData.user_id === session.user.id);
            
            // Find current user's role in the specific Crew List draft for IDENTITY
            const crewListDoc = allDrafts['crew-list'];
            const me = crewListDoc?.crew?.find((c: any) =>
                c.email && c.email.trim().toLowerCase() === emailToUse?.trim().toLowerCase()
            );

            // --- RELIABILITY FIX: Read fresh simulation status directly from source of truth ---
            const effectiveTestMode = (typeof window !== 'undefined') && localStorage.getItem('onset_test_mode') === 'true';

            // SYNC UI: Prioritize the explicit Crew List role name for the display label
            if (me?.role) {
                setUserRole(me.role);

                // --- SQL BRIDGE: Auto-Sync JSON identity to SQL Membership table ---
                // This ensures Supabase RLS and tactical permissions are always aligned.
                if (role !== me.role) {
                    console.log(`[OnsetMobile] Logic Sync: JSON [${me.role}] vs SQL [${role}]. Bridging...`);
                    await supabase.from('crew_membership')
                        .upsert({
                            project_id: id,
                            user_email: emailToUse,
                            role: me.role,
                            is_online: true
                        }, { onConflict: 'project_id, user_email' });
                }
            }
            
            // roleId determines the MATRIX mapping (identifies who you are in the silo switchboard)
            let roleId = me?.mobileRoleId;
            if (!roleId && me?.role) {
                // --- TACTICAL HOOKS: Consult Matrix Custom Roles first ---
                const customMatch = mobileControl?.roles?.find((r: any) => r.name.toLowerCase() === me.role.toLowerCase());
                
                if (customMatch) {
                    roleId = customMatch.id;
                } else {
                    // --- TACTICAL HOOKS: Unified Role-to-ID Hydration ---
                    roleId = deriveMobileRoleId(me.role);
                }
            }
            if (!roleId) roleId = role?.trim().toLowerCase().replace(/\s+/g, '-');

            const roleMatrix = matrix[roleId!] || {};
            
            // canEdit handles the per-tab write access
            const canEdit = (!!isMasterOwner && !effectiveTestMode) || (!!activeTab && roleMatrix[activeTab] === 'edit');

            let availableKeys: string[] = [];

            if (mobileControl && !isLive && (!isMasterOwner || effectiveTestMode)) {
                availableKeys = [];
            } else {
                // DYNAMIC MATRIX RESOLUTION
                availableKeys = MOBILE_SUPPORTED.filter(k => {
                    if (roleId === 'owner' || (isMasterOwner && !effectiveTestMode)) return true;
                    
                    // Robust lookup: check exact key OR map legacy aliases to confirm permission
                    const permission = roleMatrix[k] || (() => {
                        const legacyKey = Object.keys(roleMatrix).find(mk => mapMobileKey(mk) === k);
                        return legacyKey ? roleMatrix[legacyKey] : 'none';
                    })();

                    return permission === 'view' || permission === 'edit';
                });
            }

            const currentTab = activeTabRef.current;

            // --- DASHBOARD BY DEFAULT ---
            // We no longer auto-select a tab if currentTab is empty. 
            // This allows the MobileLanding (Authorized Silos) to show.
            if (availableKeys.length > 0 && availableKeys.includes(currentTab) === false && currentTab !== '') {
                setActiveTab(availableKeys[0]);
            } else if (availableKeys.length === 0) {
                setActiveTab('');
            }

            const finalData = { 
                ...computedData, 
                availableKeys, 
                _canEdit: !!canEdit, 
                _isMasterOwner: !!isMasterOwner, 
                _isTestMode: !!effectiveTestMode,
                _roleId: roleId
            };
            setData(finalData);

            // AUTO CLEAR TEST MODE IF NOT OWNER (SAFETY)
            if (!isMasterOwner && effectiveTestMode) {
                localStorage.removeItem('onset_test_mode');
                setIsTestMode(false);
            }

            // CACHE FOR OFFLINE SAFETY NET (NOW INCLUDES AVAILABLE KEYS)
            localStorage.setItem(`onset_cache_data_${id}`, JSON.stringify(finalData));
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSyncTime(nowTime);
            localStorage.setItem(`onset_cache_time_${id}`, nowTime);
            setIsOffline(false);
            setUserRole(role || '');
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

    const broadcastPulse = async (event: string, msg: string) => {
        try {
            const channel = supabase.channel(`production_pulse:${id}`);
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    channel.send({
                        type: 'broadcast',
                        event,
                        payload: { projectId: id, msg, time: Date.now() }
                    });
                }
            });
        } catch (e) { console.error("Pulse failed", e); }
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
            broadcastPulse('DIT_ALERT', `DIT Log: ${newItem.eventType || 'Activity'} logged`);

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
                    }
                });
            }

            fetchData();
            broadcastPulse('CAMERA_ALERT', `Camera: ${item.roll ? 'New Roll ' + item.roll : 'Log Entry'}`);
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
            broadcastPulse('NOTE_ALERT', 'New On-Set Note published');
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
                broadcastPulse('NOTE_ALERT', 'On-Set Note updated');
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
            broadcastPulse('CAMERA_ALERT', `Shot ${shotId} marked ${status}`);

        } catch (e) { console.error(e); }
    };

    const handleUpdateCallSheet = async (updatedDoc: any) => {
        if (!data.project) return;
        try {
            const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error || !latest) return;

            const phases = latest.data.phases;
            const phaseOrder = ['DEVELOPMENT', 'PRE_PRODUCTION', 'PRODUCTION', 'ON_SET', 'POST'];
            const searchOrder = [...phaseOrder].reverse();
            let phaseKey = 'PRODUCTION';
            for (const p of searchOrder) {
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
        
        // Optimistic UI Update for zero-latency mobile responsiveness
        setData((prev: any) => ({
            ...prev,
            docs: {
                ...prev.docs,
                [toolId]: updatedDoc
            }
        }));

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
            const searchOrder = [...phaseOrder].reverse();
            const ON_SET_TOOLS = ['schedule', 'call-sheet', 'ecomm-shot-list', 'on-set-notes', 'camera-report', 'script-notes', 'sound-report', 'dit-log'];
            let phaseKey = ON_SET_TOOLS.includes(originalKey) ? 'ON_SET' : 'PRODUCTION';
            
            for (const p of searchOrder) {
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

            // AUTO-SYNC: Schedule -> Call Sheet
            if (originalKey === 'schedule') {
                try {
                    const schedData = updatedDoc;
                    // Find call sheet across all phases to ensure consistency
                    for (const p of phaseOrder) {
                        if (updatedPhases[p]?.drafts?.['call-sheet']) {
                            const csRaw = updatedPhases[p].drafts['call-sheet'];
                            let csList = safeParse(csRaw);
                            if (Array.isArray(csList)) {
                                if (csList.length === 0) csList = [{}];
                                csList[0] = {
                                    ...csList[0],
                                    date: schedData.date || csList[0].date,
                                    crewCall: schedData.callTime || csList[0].crewCall,
                                    events: (schedData.items && Array.isArray(schedData.items)) ? schedData.items.map((item: any, i: number) => ({
                                        id: item.id || `evt-sync-${i}-${Date.now()}`,
                                        time: item.time || '',
                                        type: item.intExt === 'BREAK' ? 'Break' : 'Shoot',
                                        description: item.description || (item.scene ? `Scene ${item.scene}` : ''),
                                        location: item.set || ''
                                    })) : csList[0].events
                                };
                                updatedPhases[p].drafts['call-sheet'] = JSON.stringify(csList);
                            }
                        }
                    }
                } catch (e) {
                    console.error("[OnsetMobile] Schedule to Call Sheet sync failed:", e);
                }
            }

            const updatedProjectData = { ...latest.data, phases: updatedPhases };
            await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);

            // SYNC BROADCAST: Trigger immediate desktop re-fetch
            const syncChannel = supabase.channel(`project_sync:${id}`)
            syncChannel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await syncChannel.send({
                        type: 'broadcast',
                        event: 'SYNC_TRIGGER',
                        payload: { tool: originalKey, timestamp: Date.now() }
                    });
                    supabase.removeChannel(syncChannel);
                }
            });

            fetchData();
        } catch (e) { console.error(e) }
    }

    const handleUpdateScriptNotes = async (action: 'add' | 'update' | 'delete' | 'set-items', payload: any) => {
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
            } else if (action === 'set-items') {
                list = payload;
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

            // --- SQL BRIDGE: Proactive Authorization Sync ---
            // Ensure newly added or updated personnel have SQL records for RLS/Auth
            if (action !== 'delete' && payload.email && payload.email.trim() !== '') {
                try {
                    await supabase.from('crew_membership').upsert({
                        project_id: id,
                        user_email: payload.email.trim().toLowerCase(),
                        role: payload.role || 'General Crew'
                    }, { onConflict: 'project_id, user_email' });
                    console.log(`[OnsetMobile] Auth Bridge: Synced ${payload.email}`);
                } catch (bridgeError) {
                    console.error("[OnsetMobile] Auth Bridge failed:", bridgeError);
                }
            }

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
            <div className="h-screen bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center gap-4">
                <img src={theme === 'dark' ? "/octo%20logo%20wt.png" : "/octo%20logo%20bk.png"} className="w-16 animate-pulse opacity-50" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-300">Connecting/...</p>
            </div>
        );
    }

    if (!data.project) {
        return (
            <div className="h-screen bg-zinc-50/50 dark:bg-zinc-900/50 text-black dark:text-zinc-100 flex flex-col items-center justify-center gap-4">
                <p className="text-[17px] font-black tracking-tight uppercase text-red-500">Project Not Found</p>
            </div>
        );
    }

    return (
        <ProjectDataProvider data={data} userEmail={userEmail}>
            <div className="w-full h-full max-w-md mx-auto min-w-0 flex flex-col bg-zinc-50 dark:bg-black text-black dark:text-zinc-100 font-sans font-inter overflow-hidden md:h-[90dvh] md:rounded-2xl md:border border-zinc-300 dark:border-zinc-800 relative z-10">

                {/* TOP ROW: Header & Alerts */}
                <div className="flex flex-col z-50 shrink-0">
                    {/* TACTICAL HEAD-UP DISPLAY (HUD) HEADER */}
                    <header className="bg-zinc-100/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 pt-safe transition-all w-full relative">
                        <div className="h-16 flex items-center justify-between px-6">
                            
                            {/* ONSET Platform Identity */}
                            <div className="flex flex-col min-w-[70px]">
                                <img src={theme === 'dark' ? "/onset-logo-wt.png" : "/onset-logo-bk.png"} alt="ONSET" className="h-[28px] w-auto object-contain" />
                            </div>

                            {/* Center: Dynamic Role / Document Name */}
                            <div className="flex-1 min-w-0 flex items-center justify-center px-4">
                                <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-500 truncate text-center">
                                    {activeTab === '' ? (userRole || 'Crew') : (DOC_LABELS[activeTab] || activeTab.replace(/-/g, ' '))}
                                </span>
                            </div>

                            {/* Dashboard / System Toggle */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setActiveTab('')}
                                    className={`p-2.5 rounded-xl transition-all active:scale-95 ${activeTab === '' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg' : 'bg-transparent text-zinc-400 dark:text-zinc-600'}`}
                                >
                                    <LayoutGrid size={18} strokeWidth={3} />
                                </button>
                                
                                <button
                                    onClick={() => setShowMenu(true)}
                                    className="p-2.5 rounded-xl bg-transparent text-zinc-400 dark:text-zinc-600 transition-colors">
                                    <Menu size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* GLOBAL MEDIA ALERT BANNER */}
                    {mediaAlerts.length > 0 && activeTab !== 'dit-log' && (
                        <button
                            onClick={() => setActiveTab('dit-log')}
                            className="w-full bg-[#EAB308] text-black dark:text-zinc-100 px-4 py-3 flex items-center justify-between animate-in slide-in-from-top-2 z-40 relative shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-black/10 p-1.5 rounded-full">
                                    <HardDrive size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-wider leading-none mb-0.5 text-black dark:text-zinc-100">Media Alert</p>
                                    <p className="text-xs font-bold leading-none text-black dark:text-zinc-100">{mediaAlerts.length} New Roll{mediaAlerts.length > 1 ? 's' : ''} Pulled</p>
                                </div>
                            </div>
                            <div className="bg-black/10 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide text-black dark:text-zinc-100 border border-black/20">
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
                            <div className="relative w-4/5 max-w-sm h-full bg-zinc-50 dark:bg-[#0A0A0A] border-l border-zinc-100 dark:border-zinc-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 pointer-events-auto">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 
                                        onClick={() => setSystemTaps(prev => prev + 1)}
                                        className={`text-xs font-bold uppercase tracking-widest transition-all active:scale-95 cursor-default select-none ${systemTaps > 0 ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'}`}
                                    >
                                        System
                                    </h2>
                                    <button onClick={() => setShowMenu(false)} className="bg-zinc-50/50 dark:bg-zinc-800/50 p-2 rounded-full text-zinc-600 dark:text-zinc-300 transition-colors">
                                        <Menu size={14} />
                                    </button>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {/* Identity Card */}
                                    <div className="bg-zinc-100 dark:bg-zinc-800 shadow-inner p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-3 mb-2">
                                            <UserCircle size={20} className="text-emerald-500" />
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900 dark:text-white">{userRole || 'Crew Member'}</p>
                                                <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 break-all">{userEmail}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Production Details */}
                                    <div className="bg-emerald-500/5 dark:bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-1 block">Production</label>
                                                <p className="text-xs font-black text-zinc-900 dark:text-white uppercase truncate">{data.project?.name || 'Untitled Project'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-1 block">Producer</label>
                                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{data.project?.data?.producer || 'TBD'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-300 uppercase font-bold tracking-widest">
                                            <span>Production Role</span>
                                            <span className="text-emerald-500 font-black">{userRole || 'Crew'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-300 uppercase font-bold tracking-wider mt-4">
                                            <span>Sync Status</span>
                                            <span className={data.docs['onset-mobile-control']?.isLive !== false ? "text-emerald-600" : "text-amber-600"}>
                                                {data.docs['onset-mobile-control']?.isLive !== false ? 'Live' : 'Standby'}
                                            </span>
                                        </div>

                                    {/* Appearance */}
                                    <div className="space-y-3 pt-4">
                                        <div className="flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-300 uppercase font-bold tracking-wider">
                                            <span>Appearance</span>
                                            <button 
                                                onClick={toggleTheme}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors"
                                            >
                                                {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                                                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {myProjects.length > 0 && (
                                    <div className="space-y-2 mt-2 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-300 mb-3">Other Active Sets</h3>
                                        <div className="space-y-2">
                                            {myProjects.map(p => (
                                                <Link key={p.id} href={`/onset/${p.id}`} className="block">
                                                    <div className="bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-50/50 transition-colors p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center justify-between group">
                                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex-1 pr-4">{p.name}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse"></div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                    <button
                                        onClick={() => {
                                            // Execute visual navigation / logout instantly
                                            localStorage.removeItem('onset_user_email');
                                            localStorage.removeItem('onset_test_mode');
                                            
                                            // Fire and forget database presence updates so UI doesn't hang
                                            if (userEmail && id) {
                                                supabase.from('crew_membership').update({ is_online: false })
                                                          .eq('project_id', id).eq('user_email', userEmail).then();
                                                supabase.removeAllChannels().then();
                                            }

                                            window.location.reload();
                                        }}
                                        className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
                                        <LogOut size={14} /> Disconnect from Set
                                    </button>


                                </div>
                            </div>
                        </div>
                    )
                    }

                    {/* CONFIDENTIAL BANNER */}
                    <div className="bg-stripes-zinc text-center py-1 border-b border-zinc-100 dark:border-zinc-800 shadow-sm relative z-40 bg-zinc-100/50 dark:bg-zinc-900/50">
                        <p className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">Confidential Materials • {new Date().getFullYear()}</p>
                    </div>
                </div>

                {/* WATERMARK OVERLAY */}
                {
                    userEmail && (
                        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden opacity-[0.03] flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-24 -rotate-12 transform scale-150">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="text-xl font-black uppercase text-white dark:text-zinc-300 whitespace-nowrap select-none">
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

                        {activeTab === '' ? (() => {
                            const controlDoc = data.docs['onset-mobile-control'];
                            const matrixObj = controlDoc?.matrix || {};
                            const rId = data._roleId || 'crew';

                            return (
                                <MobileLanding
                                    projectName={data.project?.name}
                                    roleId={rId}
                                    roleMatrix={matrixObj[rId] || {}}
                                    availableKeys={data.availableKeys || []}
                                    onSelectTab={(key: string) => setActiveTab(key)}
                                    isMasterOwner={data._isMasterOwner}
                                />
                            );
                        })() : (() => {
                            const controlDoc = data.docs['onset-mobile-control'];
                            const matrixObj = controlDoc?.matrix || {};
                            const rId = data._roleId || 'crew';
                            const roleMatrix = matrixObj[rId] || {};
                            
                            const permission = roleMatrix[activeTab] || (() => {
                                const legacyKey = Object.keys(roleMatrix).find(mk => mapMobileKey(mk) === activeTab);
                                return legacyKey ? roleMatrix[legacyKey] : 'none';
                            })();

                            const isReadOnlyDynamic = !(data._isMasterOwner && !data._isTestMode) && permission !== 'edit';

                            return (
                            <>
                                {activeTab === 'av-script' && <ScriptView data={data.docs['av-script']} />}
                                {activeTab === 'shot-scene-book' && <ShotListView data={data.docs['shot-scene-book']} onCheckShot={handleCheckShot} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'call-sheet' && (
                                    <CallSheetView
                                        data={data.docs['call-sheet']}
                                        scheduleData={data.docs['schedule']}
                                        onUpdate={handleUpdateCallSheet}
                                        isReadOnly={isReadOnlyDynamic}
                                    />
                                )}
                                {activeTab === 'dit-log' && <MobileDITLogView
                                    data={data.docs['dit-log']}
                                    onAdd={handleUpdateDIT}
                                    projectId={id}
                                    mediaAlerts={mediaAlerts}
                                    setMediaAlerts={setMediaAlerts}
                                    isReadOnly={isReadOnlyDynamic}
                                />}
                                {activeTab === 'camera-report' && <MobileCameraReportView data={data.docs['camera-report']} onAdd={handleUpdateCameraReport} projectId={id} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'crew-list' && (
                                    <CrewListView
                                        data={data.docs['crew-list']}
                                        liveUsers={liveUsers}
                                        onAdd={(m) => handleUpdateCrewList('add', m)}
                                        onUpdate={(m) => handleUpdateCrewList('update', m)}
                                        onDelete={(id) => handleUpdateCrewList('delete', id)}
                                        isReadOnly={isReadOnlyDynamic}
                                    />
                                )}
                                {activeTab === 'schedule' && (
                                    <ScheduleView
                                        data={data.docs['schedule']}
                                        callSheetData={data.docs['call-sheet']}
                                        onUpdate={(newData) => handleUpdateDraft('schedule', newData)}
                                        isReadOnly={isReadOnlyDynamic}
                                    />
                                )}
                                {activeTab === 'on-set-notes' && <MobileOnSetNotesView
                                    data={data.docs['on-set-notes']}
                                    onAdd={handleAddOnSetNote}
                                    onUpdate={handleEditOnSetNote}
                                    onDelete={handleDeleteOnSetNote}
                                    isReadOnly={isReadOnlyDynamic}
                                />}
                                {activeTab === 'locations' && <MobileLocationsView data={data.docs['locations']} onAdd={(m) => handleUpdateList('locations', 'add', m)} onUpdate={(m) => handleUpdateList('locations', 'update', m)} onDelete={(id) => handleUpdateList('locations', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'releases' && <MobileReleasesView data={data.docs['releases']} onUpdate={handleUpdateReleases} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'script-notes' && <MobileScriptNotesView
                                    data={data.docs['script-notes']}
                                    avScript={data.docs['av-script']}
                                    onAdd={(item: any) => handleUpdateScriptNotes('add', item)}
                                    onUpdate={(item: any) => handleUpdateScriptNotes('update', item)}
                                    onDelete={(id: string) => handleUpdateScriptNotes('delete', id)}
                                    onSetItems={(items: any[]) => handleUpdateScriptNotes('set-items', items)}
                                    isReadOnly={isReadOnlyDynamic}
                                />}
                                {activeTab === 'sound-report' && <MobileSoundReportView
                                    data={data.docs['sound-report']}
                                    onAdd={(item: any) => handleUpdateSoundReport('add', item)}
                                    onUpdate={(item: any) => handleUpdateSoundReport('update', item)}
                                    onDelete={(id: string) => handleUpdateSoundReport('delete', id)}
                                    isReadOnly={isReadOnlyDynamic}
                                />}

                                {activeTab === 'dashboard' && <MobileReadOnlyListView data={data.docs['dashboard'] || {}} titleKey="title" onAdd={(m) => handleUpdateList('dashboard', 'add', m)} onUpdate={(m) => handleUpdateList('dashboard', 'update', m)} onDelete={(id) => handleUpdateList('dashboard', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'budget' && <MobileReadOnlyListView data={data.docs['budget']} titleKey="description" subtitleKey="category" detailKeys={['rate', 'quantity']} onAdd={(m) => handleUpdateList('budget', 'add', m)} onUpdate={(m) => handleUpdateList('budget', 'update', m)} onDelete={(id) => handleUpdateList('budget', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'equipment-list' && <MobileReadOnlyListView data={data.docs['equipment-list']} titleKey="description" subtitleKey="category" detailKeys={['quantity', 'vendor', 'total']} onAdd={(m) => handleUpdateList('equipment-list', 'add', m)} onUpdate={(m) => handleUpdateList('equipment-list', 'update', m)} onDelete={(id) => handleUpdateList('equipment-list', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'storyboard' && <MobileStoryboardView data={data.docs['storyboard']} onAdd={(m) => handleUpdateList('storyboard', 'add', m)} onUpdate={(m) => handleUpdateList('storyboard', 'update', m)} onDelete={(id) => handleUpdateList('storyboard', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}

                                {/* Phase 2: Missing Documents leveraging lists */}
                                {activeTab === 'client-selects' && <MobileClientSelectsView data={data.docs['client-selects']} onAdd={(item: any) => handleUpdateClientSelects('add', item)} onUpdate={(item: any) => handleUpdateClientSelects('update', item)} onDelete={(id: string) => handleUpdateClientSelects('delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'deliverables' && <MobileReadOnlyListView data={data.docs['deliverables']} titleKey="item" subtitleKey="format" detailKeys={['usage', 'specs']} onAdd={(m) => handleUpdateList('deliverables', 'add', m)} onUpdate={(m) => handleUpdateList('deliverables', 'update', m)} onDelete={(id) => handleUpdateList('deliverables', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'archive' && <MobileReadOnlyListView data={data.docs['archive']} titleKey="itemName" subtitleKey="date" detailKeys={['activity', 'destination', 'status']} onAdd={(m) => handleUpdateList('archive', 'add', m)} onUpdate={(m) => handleUpdateList('archive', 'update', m)} onDelete={(id) => handleUpdateList('archive', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}

                                {/* Phase 3: Missing Document Views & Visual Cards */}
                                {activeTab === 'project-vision' && (
                                    <MobileVisionView
                                        data={data.docs['project-vision']}
                                        onUpdate={(newData: any) => handleUpdateDraft('project-vision', newData)}
                                        isReadOnly={isReadOnlyDynamic}
                                    />
                                )}
                                {activeTab === 'creative-brief' && (
                                    <MobileBriefView
                                        data={data.docs['creative-brief']}
                                        onUpdate={(newData) => handleUpdateDraft('creative-brief', newData)}
                                        isReadOnly={isReadOnlyDynamic}
                                    />
                                )}
                                {activeTab === 'ecomm-shot-list' && (
                                    <ECommShotListTemplate
                                        data={data.docs['ecomm-shot-list'] || {}}
                                        onUpdate={(newData) => handleUpdateDraft('ecomm-shot-list', newData)}
                                        isLocked={isReadOnlyDynamic}
                                        plain={true}
                                        defaultViewMode="mobile"
                                        hideControls={true}
                                    />
                                )}
                                {activeTab === 'treatment' && <MobileTreatmentView data={data.docs['treatment']} onAdd={(m) => handleUpdateList('treatment', 'add', m, 'slides')} onUpdate={(m) => handleUpdateList('treatment', 'update', m, 'slides')} onDelete={(id) => handleUpdateList('treatment', 'delete', id, 'slides')} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'lookbook' && <MobileLookbookView data={data.docs['lookbook']} onAdd={(m) => handleUpdateList('lookbook', 'add', m)} onUpdate={(m) => handleUpdateList('lookbook', 'update', m)} onDelete={(id) => handleUpdateList('lookbook', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'wardrobe' && <MobileWardrobeView data={data.docs['wardrobe']} onAdd={(m) => handleUpdateList('wardrobe', 'add', m)} onUpdate={(m) => handleUpdateList('wardrobe', 'update', m)} onDelete={(id) => handleUpdateList('wardrobe', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'casting' && <MobileCastingView data={data.docs['casting']} onAdd={(m) => handleUpdateList('casting', 'add', m)} onUpdate={(m) => handleUpdateList('casting', 'update', m)} onDelete={(id) => handleUpdateList('casting', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}
                                {activeTab === 'props-list' && <MobilePropsView data={data.docs['props-list']} onAdd={(m) => handleUpdateList('props-list', 'add', m)} onUpdate={(m) => handleUpdateList('props-list', 'update', m)} onDelete={(id) => handleUpdateList('props-list', 'delete', id)} isReadOnly={isReadOnlyDynamic} />}

                                {/* Fallback for other docs */}
                                {!['av-script', 'shot-scene-book', 'ecomm-shot-list', 'call-sheet', 'dit-log', 'camera-report', 'crew-list', 'schedule', 'on-set-notes', 'locations', 'releases', 'script-notes', 'sound-report', 'budget', 'equipment-list', 'casting', 'wardrobe', 'props-list', 'storyboard', 'project-vision', 'client-selects', 'deliverables', 'creative-brief', 'treatment', 'lookbook', 'archive', 'dashboard'].includes(activeTab) && (
                                    <EmptyState label={DOC_LABELS[activeTab] || 'Document'} />
                                )}
                            </>
                        );
                        })()}
                    </div>
                </main>

            </div>
        </ProjectDataProvider>
    );
}

