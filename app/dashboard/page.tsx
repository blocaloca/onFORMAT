'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { NewProjectDialog, PROJECT_COLORS } from '@/components/dashboard/NewProjectDialog';
import { CreateFolderDialog } from '@/components/dashboard/CreateFolderDialog';
import { MoveToFolderDialog } from '@/components/dashboard/MoveToFolderDialog';
import { FolderActionsDialog } from '@/components/dashboard/FolderActionsDialog';

import { ExperimentalDashboardNav } from '@/components/onformat/ExperimentalNav';
import { UserMenu } from '@/components/onformat/UserMenu';
import { Copy, Trash2, LayoutGrid, List as ListIcon, Plus, FolderOpen, Sparkles, FolderPlus, FolderInput, MoreVertical, Archive, Smartphone } from 'lucide-react';

import { DEMO_PROJECT_DATA } from '@/lib/demoProject';

interface Folder {
    id: string;
    name: string;
    type: string;
}

interface Project {
    id: string;
    updated_at: string;
    name: string;
    data: any;
    user_id: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Folders
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [folderActionTarget, setFolderActionTarget] = useState<Folder | null>(null);



    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user.email || null);
            }
        };
        checkAuth();

        // Load Folders
        const savedFolders = localStorage.getItem('onformat_folders');
        if (savedFolders) {
            try { setFolders(JSON.parse(savedFolders)); } catch { }
        }

        fetchProjects();

    }, [router]);

    const handleCreateFolder = (name: string, type: string) => {
        const newFolder: Folder = { id: crypto.randomUUID(), name, type };
        const updated = [...folders, newFolder];
        setFolders(updated);
        localStorage.setItem('onformat_folders', JSON.stringify(updated));
    };



    const [projectToMove, setProjectToMove] = useState<Project | null>(null);
    const [projectToDuplicate, setProjectToDuplicate] = useState<Project | null>(null);

    const handleMoveProject = async (folderId: string) => {
        if (!projectToMove) return;

        // Optimistic Update
        const updatedProjects = projects.map(p =>
            p.id === projectToMove.id
                ? { ...p, data: { ...p.data, folderId } }
                : p
        );
        setProjects(updatedProjects);

        // API Update
        try {
            await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
                        body: JSON.stringify({ projectId: p.id, data: { ...p.data, folderId: null } })
                    });
                });
            } else if (action === 'DELETE_ALL') {
                // Delete Projects
                const updatedProjects = projects.filter(p => p.data.folderId !== targetId);
                setProjects(updatedProjects);

                projectsInFolder.forEach(async (p) => {
                    await fetch(`/api/projects?projectId=${p.id}`, { method: 'DELETE' });
                });
            }
            // Archive just keeps them in the now-archived folder
        }

        setFolderActionTarget(null);
    };

    const createDemoProject = async (userId: string, userEmail: string | null) => {
        try {
            const payload = {
                userId: userId,
                userEmail: userEmail,
                name: DEMO_PROJECT_DATA.projectName || 'Welcome Project',
                data: DEMO_PROJECT_DATA,
            };

            await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            localStorage.setItem(`onboarded_${userId}`, 'true');
            // Re-fetch silently
            const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
            if (data) setProjects(data);

        } catch (e) {
            console.error("Failed to create demo project", e);
        }
    };

    const creationLock = React.useRef(false);

    const fetchProjects = async () => {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // Update email state if not set
        if (!user) setUser(authUser.email || null);

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) {
            setProjects(data);

            const hasOnboarded = localStorage.getItem(`onboarded_${authUser.id}`);
            // If they have no projects, give them the demo (even if they onboarded before, maybe they want to restart)
            if (data.length === 0 && !creationLock.current) {
                creationLock.current = true;
                await createDemoProject(authUser.id, authUser.email || null);
                creationLock.current = false;
            }
        }
        setLoading(false);
    };

    const handleCreateProject = async (name: string, client: string, producer: string, color: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Authentication Error: Please reload.');
            return;
        }

        let targetUserId = user.id;

        // If Duplicating, keep the same owner? 
        // No, if I duplicate a project, I (the current user) should become the owner of the copy.
        // Unless we are admin acting on other's behalf.
        // For now, let's assume current user owns the new copy.
        // user.id is correct.

        let payloadData = {
            clientName: client,
            producer: producer,
            color: color,
            persona: 'DEFAULT'
        };

        // If Duplicating, merge with existing data (deep copy)
        if (projectToDuplicate) {
            const existingData = JSON.parse(JSON.stringify(projectToDuplicate.data));
            payloadData = {
                ...existingData,
                clientName: client,
                producer: producer,
                color: color,
                // Preserve persona if it exists in the duplicate, or default? 
                // User said "preserving the document data".
                // We should likely NOT overwrite persona if it's already set in the template.
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok) {
                console.error('API Error:', result);
                throw new Error(result.error || 'Failed to create/duplicate project');
            }

            // Success
            setProjectToDuplicate(null);
            fetchProjects();

        } catch (error: any) {
            alert('Error processing project: ' + error.message);
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
                });

                if (!res.ok) {
                    const result = await res.json();
                    throw new Error(result.error || 'Failed to delete');
                }

                fetchProjects();
            } catch (error: any) {
                alert('Error deleting project: ' + error.message);
            }
        }
    };

    const openProject = (id: string) => {
        router.push(`/project/${id}`);
    };

    const filteredProjects = projects.filter(p => {
        if (activeFolder === 'ARCHIVED') {
            // Show projects in archived folders
            const folder = folders.find(f => f.id === p.data?.folderId);
            return folder?.type === 'archived';
        }
        if (activeFolder) {
            return p.data?.folderId === activeFolder;
        }
        // All Projects filters out Archived Projects
        if (!p.data?.folderId) return true;
        const folder = folders.find(f => f.id === p.data.folderId);
        return folder?.type !== 'archived';
    });

    return (
        <div className="flex min-h-screen bg-zinc-900 text-white font-sans">

            {/* LEFT SIDEBAR */}
            {/* LEFT SIDEBAR - UPDATED */}
            <ExperimentalDashboardNav
                folders={folders}
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
                onComposeFolder={() => setIsCreateFolderOpen(true)}
                onFolderAction={(f) => setFolderActionTarget(f)}
                userEmail={user || undefined}
                darkMode={true}
                onNewProject={() => setIsDialogOpen(true)}

            />

            {/* MAIN CONTENT Area */}
            <main className="flex-1 p-12 max-w-[1600px] overflow-y-auto h-screen">

                {/* Top Bar: User Welcome + View Toggles */}
                <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-8">
                    <div>
                        <h2 className="text-4xl font-light mb-2">
                            {activeFolder === 'ARCHIVED'
                                ? 'Archived Projects'
                                : activeFolder
                                    ? folders.find(f => f.id === activeFolder)?.name || 'Folder'
                                    : 'Projects'}
                        </h2>
                        <p className="text-zinc-500 text-sm font-mono uppercase tracking-wide">
                            {filteredProjects.length} Active • {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex bg-white border border-zinc-200 rounded-sm p-1">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 transition-colors ${view === 'grid' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 transition-colors ${view === 'list' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
                            title="List View"
                        >
                            <ListIcon size={16} />
                        </button>
                    </div>
                </div>

                {/* Projects Content */}
                {activeFolder === 'ARCHIVED' && folders.filter(f => f.type === 'archived').length > 0 && (
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
                ) : (
                    <div className={`
                        ${view === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6' : 'flex flex-col gap-4'}
                    `}>


                        {/* Project Cards */}
                        {filteredProjects
                            .map((p) => {
                                const colorMap = PROJECT_COLORS.find(c => c.id === p.data?.color) || PROJECT_COLORS[0];
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => openProject(p.id)}
                                        className={`
                                    transition-all cursor-pointer group relative hover:scale-[1.02] active:scale-100 duration-300
                                    ${view === 'grid'
                                                ? `${colorMap.bg} ${colorMap.border} shadow-xl hover:shadow-2xl text-white rounded-sm rounded-tr-[3rem]`
                                                : `p-6 flex items-center justify-between ${colorMap.bg} ${colorMap.border} border rounded-lg shadow-sm hover:shadow-lg text-white`
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
                                                                <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-white/40 mb-1">
                                                                    <FolderOpen size={10} />
                                                                    {folders.find(f => f.id === p.data.folderId)?.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setProjectToMove(p); }}
                                                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                                                                title="Move to Folder"
                                                            >
                                                                <FolderInput size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDuplicate(e, p)}
                                                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                                                                title="Duplicate"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => deleteProject(e, p.id, p.name)}
                                                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-full transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-4">
                                                    <div>
                                                        <div className="text-[9px] font-bold text-white/40 uppercase mb-1">PROJECT:</div>
                                                        <h3 className="text-xl font-black uppercase leading-tight tracking-tight line-clamp-2 text-white transition-colors">
                                                            {p.name || 'Untitled'}
                                                        </h3>
                                                    </div>

                                                    <div className="border-t border-white/10 pt-2">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <div className="text-[9px] font-bold text-white/40 uppercase mb-0.5">CLIENT:</div>
                                                                <div className="text-xs font-bold uppercase text-white/90 truncate leading-none">
                                                                    {p.data?.clientName || 'No Client'}
                                                                </div>
                                                            </div>
                                                            <p className="text-[9px] font-mono text-white/30 uppercase">
                                                                {new Date(p.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-8 flex-1">
                                                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-lg">
                                                        📄
                                                    </div>
                                                    <div className="w-1/3">
                                                        <h3 className="text-md font-bold truncate">{p.name}</h3>
                                                        <p className="text-[10px] text-zinc-400 uppercase">{p.data?.clientName || 'No Client'}</p>
                                                    </div>
                                                    <p className="text-[10px] font-mono text-zinc-400 uppercase">
                                                        Edited {new Date(p.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setProjectToMove(p); }}
                                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                                                        title="Move to Folder"
                                                    >
                                                        <FolderInput size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDuplicate(e, p)}
                                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => deleteProject(e, p.id, p.name)}
                                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-full transition-colors"
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

            {/* Move Project Dialog */}
            <MoveToFolderDialog
                isOpen={!!projectToMove}
                onClose={() => setProjectToMove(null)}
                folders={folders}
                onMove={handleMoveProject}
                projectName={projectToMove?.name || 'Project'}
            />

            {/* Folder Actions Dialog */}
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

            {/* New Project Dialog */}
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


        </div>
    );
}

