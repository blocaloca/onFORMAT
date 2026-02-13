'use client';

import React, { useState } from 'react';
import { Crown, Sparkles, Check, CheckCircle, Loader2 } from 'lucide-react';
import { toggleProOverride, toggleBetaUser, markFeedbackRead } from './actions';

// User Actions Component
export function UserActions({ user }: { user: any }) {
    const [isPendingPro, setIsPendingPro] = useState(false);
    const [isPendingBeta, setIsPendingBeta] = useState(false);

    const handleTogglePro = async () => {
        setIsPendingPro(true);
        try {
            await toggleProOverride(user.id, user.manual_pro_override || false);
        } finally {
            setIsPendingPro(false);
        }
    };

    const handleToggleBeta = async () => {
        setIsPendingBeta(true);
        try {
            await toggleBetaUser(user.id, user.is_beta_user || false);
        } finally {
            setIsPendingBeta(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Manual Pro Override */}
            <button
                onClick={handleTogglePro}
                disabled={isPendingPro}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${user.manual_pro_override
                        ? 'bg-amber-400 text-black hover:bg-amber-500'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    } ${isPendingPro ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isPendingPro ? <Loader2 size={12} className="animate-spin" /> : <Crown size={12} fill={user.manual_pro_override ? "currentColor" : "none"} />}
                {user.manual_pro_override ? 'Pro Active' : 'Grant Pro'}
            </button>

            {/* Beta Access */}
            <button
                onClick={handleToggleBeta}
                disabled={isPendingBeta}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${user.is_beta_user
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                        : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900'
                    } ${isPendingBeta ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isPendingBeta ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} fill={user.is_beta_user ? "currentColor" : "none"} />}
                {user.is_beta_user ? 'Beta Active' : 'Grant Beta'}
            </button>
        </div>
    );
}

// Feedback Actions Component
export function FeedbackActions({ message }: { message: any }) {
    const [isPending, setIsPending] = useState(false);

    const handleMarkRead = async () => {
        setIsPending(true);
        try {
            await markFeedbackRead(message.id);
        } finally {
            setIsPending(false);
        }
    };

    if (message.status === 'read') return <span className="text-emerald-500 font-bold text-xs flex items-center gap-1"><CheckCircle size={14} /> Read</span>;

    return (
        <button
            onClick={handleMarkRead}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-emerald-600 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${isPending ? 'opacity-70 cursor-wait' : ''}`}
        >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Mark Read
        </button>
    );
}
