'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MessageSquarePlus, X, Loader2, Bug, Lightbulb } from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';
import { usePathname } from 'next/navigation';

export function BetaFeedbackTrigger({ variant = 'fixed' }: { variant?: 'fixed' | 'icon' }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<'bug' | 'feature' | 'other'>('bug');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitFeedback(message, type, {
                url: window.location.href,
                userAgent: navigator.userAgent
            });
            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                setMessage('');
                setType('bug');
            }, 2000);
        } catch (error) {
            console.error(error);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {variant === 'fixed' ? (
                    <button
                        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black text-white px-4 py-3 rounded-full shadow-lg hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 font-bold text-xs uppercase tracking-widest border border-zinc-800 ${pathname?.startsWith('/onset') ? 'hidden' : ''}`}
                        title="Submit Beta Feedback"
                    >
                        <MessageSquarePlus size={16} />
                        <span className="hidden md:inline">Beta Feedback</span>
                    </button>
                ) : (
                    <button
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors border border-zinc-700"
                        title="Submit Beta Feedback"
                    >
                        <MessageSquarePlus size={12} />
                        <span>Beta</span>
                    </button>
                )}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[200] w-[calc(100vw-2rem)] max-w-md max-h-[90dvh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200">

                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Check size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">Feedback Sent!</h3>
                            <p className="text-sm text-zinc-500">Thank you for helping us improve.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <Dialog.Title className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                    <MessageSquarePlus size={16} />
                                    Submit Feedback
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                        <X size={16} />
                                    </button>
                                </Dialog.Close>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setType('bug')}
                                        className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${type === 'bug'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-100'
                                            }`}
                                    >
                                        <Bug size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Bug Report</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('feature')}
                                        className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${type === 'feature'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-100'
                                            }`}
                                    >
                                        <Lightbulb size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Feature Idea</span>
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Message</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={type === 'bug' ? "Describe what happened..." : "I wish I could..."}
                                        className="w-full h-32 p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="w-full bg-black text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Feedback'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// Internal Icon for success state
function Check({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
