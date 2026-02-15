'use client';

import React, { useState } from 'react';
import { ExperimentalWorkspaceNav, Phase } from '@/components/onformat/ExperimentalNav';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Printer,
    Sparkles,
    Settings,
    Save,
    MoreHorizontal,
    Search,
    Bell,
    User
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const MOCK_FOLDERS = [
    { id: '1', name: 'Commercials', type: 'folder' },
    { id: '2', name: 'Narrative', type: 'folder' },
    { id: '3', name: 'Music Videos', type: 'folder' },
];

const SHOT_SIZES = ['Wide', 'Full', 'Medium', 'Cowboy', 'Close Up', 'Extreme CU'];
const SHOT_ANGLES = ['Eye Level', 'Low Angle', 'High Angle', 'Overhead', 'Dutch'];
const SHOT_MOVEMENTS = ['Static', 'Pan', 'Tilt', 'Tracking', 'Steadicam', 'Handheld', 'Zoom'];

// --- MOCK COMPONENTS ---

const MockLightHeader = () => (
    <header className="h-14 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-widest">Nike Commercial</span>
                <span className="text-zinc-300">/</span>
                <span className="text-xs font-bold uppercase tracking-widest text-black">Pre-Production</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-xs focus:border-zinc-400 outline-none w-64 transition-all"
                />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-colors">
                <Bell size={16} />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></div>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-colors">
                <Settings size={16} />
            </button>
        </div>
    </header>
);

const MockLightNavbar = () => (
    <div className="h-12 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-14 z-10">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 mr-2">Shot List</span>

                {/* Version Selector Pill */}
                <div className="flex items-center bg-zinc-50 rounded-md border border-zinc-200 h-8">
                    <button className="h-full px-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-l-md transition-colors border-r border-zinc-200">
                        <ChevronLeft size={14} />
                    </button>
                    <div className="px-4 flex flex-col justify-center h-full">
                        <span className="block text-[10px] font-black uppercase text-zinc-900 tracking-widest leading-none">
                            Version 3
                        </span>
                    </div>
                    <button className="h-full px-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-r-md transition-colors border-l border-zinc-200">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="h-4 w-px bg-zinc-200 mx-2" />

            {/* Actions */}
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50 rounded-md text-zinc-500 hover:text-emerald-600 transition-colors">
                <Plus size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">New Ver</span>
            </button>
        </div>

        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-sm">
                <Sparkles size={14} />
                <span>AI Analyze</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-sm">
                <Printer size={14} />
                <span>Export PDF</span>
            </button>
        </div>
    </div>
);

// --- MAIN PAGE ---

