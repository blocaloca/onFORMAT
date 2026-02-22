'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Sparkles, Check, CheckCircle, Loader2 } from 'lucide-react';
import { toggleProOverride, toggleBetaUser, markFeedbackRead, deleteFeedback } from './actions';
import { Trash2 } from 'lucide-react';

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
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleMarkRead = async () => {
        setIsPending(true);
        try {
            await markFeedbackRead(message.id);
            router.refresh();
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this bug report?")) return;
        setIsDeleting(true);
        try {
            await deleteFeedback(message.id);
            router.refresh();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-3">
            {message.status === 'read' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle size={12} />
                    Report Resolved
                </div>
            ) : (
                <button
                    onClick={handleMarkRead}
                    disabled={isPending || isDeleting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-emerald-600 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${isPending ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Mark Read
                </button>
            )}

            <button
                onClick={handleDelete}
                disabled={isPending || isDeleting}
                className={`text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 ${isDeleting ? 'opacity-70 cursor-wait' : ''}`}
                title="Delete Report"
            >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
        </div>
    );
}

