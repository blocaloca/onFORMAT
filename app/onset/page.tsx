import React from 'react';
import { Menu, Camera, Clock, MapPin, Users, Moon, Sun, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnSetPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between max-w-md mx-auto border-x border-zinc-800 shadow-2xl overflow-hidden relative">

            {/* Status Bar Mockup */}
            <div className="h-6 flex justify-between items-center px-4 text-[10px] font-bold text-zinc-500 select-none">
                <span>9:41</span>
                <div className="flex gap-1">
                    <span className="w-3 h-3 bg-zinc-600 rounded-full"></span>
                    <span className="w-3 h-3 bg-zinc-600 rounded-full"></span>
                    <span className="w-4 h-3 bg-zinc-600 rounded-[2px] border border-zinc-600"></span>
                </div>
            </div>

            {/* Header */}
            <header className="px-4 py-4 flex justify-between items-center border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
                <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-lg font-black tracking-tighter text-industrial-accent">onSET</h1>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <Menu size={24} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 overflow-y-auto">
                {/* Hero / Widget */}
                <div className="bg-zinc-900/50 rounded-xl p-6 mb-4 border border-zinc-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Status</h2>
                            <div className="text-2xl font-light">Scene 24A</div>
                        </div>
                        <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase animate-pulse border border-red-500/20">
                            Live
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-zinc-500">Location</div>
                            <div className="text-sm font-medium">Stage 4, Lot B</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-500">Time</div>
                            <div className="text-sm font-medium">14:30 PM</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
                        <div className="p-3 bg-zinc-950 rounded-full text-zinc-400 group-hover:text-industrial-accent transition-colors">
                            <Camera size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase">Shot Log</span>
                    </button>
                    <button className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
                        <div className="p-3 bg-zinc-950 rounded-full text-zinc-400 group-hover:text-industrial-accent transition-colors">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase">Schedule</span>
                    </button>
                    <button className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
                        <div className="p-3 bg-zinc-950 rounded-full text-zinc-400 group-hover:text-industrial-accent transition-colors">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase">Cast List</span>
                    </button>
                    <button className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
                        <div className="p-3 bg-zinc-950 rounded-full text-zinc-400 group-hover:text-industrial-accent transition-colors">
                            <MapPin size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase">Locations</span>
                    </button>
                </div>

                <div className="text-center p-8">
                    <p className="text-zinc-600 text-xs font-mono">
                        onSET Mobile Experience<br />
                        v0.1 Alpha
                    </p>
                </div>

            </main>

            {/* Bottom Nav Bar */}
            <nav className="bg-zinc-950 border-t border-zinc-900 p-2 safe-area-pb">
                <div className="flex justify-around items-center">
                    <button className="flex flex-col items-center gap-1 p-2 text-industrial-accent">
                        <Sun size={20} />
                        <span className="text-[9px] font-bold">Day</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 p-2 text-zinc-600 hover:text-white transition-colors">
                        <Camera size={20} />
                        <span className="text-[9px] font-bold">Shot</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 p-2 text-zinc-600 hover:text-white transition-colors">
                        <Moon size={20} />
                        <span className="text-[9px] font-bold">Night</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
