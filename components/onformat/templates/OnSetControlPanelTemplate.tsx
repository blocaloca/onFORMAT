import React, { useState } from 'react';
import { CheckSquare, Square, Smartphone, Lock, Users, Zap, UserCog } from 'lucide-react';
import { TOOLS_BY_PHASE } from '../ExperimentalNav';

const COMMON_ROLES = ['Director', 'Producer', 'DP', 'DIT', 'Gaffer', '1st AC', 'Sound Mixer', 'Art Director', 'HMU', 'PA'];

export const OnSetControlPanelTemplate = ({ data, onUpdate, isLocked, isPrinting, metadata }: any) => {
    const selectedTools = (data.selectedTools as string[]) || [];

    // Role Config State (stored in data.roleConfig)
    // Structure: { "DIT": "dit-log", "Gaffer": "call-sheet" }
    const roleConfig = data.roleConfig || {};

    const toggleTool = (toolKey: string) => {
        if (isLocked) return;
        const newSelection = selectedTools.includes(toolKey)
            ? selectedTools.filter((t: string) => t !== toolKey)
            : [...selectedTools, toolKey];
        onUpdate({ selectedTools: newSelection });
    };

    const updateRoleConfig = (role: string, toolKey: string) => {
        if (isLocked) return;
        const newConfig = { ...roleConfig, [role]: toolKey };
        onUpdate({ roleConfig: newConfig });
    };

    // Flatten tools for dropdown
    const allTools = Object.values(TOOLS_BY_PHASE).flat();

    // Printing / PDF View -> Show Large QR Code
    if (isPrinting) {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-12 text-center bg-white text-black">
                <div className="border-[6px] border-black p-8 mb-12">
                    <h1 className="text-7xl font-black uppercase tracking-tighter">onSET MOBILE</h1>
                </div>
                <div className="w-96 h-96 bg-black p-4 mb-8">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://onformat.io/onset/${metadata?.projectId || 'demo'}`}
                        alt="Scan QR"
                        className="w-full h-full bg-white p-2 object-contain"
                    />
                </div>
                <p className="font-mono text-2xl uppercase font-bold tracking-widest">Scan to Join Set</p>
                <p className="font-sans text-lg text-zinc-600 uppercase mt-2">{metadata?.projectName || 'Untitled Project'}</p>
            </div>
        )
    }

    // Editor View
    return (
        <div className="max-w-5xl mx-auto py-10 px-6 bg-zinc-950 min-h-screen text-white rounded-xl border border-zinc-900 shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between mb-12 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 flex items-center gap-4">
                        <Smartphone size={40} className="text-emerald-500" />
                        onSET Mobile
                    </h1>
                    <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest pl-14">
                        Live Production Environment • {selectedTools.length} Active Docs
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <button
                        onClick={() => !isLocked && onUpdate({ isLive: !data.isLive })}
                        disabled={isLocked}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all
                            ${data.isLive
                                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
                                : 'bg-transparent border border-zinc-700 text-zinc-500 hover:border-emerald-900 hover:text-emerald-500'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${data.isLive ? 'bg-black animate-pulse' : 'bg-zinc-500'}`}></div>
                        {data.isLive ? 'Link Active' : 'Offline'}
                    </button>
                    {isLocked && <div className="flex items-center gap-1 text-zinc-600 text-[10px] uppercase font-bold"><Lock size={10} /> Configuration Locked</div>}
                </div>
            </div>

            {/* NOTIFICATIONS */}
            {metadata?.latestNotification && (
                <div className="mb-10 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex items-center gap-4">
                    <Zap className="text-emerald-500 fill-emerald-500 animate-pulse" size={18} />
                    <span className="text-emerald-400 font-mono text-sm font-bold uppercase tracking-wider">{metadata.latestNotification.msg}</span>
                    <span className="ml-auto text-[10px] text-zinc-500 font-mono">{new Date(metadata.latestNotification.time).toLocaleTimeString()}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT COL: DOCUMENT SYNC */}
                <div>
                    <div className="flex items-center gap-2 mb-6 text-zinc-100 pb-2 border-b border-zinc-800/50">
                        <CheckSquare size={18} />
                        <h2 className="text-xl font-black uppercase tracking-tight">Synced Documents</h2>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]) => {
                            // Filter out self
                            const visibleTools = tools.filter((t: any) => t.key !== 'onset-mobile-control');
                            if (visibleTools.length === 0) return null;

                            return (
                                <div key={phase}>
                                    <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-3 tracking-widest bg-zinc-900/50 inline-block px-2 py-1 rounded">{phase.replace('_', ' ')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {visibleTools.map((tool: any) => {
                                            const isSelected = selectedTools.includes(tool.key);
                                            return (
                                                <button
                                                    key={tool.key}
                                                    onClick={() => toggleTool(tool.key)}
                                                    disabled={isLocked}
                                                    className={`
                                                        flex items-center justify-between p-3 rounded-md border text-sm font-bold uppercase transition-all
                                                        ${isSelected
                                                            ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg'
                                                            : 'bg-transparent border-zinc-800 text-zinc-600 hover:bg-zinc-900 hover:text-zinc-400'}
                                                    `}
                                                >
                                                    <span>{tool.label}</span>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT COL: ROLE CONFIGURATION */}
                <div>

                    {/* CREW ACCESS CARD */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Users size={18} className="text-zinc-400" />
                                Project Access
                            </h2>
                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase px-2 py-1 rounded">Invite Only</span>
                        </div>

                        <p className="text-xs text-zinc-500 mb-4">Share this link with crew to grant access to the mobile dashboard.</p>

                        <div className="flex gap-2 mb-4">
                            <input
                                readOnly
                                value={`https://onformat.io/join/${metadata?.projectId?.substring(0, 8) || '...'}`}
                                className="flex-1 bg-black border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(`https://onformat.io/join/${metadata?.projectId}`)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="border-t border-zinc-800 pt-4 flex justify-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://onformat.io/join/${metadata?.projectId || 'demo'}`}
                                alt="Join QR"
                                className="w-24 h-24 bg-white p-1 rounded-lg"
                            />
                        </div>
                        <p className="text-center text-[10px] text-zinc-600 mt-2 font-mono uppercase">Scan to Join</p>
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-zinc-100 pb-2 border-b border-zinc-800/50">
                        <UserCog size={18} />
                        <h2 className="text-xl font-black uppercase tracking-tight">Role Configuration</h2>
                    </div>

                    <p className="text-xs text-zinc-500 font-mono mb-6 leading-relaxed">
                        Customize the mobile experience for each crew member.
                        Define which document they see first (Primary Card) when they log in.
                    </p>

                    <div className="space-y-3">
                        {COMMON_ROLES.map(role => {
                            const currentToolKey = roleConfig[role] || '';

                            return (
                                <div key={role} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-[10px] border border-zinc-700">
                                            {role.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-zinc-200 uppercase tracking-wide">{role}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-zinc-600 uppercase font-bold mr-2">Primary View:</span>
                                        <select
                                            value={currentToolKey}
                                            onChange={(e) => updateRoleConfig(role, e.target.value)}
                                            disabled={isLocked}
                                            className="bg-black border border-zinc-700 text-xs text-emerald-500 font-mono font-bold uppercase py-1.5 px-3 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                                        >
                                            <option value="">Default (Call Sheet)</option>
                                            {allTools.filter((t: any) => t.key !== 'onset-mobile-control').map((t: any) => (
                                                <option key={t.key} value={t.key}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                </div>

            </div>
        </div>
    );
};
