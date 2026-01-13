'use client';
import React from 'react';
import { ExperimentalDashboardNav, ExperimentalWorkspaceNav } from '@/components/onformat/ExperimentalNav';

export default function NavExperimentPage() {
    return (
        <div className="min-h-screen bg-zinc-100 p-8 font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black mb-4">Sidebar Redesign Experiment</h1>
                    <p className="text-zinc-600 max-w-2xl">
                        Viewing proposed designs for the Dashboard and Workspace sidebars.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-12 h-[800px] mb-24">

                    {/* Dashboard Nav */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 flex flex-col">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">Dashboard Context</div>
                        <div className="flex-1 bg-white border border-zinc-200 overflow-hidden relative rounded-md flex">
                            <ExperimentalDashboardNav />
                            {/* Dummy Content Area */}
                            <div className="flex-1 p-12 bg-zinc-50/50">
                                <h1 className="text-3xl font-light mb-2">Projects</h1>
                                <div className="h-4 w-32 bg-zinc-200 rounded-full mb-8" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="aspect-video bg-white border border-zinc-100 shadow-sm rounded-md" />
                                    <div className="aspect-video bg-white border border-zinc-100 shadow-sm rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workspace Nav (Light) */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 flex flex-col">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">Workspace Context (Light)</div>
                        <div className="flex-1 bg-white border border-zinc-200 overflow-hidden relative rounded-md flex">
                            <ExperimentalWorkspaceNav />
                            {/* Dummy Content Area */}
                            <div className="flex-1 p-12 bg-white">
                                <div className="max-w-2xl mx-auto h-full border border-zinc-100 shadow-xl bg-white p-12">
                                    <div className="h-8 w-64 bg-zinc-100 mb-8 rounded" />
                                    <div className="space-y-4">
                                        <div className="h-4 w-full bg-zinc-50 rounded" />
                                        <div className="h-4 w-full bg-zinc-50 rounded" />
                                        <div className="h-4 w-3/4 bg-zinc-50 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dark Mode Full Page Mockup */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black mb-8">Dark Mode Workspace</h2>

                    <div className="rounded-xl overflow-hidden shadow-2xl border border-zinc-800 flex h-[900px]">
                        <ExperimentalWorkspaceNav darkMode={true} />

                        {/* Dark Mode Main Content */}
                        <div className="flex-1 bg-zinc-900 border-l border-zinc-800 p-12">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">Development Phase</div>
                                        <h1 className="text-4xl text-white font-light">Creative Brief</h1>
                                    </div>
                                    <button className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-colors">
                                        Export PDF
                                    </button>
                                </div>

                                <div className="bg-white text-black border border-zinc-200 rounded-lg p-16 min-h-[600px] shadow-2xl">
                                    <div className="h-8 w-1/3 bg-zinc-100 rounded mb-8" />
                                    <div className="space-y-6">
                                        <div className="h-4 w-full bg-zinc-50 rounded" />
                                        <div className="h-4 w-full bg-zinc-50 rounded" />
                                        <div className="h-4 w-full bg-zinc-50 rounded" />
                                        <div className="h-4 w-2/3 bg-zinc-50 rounded" />
                                    </div>

                                    <div className="mt-16 grid grid-cols-2 gap-8">
                                        <div className="aspect-video bg-zinc-50 rounded border border-zinc-100" />
                                        <div className="aspect-video bg-zinc-50 rounded border border-zinc-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
