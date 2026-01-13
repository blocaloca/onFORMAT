import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

interface TemplateListProps {
    customTemplates: any[];
    builtInTemplates: any[];
    onTemplateClick: (template: any) => void;
    onDeleteTemplate: (template: any) => void;
    onCreateTemplate: () => void;
}

export const TemplateList = ({
    customTemplates,
    builtInTemplates,
    onTemplateClick,
    onDeleteTemplate,
    onCreateTemplate
}: TemplateListProps) => {
    return (
        <div id="templates-section">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Templates</h2>
                <GlassButton
                    variant="primary"
                    onClick={onCreateTemplate}
                    className="bg-purple-600 hover:bg-purple-700 border-none"
                >
                    + Create Template
                </GlassButton>
            </div>

            {/* My Templates */}
            {customTemplates.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-xl font-semibold text-gray-300 mb-6">
                        My Templates ({customTemplates.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {customTemplates.map((template) => (
                            <GlassCard
                                key={template.id}
                                className="!bg-white/5 hover:!bg-white/10 group flex flex-col h-full"
                                hoverEffect
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-4xl">{template.icon}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteTemplate(template);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-white/10 p-2 rounded-lg transition"
                                        title="Delete template"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <h4 className="font-semibold text-white mb-2 text-lg">{template.name}</h4>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">{template.description}</p>

                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 border-t border-white/5 pt-4">
                                    <span>{template.stages?.length || 0} stages</span>
                                    <span>•</span>
                                    <span>{template.stages?.reduce((sum: number, s: any) => sum + (s.documents?.length || 0), 0) || 0} documents</span>
                                </div>

                                <GlassButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onTemplateClick(template)}
                                    className="w-full"
                                >
                                    Use Template
                                </GlassButton>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Built-in Templates */}
            <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-300 mb-6">Built-in Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {builtInTemplates.map((template) => (
                        <GlassCard
                            key={template.id}
                            className="!bg-white/5 hover:!bg-white/10 flex flex-col h-full"
                            hoverEffect
                        >
                            <div className="mb-4">
                                <span className="text-4xl">{template.icon}</span>
                            </div>
                            <h4 className="font-semibold text-white mb-2 text-lg">{template.name}</h4>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">{template.description}</p>

                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 border-t border-white/5 pt-4">
                                <span>{template.stages.length} stages</span>
                                <span>•</span>
                                <span>{template.stages.reduce((sum: any, s: any) => sum + s.documents.length, 0)} documents</span>
                            </div>

                            <GlassButton
                                variant="secondary"
                                size="sm"
                                onClick={() => onTemplateClick(template)}
                                className="w-full"
                            >
                                Use Template
                            </GlassButton>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};
