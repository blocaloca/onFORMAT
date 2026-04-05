'use client';
import React from 'react';
import { 
    BookOpen, 
    Smartphone, 
    ShieldCheck, 
    Zap, 
    Printer, 
    ArrowLeft, 
    ChevronRight,
    Search,
    Users,
    Activity,
    Lock,
    Edit3,
    Check
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30">
            {/* NAVIGATION HEADER */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/account" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                        <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={16} className="text-blue-500" />
                            User Manual <span className="text-[10px] text-zinc-400 font-mono font-normal ml-2">v1.0.0</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* HERO */}
                <header className="mb-20 text-center">
                    <h2 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-600 bg-clip-text text-transparent">
                        Master the onFORMAT Ecosystem
                    </h2>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                        A comprehensive guide to production management, real-time collaboration, and mobile synchronization.
                    </p>
                </header>

                <div className="space-y-32">
                    {/* SECTION: ONSET MOBILE */}
                    <section id="onset-mobile" className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">OnSet Mobile</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            <div className="space-y-6">
                                <p>
                                    OnSet Mobile is a real-time production companion designed for every member of your crew. It provides instant access to relevant documents while maintaining a secure, production-hardened environment.
                                </p>
                                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-widest">How to Connect</h4>
                                    <ol className="space-y-3 text-[13px]">
                                        <li className="flex gap-3"><span className="text-blue-500 font-black">01</span> Open the Mobile Hub from your device.</li>
                                        <li className="flex gap-3"><span className="text-blue-500 font-black">02</span> Enter your production email to sync permissions.</li>
                                        <li className="flex gap-3"><span className="text-blue-500 font-black">03</span> Access your assigned document bundles instantly.</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="bg-zinc-100 dark:bg-zinc-900 aspect-[4/3] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                    <Smartphone size={120} className="text-zinc-300 dark:text-zinc-800" />
                                </div>
                                {/* Feature Highlights */}
                                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                                    <div className="p-3 bg-white/80 dark:bg-black/80 backdrop-blur rounded-xl border border-white dark:border-zinc-800 text-[11px] font-bold">
                                        ⚡️ Instant Sync with Desktop
                                    </div>
                                    <div className="p-3 bg-white/80 dark:bg-black/80 backdrop-blur rounded-xl border border-white dark:border-zinc-800 text-[11px] font-bold">
                                        🔒 Role-Based Document Isolation
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: CUSTOM ROLE MATRIX */}
                    <section id="permissions" className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Custom Role Matrix</h3>
                        </div>

                        <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-3xl leading-relaxed">
                            We've replaced the legacy "ABCD" system with a granular, 1-to-1 <strong>Role-Based Access Control (RBAC) Matrix</strong>. You now have total, real-time authority over exactly what each department can view or edit while out on set.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-3">1. Define Roles</h4>
                                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Add custom roles like "DIT", "Stunt Coord", or "Client" directly in your Mobile Control center. Roles are synchronized instantly across the platform.</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3">2. Toggle Access</h4>
                                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Switch individual documents between <span className="font-mono text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 px-1 rounded">NONE</span>, <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 px-1 rounded">VIEW</span>, and <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 px-1 rounded">EDIT</span> across all roles using the visual grid matrix.</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">3. Assign Crew</h4>
                                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">When adding crew via the Crew List, map them to their configured role. Upon login, their mobile HUD locks precisely to your specifications.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-900 text-zinc-400 rounded-2xl border border-zinc-800 text-[13px] font-mono leading-relaxed shadow-lg">
                            <span className="text-white font-black uppercase tracking-widest text-[10px] block mb-2">Live Sync & Presence Protocol</span>
                            Changes to the custom matrix propagate across all active devices in milliseconds. If you revoke a user's access to a document while they are actively viewing it, they are instantly booted back to the secure dashboard. Additionally, look for the glowing <span className="text-emerald-500">Emerald LED indicators</span> on your Crew List to see exactly who is currently online and connected to Set.
                        </div>
                    </section>

                    {/* SECTION: PRODUCER ALERTS */}
                    <section id="alerts" className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Producer Alerts</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-6">
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Producers receive immediate visual and haptic-style notifications on their desktop dashboard whenever a crew member logs activity on-set. 
                                </p>
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Activity size={12} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold dark:text-white uppercase tracking-wider">Live Pulse</span>
                                            <p className="text-[13px] text-zinc-500">Navigation tabs will glow red when new data (Notes, DIT Logs) is received.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 w-5 h-5 rounded bg-red-500/10 flex items-center justify-center shrink-0">
                                            <Zap size={12} className="text-red-500" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold dark:text-white uppercase tracking-wider">Critical Sync</span>
                                            <p className="text-[13px] text-zinc-500">Toast notifications appear for major events like shot completions or issue reports.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="w-full md:w-80 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl relative">
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-amber-500/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-2 w-24 bg-zinc-800 rounded"></div>
                                    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 animate-pulse">
                                        <div className="h-1.5 w-12 bg-blue-500 mb-2"></div>
                                        <div className="h-2 w-full bg-zinc-700"></div>
                                    </div>
                                    <div className="h-2 w-32 bg-zinc-800 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: ECOMMERCE SHOT LIST */}
                    <section id="ecommerce" className="scroll-mt-24 mb-32">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">eComm Shot List</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            <div className="flex-1 space-y-6 text-zinc-600 dark:text-zinc-400">
                                <p className="leading-relaxed">
                                    Our high-volume eCommerce module is built for the rapid pace of product capture. It handles barcode scanning and SKU tracking directly from the Shot List interface, ensuring every asset is tracked from ingest to export.
                                </p>
                                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">Key Capabilities</h4>
                                    <ul className="space-y-3 text-[13px]">
                                        <li className="flex gap-3 items-center"><Check size={14} className="text-blue-500" /> Barcode & SKU System Integration</li>
                                        <li className="flex gap-3 items-center"><Check size={14} className="text-blue-500" /> Real-time Capture Status Reporting</li>
                                        <li className="flex gap-3 items-center"><Check size={14} className="text-blue-500" /> Automated Ingest Verification</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="w-full md:w-80 bg-zinc-100 dark:bg-zinc-900 aspect-square rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group overflow-hidden relative">
                                <Zap size={100} className="text-zinc-300 dark:text-zinc-800 group-hover:text-blue-500/20 transition-colors duration-500" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
                            </div>
                        </div>
                    </section>

                    {/* SECTION: PRINTROOM */}
                    <section id="printroom" className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                                <Printer size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">PrintRoom & PDF Export</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="order-2 md:order-1 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                                        <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded"></div>
                                        <div className="h-2 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded"></div>
                                        <div className="h-2 w-[70%] bg-zinc-50 dark:bg-zinc-800/50 rounded"></div>
                                    </div>
                                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                                        <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
                                    <div className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-lg">Page 02 Output</div>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 space-y-6">
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    The PrintRoom generates high-fidelity, industrial-standard PDFs. Our logic now automatically recognizes content overflow, creating clean multi-page documents for even the most extensive locations list or AV scripts.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                                        <Check size={16} className="text-blue-500 shrink-0" />
                                        <p className="text-sm font-bold dark:text-white uppercase tracking-wider pt-0.5">Automatic Pagination</p>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                                        <Check size={16} className="text-blue-500 shrink-0" />
                                        <p className="text-sm font-bold dark:text-white uppercase tracking-wider pt-0.5">Landscape & Portrait Support</p>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                                        <Check size={16} className="text-blue-500 shrink-0" />
                                        <p className="text-sm font-bold dark:text-white uppercase tracking-wider pt-0.5">Stripped Input Interfaces for PDF</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* FOOTER CALLOUT */}
                <footer className="mt-32 pt-20 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">
                        Need additional support? Contact onFORMAT Production Ops.
                    </p>
                    <Link href="/account" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 dark:hover:bg-white transition-all transform hover:-translate-y-1 active:scale-[0.98] shadow-2xl">
                        Return to Account
                    </Link>
                </footer>
            </main>
        </div>
    );
}
