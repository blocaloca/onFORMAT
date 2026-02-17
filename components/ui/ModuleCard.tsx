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
        <div className={`
            border border-zinc-200 dark:border-zinc-800 
            bg-white dark:bg-zinc-950 
            flex flex-col 
            ${className}
        `}>
            {/* Technical Header */}
            {(title || rightContent) && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        {title && (
                            <h3 className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none">
                                {title}
                            </h3>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {rightContent}
                    </div>
                </div>
            )}

            {/* Content Area */}
            {!isCollapsed && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
};
