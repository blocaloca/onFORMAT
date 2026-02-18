import React from 'react';

interface HeaderProps {
  projectName?: string;
  activeToolLabel?: string;
}

export const Header = ({ projectName, activeToolLabel }: HeaderProps) => {

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b transition-colors bg-background border-border">
      <div className="flex items-center gap-2 text-xs font-mono tracking-tight text-zinc-500">
        <span className="hover:text-zinc-700 transition-colors cursor-pointer">PROJECTS</span>
        <span className="text-zinc-300">/</span>

        {/* Project Name: Active if no tool, otherwise link-like */}
        <span className={`${activeToolLabel ? 'font-medium text-zinc-600' : 'font-bold text-[#3B82F6]'} transition-colors`}>
          {projectName || 'UNTITLED'}
        </span>

        {activeToolLabel && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="font-bold text-[#3B82F6] uppercase tracking-wider text-[10px] animate-in fade-in slide-in-from-left-1">
              {activeToolLabel}
            </span>
          </>
        )}
      </div>

    </header>
  );
};
