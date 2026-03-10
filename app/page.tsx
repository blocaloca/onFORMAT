'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Compass, Layers, Printer, CheckCircle } from 'lucide-react';

const SCREENSHOTS = [
  '/assets/Screenshot%202026-03-09%20at%202.07.23%20PM.png',
  '/assets/Screenshot%202026-03-09%20at%202.08.20%20PM.png',
  '/assets/Screenshot%202026-03-09%20at%202.10.09%20PM.png',
  '/assets/Screenshot%202026-03-09%20at%202.17.27%20PM.png',
  '/assets/Screenshot%202026-03-09%20at%202.18.35%20PM.png'
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
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
        <Link href="/" className="flex items-center gap-3">
          <img src="/octo%20logo%202.png" alt="onFORMAT Logo" className="h-8 w-auto object-contain" />
          <span className="font-bold tracking-widest text-[10px] md:text-xs uppercase text-zinc-800">onFORMAT</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/pricing" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">Pricing</Link>
          <a href="#contact" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">Contact Us</a>
          <Link href="/login" className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            Start Producing <ArrowRight size={14} />
          </Link>
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
        <p className="text-base md:text-xl text-zinc-500 font-medium max-w-3xl leading-relaxed mb-16">
          A production-ready workflow for the modern creative producer. We've deconstructed the production workflow and rebuilt it around document building and team communication. A schedule change instantly updates the Call Sheet. A DIT entry made onset updates the producer’s laptop, instantly worldwide.
        </p>

        {/* IMAGE SLIDER */}
        <div className="relative w-full max-w-5xl mx-auto rounded-[2rem] border border-zinc-200/80 bg-white shadow-2xl overflow-hidden p-[6px] backdrop-blur-sm group">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-100 aspect-[16/10]">
            <img
              src={SCREENSHOTS[currentSlide]}
              alt={`onFORMAT Interface ${currentSlide + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            />
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

      {/* THREE PILLARS (Silver UI style) */}
      <section className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto border-t border-zinc-200/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="flex flex-col items-start bg-white rounded-3xl p-8 md:p-10 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Compass className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-4 uppercase">AI LIAISON</h3>
            <p className="text-zinc-500 leading-relaxed font-medium">
              Brainstorm creative with an AI trained in modern content creation.
            </p>
          </div>

          <div className="flex flex-col items-start bg-white rounded-3xl p-8 md:p-10 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Layers className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-4 uppercase">POWER-UP PRODUCER!</h3>
            <p className="text-zinc-500 leading-relaxed font-medium">
              Maintain multiple projects simultaneously. 18 Creative and Production Documents from Development to Post. You set crew permissions, they see what’s important for their role.
            </p>
          </div>

          <div className="flex flex-col items-start bg-white rounded-3xl p-8 md:p-10 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Printer className="text-zinc-700" size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-4 uppercase">PRINTROOM</h3>
            <p className="text-zinc-500 leading-relaxed font-medium">
              All your filled documents, rendered beautifully in PDF, client ready with custom cover sheet.
            </p>
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
              <img src="/assets/IMG_6708.PNG" alt="Onset Mobile Interface" className="w-full h-auto mt-2" onError={(e) => (e.currentTarget.src = '/assets/IMG_6707.PNG')} />
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

      {/* CONTACT CTA */}
      <section id="contact" className="py-24 md:py-32 px-4 md:px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-zinc-900 mb-6 uppercase">Let's build together.</h2>
        <p className="text-lg md:text-xl text-zinc-500 font-medium mb-12 max-w-2xl mx-auto">
          Need custom enterprise workflows or a unified system for your entire production house? We’re ready to help.
        </p>
        <a href="mailto:hello@onformat.io" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-xl hover:-translate-y-1">
          Contact Us <ArrowRight size={16} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 border-t border-zinc-200/80 bg-white text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-widest">&copy; 2026 onFORMAT. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/login" className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-800 transition-colors">Start Producing</Link>
            <Link href="/pricing" className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-800 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
