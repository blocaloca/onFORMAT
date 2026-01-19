import React, { useState, useRef, useEffect } from 'react';

import { Smartphone, Lock, X, Minus, Globe, Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TOOLS_BY_PHASE } from './ExperimentalNav';

interface FloatingMobileControlProps {
    data: any; // The 'onset-mobile-control' document content
    onUpdate: (newData: any) => void;
    onClose: () => void;
    metadata?: any;
}

export const FloatingMobileControl = ({ data, onUpdate, onClose, metadata }: FloatingMobileControlProps) => {
    const defaultData = { isLive: false, toolGroups: {} };
    const safeData = data || defaultData;
    const toolGroups = safeData.toolGroups || {};

    // Exact state logic from ChatInterface
    const [position, setPosition] = useState({ x: 400, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Default High Right Position (Adapted for 320px width)
            // Ensure visibility by clamping
            const safeX = Math.min(window.innerWidth - 340, Math.max(20, window.innerWidth - 400));
            const safeY = Math.min(window.innerHeight - 500, Math.max(80, window.innerHeight - 600));
            setPosition({ x: safeX, y: safeY });
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && position.x > window.innerWidth - 50) {
            setPosition(p => ({ ...p, x: window.innerWidth - 350 }));
        }
    }, [position.x]);

    useEffect(() => {
        if (isDragging) {
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'move';
        } else {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e: MouseEvent) => {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: Math.max(0, e.clientY - dragOffset.current.y)
                });
            };
            const handleMouseUp = () => setIsDragging(false);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault(); // ChatInterface uses preventDefault
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const toggleGroup = (toolKey: string, group: string) => {
        const currentGroups = toolGroups[toolKey] || [];
        let newGroups;
        if (currentGroups.includes(group)) {
            newGroups = currentGroups.filter((g: string) => g !== group);
        } else {
            newGroups = [...currentGroups, group];
        }
        const updatedToolGroups = { ...toolGroups, [toolKey]: newGroups };
        onUpdate({ ...safeData, toolGroups: updatedToolGroups });
    };

    const toggleLive = () => {
        onUpdate({ ...safeData, isLive: !safeData.isLive });
    };



    console.log('Rendering FloatingMobileControl at:', position);

    return (
        <div
            className="fixed z-[9999] w-[1100px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col font-sans overflow-hidden"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {/* WINDOW CONTROL HEADER (Draggable) */}
            <div
                className="bg-zinc-900/50 p-2 flex items-center justify-between cursor-move select-none border-b border-zinc-800 backdrop-blur-md"
                onMouseDown={startDrag}
            >
                <div className="flex items-center gap-2 px-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Floating Window</span>
                </div>
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={onClose}
                    className="p-1 text-zinc-500 hover:text-white transition-colors rounded-md hover:bg-zinc-800"
                >
                    <X size={14} />
                </button>
            </div>

            {/* STATIC TEMPLATE CONTENT (Inlined) */}
            <div className="p-8 max-h-[80vh] overflow-y-auto bg-zinc-950 text-white">

                {/* TEMPLATE HEADER */}
                <div className="flex items-end justify-between mb-8 border-b border-zinc-900 pb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-1 text-white">onSET Mobile Control</h1>
                        <div className="flex items-center gap-3 text-zinc-500">
                            <span className="font-mono text-[10px] uppercase tracking-widest">
                                Sync Control
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">
                                {safeData.isLive ? 'Link Active' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <button
                            onClick={toggleLive}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest border transition-all
                                ${safeData.isLive
                                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
                                    : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${safeData.isLive ? 'bg-black animate-pulse' : 'bg-zinc-500'}`}></div>
                            {safeData.isLive ? 'LIVE' : 'GO LIVE'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COL: DOCUMENT SYNC (SPAN 2) */}
                    <div className="lg:col-span-2">
                        {/* ALERTS (Inlined logic) */}
                        {(() => {
                            const issues = metadata?.importedDITLog?.items?.filter((i: any) => i.eventType === 'issue' && i.status !== 'complete') || [];
                            if (issues.length > 0) {
                                return (
                                    <div className="space-y-2 mb-6">
                                        {issues.map((issue: any, i: number) => (
                                            <div key={i} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                <div className="flex-1">
                                                    <p className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider">DIT ISSUE: {issue.description || 'Check Log'}</p>
                                                    <p className="text-[9px] text-zinc-500 font-mono">Time: {issue.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                            return null;
                        })()}

                        <div className="space-y-8">
                            {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]: [string, any[]]) => {
                                const visibleTools = tools.filter((t: any) => t.key !== 'onset-mobile-control');
                                if (visibleTools.length === 0) return null;

                                return (
                                    <div key={phase}>
                                        <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-3 tracking-widest border-b border-zinc-900 pb-1">{phase.replace('_', ' ')}</h3>
                                        <div className="space-y-1">
                                            {visibleTools.map((tool: any) => {
                                                const groups = toolGroups[tool.key] || [];
                                                return (
                                                    <div
                                                        key={tool.key}
                                                        className="flex items-center justify-between p-2 pl-0 hover:bg-zinc-900/30 rounded transition-colors group"
                                                    >
                                                        <span className="text-xs font-bold uppercase text-zinc-300 group-hover:text-white transition-colors">{tool.label}</span>
                                                        <div className="flex items-center gap-1">
                                                            {['A', 'B', 'C'].map(group => {
                                                                const isActive = groups.includes(group);
                                                                const activeColor =
                                                                    group === 'A' ? 'bg-emerald-500 text-black border-emerald-500' :
                                                                        group === 'B' ? 'bg-blue-500 text-black border-blue-500' :
                                                                            'bg-amber-500 text-black border-amber-500';

                                                                return (
                                                                    <button
                                                                        key={group}
                                                                        onClick={() => toggleGroup(tool.key, group)}
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
                                    <Globe size={16} className="text-emerald-500" />
                                    Project Access
                                </h2>
                            </div>

                            <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
                                Invite crew to specific groups (A/B/C) via the Crew List document.
                            </p>

                            <div className="flex justify-center bg-white p-2 rounded-lg mb-4">
                                <QRCodeSVG
                                    value={`https://onformat.io/join/${metadata?.projectId || ''}`}
                                    size={150}
                                    level="M"
                                />
                            </div>

                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={`onformat.io/join/${metadata?.projectId?.substring(0, 6)}...`}
                                    className="flex-1 bg-black border border-zinc-700 rounded px-2 py-2 text-[10px] font-mono text-zinc-300 focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`https://onformat.io/join/${metadata?.projectId}`);
                                    }}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-[10px] font-bold uppercase transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
