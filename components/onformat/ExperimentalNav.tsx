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

const NavHeader = () => (
    <div className={`p-8 pb-4 text-foreground`}>
        <Link href="/" className="block w-32 mb-10 hover:opacity-80 transition-opacity">
            <img src="/logo-white.png" alt="onFORMAT" className="w-full h-auto object-contain bg-foreground p-1 invert dark:invert-0" />
        </Link>

        <div className="h-px w-full bg-border opacity-50 mb-0" />
    </div>
);

const NavSectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className={`px-4 text-[10px] font-bold uppercase tracking-widest mb-2 mt-6 text-muted-foreground`}>
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
}

const NavItem = ({
    active,
    children,
    icon: Icon,
    onClick,
    hasSubmenu = false,
    isOpen = false,
    onAction,
    href
}: NavItemProps) => {
    const content = (
        <div className="flex items-center gap-3 truncate">
            {Icon && <Icon size={16} className={active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} />}
            <span className={active ? 'font-bold truncate' : 'truncate'}>{children}</span>
        </div>
    );

    const className = `
        w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-all group relative block
        ${active
            ? 'text-foreground bg-muted'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }
    `;

    const inner = (
        <>
            {active && (
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-r-sm bg-primary`} />
            )}

            {content}

            {hasSubmenu && (
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={12} className="text-muted-foreground" />
                </div>
            )}

            {onAction && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(e); }} className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all absolute right-2 hover:bg-background`}>
                    <MoreVertical size={12} className={'text-muted-foreground'} />
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
    onNewProject,
    AiComponent
}: DashboardSidebarProps) => {

    return (
        <aside className={`w-64 shrink-0 h-screen sticky top-0 border-r flex flex-col font-sans transition-colors bg-zinc-200/60 border-zinc-300 backdrop-blur-md`}>
            <NavHeader />

            {/* AI Slot (Preserving Dashboard Chat functionality) */}
            {AiComponent && (
                <div className="px-4 mb-4">
                    {AiComponent}
                </div>
            )}

            {/* New Project Action - Premium Glass Refactor */}
            {onNewProject && (
                <div className="px-4 mb-2">
                    <button
                        onClick={onNewProject}
                        className={`
                            group relative w-full flex items-center justify-center gap-2 px-3 py-2.5 
                            text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300
                            bg-[#3B82F6] border border-blue-400 shadow-md text-white
                            hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]
                            active:scale-[0.98]
                        `}
                    >
                        {/* Top Highlights */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-100" />

                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        New Project
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pt-2 scrollbar-hide">
                <NavSectionTitle>Views</NavSectionTitle>
                <NavItem icon={LayoutGrid} active={activeFolder === null} onClick={() => setActiveFolder(null)}>
                    All Projects
                </NavItem>
                <NavItem icon={Archive} active={activeFolder === 'ARCHIVED'} onClick={() => setActiveFolder('ARCHIVED')}>
                    Archived
                </NavItem>

                <NavSectionTitle>Folders</NavSectionTitle>
                <div className="space-y-0.5">
                    {folders?.filter(f => f.type !== 'archived').map(f => (
                        <NavItem
                            key={f.id}
                            icon={activeFolder === f.id ? FolderOpen : Folder}
                            active={activeFolder === f.id}
                            onClick={() => setActiveFolder(f.id)}
                            onAction={onFolderAction ? () => onFolderAction(f) : undefined}
                        >
                            {f.name}
                        </NavItem>
                    ))}
                    <button
                        onClick={onComposeFolder}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors text-muted-foreground hover:text-foreground`}
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
        <aside className={`w-64 shrink-0 h-screen sticky top-0 border-r flex flex-col font-sans transition-colors bg-zinc-200/60 border-zinc-300 backdrop-blur-md`}>
            <NavHeader />

            <div className="px-8 mb-6">
                <Link href="/dashboard" className={`flex items-center gap-2 text-[10px] uppercase tracking-wider transition-colors text-zinc-500 hover:text-zinc-900 border border-transparent hover:border-zinc-200 rounded px-2 py-1 -ml-2 w-fit font-bold`}>
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
                                    ? 'bg-emerald-900/10 border-emerald-500/50 text-emerald-500'
                                    : 'bg-white/40 backdrop-blur-sm border-white/50 shadow-sm text-zinc-600 hover:bg-white/60 hover:text-zinc-900 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]'
                            }
                        `}
                    >
                        {/* Top Highlight for Premium Glass Feel */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                        {/* Status Indicator (Only Live) */}
                        {mobileStatus?.isLive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}

                        <div className={`p-1.5 rounded-lg ${mobileStatus?.hasAlert ? 'bg-destructive/20 text-destructive' :
                            mobileStatus?.isLive ? 'bg-emerald-500/20 text-emerald-500' :
                                'bg-zinc-100/50 text-zinc-500 group-hover:text-zinc-900'
                            }`}>
                            <Smartphone size={18} />
                            {mobileStatus?.hasAlert && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            )}
                        </div>

                        <div className="text-left w-full overflow-hidden">
                            <div className={`text-xs font-black uppercase tracking-wider leading-none mb-0.5 ${mobileStatus?.isLive ? 'text-emerald-400' : 'text-zinc-700 group-hover:text-black'}`}>
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
                            <div key={phase.key} className={`rounded-sm overflow-hidden transition-all mb-2 bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm`}>
                                {/* Accordion Header */}
                                <button
                                    onClick={() => togglePhase(phase.key)}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 font-sans text-[10px] font-bold uppercase tracking-widest transition-colors
                                        ${isActiveContext
                                            ? 'text-zinc-900'
                                            : 'text-zinc-500 hover:bg-white/40 hover:text-zinc-700'
                                        }
                                    `}
                                >
                                    {phase.label}
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isExpanded
                                            ? 'text-zinc-900'
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
                                    <div className={`py-2 bg-zinc-50/50 border-t border-white/20`}>
                                        {tools.map(tool => (
                                            <button
                                                key={tool.key}
                                                onClick={() => onToolSelect(tool.key, phase.key)}
                                                className={`
                                                    w-full text-left px-4 pl-8 py-2 text-xs transition-colors relative block
                                                    ${activeTool === tool.key
                                                        ? 'text-zinc-900 font-bold bg-white/50'
                                                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/30 font-medium'
                                                    }
                                                `}
                                            >
                                                {activeTool === tool.key && (
                                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-blue-500`} />
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
