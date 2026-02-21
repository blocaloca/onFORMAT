'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getClient } from '@/lib/supabase';

export default function LandingPage() {
  const supabase = getClient();
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
    };
    fetchAvatar();
  }, []);

  // Handle hover interactions for Hero Video
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden selection:bg-green-500 selection:text-black relative">

      {/* 1. Header (Fixed) */}
      <nav className="fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between mix-blend-difference pointer-events-none">

        {/* Left: Logo & Pricing */}
        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center h-20">
            <span className="font-sans font-black tracking-tighter text-4xl">onFORMAT</span>
          </div>
          <Link href="/pricing" className="hidden md:block text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>

        <Link href="/dashboard" className="absolute top-6 right-8 flex items-center gap-3 group pointer-events-auto">
          {avatarUrl ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 group-hover:border-white transition-colors">
              <img src={avatarUrl} alt="Account" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-green-500 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
            Account
          </span>
        </Link>
      </nav>

      {/* 2. Hero Section (Full Screen) */}
      <section className="relative h-screen flex flex-col justify-center px-8 md:px-20 pt-20">

        {/* HERO CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center pointer-events-none">
          <div className="hidden md:block md:col-span-5 pointer-events-auto">
            <div className="bg-zinc-100 border border-zinc-300 shadow-2xl rounded-xl aspect-video flex items-center justify-center text-zinc-400 font-mono text-sm">LIGHT MODE UI RENDER HERE</div>
          </div>
          <div className="md:col-span-7 flex flex-col items-start pointer-events-auto">

            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-widest leading-none uppercase">
              CREATIVE<br />
              PRODUCTION<br />
              SYSTEM
            </h1>

            <p className="text-lg md:text-xl text-white font-normal leading-relaxed max-w-4xl mb-12">
              A production-first ai-enabled workflow for the modern creative content producer.
            </p>

            <Link href="/dashboard" className="bg-blue-500 text-white rounded-md px-8 py-3 font-bold tracking-wide hover:bg-blue-600 active:scale-[0.98] transition-all pointer-events-auto">
              START PRODUCING
            </Link>

          </div>
        </div>

        {/* Feature Columns (Bottom of Hero) - Now Light Grey Text */}
        <div className="absolute bottom-12 left-0 w-full px-8 md:px-20 z-10 pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8 max-w-7xl mx-auto pointer-events-auto">
            <FeatureColumn
              title="AI Liaison"
              text="Brainstorm logic, draft notes, and refine treatments with an assistant that understands production."
            />
            <FeatureColumn
              title="Dynamic Documents"
              text="Briefs, Treatments, Scripts, and Budgets that live together. Data flows between phases."
            />
            <FeatureColumn
              title="Production Ready"
              text="Built for the set. Dark mode native, offline capable, and rigorous workflows."
            />
          </div>
        </div>
      </section>


      {/* 3. SCROLL SECTION: IRL MOBILE MOBILE */}
      <section className="relative w-full bg-zinc-900 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
          {/* Image Side */}
          <div className="relative h-[60vh] md:h-auto w-full p-12 flex items-center justify-center bg-zinc-900 border-r border-white/5">
            <div className="bg-zinc-100 border border-zinc-300 shadow-2xl rounded-xl aspect-video w-full max-w-sm flex items-center justify-center text-zinc-400 font-mono text-sm">LIGHT MODE UI RENDER HERE</div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col justify-center p-12 md:p-24 bg-zinc-950 text-white">
            <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-wide">
              on<span className="font-bold text-green-500">SET</span><br />
              IN HAND.
            </h2>
            <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md mb-8">
              The first mobile interface designed for the actual chaos of production.
              View call sheets, approve shots, and sync with your team in real-time.
            </p>
            <div className="w-16 h-1 bg-green-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION SKELETON */}
      <section className="py-24 px-8 md:px-20 bg-zinc-950 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase mb-4">Pricing</h2>
          <p className="text-zinc-400">Simple plans for serious productions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Tier 1 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Basic</h3>
            <p className="text-zinc-400 flex-1 mb-8">For independent producers and small teams.</p>
            <div className="text-3xl font-light mb-8">$0<span className="text-sm text-zinc-500">/mo</span></div>
            <button className="w-full bg-white/10 text-white rounded-md px-6 py-3 font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Select</button>
          </div>
          {/* Tier 2 */}
          <div className="bg-white/10 border border-white/20 p-8 rounded-2xl flex flex-col relative scale-[1.02] shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white">Recommended</div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Pro</h3>
            <p className="text-zinc-400 flex-1 mb-8">For commercial production companies.</p>
            <div className="text-3xl font-light mb-8">$49<span className="text-sm text-zinc-500">/mo</span></div>
            <button className="w-full bg-blue-500 text-white rounded-md px-6 py-3 font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">Select</button>
          </div>
          {/* Tier 3 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Enterprise</h3>
            <p className="text-zinc-400 flex-1 mb-8">For studio-level workflows and custom integrations.</p>
            <div className="text-3xl font-light mb-8">Custom</div>
            <button className="w-full bg-white/10 text-white rounded-md px-6 py-3 font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Contact Us</button>
          </div>
        </div>
      </section>

      {/* 5. SCROLL SECTION: EXPLAINERS / FOUNDER */}
      <section className="py-24 px-8 md:px-20 bg-zinc-950 max-w-7xl mx-auto border-t border-white/5">

        {/* Explainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32">
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-6">The System</h3>
            <p className="text-zinc-400 leading-relaxed text-lg">
              onFORMAT isn't just a set of tools; it's an operating system. We've deconstructed the production workflow and rebuilt it around data permanence. A script change instantly updates the schedule. A budget tweak reflects in the treatment. No more version control nightmares.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-6">The Intelligence</h3>
            <p className="text-zinc-400 leading-relaxed text-lg">
              Our AI isn't a chatbot wrapper. It's a context-aware production coordinator. It knows your locations, your cast, and your constraints. It suggests generated shot lists based on your script and warns you if you're going into overtime before you even book the day.
            </p>
          </div>
        </div>

        {/* Founder Statement */}
        <div className="border-t border-white/10 pt-20">
          <blockquote className="max-w-4xl mx-auto relative">
            <span className="absolute -top-10 -left-10 text-9xl text-green-500/10 font-serif">"</span>
            <p className="text-3xl md:text-5xl font-light leading-snug tracking-wide text-zinc-300 mb-8 italic">
              We built onFORMAT because we were tired of running million-dollar productions on spreadsheets and hope. It's time for software that works as hard as the crew.
            </p>
            <footer className="text-zinc-500 font-mono text-sm tracking-widest uppercase flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800" /> {/* Placeholder for avatar if needed */}
              <span>Founder Statement</span>
            </footer>
          </blockquote>
        </div>

      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-zinc-800 text-xs font-mono uppercase bg-zinc-950 border-t border-white/5">
        <div className="flex flex-col gap-4">
          <p className="text-zinc-600">&copy; 2026 onFORMAT. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link href="/support" className="text-zinc-500 hover:text-zinc-300 text-xs tracking-widest uppercase transition-colors">Support</Link>
            <span className="text-zinc-800">•</span>
            <Link href="/support" className="text-zinc-500 hover:text-zinc-300 text-xs tracking-widest uppercase transition-colors">Terms of Service</Link>
            <span className="text-zinc-800">•</span>
            <Link href="/support" className="text-zinc-500 hover:text-zinc-300 text-xs tracking-widest uppercase transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Sub components
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0V12M0 6H12" stroke="white" strokeWidth="3" />
  </svg>
);

// Updated FeatureColumn with lighter text color class passed or default updated?
// I'll update the component definition below to use lighter text defaults.
const FeatureColumn = ({ title, text }: { title: string, text: string }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">{title}</h3>
    <p className="text-[10px] text-zinc-300 leading-relaxed font-mono uppercase"> {/* Updated to text-zinc-300 */}
      {text}
    </p>
  </div>
);
