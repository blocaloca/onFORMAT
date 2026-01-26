import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Folder,
    LayoutGrid,
    Sparkles,
    MoreVertical,
    Plus,
    FolderPlus,
    FolderOpen,
    Archive,
    Smartphone
} from 'lucide-react';
import { UserMenu } from './UserMenu';

// Types (Mirrored from WorkspaceEditor to ensure compatibility)
export type Phase = 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'ON_SET' | 'POST';

// Ensure these match WorkspaceEditor.tsx exactly
export const TOOLS_BY_PHASE: Record<Phase, { key: string; label: string }[]> = {
    DEVELOPMENT: [
        { key: 'project-vision', label: 'Project Vision' },
        { key: 'brief', label: 'Creative Brief' },
        { key: 'av-script', label: 'AV Script' },
        { key: 'directors-treatment', label: "Treatment" },
        { key: 'storyboard', label: 'Storyboard' },
        { key: 'lookbook', label: "Lookbook" },
    ],
    PRE_PRODUCTION: [
        { key: 'shot-scene-book', label: 'Shot List' },
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
        { key: 'releases', label: 'Releases' },
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
};

export const PHASES: { key: Phase; label: string }[] = [
    { key: 'DEVELOPMENT', label: 'Development' },
    { key: 'PRE_PRODUCTION', label: 'Pre-Production' },
    { key: 'ON_SET', label: 'Production' },
    { key: 'POST', label: 'Post-Production' }
];

export const getPhaseKey = (label: string): Phase | undefined => {
    return PHASES.find(p => p.label.toLowerCase() === label.toLowerCase() || p.key === label)?.key;
}

export const getPhaseLabel = (key: Phase): string => {
    return PHASES.find(p => p.key === key)?.label || key;
}

// --- Shared Components ---

const NavHeader = ({ isAiDocked = true, darkMode = false, onToggleAi }: { isAiDocked?: boolean, darkMode?: boolean, onToggleAi?: () => void }) => (
    <div className={`p-8 pb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
        <Link href="/" className="block w-32 mb-10 hover:opacity-80 transition-opacity">
            <img src="/logo-white.png" alt="onFORMAT" className="w-full h-auto object-contain bg-black p-1" />
        </Link>

        {onToggleAi && (
            <button
                onClick={onToggleAi}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mb-6 group ${darkMode
                    ? (isAiDocked ? 'bg-emerald-900/80 text-emerald-100 border border-emerald-800 hover:bg-emerald-800' : 'bg-transparent text-emerald-500 border border-emerald-500/50 hover:bg-emerald-900/30')
                    : (isAiDocked ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-white' : 'bg-white text-black border border-black hover:bg-zinc-100')
                    }`}>
                <Sparkles size={14} className={`group-hover:rotate-12 transition-transform ${darkMode ? 'text-emerald-300' : 'text-yellow-400'}`} />
                {isAiDocked ? 'AI Liaison' : 'Close AI'}
            </button>
        )}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-50 mb-0" />
    </div>
);