export default function LightModeTestPage() {
    const [activeTool, setActiveTool] = useState('shot-scene-book');
    const [activePhase, setActivePhase] = useState<Phase>('PRE_PRODUCTION');

    // Reuse Shot List Logic
    interface Shot {
        id: string;
        scene: string;
        size: string;
        angle: string;
        movement: string;
        description: string;
    }
    const [shots, setShots] = useState<Shot[]>([
        { id: '1', scene: '1A', size: 'Wide', angle: 'Eye Level', movement: 'Static', description: 'INT. COFFEE SHOP - DAY. Establishing shot of the bustling cafe.' },
        { id: '2', scene: '1B', size: 'Medium', angle: 'Eye Level', movement: 'Pan', description: 'Follow barista as she moves from grinder to espresso machine.' },
        { id: '3', scene: '2A', size: 'Close Up', angle: 'Low Angle', movement: 'Handheld', description: 'Pouring specific latte art. Focus on texture.' },
    ]);

    const addShot = () => {
        const newShot: Shot = {
            id: Date.now().toString(),
            scene: '',
            size: 'Wide',
            angle: 'Eye Level',
            movement: 'Static',
            description: ''
        };
        setShots([...shots, newShot]);
    };

    const updateShot = (id: string, field: keyof Shot, value: string) => {
        setShots(shots.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const deleteShot = (id: string) => {
        setShots(shots.filter(s => s.id !== id));
    };

    return (
        <div className="flex h-screen w-full bg-white text-zinc-900 font-sans overflow-hidden">

            {/* 1. SIDEBAR (Real Component, Light Mode) */}
            <ExperimentalWorkspaceNav
                activeTool={activeTool}
                activePhase={activePhase}
                onToolSelect={(tool, phase) => {
                    setActiveTool(tool);
                    setActivePhase(phase);
                }}
                darkMode={false} // KEY PROP
                userEmail="davidcasteel@gmail.com"
                mobileStatus={{ isLive: true, hasAlert: false }}
            />

            {/* 2. MAIN LAYOUT */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50">

                {/* 3. MOCK HEADER */}
                <MockLightHeader />

                {/* 4. MOCK DOC NAV */}
                <MockLightNavbar />

                {/* 5. DOCUMENT AREA */}
                <main className="flex-1 overflow-y-auto px-12 py-12">
                    <div className="max-w-5xl mx-auto">

                        {/* Page Title */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-light text-zinc-900 mb-2">Production Shots</h2>
                            <div className="h-1 w-12 bg-zinc-200 rounded-full"></div>
                        </div>

                        {/* VISUAL TABLE HEADER */}
                        <div className="hidden md:grid grid-cols-[60px_120px_120px_120px_1fr_40px] gap-4 mb-4 px-4 pl-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scene</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Size</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Angle</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Movement</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                            <span></span>
                        </div>

                        {/* CONTENT CARD */}
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden min-h-[500px]">
                            <div className="divide-y divide-zinc-100">
                                {shots.map((shot, index) => (
                                    <div
                                        key={shot.id}
                                        className="group hover:bg-zinc-50 transition-colors p-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-[60px_120px_120px_120px_1fr_40px] gap-4 items-start">

                                            {/* SCENE */}
                                            <div className="md:contents">
                                                <input
                                                    type="text"
                                                    value={shot.scene}
                                                    onChange={(e) => updateShot(shot.id, 'scene', e.target.value)}
                                                    placeholder="#"
                                                    className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 outline-none transition-all text-sm font-mono text-center rounded-md font-bold text-zinc-700"
                                                />
                                            </div>

                                            {/* SIZE */}
                                            <div className="relative">
                                                <select
                                                    value={shot.size}
                                                    onChange={(e) => updateShot(shot.id, 'size', e.target.value)}
                                                    className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 outline-none transition-all text-xs font-bold uppercase tracking-wider rounded-md appearance-none cursor-pointer text-zinc-700"
                                                >
                                                    {SHOT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            {/* ANGLE */}
                                            <div className="relative">
                                                <select
                                                    value={shot.angle}
                                                    onChange={(e) => updateShot(shot.id, 'angle', e.target.value)}
                                                    className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 outline-none transition-all text-xs font-bold uppercase tracking-wider rounded-md appearance-none cursor-pointer text-zinc-700"
                                                >
                                                    {SHOT_ANGLES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            {/* MOVEMENT */}
                                            <div className="relative">
                                                <select
                                                    value={shot.movement}
                                                    onChange={(e) => updateShot(shot.id, 'movement', e.target.value)}
                                                    className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 outline-none transition-all text-xs font-bold uppercase tracking-wider rounded-md appearance-none cursor-pointer text-zinc-700"
                                                >
                                                    {SHOT_MOVEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            {/* DESCRIPTION */}
                                            <div className="relative">
                                                <textarea
                                                    value={shot.description}
                                                    onChange={(e) => updateShot(shot.id, 'description', e.target.value)}
                                                    placeholder="Describe the shot..."
                                                    rows={1}
                                                    className="w-full min-h-[38px] py-2 px-3 bg-white border border-transparent focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 outline-none transition-all text-sm leading-relaxed resize-none rounded-md placeholder:text-zinc-300 font-medium text-zinc-600"
                                                    style={{ height: 'auto', minHeight: '38px' }}
                                                    onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = Math.max(38, target.scrollHeight) + 'px';
                                                    }}
                                                />
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="flex items-center justify-center pt-2">
                                                <button
                                                    onClick={() => deleteShot(shot.id)}
                                                    className="w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ADD ROW */}
                            <div className="p-4 bg-zinc-50/50 border-t border-zinc-100">
                                <button
                                    onClick={addShot}
                                    className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-zinc-300 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 hover:bg-white rounded-md transition-all text-xs font-bold uppercase tracking-widest"
                                >
                                    <Plus size={14} /> Add Shot
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
}
