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
    <header className={`flex justify-between items-center px-6 py-3 border-b transition-colors ${darkMode ? 'border-industrial bg-industrial-surface' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-center gap-6">
        <span className={`font-black tracking-tighter text-xl ${darkMode ? 'text-industrial-accent' : 'text-black'}`}>onFORMAT</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setTheme(darkMode ? 'light' : 'dark')}
          className={`p-2 rounded-full transition-colors ${darkMode ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
