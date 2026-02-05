'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isFounder } from '@/lib/permissions';
import { Loader2, CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';

export default function FounderDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [changelog, setChangelog] = useState<any[]>([]);

    // Inputs
    const [version, setVersion] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isFounder(user.email)) {
                router.push('/dashboard');
                return;
            }
            fetchData();
        };
        check();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fbRes, clRes] = await Promise.all([
                fetch('/api/admin/feedback'),
                fetch('/api/admin/changelog')
            ]);

            if (fbRes.ok) setFeedback(await fbRes.json());
            if (clRes.ok) setChangelog(await clRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        // Optimistic
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));

        await fetch('/api/admin/feedback', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
    };

    const addVersion = async () => {
        if (!version || !notes) return;

        await fetch('/api/admin/changelog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                version,
                notes,
                date: new Date().toISOString()
            })
        });

        setVersion('');
        setNotes('');
        fetchData(); // Reload
    };

    if (loading && feedback.length === 0) {
        return <div className="h-screen bg-black text-white flex items-center justify-center font-mono">AUTHENTICATING...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-12 font-sans">
            <header className="mb-12 border-b border-zinc-800 pb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Founder Deck</h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase">onFORMAT Command Center</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 bg-zinc-900 rounded hover:bg-zinc-800 transition-colors"
                >
                    <RefreshCw size={16} />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* FEEDBACK COLUMN */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-xl font-bold uppercase tracking-widest border-l-4 border-emerald-500 pl-4 mb-6">
                        Feedback Loop
                    </h2>

                    <div className="space-y-4">
                        {feedback.length === 0 && <p className="text-zinc-600 italic">No feedback received yet.</p>}

                        {feedback.map(item => (
                            <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${item.category === 'bug' ? 'bg-red-900/30 text-red-500' :
                                                    item.category === 'feature' ? 'bg-emerald-900/30 text-emerald-500' :
                                                        'bg-blue-900/30 text-blue-500'
                                                }`}>
                                                {item.category}
                                            </span>
                                            <span className="text-zinc-500 text-xs font-mono">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            From: <span className="text-white font-bold">{item.profiles?.email || 'Anonymous'}</span>
                                        </p>
                                    </div>

                                    {/* Status Toggles */}
                                    <div className="flex bg-black rounded p-1 border border-zinc-800">
                                        <button
                                            onClick={() => updateStatus(item.id, 'new')}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${item.status === 'new' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            New
                                        </button>
                                        <button
                                            onClick={() => updateStatus(item.id, 'in-progress')}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${item.status === 'in-progress' ? 'bg-amber-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            onClick={() => updateStatus(item.id, 'resolved')}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${item.status === 'resolved' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Resolved
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-200 mb-4 whitespace-pre-wrap">{item.message}</p>

                                {item.metadata?.url && (
                                    <div className="text-[10px] text-zinc-600 font-mono truncate bg-black p-2 rounded">
                                        URL: {item.metadata.url}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SIDEBAR: CHANGELOG */}
                <div className="space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <Sparkles size={16} /> Version Tracker
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Version</label>
                                <input
                                    value={version}
                                    onChange={e => setVersion(e.target.value)}
                                    placeholder="v1.1.0"
                                    className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Changelog Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="- Added feature X..."
                                    className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded font-sans h-24"
                                />
                            </div>
                            <button
                                onClick={addVersion}
                                disabled={!version || !notes}
                                className="w-full bg-white text-black font-bold uppercase py-2 text-xs hover:bg-zinc-200 disabled:opacity-50"
                            >
                                Publish Update
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            <h4 className="text-[10px] font-bold uppercase text-zinc-600 border-b border-zinc-800 pb-2">History</h4>
                            {changelog.map(log => (
                                <div key={log.id} className="text-sm">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-mono font-bold text-emerald-500">{log.version}</span>
                                        <span className="text-[10px] text-zinc-600">{new Date(log.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-zinc-400 text-xs">{log.notes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Icon helper
function Sparkles({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    );
}
