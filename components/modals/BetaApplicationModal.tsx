'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle, Zap } from 'lucide-react';
import { getClient } from '@/lib/supabase';

interface BetaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BetaApplicationModal({ isOpen, onClose }: BetaModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    projectTypes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('beta_requests')
        .insert([{
          full_name: formData.name,
          email: formData.email,
          role: formData.role,
          project_types: formData.projectTypes
        }]);

      if (error) {
        if (error.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Beta application error:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Branding */}
        <div className="bg-zinc-900 p-8 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <Zap size={14} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Beta Program Application</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access the Ecosystem.</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 text-zinc-900 dark:text-zinc-100">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                We are currently onboarding a limited group of creative pioneers. Approved applicants receive a <span className="font-bold text-zinc-900 dark:text-white underline decoration-orange-500">60-day Pro Tier ($98 value)</span> to stress-test the engine.
              </p>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-600 text-xs font-bold uppercase tracking-wide text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="NAME"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-bold placeholder:text-zinc-400 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Work Email</label>
                  <input
                    required
                    type="email"
                    placeholder="EMAIL"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-bold placeholder:text-zinc-400 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Primary Role</label>
                <select
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-bold appearance-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">SELECT ROLE</option>
                  <option value="Producer">PRODUCER</option>
                  <option value="Executive Producer">EXECUTIVE PRODUCER</option>
                  <option value="Director">DIRECTOR</option>
                  <option value="Director of Photography">DP / CINEMATOGRAPHER</option>
                  <option value="Production Manager">PRODUCTION MANAGER</option>
                  <option value="DIT">DIT / DATA TECH</option>
                  <option value="Agency / Client">AGENCY / CLIENT</option>
                </select>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">What kind of projects do you capture?</label>
                <textarea
                  required
                  placeholder="EX: COMMERCIAL STILLS, NARRATIVE SHORT, HIGH-VOLUME ECOMM..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-bold placeholder:text-zinc-400 min-h-[100px] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                  value={formData.projectTypes}
                  onChange={e => setFormData({ ...formData, projectTypes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : (
                  <>
                    <Send size={14} /> Submit Application
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center mt-4">
                Strict Privacy Protocols In Effect
              </p>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                <CheckCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Pioneer Registry Complete.</h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">
                  Your application has been queued for review by the Founder. We will contact you via email at <span className="text-zinc-900 font-bold underline underline-offset-2">{formData.email}</span> within 24-48 hours.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
              >
                Close Registry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
