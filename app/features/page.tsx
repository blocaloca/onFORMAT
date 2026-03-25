'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Users, 
  Shield, 
  Smartphone, 
  Cpu, 
  FileText, 
  Clock, 
  Layout, 
  Eye, 
  Download,
  Search,
  MessageSquare
} from 'lucide-react';
import { getClient } from '@/lib/supabase';

const FEATURE_SECTIONS = [
  {
    phase: "PHASE 01",
    title: "DEVELOPMENT",
    description: "Build the creative foundation of your project with tools designed for visionaries.",
    features: [
      { name: "Project Vision", value: "Articulate the 'North Star' of your production in a dedicated, free-form creative space." },
      { name: "Creative Brief", value: "Strategic templates for Audience, Tone, and Message that drive every downstream document." },
      { name: "AV Script Editor", value: "A professional dual-column editor for Visuals and Audio with integrated scene logic." },
      { name: "Treatment & Storyboard", value: "Sequential visual narrative tools that pin references from your Lookbook directly to shots." }
    ]
  },
  {
    phase: "PHASE 02",
    title: "PRE-PRODUCTION",
    description: "Turn creative concepts into a logistical reality with precision planning tools.",
    features: [
      { name: "Dynamic Shot List", value: "Detailed shot registry with Size, Angle, and Movement, auto-populated from your script." },
      { name: "Budgeting Engine", value: "Line-item cost tracking with category organization and real-time total reconciliation." },
      { name: "Crew & Talent Management", value: "Full contact directories with department grouping and ABCD mobile permission levels." },
      { name: "Visual Location Logs", value: "Visual scout logs with technical specs, accessibility data, and address mapping." }
    ]
  },
  {
    phase: "PHASE 03",
    title: "PRODUCTION",
    description: "The digital heartbeat of your set. Real-time synchronization for the actual chaos of filming.",
    features: [
      { name: "Smart Call Sheets", value: "Briefs that pull from your schedule, fetch live weather, and alert crew to safety notes." },
      { name: "onSET Mobile Control", value: "A producer's permission matrix to control exactly what crew see on their phones in real-time." },
      { name: "Technical Reports", value: "Specialized logs for Camera, Sound, and DIT, designed for fast execution on long days." },
      { name: "On-Set Notes", value: "A timestamped shoot diary for logging incidents, decisions, and meetings as they happen." }
    ]
  },
  {
    phase: "PHASE 04",
    title: "POST-PRODUCTION",
    description: "Seamlessly transition from the set to the edit suite with absolute technical accuracy.",
    features: [
      { name: "Client Selects", value: "Collaborative file tracker for Approved, Reshoot, and Kill takes with client feedback." },
      { name: "Deliverable Checklist", value: "Asset version management with specs, formats, and deadline tracking for every deliverable." },
      { name: "Archive Registry", value: "Long-term tracking mapping assets to cloud, physical storage, and master vaults." },
      { name: "Actual vs. Budget", value: "Automated financial reconciliation comparing estimates to real spend with variance data." }
    ]
  }
];

const FAQS = [
  {
    q: "How does 'Remote Mode' work on a shoot with no service?",
    a: "We understand that the best locations often have the worst signal. onSET Mobile and our technical logs are designed to buffer data locally and sync automatically the moment you hit a pocket of LTE or return to basecamp."
  },
  {
    q: "Do I have to pay for seats for every crew member?",
    a: "No. onFORMAT is designed for producers. Your crew accesses their authorized documents through a secure 'Email Gate' at no additional cost. You maintain total control over who sees what."
  },
  {
    q: "Can I export documents for offline clients?",
    a: "Absolutely. Our 'Print Room' feature allows you to compile any combination of documents into a single, professionally branded PDF that is ready for email or physical printing."
  },
  {
    q: "How secure is my proprietary creative content?",
    a: "We use enterprise-grade encryption and built-in NDA gates. Crew must acknowledge your confidentiality agreement before they can view a single frame of your storyboard or a line of your script."
  },
  {
    q: "Is this built for still photographers too?",
    a: "Yes. While we support full AV script logic, many of our users are photographers using the platform for complex commercial stills productions, leveraging the Locations, Casting, and Client Selects tools."
  }
];

