import React, { useRef, useState, useEffect, useMemo } from 'react';
import { GridRow } from '@/lib/production-grid/types';
import { SwimlaneRow } from './SwimlaneRow';
import { tokens } from '@/lib/theme/tokens';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { detectClashes } from '@/lib/production-grid/parser';

interface GlobalGridContainerProps {
    rows: GridRow[];
}

export const GlobalGridContainer = ({ rows }: GlobalGridContainerProps) => {
    const router = useRouter();

    const clashingIds = useMemo(() => detectClashes(rows), [rows]);

    // Viewport State
    const [startDate, setStartDate] = useState(new Date()); // Defaults to today
    const DAY_WIDTH = 60; // PX per day
    const VISIBLE_DAYS = 30;

    // Derived Range
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + VISIBLE_DAYS);

    // Scroll Handlers
    const shiftTime = (days: number) => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + days);
        setStartDate(newDate);
    };

    // Generate Date Headers
    const dateHeaders = [];
    for (let i = 0; i < VISIBLE_DAYS; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dateHeaders.push(d);
    }

    // Auto-scroll to today on mount? handled by default state.

    return (
        <div className={`flex flex-col h-full rounded-md border ${tokens.border.default} bg-white dark:bg-zinc-950 shadow-sm overflow-hidden`}>

            {/* Toolbar */}
            <div className={`h-12 border-b ${tokens.border.subtle} flex items-center justify-between px-4 bg-zinc-50 dark:bg-zinc-900`}>
                <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className={tokens.text.primary} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${tokens.text.primary}`}>
                        Production Grid
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => shiftTime(-7)} className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${tokens.text.secondary}`}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setStartDate(new Date())} className={`px-3 py-1 text-[10px] font-bold uppercase border rounded-sm ${tokens.border.default} ${tokens.text.secondary} hover:text-black dark:hover:text-white`}>
                        Today
                    </button>
                    <button onClick={() => shiftTime(7)} className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${tokens.text.secondary}`}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Grid Header (Dates) */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                {/* Spacer for Row Labels */}
                <div className="w-48 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />

                {/* Dates Track */}
                <div className="flex-1 overflow-hidden relative" style={{ height: '40px' }}>
                    <div className="absolute top-0 left-0 bottom-0 flex">
                        {dateHeaders.map((d, i) => {
                            const isToday = d.toDateString() === new Date().toDateString();
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                            return (
                                <div
                                    key={i}
                                    className={`
                                        shrink-0 flex flex-col justify-center items-center border-r border-zinc-100 dark:border-zinc-800/50 
                                        ${isWeekend ? 'bg-zinc-50/50 dark:bg-zinc-900/40' : ''}
                                        ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                    `}
                                    style={{ width: `${DAY_WIDTH}px` }}
                                >
                                    <span className={`text-[9px] uppercase font-bold leading-none ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`}>
                                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className={`text-xs font-bold leading-none mt-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                        {d.getDate()}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Rows Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                {/* Background Grid Lines (Absolute) */}
                <div className="absolute inset-0 flex pointer-events-none pl-48">
                    {dateHeaders.map((d, i) => (
                        <div
                            key={i}
                            style={{ width: `${DAY_WIDTH}px` }}
                            className={`shrink-0 border-r border-dashed border-zinc-100 dark:border-zinc-800/30 h-full ${d.toDateString() === new Date().toDateString() ? 'bg-blue-50/10' : ''}`}
                        />
                    ))}
                </div>

                {/* Content Rows */}
                {rows.map(row => (
                    <SwimlaneRow
                        key={row.id}
                        row={row}
                        dateRange={{ start: startDate, end: endDate }}
                        dayWidth={DAY_WIDTH}
                        clashingIds={clashingIds}
                        onEventClick={(eventId) => {
                            const event = row.events.find(e => e.id === eventId);
                            if (event?.linkedDocument) {
                                const { phase, toolKey } = event.linkedDocument;
                                router.push(`/project/${row.id}?phase=${phase}&tool=${toolKey}`);
                            }
                        }}
                    />
                ))}

                {rows.length === 0 && (
                    <div className="flex items-center justify-center p-12 text-zinc-400 text-xs uppercase tracking-widest">
                        No Active Projects Found
                    </div>
                )}
            </div>
        </div>
    );
};
