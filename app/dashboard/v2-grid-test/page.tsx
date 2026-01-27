'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { buildGridRows } from '@/lib/production-grid/parser';
import { GridRow } from '@/lib/production-grid/types';
import { GlobalGridContainer } from '@/components/dashboard/production-grid/GlobalGridContainer';
import Link from 'next/link';

export default function GridTestPage() {

    const [rows, setRows] = useState<GridRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch ALL projects (no caching for test)
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false });

            if (data) {
                // Map to logic layer
                const gridData = buildGridRows(data.map(p => ({
                    id: p.id,
                    name: p.name,
                    data: p.data
                })));
                setRows(gridData);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="w-full h-screen bg-zinc-100 dark:bg-black p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase text-zinc-900 dark:text-white">Production Grid Test</h1>
                    <p className="text-xs text-zinc-500 font-mono">v2.0 Logic Layer Prototype</p>
                </div>
                <Link href="/dashboard" className="text-xs font-bold uppercase underline text-zinc-500 hover:text-black dark:hover:text-white">Back to Dashboard</Link>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center animate-pulse text-zinc-400 font-mono text-xs uppercase">
                    Analyzing Schedule Data...
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <GlobalGridContainer rows={rows} />
                </div>
            )}
        </div>
    );
}
