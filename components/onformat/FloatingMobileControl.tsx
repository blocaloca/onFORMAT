import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Lock, X, Minus, Globe, Wifi } from 'lucide-react';
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

    // ---------------------------------------------------------------------------
    // DRAGGABLE LOGIC (Copied & Adapted from ChatInterface)
    // ---------------------------------------------------------------------------
    const [position, setPosition] = useState({ x: 400, y: 100 }); // Safe default (clear of sidebar)
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Initial position: Bottom right-ish, but check bounds
        if (typeof window !== 'undefined') {
            // Ensure it doesn't spawn off-screen
            const x = Math.min(window.innerWidth - 350, Math.max(0, window.innerWidth - 400));
            const y = Math.min(window.innerHeight - 500, Math.max(0, window.innerHeight - 600));
            setPosition({ x, y });
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: Math.max(0, e.clientY - dragOffset.current.y)
                });
            }
        };
        const handleMouseUp = () => { isDragging.current = false; };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDrag = (e: React.MouseEvent) => {
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    // ---------------------------------------------------------------------------
    // CONTROL LOGIC
    // ---------------------------------------------------------------------------
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
            className="fixed z-[9999] w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col font-sans overflow-hidden"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {/* HEADER */}
            <div
                className="bg-zinc-900 p-3 flex items-center justify-between cursor-move select-none border-b border-zinc-800"
                onMouseDown={startDrag}
            >
                <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Mobile Control</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <Minus size={14} />
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="p-4 max-h-[400px] overflow-y-auto">

                {/* LIVE TOGGLE */}
                <div className="flex items-center justify-between mb-6 bg-black p-3 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${safeData.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            {safeData.isLive ? 'Sync Active' : 'Sync Offline'}
                        </span>
                    </div>
                    <button
                        onClick={toggleLive}
                        className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-colors ${safeData.isLive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
                    >
                        {safeData.isLive ? 'Stop' : 'Go Live'}
                    </button>
                </div>

                {/* QR CODE LINK */}
                <div className="mb-6 pb-6 border-b border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold uppercase text-zinc-500">Project Link</p>
                        <button
                            onClick={() => {
                                const url = `https://onformat.io/join/${metadata?.projectId}`;
                                navigator.clipboard.writeText(url);
                            }}
                            className="text-[9px] text-emerald-500 hover:text-emerald-400 font-bold uppercase"
                        >
                            Copy URL
                        </button>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[9px] font-mono text-zinc-400 truncate select-all">
                        onformat.io/join/{metadata?.projectId?.substring(0, 8)}...
                    </div>
                </div>

                {/* VISIBILITY CONTROLS */}
                <div className="space-y-6">
                    {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]: [string, any[]]) => {
                        const visibleTools = tools.filter((t: any) => t.key !== 'onset-mobile-control');
                        if (visibleTools.length === 0) return null;

                        return (
                            <div key={phase}>
                                <h3 className="text-[9px] font-black uppercase text-zinc-600 mb-2 truncate">{phase.replace('_', ' ')}</h3>
                                <div className="space-y-1">
                                    {visibleTools.map((tool: any) => {
                                        const groups = toolGroups[tool.key] || [];
                                        // Simplified visual for compact view
                                        const totalActive = groups.length;

                                        return (
                                            <div key={tool.key} className="flex items-center justify-between group">
                                                <span className={`text-[10px] font-bold uppercase truncate max-w-[120px] transition-colors ${totalActive > 0 ? 'text-white' : 'text-zinc-500'}`}>
                                                    {tool.label}
                                                </span>
                                                <div className="flex gap-0.5">
                                                    {['A', 'B', 'C'].map(g => {
                                                        const isActive = groups.includes(g);
                                                        return (
                                                            <button
                                                                key={g}
                                                                onClick={() => toggleGroup(tool.key, g)}
                                                                className={`w-5 h-5 rounded-[2px] text-[8px] font-black flex items-center justify-center transition-colors
                                                                    ${isActive
                                                                        ? (g === 'A' ? 'bg-emerald-500 text-black' : g === 'B' ? 'bg-blue-500 text-black' : 'bg-amber-500 text-black')
                                                                        : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'}
                                                                `}
                                                            >
                                                                {g}
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
        </div>
    );
};
