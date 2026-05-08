'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { NewProjectDialog, PROJECT_COLORS } from '@/components/dashboard/NewProjectDialog';
import { CreateFolderDialog } from '@/components/dashboard/CreateFolderDialog';
import { MoveToFolderDialog } from '@/components/dashboard/MoveToFolderDialog';
import { FolderActionsDialog } from '@/components/dashboard/FolderActionsDialog';

import { ExperimentalDashboardNav } from '@/components/onformat/ExperimentalNav';
import { Copy, Trash2, LayoutGrid, List as ListIcon, FolderOpen, FolderInput, MoreVertical, CalendarClock, Archive, ArchiveRestore } from 'lucide-react';
import { GlobalGridContainer } from '@/components/dashboard/production-grid/GlobalGridContainer';
import { buildGridRows } from '@/lib/production-grid/parser';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { hasAccess } from '@/lib/permissions';
import { useTrialStatus } from '@/lib/useTrialStatus';

interface Folder {
    id: string;
    name: string;
    type: string;
}

interface Project {
    id: string;
    updated_at: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    user_id: string;
    is_demo?: boolean;
    status?: string;
}

type StatusTab = 'ACTIVE' | 'ARCHIVED' | 'ALL';

export default function DashboardPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();

    const [user, setUser] = useState<string | null>(null);
    const [view, setView] = useState<'grid' | 'list' | 'timeline'>('grid');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusTab, setStatusTab] = useState<StatusTab>('ACTIVE');

    // Folders
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [folderActionTarget, setFolderActionTarget] = useState<Folder | null>(null);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    const { isLocked } = useTrialStatus();

    const [projectToMove, setProjectToMove] = useState<Project | null>(null);
    const [projectToDuplicate, setProjectToDuplicate] = useState<Project | null>(null);

    const [toastMessage, setToastMessage] = useState<{ title: string, description?: string, type: 'error' | 'success' } | null>(null);

    // --- TAB SWITCHING ---

    const handleTabSwitch = (tab: StatusTab) => {
        setStatusTab(tab);
        setActiveFolder(null);
    };

    // --- HELPER FUNCTIONS ---

    const handleCreateFolder = (name: string, type: string) => {
        const newFolder: Folder = { id: crypto.randomUUID(), name, type };
        const updated = [...folders, newFolder];
        setFolders(updated);
        localStorage.setItem('onformat_folders', JSON.stringify(updated));
    };

    const handleMoveProject = async (folderId: string) => {
        if (!projectToMove) return;

        const sourceFolderId = projectToMove.data?.folderId;

        // Optimistic Update
        const updatedProjects = projects.map(p =>
            p.id === projectToMove.id
                ? { ...p, data: { ...p.data, folderId } }
                : p
        );
        setProjects(updatedProjects);

        // If the source folder is now empty and we're viewing it, reset to all
        if (sourceFolderId && activeFolder === sourceFolderId) {
            const stillHasProjects = updatedProjects.some(p => p.data?.folderId === sourceFolderId);
            if (!stillHasProjects) setActiveFolder(null);
        }

        // API Update
        try {
            await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
                body: JSON.stringify({
                    projectId: projectToMove.id,
                    data: { ...projectToMove.data, folderId }
                })
            });
        } catch (e) {
            console.error('Failed to move project', e);
            fetchProjects();
        }
    };

    const handleFolderAction = async (action: 'DELETE_ONLY' | 'DELETE_ALL' | 'ARCHIVE' | 'UNARCHIVE') => {
        if (!folderActionTarget) return;
        const targetId = folderActionTarget.id;

        // 1. Update Folder State
        if (action === 'DELETE_ONLY' || action === 'DELETE_ALL') {
            const newFolders = folders.filter(f => f.id !== targetId);
            setFolders(newFolders);
            localStorage.setItem('onformat_folders', JSON.stringify(newFolders));
            if (activeFolder === targetId) setActiveFolder(null);
        } else if (action === 'ARCHIVE') {
            const newFolders = folders.map(f => f.id === targetId ? { ...f, type: 'archived' } : f);
            setFolders(newFolders);
            localStorage.setItem('onformat_folders', JSON.stringify(newFolders));
            if (activeFolder === targetId) setActiveFolder(null);
        } else if (action === 'UNARCHIVE') {
            const newFolders = folders.map(f => f.id === targetId ? { ...f, type: 'default' } : f);
            setFolders(newFolders);
            localStorage.setItem('onformat_folders', JSON.stringify(newFolders));
        }

        // 2. Handle Projects
        const projectsInFolder = projects.filter(p => p.data.folderId === targetId);

        if (projectsInFolder.length > 0) {
            if (action === 'DELETE_ONLY') {
                // Move to Uncategorized
                const updatedProjects = projects.map(p => p.data.folderId === targetId ? { ...p, data: { ...p.data, folderId: null } } : p);
                setProjects(updatedProjects);

                projectsInFolder.forEach(async (p) => {
                    await fetch('/api/projects', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
                        body: JSON.stringify({ projectId: p.id, data: { ...p.data, folderId: null } })
                    });
                });
            } else if (action === 'DELETE_ALL') {
                // Delete Projects
                const updatedProjects = projects.filter(p => p.data.folderId !== targetId);
                setProjects(updatedProjects);

                projectsInFolder.forEach(async (p) => {
                    await fetch(`/api/projects?projectId=${p.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
                    });
                });
            }
            // Archive just keeps them in the now-archived folder
        }

        setFolderActionTarget(null);
    };

    // --- DATA FETCHING ---
    // Fetches all projects regardless of status so tab counts are always accurate

    const fetchProjects = React.useCallback(async () => {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        if (!user) setUser(authUser.email || null);

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', authUser.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Fetch Error:', error.message);
        }

        if (data) {
            setProjects(data);
        }
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, user]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login');
                return;
            }

            setUser(user.email || null);

            // PHASE 1 HANDSHAKE: Link auth.uid to crew_membership
            if (user.email) {
                try {
                    const { error } = await supabase
                        .from('crew_membership')
                        .update({ user_id: user.id })
                        .ilike('user_email', user.email)
                        .is('user_id', null);

                    if (error) console.warn("Handshake Error (Non-Critical - Verify Schema):", error);
                } catch (e) {
                    console.warn("Handshake Failed", e);
                }
            }

            // Load Folders
            const savedFolders = localStorage.getItem('onformat_folders');
            if (savedFolders) {
                try { setFolders(JSON.parse(savedFolders)); } catch { }
            }

            fetchProjects();
        };

        checkAuth();
    }, [router, fetchProjects, supabase]);

    // --- MAIN ACTIONS ---

    const handleCreateProject = async (name: string, client: string, producer: string, color: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Authentication Error: Please reload.');
            return;
        }

        const targetUserId = user.id;

        const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_tier').eq('id', user.id).single();

        const isFounderUser = hasAccess({ email: user.email }, 'enterprise');

        let payloadData = {
            clientName: client,
            producer: producer,
            color: color,
            persona: 'DEFAULT'
        };

        if (projectToDuplicate) {
            const existingData = JSON.parse(JSON.stringify(projectToDuplicate.data));
            payloadData = {
                ...existingData,
                clientName: client,
                producer: producer,
                color: color,
                persona: existingData.persona || 'DEFAULT'
            };
        }

        const payload = {
            userId: targetUserId,
            userEmail: user,
            name: name,
            data: payloadData,
        };

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok) {
                console.error('API Error:', result);
                if (result.code === 'PROJECT_LIMIT_REACHED' || result.code === 'TRIAL_EXPIRED') {
                    setIsUpgradeOpen(true);
                    setIsDialogOpen(false);
                    return;
                }
                throw new Error(result.error || 'Failed to create/duplicate project');
            }

            setProjectToDuplicate(null);
            fetchProjects();

        } catch (error: any) {
            console.error('Project Creation Error:', error);
            alert(`Error creating project: ${error.message || 'Unknown error'}. \n\nCheck your Vercel Environment Variables (SUPABASE_SERVICE_ROLE_KEY) and ensure you ran the SQL Migration on Production.`);
        }
    };

    const handleDuplicate = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setProjectToDuplicate(project);
        setIsDialogOpen(true);
    };

    const deleteProject = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${name}"?\nThis action cannot be undone.`)) {
            try {
                const res = await fetch(`/api/projects?projectId=${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
                });

                if (!res.ok) {
                    const result = await res.json();
                    throw new Error(result.error || 'Failed to delete');
                }

                fetchProjects();
                setToastMessage({ title: 'Project Deleted', type: 'success' });
                setTimeout(() => setToastMessage(null), 3000);
            } catch (error: any) {
                console.error(error);
                setToastMessage({ title: 'Deletion Failed', description: error.message, type: 'error' });
                setTimeout(() => setToastMessage(null), 5000);
            }
        }
    };

    const openProject = (id: string) => {
        router.push(`/project/${id}`);
    };

    // --- DERIVED STATE ---

    const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
    const archivedCount = projects.filter(p => p.status === 'ARCHIVED').length;
    const allCount = projects.length;

    // Status filter first, then folder filter (folder filter only in ACTIVE tab)
    const tabFiltered = statusTab === 'ACTIVE'
        ? projects.filter(p => p.status === 'ACTIVE')
        : statusTab === 'ARCHIVED'
        ? projects.filter(p => p.status === 'ARCHIVED')
        : projects;

    const filteredProjects = statusTab !== 'ACTIVE'
        ? tabFiltered
        : tabFiltered.filter(p => {
            if (activeFolder === 'ARCHIVED') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const folder = folders.find(f => f.id === p.data?.folderId);
                return folder?.type === 'archived';
            }
            if (activeFolder) {
                return p.data?.folderId === activeFolder;
            }
            if (!p.data?.folderId) return true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const folder = folders.find(f => f.id === p.data.folderId);
            return folder?.type !== 'archived';
        });

    const pageTitle = statusTab === 'ACTIVE' ? 'Projects' : statusTab === 'ARCHIVED' ? 'Archived' : 'All Projects';

    const tabs = [
        { key: 'ACTIVE' as const, label: 'Active', count: activeCount },
        { key: 'ARCHIVED' as const, label: 'Archived', count: archivedCount },
        { key: 'ALL' as const, label: 'All', count: allCount },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
            <ExperimentalDashboardNav
                folders={folders}
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
                onComposeFolder={() => setIsCreateFolderOpen(true)}
                onFolderAction={(f) => setFolderActionTarget(f)}
                userEmail={user || undefined}
                darkMode={true}
                onNewProject={isLocked ? undefined : () => setIsDialogOpen(true)}
                isLocked={isLocked}
                projects={projects.filter(p => p.status === 'ACTIVE')}
            />

            <main className="flex-1 p-12 max-w-[1600px] overflow-y-auto h-screen">
                {/* Header */}
                <div className="mb-12">
                    {/* Title row */}
                    <div className="flex justify-between items-end pb-6">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
                                {pageTitle}
                            </h2>
                            <p className="text-xs text-zinc-400 tracking-wide">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>

                        {/* View toggle — top right, alone */}
                        <div className="flex border rounded-sm p-1 bg-muted border-border">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-2 transition-colors ${view === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-2 transition-colors ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="List View"
                            >
                                <ListIcon size={16} />
                            </button>
                            <button
                                onClick={() => setView('timeline')}
                                className={`p-2 transition-colors ${view === 'timeline' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Timeline View"
                            >
                                <CalendarClock size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Full-width tab bar */}
                    <div className="flex w-full border-b border-zinc-800">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabSwitch(tab.key)}
                                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors
                                    ${statusTab === tab.key
                                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                                        : 'text-zinc-500 hover:text-foreground'
                                    }`}
                            >
                                {tab.label} · {tab.count}
                            </button>
                        ))}
                    </div>
                </div>

                {statusTab === 'ACTIVE' && activeFolder === 'ARCHIVED' && folders.filter(f => f.type === 'archived').length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Archived Folders</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {folders.filter(f => f.type === 'archived').map(f => (
                                <div key={f.id} className="bg-zinc-50 border border-zinc-200 p-6 flex items-start justify-between group relative hover:border-black transition-colors">
                                    <div>
                                        <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Folder</div>
                                        <span className="font-bold text-lg text-zinc-700">{f.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFolderActionTarget(f); }}
                                        className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-200 rounded-sm transition-colors"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-zinc-400 animate-pulse font-mono text-sm uppercase">Loading Projects...</div>
                ) : !loading && filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-6">
                            {statusTab === 'ACTIVE' ? 'No active projects yet'
                                : statusTab === 'ARCHIVED' ? 'No archived projects'
                                : 'No projects yet'}
                        </p>
                        {statusTab !== 'ARCHIVED' && !isLocked && (
                            <button
                                onClick={() => setIsDialogOpen(true)}
                                className="px-6 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                            >
                                + New Project
                            </button>
                        )}
                    </div>
                ) : view === 'timeline' ? (
                    <div className="w-full h-full overflow-hidden">
                        <GlobalGridContainer
                            rows={buildGridRows(filteredProjects.map(p => ({
                                id: p.id,
                                name: p.name,
                                data: p.data
                            })))}
                        />
                    </div>
                ) : (
                    <div className={`
                        ${view === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6' : 'flex flex-col gap-4'}
                    `}>
                        {filteredProjects
                            .map((p) => {
                                const colorMap = PROJECT_COLORS.find(c => c.id === p.data?.color) || PROJECT_COLORS[0];
                                const isLight = colorMap.id === '#FFFFFF' || colorMap.id === '#FBBF24';
                                const textPrimary = isLight ? 'text-zinc-900' : 'text-white';
                                const textPrimaryHover = isLight ? 'hover:text-zinc-900' : 'hover:text-white';
                                const textSecondary = isLight ? 'text-zinc-500' : 'text-white/50';
                                const textTertiary = isLight ? 'text-zinc-400' : 'text-white/40';
                                const borderDiv = isLight ? 'border-zinc-300' : 'border-white/20';
                                const hoverBg = isLight ? 'hover:bg-black/5' : 'hover:bg-black/20';

                                const showArchive = statusTab === 'ACTIVE' || (statusTab === 'ALL' && p.status === 'ACTIVE');
                                const showRestore = statusTab === 'ARCHIVED' || (statusTab === 'ALL' && p.status === 'ARCHIVED');

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => openProject(p.id)}
                                        className={`
                                    transition-all cursor-pointer group relative hover:scale-[1.02] active:scale-100 duration-300
                                    ${view === 'grid'
                                                ? `${colorMap.bg} border-t ${borderDiv} shadow-xl hover:shadow-2xl ${textPrimary} rounded-sm rounded-tr-[3rem]`
                                                : `${colorMap.bg} border-t ${borderDiv} p-6 flex items-center justify-between rounded-sm shadow-sm hover:shadow-md ${textPrimary} transition-all`
                                            }
                                    ${view === 'grid' ? 'aspect-[3/2] p-8' : ''}
                                `}
                                        style={view === 'grid' ? {} : {}}
                                    >
                                        {view === 'grid' ? (
                                            <>
                                                <div className="absolute top-6 left-6 right-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            {p.data?.folderId && (
                                                                <div className={`flex items-center gap-1 text-[9px] font-bold uppercase ${textTertiary} mb-1`}>
                                                                    <FolderOpen size={10} />
                                                                    {folders.find(f => f.id === p.data.folderId)?.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            {showArchive && (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm('Archive this project?')) {
                                                                            const session = (await supabase.auth.getSession()).data.session;
                                                                            const res = await fetch('/api/projects/archive', {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${session?.access_token}`,
                                                                                },
                                                                                body: JSON.stringify({ id: p.id }),
                                                                            });
                                                                            if (!res.ok) {
                                                                                const result = await res.json();
                                                                                setToastMessage({ title: 'Archive Failed', description: result.error, type: 'error' });
                                                                                setTimeout(() => setToastMessage(null), 5000);
                                                                                return;
                                                                            }
                                                                            fetchProjects();
                                                                        }
                                                                    }}
                                                                    title="Archive"
                                                                    className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                                >
                                                                    <Archive size={14} />
                                                                </button>
                                                            )}
                                                            {showRestore && (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        const session = (await supabase.auth.getSession()).data.session;
                                                                        const res = await fetch('/api/projects/unarchive', {
                                                                            method: 'POST',
                                                                            headers: {
                                                                                'Content-Type': 'application/json',
                                                                                'Authorization': `Bearer ${session?.access_token}`,
                                                                            },
                                                                            body: JSON.stringify({ id: p.id }),
                                                                        });
                                                                        if (!res.ok) {
                                                                            const result = await res.json();
                                                                            setToastMessage({ title: 'Restore Failed', description: result.error, type: 'error' });
                                                                            setTimeout(() => setToastMessage(null), 5000);
                                                                            return;
                                                                        }
                                                                        setToastMessage({ title: 'Project Restored', type: 'success' });
                                                                        setTimeout(() => setToastMessage(null), 3000);
                                                                        fetchProjects();
                                                                    }}
                                                                    title="Restore"
                                                                    className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                                >
                                                                    <ArchiveRestore size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setProjectToMove(p); }}
                                                                className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                                title="Move to Folder"
                                                            >
                                                                <FolderInput size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDuplicate(e, p)}
                                                                className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                                title="Duplicate"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => deleteProject(e, p.id, p.name)}
                                                                className="p-1.5 bg-black/30 hover:bg-red-500/70 text-white rounded-full transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-4">
                                                    <div>
                                                        <div className={`text-[9px] font-bold ${textTertiary} uppercase mb-1`}>PROJECT:</div>
                                                        <h3 className={`text-xl font-black uppercase leading-tight tracking-tight line-clamp-2 ${textPrimary} transition-colors`}>
                                                            {p.name || 'Untitled'}
                                                        </h3>
                                                    </div>

                                                    <div className={`border-t ${borderDiv} pt-2`}>
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <div className={`text-[9px] font-bold ${textSecondary} uppercase mb-0.5`}>CLIENT:</div>
                                                                <div className={`text-xs font-bold uppercase ${textPrimary} truncate leading-none`}>
                                                                    {p.data?.clientName || 'No Client'}
                                                                </div>
                                                            </div>
                                                            <p className={`text-[9px] font-mono ${textSecondary} uppercase`}>
                                                                {new Date(p.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-8 flex-1">
                                                    <div className={`w-10 h-10 ${isLight ? 'bg-black/5' : 'bg-black/20'} border ${borderDiv} flex items-center justify-center text-lg rounded-sm ${textPrimary}`}>
                                                        📄
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h3 className={`font-sans font-black text-2xl tracking-tight leading-none truncate ${textPrimary} ${textPrimaryHover} transition-colors`}>{p.name}</h3>
                                                            <div className="flex items-center gap-2">
                                                                {showArchive && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('Archive this project?')) {
                                                                                const session = (await supabase.auth.getSession()).data.session;
                                                                                const res = await fetch('/api/projects/archive', {
                                                                                    method: 'POST',
                                                                                    headers: {
                                                                                        'Content-Type': 'application/json',
                                                                                        'Authorization': `Bearer ${session?.access_token}`,
                                                                                    },
                                                                                    body: JSON.stringify({ id: p.id }),
                                                                                });
                                                                                if (!res.ok) {
                                                                                    const result = await res.json();
                                                                                    setToastMessage({ title: 'Archive Failed', description: result.error, type: 'error' });
                                                                                    setTimeout(() => setToastMessage(null), 5000);
                                                                                    return;
                                                                                }
                                                                                fetchProjects();
                                                                            }
                                                                        }}
                                                                        title="Archive"
                                                                        className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                                    >
                                                                        <Archive size={14} />
                                                                    </button>
                                                                )}
                                                                {showRestore && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            const session = (await supabase.auth.getSession()).data.session;
                                                                            const res = await fetch('/api/projects/unarchive', {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${session?.access_token}`,
                                                                                },
                                                                                body: JSON.stringify({ id: p.id }),
                                                                            });
                                                                            if (!res.ok) {
                                                                                const result = await res.json();
                                                                                setToastMessage({ title: 'Restore Failed', description: result.error, type: 'error' });
                                                                                setTimeout(() => setToastMessage(null), 5000);
                                                                                return;
                                                                            }
                                                                            setToastMessage({ title: 'Project Restored', type: 'success' });
                                                                            setTimeout(() => setToastMessage(null), 3000);
                                                                            fetchProjects();
                                                                        }}
                                                                        title="Restore"
                                                                        className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                                    >
                                                                        <ArchiveRestore size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className={`text-[10px] font-mono uppercase tracking-widest ${textSecondary} mb-2`}>{p.data?.clientName || 'No Client'} • {p.data?.producerName || 'No Producer'}</p>
                                                    </div>
                                                    <p className={`text-[10px] font-mono ${textSecondary} uppercase`}>
                                                        Edited {new Date(p.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setProjectToMove(p); }}
                                                        className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                        title="Move to Folder"
                                                    >
                                                        <FolderInput size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDuplicate(e, p)}
                                                        className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => deleteProject(e, p.id, p.name)}
                                                        className="p-1.5 bg-black/30 hover:bg-red-500/70 text-white rounded-full transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </main>

            <MoveToFolderDialog
                isOpen={!!projectToMove}
                onClose={() => setProjectToMove(null)}
                folders={folders}
                onMove={handleMoveProject}
                projectName={projectToMove?.name || 'Project'}
            />

            <FolderActionsDialog
                isOpen={!!folderActionTarget}
                onClose={() => setFolderActionTarget(null)}
                folderName={folderActionTarget?.name || ''}
                onDeleteOnly={() => handleFolderAction('DELETE_ONLY')}
                onDeleteAll={() => handleFolderAction('DELETE_ALL')}
                onArchive={() => handleFolderAction('ARCHIVE')}
                isArchived={folderActionTarget?.type === 'archived'}
                onUnarchive={() => handleFolderAction('UNARCHIVE')}
            />

            <NewProjectDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setProjectToDuplicate(null);
                }}
                onCreate={handleCreateProject}
                mode={projectToDuplicate ? 'duplicate' : 'create'}
                initialData={projectToDuplicate ? {
                    name: `${projectToDuplicate.name} Copy`,
                    client: projectToDuplicate.data?.clientName || '',
                    producer: projectToDuplicate.data?.producer || ''
                } : undefined}
            />

            <CreateFolderDialog
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onCreate={handleCreateFolder}
            />

            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
            />

            {toastMessage && (
                <div className={`fixed bottom-6 right-6 z-[100] p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 ${toastMessage.type === 'error' ? 'bg-red-950/90 border-red-900/50 text-red-100' : 'bg-zinc-950/90 border-zinc-800 text-emerald-400'}`}>
                    <div className="mt-0.5">
                        {toastMessage.type === 'error' ? '❌' : '✅'}
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight">{toastMessage.title}</p>
                        {toastMessage.description && <p className="text-xs opacity-80 mt-1 max-w-xs">{toastMessage.description}</p>}
                    </div>
                    <button onClick={() => setToastMessage(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
