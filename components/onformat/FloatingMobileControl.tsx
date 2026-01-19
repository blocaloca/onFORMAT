import React, { useState, useRef, useEffect } from 'react';

import { Smartphone, Lock, X, Minus, Globe, Wifi, ChevronDown } from 'lucide-react';
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
            className="fixed z-[9999] w-[1000px] bg-[#1E1E20] border border-zinc-800 rounded-lg shadow-2xl flex flex-col font-sans overflow-hidden text-white"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {/* DRAG HANDLE BAR */}
            <div
                className="bg-[#2D2D30] h-6 w-full cursor-move flex items-center justify-end px-2"
                onMouseDown={startDrag}
            >
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <ChevronDown size={14} />
                </button>
            </div>

            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

                {/* HEADER SECTION */}
                <div className="flex items-start justify-between mb-10 border-b border-zinc-700/50 pb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">ONSET MOBILE CONTROL</h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
                            <span className="text-zinc-500">SYNC CONTROL</span>
                            <span className="text-zinc-600">•</span>
                            <span className={safeData.isLive ? "text-emerald-500" : "text-emerald-500"}>
                                {safeData.isLive ? 'LIVE' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={toggleLive}
                        className={`flex items-center gap-2 px-6 py-2 rounded border text-[11px] font-bold uppercase tracking-widest transition-all
                            ${safeData.isLive
                                ? 'bg-emerald-500 border-emerald-500 text-black hover:bg-emerald-400'
                                : 'bg-transparent border-zinc-600 text-white hover:border-zinc-400'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${safeData.isLive ? 'bg-black' : 'bg-zinc-500'}`}></div>
                        {safeData.isLive ? 'LIVE' : 'GO LIVE'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN: TOOLS LIST */}
                    <div className="lg:col-span-2 space-y-8">
                        {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]: [string, any[]]) => {
                            const visibleTools = tools.filter((t: any) => t.key !== 'onset-mobile-control');
                            if (visibleTools.length === 0) return null;

                            return (
                                <div key={phase}>
                                    <h3 className="text-[11px] font-bold uppercase text-zinc-500 mb-4 border-b border-zinc-700/50 pb-2 tracking-widest">
                                        {phase.replace('_', ' ')}
                                    </h3>
                                    <div className="space-y-3">
                                        {visibleTools.map((tool: any) => {
                                            const groups = toolGroups[tool.key] || [];
                                            return (
                                                <div
                                                    key={tool.key}
                                                    className="flex items-center justify-between group"
                                                >
                                                    <span className="text-sm font-bold uppercase text-white tracking-wide">{tool.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        {['A', 'B', 'C'].map(group => {
                                                            const isActive = groups.includes(group);
                                                            return (
                                                                <button
                                                                    key={group}
                                                                    onClick={() => toggleGroup(tool.key, group)}
                                                                    className={`
                                                                        w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold border transition-all
                                                                        ${isActive
                                                                            ? 'bg-zinc-700 border-zinc-600 text-white'
                                                                            : 'bg-[#252528] border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}
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

                    {/* RIGHT COLUMN: PROJECT ACCESS CARD */}
                    <div>
                        <div className="bg-[#2D2D30] rounded-xl p-6 sticky top-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe size={16} className="text-emerald-500" />
                                <h2 className="text-sm font-black uppercase tracking-wide text-white">Project Access</h2>
                            </div>

                            <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed">
                                Invite crew to specific groups (A/B/C) via the Crew List document.
                            </p>

                            <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
                                <QRCodeSVG
                                    value={`https://onformat.io/join/${metadata?.projectId || ''}`}
                                    size={160}
                                    level="M"
                                />
                            </div>

                            <div className="flex bg-black rounded overflow-hidden border border-zinc-700">
                                <span className="flex-1 px-3 py-2 text-[10px] font-mono text-zinc-400 truncate flex items-center">
                                    onformat.io/join/{metadata?.projectId?.substring(0, 5)}...
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`https://onformat.io/join/${metadata?.projectId}`);
                                    }}
                                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 text-[10px] font-bold uppercase transition-colors"
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
