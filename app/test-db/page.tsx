'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function TestDBPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [status, setStatus] = useState('Ready');
    const [userId, setUserId] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`]);

    const runTest = async () => {
        setLogs([]);
        addLog("Starting Test...");

        // 1. Check Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            addLog("❌ Auth Error: " + (authError?.message || "No User"));
            setStatus("Failed Auth");
            return;
        }
        setUserId(user.id);
        addLog(`✅ Authenticated: ${user.email} (${user.id})`);

        // 2. Test Read
        addLog("Testing SELECT * ...");
        const { data: readData, error: readError } = await supabase.from('projects').select('*').limit(5);
        if (readError) {
            addLog("❌ SELECT Error: " + JSON.stringify(readError));
        } else {
            addLog(`✅ SELECT Success. Found ${readData.length} records.`);
        }

        // 3. Test Insert
        addLog("Testing INSERT ...");
        const testProject = {
            user_id: user.id,
            name: "DB Connectivity Test " + Math.floor(Math.random() * 1000),
            data: { test: true },
            current_version: 1,
            // Ensure other required fields if any? (product_type etc have defaults?)
            product_type: 'LuxPixPro',
        };

        const { data: insertData, error: insertError } = await supabase
            .from('projects')
            .insert(testProject)
            .select()
            .single();

        if (insertError) {
            addLog("❌ INSERT Error: " + JSON.stringify(insertError));
            addLog("Details: " + insertError.message);
            addLog("Hint: " + insertError.hint);
        } else {
            addLog("✅ INSERT Success! New ID: " + insertData.id);
        }
    };

    return (
        <div className="p-12 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl mb-4">Database Diagnostics</h1>
            <p className="mb-8 text-zinc-400">User: {userId || '...'}</p>

            <button
                onClick={runTest}
                className="bg-emerald-500 text-black px-6 py-3 font-bold rounded hover:bg-emerald-400 mb-8"
            >
                RUN DIAGNOSTIC
            </button>

            <div className="bg-zinc-900 p-4 rounded border border-zinc-800 font-mono text-sm">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-zinc-800 pb-1 last:border-0">{log}</div>
                ))}
            </div>
        </div>
    );
}
