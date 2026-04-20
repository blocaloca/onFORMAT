'use client';

import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sendTestEmailAction } from '@/app/admin/actions';

export default function ResendTestButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleTest = async () => {
        setStatus('loading');
        setErrorMessage('');
        
        try {
            const res = await sendTestEmailAction();
            if (res.success) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setErrorMessage(res.error || 'Unknown error');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Network error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleTest}
                disabled={status === 'loading'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                    status === 'success' 
                    ? 'bg-emerald-500 text-white' 
                    : status === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-900 text-zinc-100 hover:bg-black'
                } ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}`}
            >
                {status === 'loading' ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : status === 'success' ? (
                    <CheckCircle size={12} />
                ) : status === 'error' ? (
                    <AlertCircle size={12} />
                ) : (
                    <Mail size={12} />
                )}
                
                {status === 'loading' ? 'Testing...' : status === 'success' ? 'Email Sent' : status === 'error' ? 'Test Failed' : 'Test Resend'}
            </button>
            
            {status === 'error' && errorMessage && (
                <span className="text-[9px] text-red-500 font-bold uppercase animate-pulse">
                    {errorMessage}
                </span>
            )}
        </div>
    );
}
