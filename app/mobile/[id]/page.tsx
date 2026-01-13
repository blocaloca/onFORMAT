'use client';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Calendar, Clapperboard, Users, MapPin, Shirt, Package, File, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TOOLS_BY_PHASE } from '@/components/onformat/ExperimentalNav';

// --- Mobile Components ---

const MobileHeader = ({ title, onBack, rightAction }: { title: string, onBack?: () => void, rightAction?: React.ReactNode }) => (
    <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 z-50 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
            {onBack && (
                <button
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>
            )}
            <div>
                {!onBack && <div className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-0.5">onSET Mobile</div>}
                <div className="text-xs font-bold uppercase tracking-wider text-white truncate max-w-[200px]">
                    {title}
                </div>
            </div>
        </div>
        {rightAction ? rightAction : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
    </div>
);

const MobileDocList = ({ project, allowedTools, onSelect }: any) => {
    // Flatten tools
    const allTools = Object.values(TOOLS_BY_PHASE).flat();
    const visibleTools = allTools.filter((t: any) => allowedTools.includes(t.key));

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div className="pt-20 pb-12 px-5 min-h-screen bg-black text-white selection:bg-emerald-500/30">
            {/* Project Card */}
            <div className="mb-8 p-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono uppercase text-zinc-400">
                            Status: Active
                        </div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">
                            {today}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-2 text-white">
                        {project.name || 'Untitled Project'}
                    </h1>

                    <div className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                        {project.data?.clientName && (
                            <div className="flex items-center gap-2">
                                <span className="opacity-50">Client:</span>
                                <span className="text-white font-bold">{project.data.clientName}</span>
                            </div>
                        )}
                        {project.data?.producer && (
                            <div className="flex items-center gap-2">
                                <span className="opacity-50">Prod:</span>
                                <span className="text-white font-bold">{project.data.producer}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Production Tools List */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4 opacity-50 px-2">
                    <div className="h-px bg-white/20 flex-1" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Production Docs</span>
                    <div className="h-px bg-white/20 flex-1" />
                </div>

                {visibleTools.length === 0 ? (
                    <div className="text-center py-12 px-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                        <p className="text-zinc-500 font-mono text-xs uppercase mb-2">No documents synced</p>
                        <p className="text-[9px] text-zinc-600">Use control panel to push docs</p>
                    </div>
                ) : (
                    visibleTools.map((tool: any, i: number) => (
                        <button
                            key={tool.key}
                            onClick={() => onSelect(tool.key)}
                            style={{ animationDelay: `${i * 50}ms` }}
                            className="w-full bg-zinc-900/80 hover:bg-zinc-800 border-l-2 border-transparent hover:border-emerald-500 pr-5 pl-5 py-5 flex items-center justify-between group active:scale-[0.98] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards mb-1"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors shadow-lg">
                                    {getIconForTool(tool.key)}
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm text-zinc-200 group-hover:text-white uppercase tracking-wider mb-0.5 transition-colors">
                                        {tool.label}
                                    </div>
                                    <div className="text-[9px] text-zinc-600 font-mono uppercase group-hover:text-zinc-500 transition-colors">
                                        Tap to view
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-700 group-hover:text-zinc-400 transition-colors transform group-hover:translate-x-1" />
                        </button>
                    ))
                )}
            </div>

            <div className="mt-12 text-center">
                <p className="text-[9px] font-mono text-zinc-700 uppercase">
                    onSET Mobile v1.0 &bull; Secure Connection
                </p>
            </div>
        </div>
    )
}

const MobileDocViewer = ({ toolKey, data, onBack }: any) => {
    // Generic Renderer based on Tool Type logic
    const toolLabel = Object.values(TOOLS_BY_PHASE).flat().find((t: any) => t.key === toolKey)?.label || 'Document';

    return (
        <div className="bg-black min-h-screen">
            <MobileHeader title={toolLabel} onBack={onBack} />

            <div className="pt-20 pb-8 px-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden min-h-[50vh]">
                    <GenericMobileRenderer data={data} toolKey={toolKey} />
                </div>
            </div>
        </div>
    )
}

// --- Generic Renderers ---

const GenericMobileRenderer = ({ data, toolKey }: any) => {
    if (!data) return <div className="p-8 text-center text-zinc-600 text-xs">No Data</div>;

    // Handle Arrays (Lists like Shot List, Schedule, Storyboard)
    if (Array.isArray(data)) {
        // Attempt to detect structure
        if (data.length === 0) return <div className="p-8 text-center text-zinc-600 text-xs">Empty List</div>;

        // Storyboard / Moodboard Check (Items with URL)
        if (data[0].url !== undefined || data[0].caption !== undefined) {
            return (
                <div className="divide-y divide-zinc-800">
                    {data.map((item: any, i: number) => (
                        <div key={i} className="p-4">
                            {item.url && (
                                <div className="mb-3 rounded-md overflow-hidden bg-zinc-950 aspect-[3/2] border border-zinc-800">
                                    <img src={item.url} className="w-full h-full object-cover" />
                                </div>
                            )}
                            {item.caption && <div className="font-bold text-sm text-white mb-1 uppercase">{item.caption}</div>}
                            {item.notes && <div className="text-xs text-zinc-400 font-mono">{item.notes}</div>}
                        </div>
                    ))}
                </div>
            )
        }

        // Schedule / Shot List Check
        // Generic Table-like list
        return (
            <div className="divide-y divide-zinc-800">
                {data.map((row: any, i: number) => (
                    <div key={i} className="p-4 space-y-1">
                        {Object.entries(row).map(([k, v]) => {
                            if (k === 'id' || k === 'rowId') return null;
                            return (
                                <div key={k} className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                                    <span className="text-zinc-500 uppercase font-bold truncate">{k}</span>
                                    <span className="text-zinc-300 font-mono break-words">{String(v)}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    // Handle Object (Call Sheet, Brief)
    if (typeof data === 'object') {
        const entries = Object.entries(data);
        // Special Case: Call Sheet (might have 'general', 'crew', 'schedule' objects inside)
        if (toolKey === 'call-sheet') {
            // Flatten sections
            return (
                <div className="p-4 space-y-6">
                    {entries.map(([sectionKey, content]: any) => {
                        if (typeof content !== 'object' || !content) return null;
                        return (
                            <div key={sectionKey}>
                                <h3 className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">
                                    {sectionKey.replace(/_/g, ' ')}
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(content).map(([k, v]) => (
                                        <div key={k} className="flex flex-col gap-1">
                                            <span className="text-[10px] text-zinc-500 uppercase font-bold">{k}</span>
                                            <span className="text-sm text-white border-l-2 border-zinc-700 pl-2">{String(v || '—')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        }

        // Generic Object
        return (
            <div className="p-4 space-y-4">
                {entries.map(([k, v]) => {
                    if (typeof v === 'object') return null; // Skip nested for now
                    return (
                        <div key={k} className="mb-4">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="text-sm text-white font-mono bg-zinc-950 p-2 rounded-sm border border-zinc-800">
                                {String(v)}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return <div className="p-8 text-white">{JSON.stringify(data)}</div>
}

const getIconForTool = (key: string) => {
    if (key.includes('sheet')) return <FileText size={20} />;
    if (key.includes('schedule')) return <Calendar size={20} />;
    if (key.includes('shot')) return <Clapperboard size={20} />;
    if (key.includes('crew')) return <Users size={20} />;
    if (key.includes('location')) return <MapPin size={20} />;
    if (key.includes('wardrobe')) return <Shirt size={20} />;
    if (key.includes('props')) return <Package size={20} />;
    return <File size={20} />;
}

// --- Main Page ---

export default function MobilePage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);
    const [allowedTools, setAllowedTools] = useState<string[]>([]);

    // Active Viewer State
    const [activeToolKey, setActiveToolKey] = useState<string | null>(null);
    const [activeToolData, setActiveToolData] = useState<any>(null);

    useEffect(() => {
        if (id) fetchProject();
    }, [id]);

    const fetchProject = async () => {
        setLoading(true);

        // HANDLE LOCAL WORKSPACE (Simulation)
        if (id === 'local') {
            const localState = localStorage.getItem('onformat_v0_state');
            if (localState) {
                try {
                    const parsedState = JSON.parse(localState);
                    setProject({
                        name: parsedState.projectName || 'Local Workspace',
                        data: { ...parsedState, phases: parsedState.phases || {} }
                    });

                    // Parse Allowed Tools
                    const controlRaw = parsedState.phases?.['ON_SET']?.drafts?.['onset-mobile-control'];
                    let allowed: string[] = [];
                    if (controlRaw) {
                        const rawParsed = JSON.parse(controlRaw);
                        const stack = Array.isArray(rawParsed) ? rawParsed : [rawParsed];
                        allowed = stack[0]?.selectedTools || [];
                    }
                    setAllowedTools(allowed);
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error("Local State Parse Error", e);
                }
            }
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (data && data.data) {
            setProject(data);

            // Parse Allowed Tools (from Control Panel)
            const controlRaw = data.data.phases?.['ON_SET']?.drafts?.['onset-mobile-control'];
            let allowed: string[] = [];
            if (controlRaw) {
                try {
                    const parsed = JSON.parse(controlRaw);
                    // Control Panel uses a Stack array for versions.
                    // The actual data is in the first element of stack.
                    // Or wait. ControlPanelTemplate uses `data.selectedTools`.
                    // `DraftEditor` saves `JSON.stringify(currentStack)`.
                    // So `controlRaw` is `[ { selectedTools: [...] } ]` (as string).
                    const stack = Array.isArray(parsed) ? parsed : [parsed];
                    allowed = stack[0]?.selectedTools || [];
                } catch { }
            }
            setAllowedTools(allowed);
        }
        setLoading(false);
    }

    const handleSelectTool = (key: string) => {
        // Fetch Tool Data from Project State
        // Project State is in `project.data`
        const phases = project?.data?.phases || {};
        // Find phase for tool?
        // We know keys are unique. Search all phases.
        let toolDraftRaw = null;
        for (const pKey of Object.keys(phases)) {
            if (phases[pKey]?.drafts?.[key]) {
                toolDraftRaw = phases[pKey].drafts[key];
                break;
            }
        }

        if (toolDraftRaw) {
            try {
                const parsed = JSON.parse(toolDraftRaw);
                const stack = Array.isArray(parsed) ? parsed : [parsed];
                setActiveToolData(stack[0]);
            } catch {
                setActiveToolData({});
            }
        } else {
            setActiveToolData(null);
        }
        setActiveToolKey(key);
    };

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs animate-pulse">CONNECTING TO ONSET...</div>;

    if (!project) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono text-xs gap-4 p-8 text-center">
            <div className="text-2xl font-bold">PROJECT ACCESS DENIED</div>
            <div>ID: {id}</div>
            <div className="text-zinc-500">
                Possible causes:
                <br />1. You are not logged in (RLS)
                <br />2. This project does not exist
                <br />3. Public access is disabled
            </div>
            <div className="mt-4 p-4 border border-zinc-800 bg-zinc-900 text-zinc-300 rounded">
                Try logging in at <a href="/login" className="text-emerald-500 underline">/login</a> then refresh.
            </div>

            {id === 'local' && (
                <button
                    onClick={() => {
                        setProject({
                            name: 'Demo Project (Simulator)',
                            data: { phases: {} }
                        });
                        setAllowedTools(['call-sheet', 'schedule', 'storyboard']);
                    }}
                    className="mt-4 text-emerald-500 hover:text-emerald-400 border border-emerald-900 bg-emerald-900/20 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest"
                >
                    Load Demo Data
                </button>
            )}
        </div>
    );

    if (activeToolKey) {
        return <MobileDocViewer toolKey={activeToolKey} data={activeToolData} onBack={() => setActiveToolKey(null)} />;
    }

    return (
        <MobileDocList
            project={project}
            allowedTools={allowedTools}
            onSelect={handleSelectTool}
        />
    );
}