const NavSectionTitle = ({ children, darkMode = false }: { children: React.ReactNode, darkMode?: boolean }) => (
    <div className={`px-4 text-[10px] font-bold uppercase tracking-widest mb-2 mt-6 ${darkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>
        {children}
    </div>
);

interface NavItemProps {
    active?: boolean;
    children: React.ReactNode;
    icon?: any;
    onClick?: () => void;
    hasSubmenu?: boolean;
    isOpen?: boolean;
    darkMode?: boolean;
    onAction?: (e: React.MouseEvent) => void;
    href?: string;
}

const NavItem = ({
    active,
    children,
    icon: Icon,
    onClick,
    hasSubmenu = false,
    isOpen = false,
    darkMode = false,
    onAction,
    href
}: NavItemProps) => {
    const content = (
        <div className="flex items-center gap-3 truncate">
            {Icon && <Icon size={16} className={active ? (darkMode ? 'text-emerald-400' : 'text-black') : (darkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600')} />}
            <span className={active ? 'font-bold truncate' : 'truncate'}>{children}</span>
        </div>
    );

    const className = `
        w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-all group relative block
        ${active
            ? (darkMode ? 'text-white bg-zinc-800' : 'text-black bg-zinc-50')
            : (darkMode ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-black hover:bg-zinc-50/50')
        }
    `;

    const inner = (
        <>
            {active && (
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-r-sm ${darkMode ? 'bg-emerald-500' : 'bg-black'}`} />
            )}

            {content}

            {hasSubmenu && (
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={12} className="text-zinc-400" />
                </div>
            )}

            {onAction && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(e); }} className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all absolute right-2 ${darkMode ? 'hover:bg-zinc-700/50' : 'hover:bg-zinc-200'}`}>
                    <MoreVertical size={12} className={darkMode ? 'text-zinc-400' : 'text-zinc-500'} />
                </div>
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className} onClick={onClick}>
                {inner}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {inner}
        </button>
    );
};

// --- DASHBOARD SIDEBAR ---

interface DashboardSidebarProps {
    folders: { id: string; name: string; type?: string }[];
    activeFolder: string | null;
    setActiveFolder: (id: string | null) => void;
    onComposeFolder?: () => void;
    onFolderAction?: (folder: any) => void;
    userEmail?: string;
    darkMode?: boolean;
    onNewProject?: () => void;
    AiComponent?: React.ReactNode;
    onToggleAi?: () => void;
    heading?: string;
    isAiDocked?: boolean;
}

export const ExperimentalDashboardNav = ({
    folders,
    activeFolder,
    setActiveFolder,
    onComposeFolder,
    onFolderAction,
    userEmail,
    darkMode = false,
    onNewProject,
    AiComponent,
    onToggleAi,
    isAiDocked = true
}: DashboardSidebarProps) => {

    return (
        <aside className={`w-64 shrink-0 h-screen sticky top-0 border-r flex flex-col font-sans transition-colors ${darkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-100'}`}>
            <NavHeader darkMode={darkMode} onToggleAi={onToggleAi} isAiDocked={isAiDocked} />

            {/* AI Slot (Preserving Dashboard Chat functionality) */}
            {AiComponent && (
                <div className="px-4 mb-4">
                    {AiComponent}
                </div>
            )}

            {/* New Project Action */}
            {onNewProject && (
                <div className="px-4 mb-2">
                    <button
                        onClick={onNewProject}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all shadow-sm ${darkMode
                            ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                            : 'bg-white text-black border border-black hover:bg-zinc-50'
                            }`}
                    >
                        <Plus size={14} /> New Project
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pt-2 scrollbar-hide">
                <NavSectionTitle darkMode={darkMode}>Views</NavSectionTitle>
                <NavItem icon={LayoutGrid} active={activeFolder === null} onClick={() => setActiveFolder(null)} darkMode={darkMode}>
                    All Projects
                </NavItem>
                <NavItem icon={Archive} active={activeFolder === 'ARCHIVED'} onClick={() => setActiveFolder('ARCHIVED')} darkMode={darkMode}>
                    Archived
                </NavItem>

                <NavSectionTitle darkMode={darkMode}>Folders</NavSectionTitle>
                <div className="space-y-0.5">
                    {folders?.filter(f => f.type !== 'archived').map(f => (
                        <NavItem
                            key={f.id}
                            icon={activeFolder === f.id ? FolderOpen : Folder}
                            active={activeFolder === f.id}
                            onClick={() => setActiveFolder(f.id)}
                            darkMode={darkMode}
                            onAction={onFolderAction ? () => onFolderAction(f) : undefined}
                        >
                            {f.name}
                        </NavItem>
                    ))}
                    <button
                        onClick={onComposeFolder}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-400 hover:text-black'}`}
                    >
                        <Plus size={12} /> New Folder
                    </button>
                </div>


            </div>

            <UserMenu email={userEmail} />
        </aside>
    );
};


// --- WORKSPACE SIDEBAR ---

interface WorkspaceSidebarProps {
    activeTool: string;
    activePhase: Phase;
    onToolSelect: (toolKey: string, phase: Phase) => void;
    darkMode?: boolean;
    userEmail?: string;
    producerName?: string;
    onToggleAi?: () => void;
    isAiDocked?: boolean;
    mobileStatus?: { isLive: boolean; hasAlert: boolean; alertMsg?: string }; // New prop
}

