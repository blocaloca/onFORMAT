'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-green-500 selection:text-black relative">

      {/* 1. Header (Fixed) */}
      <nav className="fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between mix-blend-difference pointer-events-none">
        {/* mix-blend-difference helps visibility over light images if scrolled, 
              but might be weird with green. Removing mix-blend if it clashes. 
              Let's keep it simple for now, maybe add backdrop blur if needed.
          */}
        <div className="w-60 relative h-20 pointer-events-auto">
          <img src="/logo-white.png" alt="onFORMAT" className="h-full object-contain object-left" />
        </div>

        <Link href="/dashboard" className="absolute top-6 right-8 flex items-center gap-3 group pointer-events-auto">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-green-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
            Account
          </span>
        </Link>
      </nav>

      {/* 2. Hero Section (Full Screen) */}
      <section className="relative h-screen flex flex-col justify-center px-8 md:px-20 pt-20">

        {/* ANIMATION LAYER (Absolute Background of Hero) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 flex items-center justify-start overflow-hidden opacity-100">
          <video
            ref={videoRef}
            src="/hero-animation.mp4"
            loop
            muted
            playsInline
            className="w-[120%] h-auto md:w-[70%] md:h-auto object-cover opacity-80 mix-blend-screen -ml-20"
          />
        </div>

        {/* INTERACTION HOTSPOT */}
        <div
          className="absolute top-1/2 left-0 md:left-[10%] -translate-y-1/2 w-[500px] h-[500px] z-20 cursor-default"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* HERO CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center pointer-events-none">
          <div className="hidden md:block md:col-span-5"></div>
          <div className="md:col-span-7 flex flex-col items-start pointer-events-auto">

            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-widest leading-none uppercase">
              CREATIVE<br />
              PRODUCTION<br />
              SYSTEM
            </h1>

            <p className="text-lg md:text-xl text-white font-normal leading-relaxed max-w-4xl mb-12">
              A production-first ai-enabled workflow for the modern creative content producer.
            </p>

            <Link href="/dashboard" className="group relative inline-block w-[115px] h-[140px]">
              {/* Button SVG */}
              <svg className="absolute inset-0 w-full h-full shadow-lg group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-xl" viewBox="0 0 144 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="btnGradient" x1="72" y1="0" x2="72" y2="176" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF6B00" />
                    <stop offset="1" stopColor="#6BCB44" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 12C0 5.37258 5.37258 0 12 0H102C106.5 0 110.5 2 113.5 5L139 30.5C142 33.5 144 37.5 144 42V164C144 170.627 138.627 176 132 176H12C5.37258 176 0 170.627 0 164V12Z"
                  fill="url(#btnGradient)"
                />
              </svg>

              <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between group-hover:-translate-y-2 transition-transform duration-300">
                <PlusIcon />
                <span className="text-xs font-black uppercase leading-tight text-white mb-2 tracking-widest">
                  <span className="inline-flex">
                    S
                    <span className="relative w-[1ch] h-[1em] mx-px">
                      <span className="absolute inset-0 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">T</span>
                      <span className="absolute inset-0 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:-translate-x-0.5 text-green-100">M</span>
                    </span>
                    ART
                  </span>
                  <br />Producing
                </span>
              </div>
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
          <div className="relative h-[60vh] md:h-auto w-full">
            <img
              src="/onset-mobile.png"
              alt="Hand holding onSET mobile app"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:hidden" />
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

      {/* 4. SCROLL SECTION: EXPLAINERS / FOUNDER */}
      <section className="py-24 px-8 md:px-20 bg-black max-w-7xl mx-auto">

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
      <footer className="py-12 text-center text-zinc-800 text-xs font-mono uppercase bg-black">
        &copy; 2026 onFORMAT. All rights reserved.
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
