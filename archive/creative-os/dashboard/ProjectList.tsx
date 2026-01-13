import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';

interface ProjectListProps {
    projects: any[];
    onDeleteProject: (project: any) => void;
    getTemplateIcon: (id: string) => string;
    getTemplateName: (id: string) => string;
}

export const ProjectList = ({
    projects,
    onDeleteProject,
    getTemplateIcon,
    getTemplateName
}: ProjectListProps) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

    const filteredProjects = projects.filter((project) => {
        if (!searchTerm) return true;
        return project.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleMenuClick = (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenuId(openMenuId === projectId ? null : projectId);
    };

    const handleDeleteClick = (e: React.MouseEvent, project: any) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteProject(project);
        setOpenMenuId(null);
    };

    return (
        <div className="mb-12">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-6">Recent Projects</h2>

                {projects.length > 0 && (
                    <div className="flex items-center gap-4 mb-8">
                        <GlassInput
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!bg-white/10 !border-white/10 text-white placeholder-gray-500"
                        />

                        <div className="flex gap-2">
                            <GlassButton
                                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                ⊞ Grid
                            </GlassButton>
                            <GlassButton
                                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                ≡ List
                            </GlassButton>
                        </div>
                    </div>
                )}
            </div>

            {projects.length > 0 && searchTerm && (
                <p className="text-sm text-gray-400 mb-4">
                    Showing {filteredProjects.length} of {projects.length} projects
                </p>
            )}

            {projects.length === 0 ? (
                <GlassCard className="text-center py-12 !bg-white/5 border-dashed border-white/20">
                    <p className="text-gray-400 text-lg">
                        No projects yet. Choose a template below to get started!
                    </p>
                </GlassCard>
            ) : filteredProjects.length === 0 ? (
                <GlassCard className="text-center py-12 !bg-white/5">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        No projects found for "{searchTerm}"
                    </h3>
                </GlassCard>
            ) : viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Link key={project.id} href={`/project/${project.id}`}>
                            <GlassCard hoverEffect className="h-full !bg-white/5 hover:!bg-white/10 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{getTemplateIcon(project.template_id)}</span>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
                                                {project.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {getTemplateName(project.template_id)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative" onClick={(e) => e.preventDefault()}>
                                        <button
                                            onClick={(e) => handleMenuClick(e, project.id)}
                                            className="text-gray-500 hover:text-white p-1 rounded transition"
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === project.id && (
                                            <div className="absolute right-0 top-8 bg-[#1D1D1F] border border-white/10 rounded-lg shadow-xl z-20 min-w-[120px] overflow-hidden">
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, project)}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                                        v{project.current_version}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {new Date(project.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredProjects.map((project) => (
                        <Link key={project.id} href={`/project/${project.id}`}>
                            <GlassCard hoverEffect className="!bg-white/5 hover:!bg-white/10 !p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{getTemplateIcon(project.template_id)}</span>
                                    <div>
                                        <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {getTemplateName(project.template_id)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-gray-400">v{project.current_version}</p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(project.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="relative" onClick={(e) => e.preventDefault()}>
                                        <button
                                            onClick={(e) => handleMenuClick(e, project.id)}
                                            className="text-gray-500 hover:text-white p-1 rounded transition"
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === project.id && (
                                            <div className="absolute right-0 top-8 bg-[#1D1D1F] border border-white/10 rounded-lg shadow-xl z-20 min-w-[120px] overflow-hidden">
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, project)}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
