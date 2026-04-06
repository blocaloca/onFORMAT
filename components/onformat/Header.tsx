import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { BetaFeedbackTrigger } from '../feedback/BetaFeedbackTrigger';

interface HeaderProps {
  projectName?: string;
  activeToolLabel?: string;
  syncStatus?: number;
}

export const Header = ({ projectName, activeToolLabel, syncStatus }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';

  const [isSyncing, setIsSyncing] = React.useState(false);
  const lastSync = React.useRef(syncStatus);

  React.useEffect(() => {
    if (syncStatus !== undefined && syncStatus !== lastSync.current) {
      setIsSyncing(true);
      const t = setTimeout(() => setIsSyncing(false), 2000);
      lastSync.current = syncStatus;
      return () => clearTimeout(t);
    }
  }, [syncStatus]);

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b transition-colors bg-background border-border relative">
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
            <span className="font-bold text-[#3B82F6] uppercase tracking-wider text-[10px] animate-in fade-in slide-in-from-left-1 flex items-center gap-2">
              {activeToolLabel}
              {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Syncing..." />}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <BetaFeedbackTrigger variant="icon" />
      </div>

    </header>
  );
};
