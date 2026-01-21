'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Menu } from 'lucide-react';
import Link from 'next/link';

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
    MobileCameraReportView
} from './components';
import { LogOut, Wifi, UserCircle } from 'lucide-react';

/* --------------------------------------------------------------------------------
 * COMPONENTS
 * -------------------------------------------------------------------------------- */
const MobileLanding = ({ projectName, status }: any) => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8 animate-in fade-in duration-700">
        <div className="mb-8 opacity-20">
            <img src="/onset_logo.png" className="w-24 grayscale" />
        </div>
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
}

/* --------------------------------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------------------------------- */
export default function OnSetMobilePage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('');
    const [data, setData] = useState<MobileState>({ project: null, docs: {} });
    const [mediaAlerts, setMediaAlerts] = useState<any[]>([]);

    const [userEmail, setUserEmail] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');
    const [showLogin, setShowLogin] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

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
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const fetchData = async () => {
        try {
            // 0. Identity Check
            const storedEmail = localStorage.getItem('onset_user_email');
            let emailToUse = storedEmail;

            // Try to get from Auth if not in local storage
            if (!emailToUse) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    emailToUse = user.email!;
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

            // 1. Fetch Project
            const { data: projectData, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !projectData) throw new Error("Project not found");

            // 2. Fetch Role if email exists
            let role = 'Crew';
            if (emailToUse) {
                const { data: crew } = await supabase.from('crew_membership')
                    .select('role')
                    .eq('project_id', id)
                    .eq('user_email', emailToUse)
                    .single();
                if (crew) role = crew.role;
                setUserRole(role);
            }

            // Parse ALL drafts across all phases
            const allDrafts: Record<string, any> = {};
            if (projectData.data?.phases) {
                Object.values(projectData.data.phases).forEach((phase: any) => {
                    if (phase.drafts) {
                        Object.entries(phase.drafts).forEach(([key, val]) => {
                            const parsed = safeParse(val as string);
                            // Safety: Handle Array Versions (take latest/first)
                            if (Array.isArray(parsed)) {
                                allDrafts[key] = parsed[0];
                            } else if (parsed) {
                                allDrafts[key] = parsed;
                            }
                        });
                    }
                });
            }

            // VIRTUAL MIGRATION: Support legacy Shot Log data
            if (allDrafts['shot-log'] && !allDrafts['camera-report']) {
                allDrafts['camera-report'] = allDrafts['shot-log'];
            }

            setData({
                project: projectData,
                docs: allDrafts
            });

            // Determine Tabs: Support new 'toolGroups' or legacy 'selectedTools'
            const mobileControl = allDrafts['onset-mobile-control'];

            let computedAvailableKeys: string[] = [];
            const isLive = mobileControl?.isLive;

            // SECURITY: Respect "Go Live" toggle. If Offline, show nothing.
            if (mobileControl && !isLive) {
                computedAvailableKeys = [];
            } else if (mobileControl?.toolGroups) {
                // New System: Group-Based Access (A/B/C)
                const crewListDoc = allDrafts['crew-list'];
                // Find current user in the Crew List document
                const me = crewListDoc?.crew?.find((c: any) =>
                    c.email && c.email.toLowerCase() === emailToUse?.toLowerCase()
                );

                const myGroups = me?.onSetGroups || [];
                const isOwner = role === 'Owner';

                // Filter available tools based on intersection of groups
                computedAvailableKeys = Object.entries(mobileControl.toolGroups)
                    .filter(([_, allowedGroups]: any) => {
                        if (!Array.isArray(allowedGroups)) return false;
                        if (allowedGroups.length === 0) return false; // Tool not assigned to any group -> Hidden

                        // Owner sees everything active
                        if (isOwner) return true;

                        // Crew sees only matching groups
                        return allowedGroups.some((g: string) => myGroups.includes(g));
                    })
                    .map(([key]) => key === 'shot-log' ? 'camera-report' : key);
            } else {
                computedAvailableKeys = (mobileControl?.selectedTools || []).map((k: string) => k === 'shot-log' ? 'camera-report' : k);
            }

            // Strict Permission: No defaults.
            let availableKeys = computedAvailableKeys;

            // REMOVED: Default fallback logic. If empty, it stays empty.
            if (availableKeys.length === 0 && !mobileControl) {
                // STRICT MODE: Do nothing.
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

        } catch (e) {
            console.error(e);
        } finally {
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

        } catch (e) {
            console.error(e);
        }
    };

    if (showLogin) {
        return <EmailEntryGate onJoin={handleJoin} projectName={data.project?.name} />;
    }

    if (loading) {
        return (
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <img src="/onset_logo.png" className="w-16 animate-pulse opacity-50" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Connecting/...</p>
            </div>
        );
    }

    if (!data.project) {
        return (
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-bold uppercase text-red-500">Project Not Found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">

            {/* HEADER */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <Link href="/onset" className="flex items-center gap-3">
                    <img src="/onset_logo.png" className="h-6 w-auto" alt="onSET" />
                    <div className="h-4 w-[1px] bg-zinc-700"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white leading-none mb-0.5">{data.project.name}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono text-emerald-500 uppercase leading-none">Live Sync</span>
                        </div>
                    </div>
                </Link>
                <button
                    onClick={() => setShowMenu(true)}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <Menu size={14} />
                </button>
            </header>

            {/* SYSTEM MENU DRAWER */}
            {
                showMenu && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                            onClick={() => setShowMenu(false)}
                        />

                        {/* Drawer */}
                        <div className="relative w-4/5 max-w-sm h-full bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">System</h2>
                                <button onClick={() => setShowMenu(false)} className="bg-black/50 p-2 rounded-full text-zinc-400">
                                    <Menu size={14} />
                                </button>
                            </div>

                            <div className="space-y-6 flex-1">
                                {/* Identity Card */}
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <UserCircle size={20} className="text-emerald-500" />
                                        <div>
                                            <p className="text-xs font-bold text-white">{userRole || 'Crew Member'}</p>
                                            <p className="text-[10px] font-mono text-zinc-500 break-all">{userEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                                        <span className="flex items-center gap-2"><Wifi size={12} /> Connection</span>
                                        <span className="text-emerald-500">Stable</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                                        <span>Sync Status</span>
                                        <span className={data.docs['onset-mobile-control']?.isLive ? "text-emerald-500" : "text-amber-500"}>
                                            {data.docs['onset-mobile-control']?.isLive ? 'Live' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-zinc-800 pt-6">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('onset_user_email');
                                        window.location.reload();
                                    }}
                                    className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                                    <LogOut size={14} /> Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* CONFIDENTIAL BANNER */}
            <div className="bg-stripes-zinc text-center py-1 border-b border-zinc-800">
                <p className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-600">Confidential Materials • {new Date().getFullYear()}</p>
            </div>

            {/* WATERMARK OVERLAY */}
            {
                userEmail && (
                    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden opacity-[0.03] flex items-center justify-center">
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
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 touch-pan-y relative bg-black">
                <div className="w-full max-w-md mx-auto px-4 py-6">
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
                            {activeTab === 'call-sheet' && <CallSheetView data={data.docs['call-sheet']} />}
                            {activeTab === 'dit-log' && <MobileDITLogView
                                data={data.docs['dit-log']}
                                onAdd={handleUpdateDIT}
                                projectId={id}
                                mediaAlerts={mediaAlerts}
                                setMediaAlerts={setMediaAlerts}
                            />}
                            {activeTab === 'camera-report' && <MobileCameraReportView data={data.docs['camera-report']} onAdd={handleUpdateCameraReport} projectId={id} />}
                            {activeTab === 'crew-list' && <CrewListView data={data.docs['crew-list']} />}
                            {activeTab === 'production-schedule' && <ScheduleView data={data.docs['production-schedule']} />}

                            {/* Fallback for other docs */}
                            {!['av-script', 'shot-scene-book', 'call-sheet', 'dit-log', 'camera-report', 'crew-list', 'production-schedule'].includes(activeTab) && (
                                <EmptyState label={DOC_LABELS[activeTab] || 'Document'} />
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* BOTTOM NAV (SCROLLABLE ROWS) */}
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-zinc-950 border-t border-zinc-900 z-50 pb-safe">
                <div className="flex items-center h-full overflow-x-auto px-4 gap-3 no-scrollbar">
                    {(() => {
                        const mobileControl = data.docs['onset-mobile-control'];
                        let availableKeys: string[] = [];
                        const isLive = mobileControl?.isLive;

                        // Security: If Offline, hide Nav
                        if (mobileControl && !isLive) return null;

                        if (mobileControl?.toolGroups) {
                            const crewListDoc = data.docs['crew-list'];
                            const me = crewListDoc?.crew?.find((c: any) =>
                                c.email && c.email.toLowerCase() === userEmail?.toLowerCase()
                            );
                            const myGroups = me?.onSetGroups || [];
                            const isOwner = userRole === 'Owner';

                            availableKeys = Object.entries(mobileControl.toolGroups)
                                .filter(([_, allowedGroups]: any) => {
                                    if (!Array.isArray(allowedGroups) || allowedGroups.length === 0) return false;
                                    if (isOwner) return true;
                                    return allowedGroups.some((g: string) => myGroups.includes(g));
                                })
                                .map(([key]) => key);
                        } else {
                            availableKeys = mobileControl?.selectedTools || [];
                        }

                        if (availableKeys.length === 0) {
                            return null;
                        }

                        if (availableKeys.length === 0) {
                            return null;
                        }

                        const mappedKeys = Array.from(new Set(availableKeys.map(k => k === 'shot-log' ? 'camera-report' : k)));

                        return mappedKeys.map((key: string) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`
                                flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all
                                ${activeTab === key
                                        ? 'bg-white text-black border-white'
                                        : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                            >
                                {DOC_LABELS[key] || key}
                            </button>
                        ));
                    })()}
                </div>
            </nav>
        </div >
    );
}

