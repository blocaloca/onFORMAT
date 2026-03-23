import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  projectName?: string;
  activeToolLabel?: string;
}

export const Header = ({ projectName, activeToolLabel }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b transition-colors bg-background border-border">
      <div className="flex items-center gap-2 text-xs font-mono tracking-tight text-zinc-500">
        <span className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer">PROJECTS</span>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>

        {/* Project Name: Active if no tool, otherwise link-like */}
        <span className={`${activeToolLabel ? 'font-medium text-zinc-600 dark:text-zinc-400' : 'font-bold text-[#3B82F6]'} transition-colors`}>
          {projectName || 'UNTITLED'}
        </span>

        {activeToolLabel && (
          <>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-[#3B82F6] uppercase tracking-wider text-[10px] animate-in fade-in slide-in-from-left-1">
              {activeToolLabel}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(darkMode ? 'light' : 'dark')}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

    </header>
  );
};
