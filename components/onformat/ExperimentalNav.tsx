import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronDown,
    ChevronLeft,
    Folder,
    LayoutGrid,
    MoreVertical,
    Plus,
    FolderOpen,
    Archive,
    Smartphone
} from 'lucide-react';
import { UserMenu } from './UserMenu';

// Types (Mirrored from WorkspaceEditor to ensure compatibility)
export type Phase = 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'PRODUCTION' | 'ON_SET' | 'POST' | 'STRATEGY';

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
        { key: 'budget', label: 'Budget' },
        { key: 'crew-list', label: 'Crew List' },
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
    PRODUCTION: [],
    STRATEGY: [],
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

const NavHeader = () => {
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? '/octo logo wt.png' : '/octo logo bk.png';

    return (
        <div className={`p-8 pb-4 text-foreground`}>
            <Link href="/" className="flex justify-center mb-10 hover:opacity-80 transition-opacity w-full">
                <img src={logoSrc} alt="onFORMAT Logo" className="h-20 w-auto object-contain" />
            </Link>

            <div className="h-px w-full bg-border opacity-50 mb-0" />
        </div>
    );
};

const NavSectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className={`px-4 font-sans text-[10px] font-bold uppercase tracking-widest mb-2 mt-6 text-zinc-500 dark:text-zinc-400`}>
        {children}
    </div>
);

interface NavItemProps {
    active?: boolean;
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
    onClick?: () => void;
    hasSubmenu?: boolean;
    isOpen?: boolean;
    darkMode?: boolean;
    onAction?: (e: React.MouseEvent) => void;
    href?: string;
    count?: number;
}

