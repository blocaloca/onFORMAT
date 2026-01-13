import React from 'react';

interface HeaderProps {
  activePhase: 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP';
  onPhaseChange: (phase: 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP') => void;
  onSave: () => void;
  onCompletePhase: () => void;
}

const PHASES = ['CONCEPT', 'PLAN', 'EXECUTE', 'WRAP'] as const;

export const Header = ({ activePhase, onPhaseChange, onSave, onCompletePhase }: HeaderProps) => {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-industrial bg-industrial-surface">
      <div className="flex items-center gap-6">
        <span className="text-industrial-accent font-black tracking-tighter text-xl">onFORMAT</span>

      </div>
      <div className="flex gap-3">
        {/* Buttons removed for Document Nav Bar migration */}
      </div>
    </header>
  );
};
