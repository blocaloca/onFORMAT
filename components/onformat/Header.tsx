import React from 'react';

interface HeaderProps {
  activePhase: 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP';
  onPhaseChange: (phase: 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP') => void;
  onSave: () => void;
  onCompletePhase: () => void;
}

const PHASES = ['CONCEPT', 'PLAN', 'EXECUTE', 'WRAP'] as const;

import { useTheme } from '@/components/ThemeProvider';

export const Header = ({ activePhase, onPhaseChange, onSave, onCompletePhase }: HeaderProps) => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <header className={`flex justify-between items-center px-6 py-3 border-b transition-colors ${darkMode ? 'border-industrial bg-industrial-surface' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-center gap-6">
        <span className={`font-black tracking-tighter text-xl ${darkMode ? 'text-industrial-accent' : 'text-black'}`}>onFORMAT</span>
      </div>
      <div className="flex gap-3">
        {/* Buttons removed for Document Nav Bar migration */}
      </div>
    </header>
  );
};
