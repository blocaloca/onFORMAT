import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface Tool {
    key: string;
    label: string;
}

interface ToolSelectorProps {
    tools: Tool[];
    activeTool: string;
    onToolChange: (tool: string) => void;
    activePhase: string;
    onPhaseChange: (phase: 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'ON_SET' | 'POST') => void;
    persona: 'STILLS' | 'MOTION' | 'HYBRID';
    setPersona: (p: 'STILLS' | 'MOTION' | 'HYBRID') => void;
    isAiDocked?: boolean;
    toggleAiDock?: () => void;
    userEmail?: string;
}

export const ToolSelector = ({ tools, activeTool, onToolChange, activePhase, onPhaseChange, persona, setPersona, isAiDocked, toggleAiDock, userEmail }: ToolSelectorProps) => {

    const PHASE_LABELS: Record<string, string> = {
        DEVELOPMENT: 'Development',
        PRE_PRODUCTION: 'Pre-Production',
        ON_SET: 'onSET',
        POST: 'Post-Production'
    };

    return (
        <aside className="w-64 flex-shrink-0 border-r border-industrial bg-industrial-surface h-full overflow-hidden flex flex-col z-20">
            {/* Top Section */}
            <div className="p-6 pb-2">
                <h1 className="text-xl font-black tracking-tighter mb-1">onFORMAT</h1>
                <Link
                    href="/dashboard"
                    className="text-[10px] bg-black text-white px-2 py-0.5 font-bold uppercase inline-block hover:bg-zinc-800 transition-colors mb-6"
                >
                    Back to Dashboard
                </Link>

                {/* AI Liaison Dock (Top) */}
                {isAiDocked && toggleAiDock && (
                    <button
                        onClick={toggleAiDock}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-3 py-2 text-xs font-bold uppercase tracking-widest border border-black hover:bg-zinc-800 transition-all shadow-sm mb-4"
                    >
                        <Sparkles size={14} className="text-industrial-accent" />
                        AI Liaison
                    </button>
                )}

                <div className="h-px w-full bg-zinc-200 mb-4" />
            </div>


            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="text-[9px] text-zinc-500 uppercase mb-2 font-bold">PROJECT PHASE</div>
                <div className="mb-6 space-y-1">
                    {Object.entries(PHASE_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => onPhaseChange(key as any)}
                            className={`
w-full text-left px-3 py-2 text-xs rounded-sm transition-colors border
              ${activePhase === key
                                    ? 'bg-black border-l-2 border-l-industrial-accent border-y-transparent border-r-transparent text-white'
                                    : 'border-transparent text-zinc-600 hover:bg-zinc-200 hover:text-black'
                                }
`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="space-y-1">
                    <div className="text-[9px] text-zinc-500 uppercase mb-2 font-bold">Documents</div>
                    {tools.map((tool) => (
                        <button
                            key={tool.key}
                            onClick={() => onToolChange(tool.key)}
                            className={`
w-full text-left px-3 py-2 text-xs rounded-sm transition-colors border
              ${activeTool === tool.key
                                    ? 'bg-black border-l-2 border-l-industrial-accent border-y-transparent border-r-transparent text-white'
                                    : 'border-transparent text-zinc-600 hover:bg-zinc-200 hover:text-black'
                                }
`}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Account Section (Matching Dashboard) */}
            <UserMenu email={userEmail} />
        </aside>
    );
};
