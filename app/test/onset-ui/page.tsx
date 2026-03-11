'use client';

import React, { useState } from 'react';
import { Phone, Mail, Search, Edit2, Plus, X, Save } from 'lucide-react';

const DUMMY_CREW = [
    { id: '1', name: 'John Doe', role: 'Director', department: 'Direction', phone: '555-0100', email: 'john@example.com', onSetGroups: ['A'] },
    { id: '2', name: 'Jane Smith', role: 'DP', department: 'Camera', phone: '555-0101', email: 'jane@example.com', onSetGroups: ['B', 'C'] },
    { id: '3', name: 'Sam Wilson', role: 'Sound Mixer', department: 'Sound', phone: '555-0102', email: 'sam@example.com', onSetGroups: ['D'] },
];

export default function TestOnsetUIPage() {
    const [activeProposal, setActiveProposal] = useState(1);

    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 inset-x-0 bg-white border-b border-zinc-200 z-50 p-4">
                <div className="max-w-md mx-auto flex flex-col items-center">
                    <h1 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">OnSet Readability Proposals</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveProposal(1)} className={`px-4 py-2 text-xs font-bold rounded-full ${activeProposal === 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>1: Monochromatic</button>
                        <button onClick={() => setActiveProposal(2)} className={`px-4 py-2 text-xs font-bold rounded-full ${activeProposal === 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>2: Colorful (Soft)</button>
                        <button onClick={() => setActiveProposal(3)} className={`px-4 py-2 text-xs font-bold rounded-full ${activeProposal === 3 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>3: Modern Glass</button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto pt-24 px-4 pb-12">
                {activeProposal === 1 && <Proposal1 />}
                {activeProposal === 2 && <Proposal2 />}
                {activeProposal === 3 && <Proposal3 />}
            </main>
        </div>
    );
}

// -------------------------------------------------------------
// PROPOSAL 1: Monochromatic (Except Systemic Colors)
// Focus: High contrast black/white/gray, larger typography,
// no colored backgrounds to compete with text.
// -------------------------------------------------------------
function Proposal1() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="pb-2 border-b-2 border-zinc-900">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">V1: High Contrast Mono</h2>
                <p className="text-sm text-zinc-600 font-medium">Clear heirarchy, monochromatic layouts with heavy black text on white backgrounds. System colors (ABCD) remain.</p>
            </div>

            {/* Simulated Crew List View */}
            <div className="relative flex-1 mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-900" size={18} />
                <input
                    className="w-full bg-white border-2 border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-zinc-900/20 font-bold tracking-wide"
                    placeholder="Search Crew..."
                    disabled
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest pl-1">Direction</h3>
                {DUMMY_CREW.slice(0, 1).map(m => (
                    <div key={m.id} className="bg-white border-2 border-zinc-200 rounded-xl p-5 flex items-center justify-between group hover:border-zinc-900 transition-colors">
                        <div className="flex-1">
                            <p className="text-lg font-black text-zinc-900 leading-none mb-1">{m.name}</p>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{m.role}</p>

                            {/* ABCD Systemic Colors Retained */}
                            <div className="flex gap-1.5">
                                {m.onSetGroups.map(g => (
                                    <span key={g} className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm 
                                        ${g === 'A' ? 'bg-[#22C55E] text-white' : g === 'B' ? 'bg-[#3B82F6] text-white' : g === 'C' ? 'bg-[#EAB308] text-white' : 'bg-[#EF4444] text-white'}`}>
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 hover:bg-zinc-200 transition-colors">
                                <Phone size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full border-2 border-zinc-200 flex items-center justify-center text-zinc-900 hover:border-zinc-900 transition-colors">
                                <Mail size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest pl-1 mt-8">Camera</h3>
                {DUMMY_CREW.slice(1, 2).map(m => (
                    <div key={m.id} className="bg-white border-2 border-zinc-200 rounded-xl p-5 flex items-center justify-between group hover:border-zinc-900 transition-colors">
                        <div className="flex-1">
                            <p className="text-lg font-black text-zinc-900 leading-none mb-1">{m.name}</p>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{m.role}</p>

                            <div className="flex gap-1.5">
                                {m.onSetGroups.map(g => (
                                    <span key={g} className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm 
                                        ${g === 'A' ? 'bg-[#22C55E] text-white' : g === 'B' ? 'bg-[#3B82F6] text-white' : g === 'C' ? 'bg-[#EAB308] text-white' : 'bg-[#EF4444] text-white'}`}>
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form View Mockup */}
            <div className="mt-12 bg-white border-2 border-zinc-200 rounded-xl p-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Edit Permissions</h4>
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-900">ABCD Groups</label>
                    <div className="flex gap-3">
                        {['A', 'B', 'C', 'D'].map((g, i) => (
                            <button
                                key={g}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all
                                    ${i === 0
                                        ? 'bg-[#22C55E] border-[#22C55E] text-white shadow-md'
                                        : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="w-full mt-8 bg-zinc-900 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// PROPOSAL 2: Colorful (Tasteful Pastels)
// Focus: Use accessible pastel backgrounds for categorization,
// dark deeply-saturated text colors to maintain reading contrast.
// -------------------------------------------------------------
function Proposal2() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="pb-2 border-b border-blue-200">
                <h2 className="text-lg font-black uppercase tracking-tight text-blue-900">V2: Tasteful Color Blocks</h2>
                <p className="text-sm text-blue-700/80 font-medium">Softer pastel card backgrounds with deep, saturated text for excellent contrast and visual warmth.</p>
            </div>

            {/* Simulated Crew List View */}
            <div className="relative flex-1 mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                <input
                    className="w-full bg-blue-50 border-none rounded-2xl py-4 pl-12 pr-4 text-base text-blue-950 placeholder:text-blue-400 outline-none focus:ring-4 focus:ring-blue-500/20 font-bold tracking-wide shadow-sm"
                    placeholder="Search Crew..."
                    disabled
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-800/60 tracking-widest pl-2">Direction</h3>
                {DUMMY_CREW.slice(0, 1).map(m => (
                    <div key={m.id} className="bg-emerald-50/80 border border-emerald-100/50 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-lg font-black text-emerald-950 leading-none mb-1">{m.name}</p>
                            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-3">{m.role}</p>

                            <div className="flex gap-2">
                                {m.onSetGroups.map(g => (
                                    <span key={g} className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg
                                        ${g === 'A' ? 'bg-emerald-500 text-white' : g === 'B' ? 'bg-[#3B82F6] text-white' : g === 'C' ? 'bg-[#EAB308] text-white' : 'bg-[#EF4444] text-white'}`}>
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-emerald-200/50 flex items-center justify-center text-emerald-800 hover:bg-emerald-200 transition-colors">
                                <Phone size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-emerald-800 hover:bg-white transition-colors">
                                <Mail size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <h3 className="text-xs font-black uppercase text-blue-800/60 tracking-widest pl-2 mt-8">Camera</h3>
                {DUMMY_CREW.slice(1, 2).map(m => (
                    <div key={m.id} className="bg-indigo-50/80 border border-indigo-100/50 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-lg font-black text-indigo-950 leading-none mb-1">{m.name}</p>
                            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-3">{m.role}</p>

                            <div className="flex gap-2">
                                {m.onSetGroups.map(g => (
                                    <span key={g} className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg
                                        ${g === 'A' ? 'bg-[#22C55E] text-white' : g === 'B' ? 'bg-blue-500 text-white' : g === 'C' ? 'bg-[#EAB308] text-white' : 'bg-[#EF4444] text-white'}`}>
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-indigo-200/50 flex items-center justify-center text-indigo-800 hover:bg-indigo-200 transition-colors">
                                <Phone size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-indigo-800 hover:bg-white transition-colors">
                                <Mail size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form View Mockup */}
            <div className="mt-12 bg-white border border-blue-100 shadow-xl shadow-blue-900/5 rounded-3xl p-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-blue-950 mb-6">Edit Permissions</h4>
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-blue-800">ABCD Groups</label>
                    <div className="flex gap-3">
                        {['A', 'B', 'C', 'D'].map((g, i) => (
                            <button
                                key={g}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-sm
                                    ${i === 1
                                        ? 'bg-blue-500 text-white shadow-blue-500/30 shadow-lg scale-105'
                                        : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="w-full mt-8 bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// PROPOSAL 3: Modern Glass (Expert Choice)
// Focus: Subdued structural elements, tactile shadows, 
// increased font-weights, entirely removing inner borders.
// -------------------------------------------------------------
function Proposal3() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="pb-2 border-b border-zinc-200">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">V3: Modern Glass (Tactile)</h2>
                <p className="text-sm text-zinc-500 font-medium">Slightly rounded, floating elements on a light gray canvas. Highly readable weights with distinct drop shadows vs harsh borders.</p>
            </div>

            {/* Container to mock an off-white app background common in modern apps */}
            <div className="-mx-4 px-4 py-6 bg-zinc-50/80 rounded-3xl">

                {/* Simulated Crew List View */}
                <div className="relative flex-1 mb-8 shadow-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        className="w-full bg-white border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-base text-zinc-900 placeholder:text-zinc-300 outline-none focus:ring-4 focus:ring-emerald-500/20 font-bold tracking-wide"
                        placeholder="Search Crew..."
                        disabled
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-2">Direction</h3>
                    {DUMMY_CREW.slice(0, 1).map(m => (
                        <div key={m.id} className="bg-white rounded-[20px] p-5 flex items-center justify-between shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <p className="text-[17px] font-black text-zinc-900 leading-none mb-1.5">{m.name}</p>
                                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3">{m.role}</p>

                                <div className="flex gap-2">
                                    {m.onSetGroups.map(g => (
                                        <div key={g} className={`text-[10px] font-black uppercase w-6 h-6 flex items-center justify-center rounded-full shadow-sm
                                            ${g === 'A' ? 'bg-[#22C55E] text-white' : g === 'B' ? 'bg-[#3B82F6] text-white' : g === 'C' ? 'bg-[#EAB308] text-white' : 'bg-[#EF4444] text-white'}`}>
                                            {g}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <Phone size={15} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <Mail size={15} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-2 mt-8">Sound</h3>
                    {DUMMY_CREW.slice(2, 3).map(m => (
                        <div key={m.id} className="bg-white rounded-[20px] p-5 flex items-center justify-between shadow-sm border border-black/[0.03] hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <p className="text-[17px] font-black text-zinc-900 leading-none mb-1.5">{m.name}</p>
                                <p className="text-[11px] font-bold text-purple-600 uppercase tracking-widest mb-3">{m.role}</p>

                                <div className="flex gap-2">
                                    {m.onSetGroups.map(g => (
                                        <div key={g} className={`text-[10px] font-black uppercase w-6 h-6 flex items-center justify-center rounded-full shadow-sm
                                            ${g === 'A' ? 'bg-[#22C55E] text-white' : g === 'B' ? 'bg-[#3B82F6] text-white' : g === 'C' ? 'bg-[#EAB308] text-white' : 'bg-[#EF4444] text-white'}`}>
                                            {g}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                    <Phone size={15} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                    <Mail size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form View Mockup */}
                <div className="mt-8 bg-white shadow-xl shadow-black-[0.02] border border-black/[0.04] rounded-[24px] p-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-6">Edit Permissions</h4>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ABCD Groups</label>
                        <div className="flex gap-3">
                            {['A', 'B', 'C', 'D'].map((g, i) => (
                                <button
                                    key={g}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all shadow-sm
                                        ${i === 3
                                            ? 'bg-[#EF4444] text-white scale-110 shadow-red-500/20'
                                            : 'bg-zinc-50 text-zinc-400 border border-zinc-100 hover:bg-zinc-100'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="w-full mt-8 bg-zinc-900 text-white font-bold uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-zinc-900/10 flex items-center justify-center gap-2">
                        <Save size={18} /> Update Access
                    </button>
                </div>

            </div>
        </div>
    );
}
