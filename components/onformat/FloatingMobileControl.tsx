import React, { useState, useRef, useEffect } from 'react';

import { Smartphone, Lock, X, Minus, Globe, Wifi, ChevronDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TOOLS_BY_PHASE } from './ExperimentalNav';

interface FloatingMobileControlProps {
    data: any; // The 'onset-mobile-control' document content
    onUpdate: (newData: any) => void;
    onClose: () => void;
    metadata?: any;
    crewList?: any;
    userEmail?: string;
    userRole?: string;
    latestNotification?: { msg: string; time: number } | null;
}

export const FloatingMobileControl = ({ data, onUpdate, onClose, metadata, crewList, userEmail, userRole, latestNotification }: FloatingMobileControlProps) => {
    const defaultData = { isLive: false, toolGroups: {} };
    const safeData = data || defaultData;
    const toolGroups = safeData.toolGroups || {};

    // Permissions Logic
    const getUserGroups = () => {
        if (!userEmail || !crewList?.crew) return [];
        const member = crewList.crew.find((m: any) => m.email?.toLowerCase() === userEmail.toLowerCase());
        return member?.onSetGroups || [];
    };

    const userGroups = getUserGroups();
    // Admin override: If role is 'admin' or 'owner', or no email provided (dev mode), or email not in crew list? 
    // Wait, if not in crew list, maybe they are admin? Or unauthorized?
    // Let's assume userRole 'admin'/'owner' sees all.
    const isAdmin = userRole === 'admin' || userRole === 'owner' || !userEmail;

    // Exact state logic from ChatInterface
    const [position, setPosition] = useState({ x: 400, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Center Position
            const width = 1000;
            const height = 800; // Approx max height
            const centerX = (window.innerWidth - width) / 2;
            const centerY = (window.innerHeight - height) / 2;

            // Clamp to ensure visibility
            const safeX = Math.max(20, Math.min(centerX, window.innerWidth - width - 20));
            const safeY = Math.max(80, Math.min(centerY, window.innerHeight - height - 80));

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

            {/* ALERT BANNER */}
            {latestNotification && (
                <div className="bg-emerald-900/20 border-b border-emerald-900/50 px-8 py-2 flex items-center justify-center animate-in slide-in-from-top-2 fade-in duration-500">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse">
                        {latestNotification.msg}
                    </span>
                </div>
            )}

            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

                {/* HEADER SECTION */}
                <div className="flex items-start justify-between mb-10 border-b border-zinc-700/50 pb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">ONSET MOBILE CONTROL</h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
                            <span className="text-zinc-500">SYNC CONTROL</span>
                            <span className="text-zinc-600">•</span>
                            <span className={safeData.isLive ? "text-emerald-500" : "text-rose-500"}>
                                {safeData.isLive ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={toggleLive}
                        className={`flex items-center gap-2 px-6 py-2 rounded border text-[11px] font-bold uppercase tracking-widest transition-all
                            ${safeData.isLive
                                ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
                                : 'bg-rose-600 border-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:bg-rose-500'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${safeData.isLive ? 'bg-black animate-pulse' : 'bg-white'}`}></div>
                        {safeData.isLive ? 'LIVE' : 'GO LIVE'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN: TOOLS LIST */}
                    <div className="lg:col-span-2 space-y-8">
                        {Object.entries(TOOLS_BY_PHASE).map(([phase, tools]: [string, any[]]) => {
                            // Filter logic
                            const visibleTools = tools.filter((t: any) => {
                                if (t.key === 'onset-mobile-control') return false;
                                if (isAdmin) return true; // Admins see all
                                const assignedGroups = toolGroups[t.key] || [];
                                // If NO groups assigned, is it visible? Assuming Yes for now? Or No?
                                // "only see the docs i am given permission to see".
                                // If list is empty, probably NO ONE sees it? Or EVERYONE?
                                // Let's assume if empty => Everyone sees it (Public). 
                                // Because default is empty.
                                if (assignedGroups.length === 0) return true;
                                return assignedGroups.some((g: string) => userGroups.includes(g));
                            });

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

                                                    {/* Controls only for Admin */}
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-2">
                                                            {['A', 'B', 'C'].map(group => {
                                                                const isActive = groups.includes(group);
                                                                // A=Emerald, B=Blue, C=Amber
                                                                const activeClass = group === 'A' ? 'bg-emerald-500 border-emerald-500 text-black' :
                                                                    group === 'B' ? 'bg-blue-500 border-blue-500 text-black' :
                                                                        'bg-amber-500 border-amber-500 text-black';

                                                                return (
                                                                    <button
                                                                        key={group}
                                                                        onClick={() => toggleGroup(tool.key, group)}
                                                                        className={`
                                                                            w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold border transition-all
                                                                            ${isActive
                                                                                ? activeClass
                                                                                : 'bg-[#252528] border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400'}
                                                                        `}
                                                                    >
                                                                        {group}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* If not Admin, maybe show badges? */}
                                                    {!isAdmin && groups.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {groups.filter((g: string) => userGroups.includes(g)).map((g: string) => (
                                                                <span key={g} className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                                                                    Group {g}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
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
