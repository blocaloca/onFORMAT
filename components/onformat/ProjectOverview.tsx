/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react';
import {
    Calendar, CheckSquare, Layout, Video, Zap,
    Flag
} from 'lucide-react';

interface ProjectOverviewProps {
    phases: any;
    onOpenTool: (toolKey: string) => void;
    activePhaseKey: string;
}

export const ProjectOverview = ({ phases, onOpenTool, activePhaseKey }: ProjectOverviewProps) => {

    // --- Helpers to calculate stats ---
    const calculatePhaseProgress = (phaseKey: string) => {
        const phase = phases[phaseKey];
        if (!phase) return 0;
        // Simple logic: if specific drafts exist, give points
        const drafts = phase.drafts || {};
        const totalTools = Object.keys(drafts).length; // Rough metric
        if (totalTools === 0) return 0;

        // Count non-empty drafts
        let completed = 0;
        Object.values(drafts).forEach((d: any) => {
            if (d && d.length > 10) completed++;
        });

        return Math.round((completed / 5) * 100); // Normalize to assume 5 tools per phase roughly
    };

    const getPhaseStatus = (phaseKey: string) => {
        const progress = calculatePhaseProgress(phaseKey);
        if (progress === 0) return 'Not Started';
        if (progress >= 100) return 'Completed';
        return 'In Progress';
    };

    const PHASE_META: any = {
        'STRATEGY': { label: 'Strategy', icon: Flag, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        'DEVELOPMENT': { label: 'Development', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        'PRE_PRODUCTION': { label: 'Pre-Production', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        'PRODUCTION': { label: 'Production', icon: Video, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        'POST_PRODUCTION': { label: 'Post-Production', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        'WRAP': { label: 'Wrap', icon: CheckSquare, color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    };

    return (
        <div className="bg-zinc-950 min-h-full p-8 text-zinc-200">
            <div className="max-w-6xl mx-auto flex flex-col gap-12">

                {/* Header Stats */}
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">Project Overview</h1>
                    <p className="text-zinc-500">Key metrics and phase progress.</p>
                </header>

                {/* Phase Timeline / Cards */}
                <div className="grid grid-cols-3 gap-6">
                    {Object.keys(PHASE_META).map((key: string) => { // Explicitly typed key as string
                        // Safety check if meta exists for key
                        if (!PHASE_META[key]) return null;

                        const meta = PHASE_META[key];
                        // Safety check for progress calculation
                        const progress = calculatePhaseProgress(key);
                        // Safety check for status calculation
                        const status = getPhaseStatus(key);
                        const Icon = meta.icon;
                        const isActive = activePhaseKey === key;

                        return (
                            <div
                                key={key}
                                className={`
                                    group relative rounded-xl border p-6 flex flex-col gap-4 transition-all
                                    ${isActive ? 'bg-zinc-900 border-zinc-700 shadow-xl' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'}
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-lg ${meta.bg} ${meta.color} border ${meta.border}`}>
                                        <Icon size={20} />
                                    </div>
                                    {isActive && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                            Current Phase
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{meta.label}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${status === 'Completed' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                            {status}
                                        </span>
                                        <span className="text-zinc-700">•</span>
                                        <span className="text-xs text-zinc-500 font-mono">{progress}%</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${status === 'Completed' ? 'bg-emerald-500' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}
                                        style={{ width: `${Math.max(5, progress)}%` }} // Minimum 5% visible
                                    />
                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => onOpenTool(key)} // Open phase not specific tool yet?
                                    className="absolute inset-0 z-10"
                                    title={`Open ${meta.label}`}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Recent Activity Placeholder */}
                <div className="border-t border-zinc-900 pt-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Recent Activity</h3>
                    <div className="flex flex-col gap-4 opacity-50">
                        <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono">
                            <span>10:42 AM</span>
                            <span className="text-zinc-400">David updated the <strong>Budget</strong></span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono">
                            <span>09:15 AM</span>
                            <span className="text-zinc-400">Sarah approved <strong>Call Sheet</strong></span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
