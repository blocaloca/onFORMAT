'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Save, Printer, Settings, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

// TYPE DEFINITIONS
interface Shot {
    id: string;
    scene: string;
    size: string;
    angle: string;
    movement: string;
    description: string;
}

const SHOT_SIZES = ['Wide', 'Full', 'Medium', 'Cowboy', 'Close Up', 'Extreme CU'];
const SHOT_ANGLES = ['Eye Level', 'Low Angle', 'High Angle', 'Overhead', 'Dutch'];
const SHOT_MOVEMENTS = ['Static', 'Pan', 'Tilt', 'Tracking', 'Steadicam', 'Handheld', 'Zoom'];

export default function ShotListTestPage() {
    const [shots, setShots] = useState<Shot[]>([
        { id: '1', scene: '1A', size: 'Wide', angle: 'Eye Level', movement: 'Static', description: 'INT. COFFEE SHOP - DAY. Establishing shot of the bustling cafe.' },
        { id: '2', scene: '1B', size: 'Medium', angle: 'Eye Level', movement: 'Pan', description: 'Follow barista as she moves from grinder to espresso machine.' },
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
        if (confirm('Delete this shot?')) {
            setShots(shots.filter(s => s.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-black selection:text-white">

            {/* NAVIGATION BAR (Mock) */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-widest text-black">Shot List</h1>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400">Project: Light Mode Test</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 flex items-center gap-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors rounded-sm">
                        <Save size={12} /> <span className="hidden sm:inline">Save Changes</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-sm transition-colors">
                        <Printer size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-sm transition-colors">
                        <Settings size={16} />
                    </button>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-5xl mx-auto px-6 py-12">

                {/* PAGE HEADER */}
                <div className="mb-12">
                    <h2 className="text-4xl font-light mb-4">Production Shots</h2>
                </div>

                {/* VISUAL TABLE HEADER */}
                <div className="hidden md:grid grid-cols-[60px_120px_120px_120px_1fr_40px] gap-4 mb-4 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scene</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Size</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Angle</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Movement</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</span>
                    <span></span>
                </div>

                {/* SHOT LIST FORM */}
                <div className="space-y-3">
                    {shots.map((shot, index) => (
                        <div
                            key={shot.id}
                            className="group bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md p-4 md:p-2 rounded-sm"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-[60px_120px_120px_120px_1fr_40px] gap-3 items-start">

                                {/* SCENE */}
                                <div className="md:contents">
                                    <label className="md:hidden text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Scene</label>
                                    <input
                                        type="text"
                                        value={shot.scene}
                                        onChange={(e) => updateShot(shot.id, 'scene', e.target.value)}
                                        placeholder="#"
                                        className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-mono text-center rounded-sm placeholder:text-zinc-300"
                                    />
                                </div>

                                {/* SIZE */}
                                <div className="md:contents">
                                    <label className="md:hidden text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Size</label>
                                    <div className="relative">
                                        <select
                                            value={shot.size}
                                            onChange={(e) => updateShot(shot.id, 'size', e.target.value)}
                                            className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs font-bold uppercase tracking-wider rounded-sm appearance-none cursor-pointer"
                                        >
                                            {SHOT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* ANGLE */}
                                <div className="md:contents">
                                    <label className="md:hidden text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Angle</label>
                                    <div className="relative">
                                        <select
                                            value={shot.angle}
                                            onChange={(e) => updateShot(shot.id, 'angle', e.target.value)}
                                            className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs font-bold uppercase tracking-wider rounded-sm appearance-none cursor-pointer"
                                        >
                                            {SHOT_ANGLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* MOVEMENT */}
                                <div className="md:contents">
                                    <label className="md:hidden text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Movement</label>
                                    <div className="relative">
                                        <select
                                            value={shot.movement}
                                            onChange={(e) => updateShot(shot.id, 'movement', e.target.value)}
                                            className="w-full h-9 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs font-bold uppercase tracking-wider rounded-sm appearance-none cursor-pointer"
                                        >
                                            {SHOT_MOVEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="md:contents">
                                    <label className="md:hidden text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Description</label>
                                    <div className="relative">
                                        <textarea
                                            value={shot.description}
                                            onChange={(e) => updateShot(shot.id, 'description', e.target.value)}
                                            placeholder="Describe the shot..."
                                            rows={1}
                                            className="w-full min-h-[36px] py-2 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm leading-relaxed resize-none rounded-sm placeholder:text-zinc-300"
                                            style={{ height: 'auto', minHeight: '36px' }}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = Math.max(36, target.scrollHeight) + 'px';
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center justify-end md:justify-center pt-1">
                                    <button
                                        onClick={() => deleteShot(shot.id)}
                                        className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                {/* ADD BUTTON */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={addShot}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 shadow-sm hover:border-black hover:shadow-md transition-all text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black rounded-sm group"
                    >
                        <Plus size={14} className="group-hover:scale-110 transition-transform" />
                        Add New Shot
                    </button>
                </div>

            </main>
        </div>
    );
}
