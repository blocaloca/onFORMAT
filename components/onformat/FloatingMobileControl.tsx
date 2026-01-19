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
            className="fixed z-[9999] w-[600px] bg-black/95 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl flex flex-col font-sans overflow-hidden transition-all duration-300 ring-1 ring-white/10"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {/* HEADER */}
            <div
                className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-black p-4 flex items-center justify-between cursor-move select-none border-b border-zinc-800/50"
                onMouseDown={startDrag}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-1.5 rounded-md border border-emerald-500/20">
                        <Smartphone size={16} className="text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-0.5">Mobile Control</div>
                        <div className="text-[9px] font-medium text-emerald-500/80 tracking-wider">Live Session Manager</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white hover:bg-zinc-800/50 p-2 rounded-lg transition-all"
                        title="Close Panel"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                {/* TOP SECTION: LIVE & QR */}
                <div className="flex gap-6 mb-8">
                    {/* LIVE STATUS CARD */}
                    <div className="flex-1 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">System Status</span>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-3 h-3 rounded-full ${safeData.isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`}></div>
                                <span className={`text-sm font-bold tracking-tight ${safeData.isLive ? 'text-white' : 'text-zinc-400'}`}>
                                    {safeData.isLive ? 'Sync Active' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={toggleLive}
                            className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${safeData.isLive
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'}`}
                        >
                            {safeData.isLive ? 'Stop Session' : 'Go Live'}
                        </button>
                    </div>

                    {/* QR CARD */}
                    <div className="flex-1 bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <QRCodeSVG
                            value={`https://onformat.io/join/${metadata?.projectId || ''}`}
                            size={100}
                            level="M"
                        />
                        <div className="text-center z-10">
                            <p className="text-[10px] text-zinc-900 font-bold uppercase tracking-wide">Scan to Join</p>
                        </div>
                    </div>
                </div>

                {/* TOOLS GRID */}
                <div className="space-y-8">
                    {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]: [string, any[]]) => {
                        const visibleTools = tools.filter((t: any) => t.key !== 'onset-mobile-control');
                        if (visibleTools.length === 0) return null;

                        return (
                            <div key={phase}>
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{phase.replace('_', ' ')}</h3>
                                    <div className="h-px flex-1 bg-zinc-800/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {visibleTools.map((tool: any) => {
                                        const groups = toolGroups[tool.key] || [];
                                        const totalActive = groups.length;

                                        return (
                                            <div key={tool.key} className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between group/card ${totalActive > 0 ? 'bg-zinc-900/80 border-zinc-700' : 'bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700/80'}`}>
                                                <span className={`text-[10px] font-bold uppercase truncate max-w-[120px] transition-colors ${totalActive > 0 ? 'text-white' : 'text-zinc-500 group-hover/card:text-zinc-300'}`}>
                                                    {tool.label}
                                                </span>
                                                <div className="flex gap-1">
                                                    {['A', 'B', 'C'].map(g => {
                                                        const isActive = groups.includes(g);
                                                        return (
                                                            <button
                                                                key={g}
                                                                onClick={() => toggleGroup(tool.key, g)}
                                                                className={`w-6 h-6 rounded-md text-[9px] font-black flex items-center justify-center transition-all scale-95 hover:scale-100
                                                                    ${isActive
                                                                        ? (g === 'A' ? 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]' : g === 'B' ? 'bg-blue-500 text-black shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.3)]')
                                                                        : 'bg-zinc-900 text-zinc-700 hover:bg-zinc-800 hover:text-zinc-400 border border-zinc-800'}
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