export const ExperimentalWorkspaceNav = ({
    activeTool,
    activePhase,
    onToolSelect,
    darkMode = true, // Default Dark for Workspace
    userEmail,
    producerName,
    onToggleAi,
    isAiDocked = true,
    mobileStatus,
    alerts
}: WorkspaceSidebarProps & { alerts?: Record<string, boolean> }) => {
    // We maintain local state for 'expanded' phases, but we default to expanding the ACTIVE phase.
    const [expandedPhase, setExpandedPhase] = useState<Phase | null>(activePhase);

    // If activePhase changes externally, ensure it is expanded
    useEffect(() => {
        setExpandedPhase(activePhase);
    }, [activePhase]);

    const togglePhase = (phase: Phase) => {
        setExpandedPhase(expandedPhase === phase ? null : phase);
    };

    return (
        <aside className={`w-64 shrink-0 h-screen sticky top-0 border-r flex flex-col font-sans transition-colors ${darkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-100'}`}>
            <NavHeader darkMode={darkMode} onToggleAi={onToggleAi} isAiDocked={isAiDocked} />

            <div className="px-8 mb-6">
                <Link href="/dashboard" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>
                    <ChevronLeft size={12} /> Back to Projects
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 scrollbar-none">

                {/* Dedicated onSET Mobile Button */}
                <div className="px-4 mb-6">
                    <button
                        onClick={() => onToolSelect('onset-mobile-control', 'ON_SET')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group relative overflow-hidden
                            ${mobileStatus?.hasAlert
                                ? 'bg-zinc-900 border-zinc-700'
                                : mobileStatus?.isLive
                                    ? (darkMode ? 'bg-emerald-900/10 border-emerald-500/50' : 'bg-emerald-50 border-emerald-500')
                                    : (darkMode ? 'bg-zinc-900/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-black')
                            }
                        `}
                    >
                        {/* Status Indicator (Only Live) */}
                        {mobileStatus?.isLive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}

                        <div className={`p-1.5 rounded-lg ${mobileStatus?.hasAlert ? 'bg-zinc-800 text-zinc-400' :
                            mobileStatus?.isLive ? 'bg-emerald-500/20 text-emerald-500' :
                                'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'
                            }`}>
                            <Smartphone size={18} />
                            {mobileStatus?.hasAlert && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            )}
                        </div>

                        <div className="text-left w-full overflow-hidden">
                            <div className={`text-xs font-black uppercase tracking-wider leading-none mb-0.5 ${mobileStatus?.isLive ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                onSET Mobile
                            </div>
                            {mobileStatus?.hasAlert ? (
                                <div className="text-[9px] font-bold uppercase text-emerald-400 animate-pulse truncate">
                                    {mobileStatus.alertMsg || 'UPDATED'}
                                </div>
                            ) : (
                                <div className="text-[9px] font-bold opacity-60">
                                    {mobileStatus?.isLive ? 'Link Active' : 'Control Panel'}
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                <NavSectionTitle darkMode={darkMode}>Phases</NavSectionTitle>

                <div className="space-y-2 px-4">
                    {PHASES.map((phase) => {
                        const isExpanded = expandedPhase === phase.key;
                        const tools = TOOLS_BY_PHASE[phase.key];
                        // Highlight Logic: Is the active tool inside this phase?
                        const isActiveContext = activePhase === phase.key;

                        return (
                            <div key={phase.key} className={`border rounded-lg overflow-hidden transition-all mb-2 ${darkMode
                                ? 'border-zinc-800/50 bg-zinc-900/50'
                                : 'border-zinc-100 bg-white'
                                }`}>
                                {/* Accordion Header */}
                                <button
                                    onClick={() => togglePhase(phase.key)}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors
                                        ${isActiveContext
                                            ? (darkMode ? 'text-white' : 'text-black')
                                            : (darkMode ? 'bg-transparent text-zinc-300 hover:bg-zinc-800/50' : 'bg-white text-zinc-500 hover:bg-zinc-50')
                                        }
                                    `}
                                >
                                    {phase.label}
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isExpanded
                                            ? (darkMode ? 'text-white' : 'text-black')
                                            : (darkMode ? 'text-zinc-600' : 'text-zinc-300')
                                            }`}
                                    />
                                </button>

                                {/* Tools List */}
                                <div
                                    className={`
                                        overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                                        ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                                    `}
                                >
                                    <div className={`py-2 ${darkMode ? 'bg-black/20' : 'bg-zinc-50/30'}`}>
                                        {tools.map(tool => (
                                            <button
                                                key={tool.key}
                                                onClick={() => onToolSelect(tool.key, phase.key)}
                                                className={`
                                                    w-full text-left px-4 pl-8 py-2 text-[11px] transition-colors relative block
                                                    ${activeTool === tool.key
                                                        ? (darkMode ? 'text-white font-bold' : 'text-black font-bold')
                                                        : (darkMode ? 'text-zinc-400 hover:text-zinc-200 font-medium' : 'text-zinc-500 hover:text-black font-medium')
                                                    }
                                                `}
                                            >
                                                {activeTool === tool.key && (
                                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full ${darkMode ? 'bg-emerald-500' : 'bg-black'}`} />
                                                )}
                                                {alerts?.[tool.key] && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                                                )}
                                                {tool.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <UserMenu email={userEmail} />
        </aside>
    );
};
