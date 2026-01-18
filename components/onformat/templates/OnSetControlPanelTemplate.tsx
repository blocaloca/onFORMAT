import React from 'react';
import { Smartphone, Lock, Zap, Users } from 'lucide-react';
import { TOOLS_BY_PHASE } from '../ExperimentalNav';

export const OnSetControlPanelTemplate = ({ data, onUpdate, isLocked, isPrinting, metadata }: any) => {

    // STRUCTURE: { "call-sheet": ["A", "B"], "script": ["A"] }
    const toolGroups = data.toolGroups || {};

    const toggleGroup = (toolKey: string, group: string) => {
        if (isLocked) return;
        const currentGroups = toolGroups[toolKey] || [];

        let newGroups;
        if (currentGroups.includes(group)) {
            newGroups = currentGroups.filter((g: string) => g !== group);
        } else {
            newGroups = [...currentGroups, group];
        }

        // Clean up empty arrays to keep data tidy? Optional.
        const updatedToolGroups = { ...toolGroups, [toolKey]: newGroups };
        onUpdate({ toolGroups: updatedToolGroups });
    };

    // Printing / PDF View -> Show Large QR Code
    if (isPrinting) {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-12 text-center bg-white text-black">
                <div className="border-[6px] border-black p-8 mb-12">
                    {/* Standardized Typography per request */}
                    <h1 className="text-4xl font-black uppercase tracking-tighter">onSET MOBILE</h1>
                </div>
                <div className="w-96 h-96 bg-black p-4 mb-8">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://onformat.io/join/${metadata?.projectId || 'demo'}`}
                        alt="Scan QR"
                        className="w-full h-full bg-white p-2 object-contain"
                    />
                </div >
                <p className="font-mono text-2xl uppercase font-bold tracking-widest">Scan to Join Set</p>
                <p className="font-sans text-lg text-zinc-600 uppercase mt-2">{metadata?.projectName || 'Untitled Project'}</p>
            </div >
        )
    }

    // Editor View
    return (
        <div className="max-w-5xl mx-auto py-10 px-6 bg-zinc-950 min-h-screen text-white rounded-xl border border-zinc-900 shadow-2xl">

            {/* HEADER: Standardized to match Document Layout */}
            <div className="flex items-end justify-between mb-8 border-b border-zinc-800 pb-4">
                <div>
                    {/* Smaller Title */}
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-1 text-white">onSET Mobile Control</h1>
                    <div className="flex items-center gap-3 text-zinc-500">
                        <span className="font-mono text-[10px] uppercase tracking-widest">
                            Sync Control
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">
                            {data.isLive ? 'Link Active' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <button
                        onClick={() => !isLocked && onUpdate({ isLive: !data.isLive })}
                        disabled={isLocked}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest border transition-all
                            ${data.isLive
                                ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
                                : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${data.isLive ? 'bg-black animate-pulse' : 'bg-zinc-500'}`}></div>
                        {data.isLive ? 'LIVE' : 'GO LIVE'}
                    </button>
                    {isLocked && <div className="flex items-center gap-1 text-zinc-600 text-[10px] uppercase font-bold"><Lock size={10} /> Locked</div>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: DOCUMENT SYNC (SPAN 2) */}
                <div className="lg:col-span-2">

                    {/* ALERTS SECTION */}
                    {(() => {
                        const issues = metadata?.importedDITLog?.items?.filter((i: any) => i.eventType === 'issue' && i.status !== 'complete') || [];
                        if (issues.length === 0 && !metadata?.latestNotification) return null;

                        return (
                            <div className="space-y-2 mb-6 animate-in fade-in slide-in-from-top-2">
                                {/* DIT ISSUES */}
                                {issues.map((issue: any, i: number) => (
                                    <div key={i} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <div className="flex-1">
                                            <p className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider">DIT ISSUE: {issue.description || 'Check Log'}</p>
                                            <p className="text-[9px] text-zinc-500 font-mono">Time: {issue.time}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* GENERAL NOTIFICATIONS */}
                                {metadata?.latestNotification && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3">
                                        <Zap className="text-emerald-500 fill-emerald-500 animate-pulse" size={16} />
                                        <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">{metadata.latestNotification.msg}</span>
                                        <span className="ml-auto text-[9px] text-zinc-500 font-mono">{new Date(metadata.latestNotification.time).toLocaleTimeString()}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

                    <div className="space-y-8">
                        {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]) => {
                            const visibleTools = tools.filter((t: any) => t.key !== 'onset-mobile-control');
                            if (visibleTools.length === 0) return null;

                            return (
                                <div key={phase}>
                                    <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-3 tracking-widest border-b border-zinc-800 pb-1">{phase.replace('_', ' ')}</h3>
                                    <div className="space-y-1">
                                        {visibleTools.map((tool: any) => {
                                            const groups = toolGroups[tool.key] || [];

                                            return (
                                                <div
                                                    key={tool.key}
                                                    className="flex items-center justify-between p-2 pl-0 hover:bg-zinc-900/30 rounded transition-colors group"
                                                >
                                                    <span className="text-xs font-bold uppercase text-zinc-300 group-hover:text-white transition-colors">{tool.label}</span>

                                                    {/* GROUP TOGGLES */}
                                                    <div className="flex items-center gap-1">
                                                        {['A', 'B', 'C'].map(group => {
                                                            const isActive = groups.includes(group);

                                                            // Colors: A=Emerald, B=Blue, C=Amber/Purple
                                                            const activeColor =
                                                                group === 'A' ? 'bg-emerald-500 text-black border-emerald-500' :
                                                                    group === 'B' ? 'bg-blue-500 text-black border-blue-500' :
                                                                        'bg-amber-500 text-black border-amber-500';

                                                            return (
                                                                <button
                                                                    key={group}
                                                                    onClick={() => toggleGroup(tool.key, group)}
                                                                    disabled={isLocked}
                                                                    className={`
                                                                        w-6 h-6 rounded flex items-center justify-center text-[9px] font-black border transition-all
                                                                        ${isActive
                                                                            ? activeColor
                                                                            : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'}
                                                                    `}
                                                                >
                                                                    {group}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT COL: PROJECT ACCESS (SPAN 1) */}
                <div>
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-white">
                                <Users size={16} className="text-emerald-500" />
                                Project Access
                            </h2>
                        </div>

                        <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
                            Invite crew to specific groups (A/B/C) via the Crew List document.
                        </p>

                        <div className="flex justify-center bg-white p-2 rounded-lg mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://onformat.io/join/${metadata?.projectId || 'demo'}`}
                                alt="Join QR"
                                className="w-32 h-32 object-contain"
                            />
                        </div>

                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={`onformat.io/join/${metadata?.projectId?.substring(0, 6)}...`}
                                className="flex-1 bg-black border border-zinc-700 rounded px-2 py-2 text-[10px] font-mono text-zinc-300 focus:outline-none"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(`https://onformat.io/join/${metadata?.projectId}`)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-[10px] font-bold uppercase transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