const NavItem = ({
    active,
    children,
    icon: Icon,
    onClick,
    hasSubmenu = false,
    isOpen = false,
    onAction,
    href,
    count
}: NavItemProps) => {
    const content = (
        <div className="flex items-center gap-3 truncate">
            {Icon && <Icon size={16} className={active ? 'text-zinc-900 dark:text-zinc-100 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100 dark:group-hover:text-zinc-300'} />}
            <span className={active ? 'font-bold truncate text-zinc-900 dark:text-zinc-100 dark:text-white font-mono text-[11px] tracking-wide uppercase' : 'truncate font-mono text-[11px] font-bold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 dark:text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100 dark:group-hover:text-zinc-300 transition-colors'}>
                {children}
            </span>
        </div>
    );

    const className = `
        w-full flex items-center justify-between px-3 py-2.5 transition-all group relative block rounded-md
        ${active
            ? 'bg-zinc-300/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 dark:text-white shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 dark:text-zinc-400 hover:bg-zinc-300/30 dark:hover:bg-zinc-800/50'
        }
    `;

    const inner = (
        <>
            {/* {active && (
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-r-sm bg-emerald-500`} />
            )} */}

            {content}

            {hasSubmenu && (
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={12} className="text-muted-foreground" />
                </div>
            )}

            {count !== undefined && (
                <div className={`ml-auto shrink-0 flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[9px] font-bold font-mono transition-colors border ${active ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600' : 'bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:border-zinc-800 dark:group-hover:border-zinc-600'}`}>
                    {count}
                </div>
            )}

            {onAction && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(e); }} className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all absolute right-2 hover:bg-zinc-200`}>
                    <MoreVertical size={12} className={'text-zinc-500 dark:text-zinc-400'} />
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFolderAction?: (folder: any) => void;
    userEmail?: string;
    darkMode?: boolean;
    onNewProject?: () => void;
    heading?: string;
    projects?: any[];
    isLocked?: boolean;
}

export const ExperimentalDashboardNav = ({
    folders,
    activeFolder,
    setActiveFolder,
    onComposeFolder,
    onFolderAction,
    userEmail,
    onNewProject,
    projects = [],
    isLocked = false
}: DashboardSidebarProps) => {

    const allProjectsCount = projects.length;

    return (
        <aside className={`w-64 shrink-0 h-screen sticky top-0 border-r flex flex-col font-sans transition-colors bg-zinc-200/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800 backdrop-blur-md`}>
            <NavHeader />

            {/* New Project Action - Premium Glass Refactor */}
            {onNewProject && (
                <div className="px-4 mb-2">
                    <button
                        onClick={onNewProject}
                        disabled={isLocked}
                        className={`
                            group relative w-full flex items-center justify-center gap-2 px-3 py-2.5 
                            text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300
                            ${isLocked
                                ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed border-zinc-400 dark:border-zinc-600'
                                : 'bg-[#3B82F6] border border-blue-400 shadow-md text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] active:scale-[0.98]'
                            }
                        `}
                    >
                        {/* Top Highlights */}
                        {!isLocked && <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-100" />}

                        <Plus size={14} className={!isLocked ? 'group-hover:rotate-90 transition-transform duration-300' : ''} />
                        New Project
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pt-2 scrollbar-hide">
                <NavSectionTitle>Folders</NavSectionTitle>
                <div className="px-2 space-y-1">
                    <NavItem icon={LayoutGrid} active={activeFolder === null} onClick={() => setActiveFolder(null)} count={allProjectsCount}>
                        All Projects
                    </NavItem>
                    {folders?.filter(f => f.type !== 'archived').map(f => {
                        const count = projects.filter(p => p.data?.folderId === f.id).length;
                        return (
                            <NavItem
                                key={f.id}
                                icon={activeFolder === f.id ? FolderOpen : Folder}
                                active={activeFolder === f.id}
                                onClick={() => setActiveFolder(f.id)}
                                onAction={onFolderAction ? () => onFolderAction(f) : undefined}
                                count={count}
                            >
                                {f.name}
                            </NavItem>
                        );
                    })}
                    <button
                        onClick={onComposeFolder}
                        className={`w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 dark:hover:text-zinc-300`}
                    >
                        <Plus size={12} /> New Folder
                    </button>
                </div>

                <div className="px-2 mt-8 space-y-1">
                    <NavItem icon={Archive} href="/dashboard/archived">
                        Archived
                    </NavItem>
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
    mobileStatus?: { isLive: boolean; hasAlert: boolean; alertMsg?: string }; // New prop
}

import { useTheme } from '@/components/ThemeProvider';

// ... (previous imports remain, ensure useTheme is imported)

export const ExperimentalWorkspaceNav = ({
    activeTool,
    activePhase,
    onToolSelect,
    // darkMode prop is removed in favor of context
    userEmail,
    mobileStatus,
    alerts
}: WorkspaceSidebarProps & { alerts?: Record<string, boolean> }) => {
    // const { theme } = useTheme();

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
        <aside className={`w-64 shrink-0 h-screen sticky top-0 border-r flex flex-col font-sans transition-colors bg-zinc-200/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800 backdrop-blur-md`}>
            <NavHeader />

            <div className="px-8 mb-6">
                <Link href="/dashboard" className={`flex items-center gap-2 text-[10px] uppercase tracking-wider transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100 border border-transparent hover:border-zinc-200 rounded px-2 py-1 -ml-2 w-fit font-bold`}>
                    <ChevronLeft size={12} /> Back to Projects
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 scrollbar-none">

                {/* Dedicated onSET Mobile Button */}
                <div className="px-4 mb-6">
                    <button
                        onClick={() => onToolSelect('onset-mobile-control', 'ON_SET')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group relative overflow-hidden
                            ${mobileStatus?.hasAlert
                                ? 'bg-destructive/10 border-destructive text-destructive'
                                : mobileStatus?.isLive
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-500'
                                    : 'bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm border-white/50 dark:border-zinc-700/50 shadow-sm text-zinc-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]'
                            }
                        `}
                    >
                        {/* Top Highlight for Premium Glass Feel */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                        {/* Status Indicator (Only Live) */}
                        {mobileStatus?.isLive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.5)]" />}

                        <div className={`p-1.5 rounded-lg ${mobileStatus?.hasAlert ? 'bg-destructive/20 text-destructive' :
                            mobileStatus?.isLive ? 'bg-[#3B82F6]/20 text-[#3B82F6]' :
                                'bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100'
                            }`}>
                            <Smartphone size={18} />
                            {mobileStatus?.hasAlert && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            )}
                        </div>

                        <div className="text-left w-full overflow-hidden">
                            <div className={`text-xs font-black uppercase tracking-wider leading-none mb-0.5 ${mobileStatus?.isLive ? 'text-[#3B82F6]' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                                onSET Mobile
                            </div>
                            {mobileStatus?.hasAlert ? (
                                <div className="text-[9px] font-bold uppercase text-destructive animate-pulse truncate">
                                    {mobileStatus.alertMsg || 'UPDATED'}
                                </div>
                            ) : (
                                <div className="text-[9px] font-bold opacity-60 font-mono">
                                    {mobileStatus?.isLive ? 'Link Active' : 'Control Panel'}
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                <NavSectionTitle>Phases</NavSectionTitle>

                <div className="space-y-2 px-4">
                    {PHASES.map((phase) => {
                        const isExpanded = expandedPhase === phase.key;
                        const tools = TOOLS_BY_PHASE[phase.key];
                        // Highlight Logic: Is the active tool inside this phase?
                        const isActiveContext = activePhase === phase.key;

                        return (
                            <div key={phase.key} className={`rounded-sm overflow-hidden transition-all mb-2 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm border border-white/50 dark:border-zinc-700/50 shadow-sm`}>
                                {/* Accordion Header */}
                                <button
                                    onClick={() => togglePhase(phase.key)}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 font-sans text-[10px] font-bold uppercase tracking-widest transition-colors
                                        ${isActiveContext
                                            ? 'text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/40 dark:bg-zinc-800/40 hover:text-zinc-700 dark:text-zinc-300'
                                        }
                                    `}
                                >
                                    {phase.label}
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isExpanded
                                            ? 'text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-400'
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
                                    <div className={`py-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-white/20 dark:border-zinc-700/20`}>
                                        {tools.map(tool => (
                                            <button
                                                key={tool.key}
                                                onClick={() => onToolSelect(tool.key, phase.key)}
                                                className={`
                                                    w-full text-left px-4 pl-8 py-2 text-xs transition-colors relative block
                                                    ${activeTool === tool.key
                                                        ? 'text-zinc-900 dark:text-zinc-100 font-bold bg-white/50 dark:bg-zinc-800/50'
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/30 dark:bg-zinc-800/30 font-medium'
                                                    }
                                                `}
                                            >
                                                {activeTool === tool.key ? (
                                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]`} />
                                                ) : (
                                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-50`} />
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
