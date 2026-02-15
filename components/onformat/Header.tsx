import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activePhase: 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'ON_SET' | 'POST';
  onPhaseChange: (phase: 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'ON_SET' | 'POST') => void;
  onSave: () => void;
  onCompletePhase: () => void;
}

const PHASES = ['DEVELOPMENT', 'PRE_PRODUCTION', 'ON_SET', 'POST'] as const;

import { useTheme } from '@/components/ThemeProvider';

export const Header = ({ activePhase, onPhaseChange, onSave, onCompletePhase }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <header className={`flex justify-between items-center px-6 py-3 border-b transition-colors ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
      <div className="flex items-center gap-6">
        {/* Branding Removed as requested */}
      </div>

    </header>
  );
};
