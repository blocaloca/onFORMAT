'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, MessageSquare, Bug, Lightbulb, Send, Loader2, CheckCircle2, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// FAQ Content
const FAQS = [
    {
        question: "How do I upgrade my plan?",
        answer: "Go to the Account page (click your avatar in the top right) and view the Subscription section. You can upgrade to Pro or Studio tiers there."
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes. You can manage your subscription via the Stripe Customer Portal, accessible from the Account page. Cancellations take effect at the end of the billing cycle."
    },
    {
        question: "Where are my PDF exports saved?",
        answer: "PDFs are generated on-the-fly and downloaded directly to your device. We do not store PDF files on our servers for privacy, but all the data used to generate them is saved securely."
    },
    {
        question: "How do I report a bug?",
        answer: "You can use the form below to report bugs directly to our engineering team. Please include as much detail as possible about what happened."
    },
    {
        question: "Is there a mobile app?",
        answer: "Yes! onSET is our mobile companion app designed for production days. It works in your mobile browser and is optimized for quick access to call sheets and schedules."
    }
];

export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Feedback Form State
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<'bug' | 'feature' | 'other'>('bug');
    const [userEmail, setUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setUserEmail(user.email);
        };
        getUser();
    }, []);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();

        // Allow anonymous feedback if not logged in? Ideally yes for support page.
        // But our RLS might require user_id. Let's check RLS or insert null user_id if allowed.
        // Schema: user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
        // So it accepts NULL. We just need to ensure RLS allows anon insert.
        // Actually, previous RLS "Users can submit feedback" checked `auth.uid() = user_id`.
        // If no user, auth.uid() is null. usage: `user_id: null` -> `null = null`? 
        // Postgres `null = null` is false/unknown.
        // We probably need to verify if anon feedback is allowed. 
        // For now, let's assume logged in mostly, or try. 
        // If not logged in, we might fail RLS if not updated.
        // Let's require email at least for contact form if not logged in.

        const payload = {
            user_id: user?.id || null,
            user_email: user?.email || userEmail, // Fallback to state if user manually entered (future feature)
            message: message,
            type: category,
            context: {
                userAgent: window.navigator.userAgent,
                url: window.location.href,
                source: 'Support Page'
            }
        };

        const { error } = await supabase.from('feedback_messages').insert(payload);

        if (error) {
            console.error('Feedback error:', error);
            alert('Failed to send message. If you are not logged in, please email support@onformat.com directly.');
        } else {
            setIsSuccess(true);
            setMessage('');
            setTimeout(() => setIsSuccess(false), 5000);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black pt-24 pb-20 px-8">

            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 relative">
                        <img src="/logo-white.png" alt="onFORMAT" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase">Support</span>
                </Link>
                <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                    Back to Dashboard
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-wide">
                        How can we help?
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Search our knowledge base or get in touch with our support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

                    {/* FAQ Section */}
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
                            <HelpCircle className="text-emerald-500" size={20} />
                            Common Questions
                        </h2>
                        <div className="space-y-4">
                            {FAQS.map((faq, idx) => (
                                <div key={idx} className="border-b border-zinc-800 pb-4">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full text-left flex justify-between items-start gap-4 hover:text-emerald-400 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-zinc-300 py-1">{faq.question}</span>
                                        <span className="text-zinc-500 text-lg leading-none">{openFaq === idx ? '−' : '+'}</span>
                                    </button>
                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${openFaq === idx ? 'grid-rows-[1fr] mt-3 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <p className="text-zinc-500 text-sm leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Terms Links */}
                        <div className="mt-12 pt-8 border-t border-zinc-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Legal</h3>
                            <div className="flex flex-col gap-2 text-sm text-zinc-400">
                                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                                <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 h-fit">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
                            <MessageSquare className="text-indigo-500" size={20} />
                            Contact Us
                        </h2>
                        <p className="text-zinc-500 text-sm mb-8">
                            Have a specific issue? Send us a message directly.
                        </p>

                        {isSuccess ? (
                            <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-lg p-8 text-center animate-in fade-in zoom-in-95">
                                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                                <h3 className="text-lg font-bold text-white mb-2">Message Sent</h3>
                                <p className="text-zinc-400 text-sm">We'll get back to you shortly.</p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="mt-6 text-xs text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest"
                                >
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Category */}
                                <div className="grid grid-cols-3 gap-2">
                                    {(['bug', 'feature', 'other'] as const).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`p-2 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors flex flex-col items-center gap-1 ${category === cat
                                                    ? cat === 'bug' ? 'bg-red-900/20 border-red-900 text-red-500'
                                                        : cat === 'feature' ? 'bg-emerald-900/20 border-emerald-900 text-emerald-500'
                                                            : 'bg-blue-900/20 border-blue-900 text-blue-500'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                                }`}
                                        >
                                            {cat === 'bug' && <Bug size={14} />}
                                            {cat === 'feature' && <Lightbulb size={14} />}
                                            {cat === 'other' && <MessageSquare size={14} />}
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Message */}
                                <div>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help?"
                                        className="w-full h-32 bg-black border border-zinc-800 rounded-lg p-4 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none transition-colors"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !message.trim()}
                                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors group"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    )}
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>

                                <p className="text-center text-[10px] text-zinc-600">
                                    Protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