export default function FeaturesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-zinc-900 font-sans tracking-tight selection:bg-zinc-200">
      
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex items-center justify-between bg-white/70 backdrop-blur-2xl border-b border-zinc-200">
        <Link href="/" className="flex items-center group">
          <img src="/octo%20logo%20bk.png" alt="onFORMAT Logo" className="h-[60px] md:h-[70px] w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/features" className="text-xs font-semibold uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-900 pb-1 hidden md:block">Features</Link>
          <Link href="/pricing" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">Pricing</Link>
          {!loading ? (
            <Link 
              href={user ? "/dashboard" : "/login"} 
              className={user 
                ? "bg-orange-500/90 text-white px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center gap-2 backdrop-blur-md border border-orange-400/50"
                : "bg-zinc-900 text-white px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              }
            >
              {user ? "Dashboard" : "Join Private Beta"} <ArrowRight size={14} />
            </Link>
          ) : (
            <div className="h-10 w-32 bg-zinc-100 rounded-full animate-pulse" />
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-48 pb-24 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white shadow-sm text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
           System Capabilities
        </div>
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-zinc-900 mb-8 leading-[0.95] uppercase">
          BUILT FOR THE <br className="hidden md:block" />
          <span className="text-zinc-400 font-light">CHAOS OF SET.</span>
        </h1>
        <p className="text-xl text-zinc-500 font-medium max-w-3xl mx-auto leading-relaxed">
          onFORMAT is a unified production operating system that stays in sync from the first creative spark to the final client deliverable. No more fragmented spreadsheets or outdated call sheets.
        </p>
      </section>

      {/* PHASE BREAKDOWN */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="space-y-32">
          {FEATURE_SECTIONS.map((section, idx) => (
            <div key={section.title} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-16 items-start`}>
              <div className="flex-1 space-y-6">
                <span className="text-xs font-black tracking-[0.3em] text-zinc-400 uppercase">{section.phase}</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 uppercase leading-[0.9]">{section.title}</h2>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed">{section.description}</p>
                <div className="pt-8">
                  {!user && (
                    <Link href="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-900 group">
                      Join Private Beta <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                {section.features.map(f => (
                  <div key={f.name} className="bg-white border border-zinc-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
                    <h4 className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase mb-3 group-hover:text-zinc-900 transition-colors">{f.name}</h4>
                    <p className="text-zinc-600 font-medium leading-relaxed">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="py-32 bg-zinc-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6">INTELLIGENT INFRASTRUCTURE</h2>
            <p className="text-zinc-400 font-medium max-w-2xl mx-auto">Built on a reactive data engine that ensures every department is looking at the same version of the truth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Cpu />, title: "AI LIAISON", desc: "A creative partner trained in the nuances of production to help you draft scripts, vision, and strategy." },
              { icon: <Smartphone />, title: "onSET MOBILE", desc: "Mobile-first interfaces for crew that allow for live shot completion and technical logging." },
              { icon: <Shield />, title: "PERMISSION MATRIX", desc: "Producer-level control over which crew members see which documents based on ABCD grouping." },
              { icon: <FileText />, title: "PRINT ROOM", desc: "Beautifully formatted, client-ready PDF exports that compile multiple project docs into one." },
              { icon: <Zap />, title: "DATA REACTION", desc: "Changes in your schedule update your call sheet. Changes in your script update your shot list." },
              { icon: <Layout />, title: "PHASE LOGIC", desc: "A unified workspace that guides the project lifecycle from concept to archive without friction." }
            ].map(item => (
              <div key={item.title} className="bg-zinc-800/50 border border-zinc-700 p-10 rounded-[30px] hover:bg-zinc-800 transition-colors">
                <div className="w-12 h-12 bg-zinc-700/50 rounded-2xl flex items-center justify-center mb-8 text-white">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
                </div>
                <h3 className="text-lg font-black tracking-widest uppercase mb-4">{item.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-32 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6 text-zinc-900">PRODUCER FREQUENTLY ASKED QUESTIONS</h2>
          <p className="text-zinc-500 font-medium">Clear answers for the technical and logistical realities of the job.</p>
        </div>
        <div className="space-y-6">
          {FAQS.map(faq => (
            <div key={faq.q} className="bg-white border border-zinc-200 p-10 rounded-[40px] shadow-sm">
              <h4 className="text-lg font-black tracking-tight text-zinc-900 mb-4 uppercase leading-tight">{faq.q}</h4>
              <p className="text-zinc-500 font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-4 md:px-8 text-center bg-zinc-50">
        <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-zinc-900 mb-8 uppercase leading-tight">
          READY TO OWN YOUR <br className="hidden md:block" />
          <span className="text-zinc-400 font-light">PRODUCTION?</span>
        </h2>
        <div className="flex flex-col items-center gap-6">
          {!user && (
            <>
              <Link href="/login" className="bg-zinc-900 text-white px-10 py-5 rounded-full text-xs md:text-base font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl hover:-translate-y-1 flex items-center gap-3">
                Get Started with a 14-Day Free Trial <ArrowRight size={20} />
              </Link>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Log in to a demo project instantly • no setup required
              </p>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 border-t border-zinc-200/80 bg-white text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-widest">&copy; 2026 onFORMAT. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/" className="text-[10px] md:text-xs font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-900">Home</Link>
            <Link href="/pricing" className="text-[10px] md:text-xs font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-900">Pricing</Link>
            <Link href="/features" className="text-[10px] md:text-xs font-semibold text-zinc-900 uppercase tracking-widest">Features</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
