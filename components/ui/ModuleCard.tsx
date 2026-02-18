import React from 'react';

interface ModuleCardProps {
    title?: string;
    rightContent?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export const ModuleCard = ({ title, rightContent, children, className = '', isCollapsed = false, onToggle }: ModuleCardProps) => {
    return (
        <div className={`relative flex flex-col rounded-xl overflow-hidden transition-all duration-300
            bg-white/80 backdrop-blur-md shadow-sm border border-zinc-200/50 hover:shadow-md
            dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-zinc-800/50
            ${className}`}
        >
            {(title || rightContent) && (
                <div className="px-5 py-4 border-b border-zinc-100/50 dark:border-zinc-800/50 flex justify-between items-center bg-white/40 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2">
                        {title && (
                            <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">{title}</h3>
                        )}
                    </div>
                    {rightContent && (
                        <div className="flex items-center gap-2">
                            {rightContent}
                        </div>
                    )}
                </div>
            )}

            {!isCollapsed && (
                <div className="flex-1 p-5">
                    {children}
                </div>
            )}
        </div>
    );
};
