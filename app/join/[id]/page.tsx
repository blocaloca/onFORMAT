'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function JoinProjectPage() {
    const params = useParams(); // Use useParams for client components
    const router = useRouter();
    const projectId = params?.id as string;

    const [projectName, setProjectName] = useState('Loading...');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewDoc, setViewDoc] = useState<'nda' | 'privacy' | null>(null);

    useEffect(() => {
        if (projectId) {
            // Fetch project name just for display
            supabase.from('projects').select('name').eq('id', projectId).single()
                .then(({ data }) => {
                    if (data) setProjectName(data.name || 'Untitled Production');
                });
        }
    }, [projectId]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed || !email || !projectId) return;

        setLoading(true);

        try {
            // 1. Store email locally for frictionless mobile access
            localStorage.setItem('onset_user_email', email);

            // 2. Add to Crew Membership (Upsert)
            // We use upsert to avoid errors if they are already added
            const { error } = await supabase.from('crew_membership').upsert({
                project_id: projectId,
                user_email: email,
                role: 'Crew', // Default role
                is_verified: true, // Auto-verify for now in this MVP flow
                invited_at: new Date().toISOString()
            }, { onConflict: 'project_id,user_email' });

            if (error) {
                console.error('Join error:', error);
                // Continue anyway to show dashboard, assuming "Viewer" access
            }

            // 3. Redirect to Mobile Dashboard
            router.push(`/onset/${projectId}`);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {viewDoc && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col p-6 animate-in slide-in-from-bottom-10">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                        <h2 className="text-lg font-black uppercase tracking-wider text-white">
                            {viewDoc === 'nda' ? 'Non-Disclosure Agreement' : 'Privacy Policy'}
                        </h2>
                        <button
                            onClick={() => setViewDoc(null)}
                            className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
                            {viewDoc === 'nda' ? (
                                <>
                                    <h3 className="text-white font-bold uppercase mb-4">Confidentiality & Non-Disclosure Agreement</h3>
                                    <p><strong className="text-white">Confidentiality:</strong> All project materials, including scripts, call sheets, and schedules, are strictly confidential.</p>
                                    <p><strong className="text-white">No Photography/Social Media:</strong> You are prohibited from taking or sharing photos, videos, or "behind-the-scenes" content without explicit written permission.</p>
                                    <p><strong className="text-white">Proprietary Info:</strong> All technical data, such as DIT logs and lighting plots, remains the property of the Production.</p>
                                    <p><strong className="text-white">Revocable Access:</strong> Access to this dashboard is a privilege for active crew members and can be revoked by the Administrator at any time.</p>
                                </>
                            ) : (
                                <>
                                    <p><strong>onFORMAT Terms of Service</strong></p>
                                    <p>By joining this project, you agree to the onFORMAT Terms of Service. We use your email to secure your access to project documents and to keep you updated on platform features and industry tools. You can opt-out of marketing communications at any time via your account settings.</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-zinc-900">
                        <button onClick={() => setViewDoc(null)} className="w-full bg-white text-black font-bold uppercase py-4 rounded-xl tracking-wide hover:bg-zinc-200">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black z-0 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-6 ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 border-2 border-white/50 rounded-full" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Access Production</h1>
                    <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">{projectName}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleJoin} className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-6 shadow-2xl">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5 ml-1">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@production.com"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/40 focus:bg-black/80 transition-all text-sm placeholder:text-zinc-600"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-white bg-transparent border-zinc-600 rounded cursor-pointer"
                            id="consent"
                        />
                        <label htmlFor="consent" className="text-[10px] leading-relaxed text-zinc-400 cursor-pointer select-none">
                            I verify that I am an authorized crew member. I agree to the <span className="text-white underline hover:text-emerald-400 transition-colors" onClick={(e) => { e.preventDefault(); setViewDoc('nda'); }}>NDA</span> and <span className="text-white underline hover:text-emerald-400 transition-colors" onClick={(e) => { e.preventDefault(); setViewDoc('privacy'); }}>Privacy Policy</span>. I understand my activity is logged.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!agreed || !email || loading}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 ${agreed && email
                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02]'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Verifying...' : 'Enter Set'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] text-zinc-600 font-mono">SECURED BY CREATIVE OS</p>
                </div>

            </div>
        </div>
    );
}
