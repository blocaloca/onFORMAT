import React from 'react';

interface HeaderProps {
  projectName?: string;
  activeToolLabel?: string;
}

export const Header = ({ projectName, activeToolLabel }: HeaderProps) => {

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b transition-colors bg-background border-border">
      <div className="flex items-center gap-2 text-xs font-mono tracking-tight text-zinc-500">
        <span className="hover:text-foreground transition-colors cursor-pointer">PROJECTS</span>
        <span className="text-zinc-300">/</span>
        <span className="font-bold text-foreground">
          {projectName || 'UNTITLED'}
        </span>
        {activeToolLabel && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
              {activeToolLabel}
            </span>
          </>
        )}
      </div>

    </header>
  );
};
