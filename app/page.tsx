'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb,
  Calendar,
  Camera,
  Archive,
  Smartphone,
  LayoutDashboard,
  BrainCircuit,
  Printer,
  CheckCircle 
} from 'lucide-react';
import { getClient } from '@/lib/supabase';
import BetaApplicationModal from '@/components/modals/BetaApplicationModal';

const SCREENSHOTS = [
  '/assets/slider-1.png',
  '/assets/slider-2.png',
  '/assets/slider-3.png',
  '/assets/slider-4.png',
  '/assets/slider-5.png'
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SCREENSHOTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SCREENSHOTS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-zinc-900 font-sans tracking-tight selection:bg-zinc-200">

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex items-center justify-between bg-white/70 backdrop-blur-2xl border-b border-zinc-200 shadow-sm">
        <Link href="/" className="flex items-center group">
          <img src="/octo%20logo%20bk.png" alt="onFORMAT Logo" className="h-[60px] md:h-[70px] w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/features" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">Features</Link>
          <Link href="/pricing" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">Pricing</Link>
          {!loading ? (
            user ? (
              <Link 
                href="/dashboard" 
                className="bg-orange-500/90 text-white px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center gap-2 backdrop-blur-md border border-orange-400/50"
              >
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Login
              </Link>
            )
          ) : (
            <div className="h-10 w-32 bg-zinc-100 rounded-full animate-pulse" />
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white shadow-sm text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Production-Ready
        </div>
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-zinc-900 mb-8 leading-[0.95] uppercase">
          CREATIVE PRODUCTION <br className="hidden md:block" />
          <span className="text-zinc-400 font-light">SYSTEM</span>
        </h1>
        <p className="text-base md:text-xl text-zinc-500 font-medium max-w-3xl leading-relaxed mb-8">
          A production-ready workflow for the modern creative producer. We've deconstructed the production workflow and rebuilt it around document building and team communication. A schedule change instantly updates the Call Sheet. A DIT entry made onset updates the producer’s laptop, instantly worldwide.
        </p>

        <div className="flex flex-col items-center gap-4 mb-16">
          {!user && (
            <>
              <button 
                onClick={() => setIsBetaModalOpen(true)}
                className="bg-zinc-900 text-white px-8 py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3"
              >
                Join Private Beta <ArrowRight size={18} />
              </button>
              <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Invitation / Access Code Required
              </p>
            </>
          )}
        </div>

        {/* IMAGE SLIDER */}
        <div className="relative w-full max-w-5xl mx-auto rounded-[2rem] border border-zinc-200/80 bg-white shadow-2xl overflow-hidden p-[6px] backdrop-blur-sm group">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-100 aspect-[16/10]">
            {SCREENSHOTS.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`onFORMAT Interface ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            {/* Slider Controls */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white text-zinc-800 transition-transform hover:scale-105 opacity-0 group-hover:opacity-100 md:w-10 md:h-10">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white text-zinc-800 transition-transform hover:scale-105 opacity-0 group-hover:opacity-100">
              <ChevronRight size={20} />
            </button>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {SCREENSHOTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-zinc-800 scale-125' : 'bg-black/20 hover:bg-black/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY: THE PRODUCTION PHASES */}
      <section className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto border-t border-zinc-200/60">
        <div className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">The Lifecycle</h2>
          <p className="text-3xl font-bold tracking-tight text-zinc-900">Four Phases. One Workspace.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phase 1: Develop */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-purple-100">
              <Lightbulb className="text-purple-600" size={22} />
            </div>
            <h3 className="text-sm font-black tracking-widest text-zinc-900 mb-6 uppercase">Development</h3>
            <ul className="space-y-3 text-[13px] font-medium text-zinc-500">
              <li className="flex items-center gap-2">• Brief</li>
              <li className="flex items-center gap-2">• Creative Direction</li>
              <li className="flex items-center gap-2">• Shot & Scene Book</li>
              <li className="flex items-center gap-2">• AV Script</li>
              <li className="flex items-center gap-2">• Storyboard</li>
              <li className="flex items-center gap-2">• Creative Concept</li>
              <li className="flex items-center gap-2">• Director's Treatment</li>
              <li className="flex items-center gap-2">• Mood Board</li>
              <li className="flex items-center gap-2">• Lookbook</li>
            </ul>
          </div>

          {/* Phase 2: Pre-Prod */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
              <Calendar className="text-emerald-600" size={22} />
            </div>
            <h3 className="text-sm font-black tracking-widest text-zinc-900 mb-6 uppercase">Pre-Production</h3>
            <ul className="space-y-3 text-[13px] font-medium text-zinc-500">
              <li className="flex items-center gap-2">• Locations & Sets</li>
              <li className="flex items-center gap-2">• Casting & Talent</li>
              <li className="flex items-center gap-2">• Crew List</li>
              <li className="flex items-center gap-2">• Schedule</li>
              <li className="flex items-center gap-2">• Budget</li>
              <li className="flex items-center gap-2">• Equipment List</li>
              <li className="flex items-center gap-2">• Props List</li>
              <li className="flex items-center gap-2">• Wardrobe</li>
              <li className="flex items-center gap-2">• Talent Release</li>
              <li className="flex items-center gap-2">• Property Release</li>
            </ul>
          </div>

          {/* Phase 3: Production */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
              <Camera className="text-blue-600" size={22} />
            </div>
            <h3 className="text-sm font-black tracking-widest text-zinc-900 mb-6 uppercase">Production</h3>
            <ul className="space-y-3 text-[13px] font-medium text-zinc-500">
              <li className="flex items-center gap-2">• Call Sheet</li>
              <li className="flex items-center gap-2">• On-Set Notes</li>
              <li className="flex items-center gap-2">• EComm Shot List</li>
              <li className="flex items-center gap-2">• Shot List</li>
              <li className="flex items-center gap-2">• DIT Log</li>
              <li className="flex items-center gap-2">• Camera Report</li>
              <li className="flex items-center gap-2">• Sound Report</li>
              <li className="flex items-center gap-2">• Script Notes</li>
              <li className="flex items-center gap-2">• OnSet Control Panel</li>
            </ul>
          </div>

          {/* Phase 4: Post */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
              <Archive className="text-amber-600" size={22} />
            </div>
            <h3 className="text-sm font-black tracking-widest text-zinc-900 mb-6 uppercase">Post-Production</h3>
            <ul className="space-y-3 text-[13px] font-medium text-zinc-500">
              <li className="flex items-center gap-2">• Client Selects</li>
              <li className="flex items-center gap-2">• Deliverables & Licensing</li>
              <li className="flex items-center gap-2">• Archive Log</li>
              <li className="flex items-center gap-2">• Budget Actuals</li>
              <li className="flex items-center gap-2">• Releases Manager</li>
            </ul>
          </div>
        </div>

        {/* TACTICAL FEATURES */}
        <div className="mt-24 md:mt-32 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Tactical Tools</h2>
          <p className="text-3xl font-bold tracking-tight text-zinc-900">System Engines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-start bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Smartphone className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 uppercase">Onset Mobile Control</h3>
            <ul className="space-y-2 text-sm text-zinc-500 font-medium">
              <li className="flex items-center gap-2">• Real-time shot tracking</li>
              <li className="flex items-center gap-2">• Instant call sheet distribution</li>
              <li className="flex items-center gap-2">• Direct DIT-to-Office data flow</li>
            </ul>
          </div>

          <div className="flex flex-col items-start bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <LayoutDashboard className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 uppercase">Project Dashboard</h3>
            <ul className="space-y-2 text-sm text-zinc-500 font-medium">
              <li className="flex items-center gap-2">• 25+ Integrated Templates</li>
              <li className="flex items-center gap-2">• Granular RBAC Permissions</li>
              <li className="flex items-center gap-2">• Cross-project data sync</li>
            </ul>
          </div>

          <div className="flex flex-col items-start bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <BrainCircuit className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 uppercase">Project Vision AI Liaison</h3>
            <ul className="space-y-2 text-sm text-zinc-500 font-medium">
              <li className="flex items-center gap-2">• Creative brainstorming</li>
              <li className="flex items-center gap-2">• Intelligent shot list generation</li>
              <li className="flex items-center gap-2">• Automated data pre-population</li>
            </ul>
          </div>

          <div className="flex flex-col items-start bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Printer className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 uppercase">Printroom</h3>
            <ul className="space-y-2 text-sm text-zinc-500 font-medium">
              <li className="flex items-center gap-2">• High-fidelity PDF rendering</li>
              <li className="flex items-center gap-2">• Branded client cover sheets</li>
              <li className="flex items-center gap-2">• Batch production stack export</li>
            </ul>
          </div>
        </div>
      </section>


      {/* ONSET MOBILE */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-white border-y border-zinc-200/60 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
          <div className="order-2 md:order-1 flex justify-center perspective-[1000px]">
            <div className="relative w-[280px] md:w-[320px] rounded-[3rem] border-[10px] border-zinc-100 bg-zinc-50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden ring-1 ring-zinc-200 transform rotate-y-[-5deg] rotate-x-[5deg]">
              <div className="absolute top-0 inset-x-0 h-6 bg-zinc-100 flex justify-center z-20">
                <div className="w-20 h-4 bg-zinc-200 rounded-b-xl" />
              </div>
              <img src="/assets/mobile-preview.png" alt="Onset Mobile Interface" className="w-full h-auto mt-2" />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 mb-6 uppercase leading-none">
              ONSET MOBILE.
            </h2>
            <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-8">
              The first mobile interface designed for the actual chaos of production. Once logged-in, the crew is unified in a digital environment.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-zinc-700 font-medium text-lg">
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-zinc-500" />
                </div>
                View call sheets instantly
              </li>
              <li className="flex items-center gap-4 text-zinc-700 font-medium text-lg">
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-zinc-500" />
                </div>
                Approve shots on the fly
              </li>
              <li className="flex items-center gap-4 text-zinc-700 font-medium text-lg">
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-zinc-500" />
                </div>
                Sync with your team in real-time
              </li>
            </ul>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="py-12 px-8 border-t border-zinc-200/80 bg-white text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
          <p className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-widest">&copy; 2026 onFORMAT. All rights reserved.</p>
        </div>
      </footer>

      <BetaApplicationModal 
        isOpen={isBetaModalOpen} 
        onClose={() => setIsBetaModalOpen(false)} 
      />
    </div>
  );
}
