import React from 'react';

type Phase = 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP';

interface PhaseSelectorProps {
    activePhase: Phase;
    phases: Record<Phase, { locked: boolean }>;
    onPhaseChange: (phase: Phase) => void;
}

const PHASES: Phase[] = ['CONCEPT', 'PLAN', 'EXECUTE', 'WRAP'];

export const PhaseSelector = ({ activePhase, phases, onPhaseChange }: PhaseSelectorProps) => {
    return (
        <nav className="flex gap-1 p-6 pb-0 bg-zinc-950">
            {PHASES.map((phase) => (
                <button
                    key={phase}
                    onClick={() => onPhaseChange(phase)}
                    className={`
            flex-1 py-3 border-t-2 text-[11px] font-bold tracking-widest text-left px-4 transition-all duration-200
            ${activePhase === phase
                            ? 'border-[#00FF41] text-white bg-zinc-800'
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                        }
          `}
                >
                    {phase}
                    {phases[phase].locked && (
                        <span className="ml-2 text-[8px] uppercase border border-zinc-600 px-1 rounded text-zinc-400">
                            Locked
                        </span>
                    )}
                </button>
            ))}
        </nav>
    );
};
