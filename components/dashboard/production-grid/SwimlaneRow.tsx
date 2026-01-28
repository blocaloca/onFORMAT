import React from 'react';
import { GridRow } from '@/lib/production-grid/types';
import { EventPill } from './EventPill';
import { tokens } from '@/lib/theme/tokens';

interface SwimlaneRowProps {
    row: GridRow;
    dateRange: { start: Date; end: Date }; // The viewport range
    dayWidth: number; // Pixels per day
    onEventClick: (eventId: string) => void;
    clashingIds?: Set<string>;
}

export const SwimlaneRow = ({ row, dateRange, dayWidth, onEventClick, clashingIds }: SwimlaneRowProps) => {

    // Helper: Position calculation
    const getPosition = (dateStr: string) => {
        // Parse "YYYY-MM-DD" manually to ensure Local Time Midnight
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d); // Local Midnight

        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0); // Normalize viewport start to midnight

        const diffTime = date.getTime() - start.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays * dayWidth;
    };

    return (
        <div className={`flex w-full h-[60px] border-b ${tokens.border.subtle} group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors`}>

            {/* Left Header (Sticky?) - Handled by parent container generally, but putting label here for simple MV1 */}
            <div className={`w-48 shrink-0 flex flex-col justify-center px-4 border-r ${tokens.border.subtle} bg-white dark:bg-zinc-950 sticky left-0 z-20`}>
                <span className={`text-xs font-bold truncate ${tokens.text.primary}`}>{row.label}</span>
                <span className={`text-[10px] uppercase truncate ${tokens.text.secondary}`}>{row.meta.client}</span>
            </div>

            {/* Timeline Area */}
            <div className="relative flex-1 h-full">
                {/* Grid Lines (Vertical) - Rendered by parent or CSS BG? Let's render absolute pills for now */}

                {row.events.map(evt => {
                    const left = getPosition(evt.startDate);
                    // Determine width (Duration + 1 day inclusive)
                    const end = getPosition(evt.endDate);
                    // DayWidth - 4px margin
                    const width = Math.max(dayWidth - 4, (end - left) + dayWidth - 4);

                    // Check visibility logic? We rely on overflow-hidden for now.

                    return (
                        <EventPill
                            key={evt.id}
                            event={evt}
                            left={left + 2} // 2px margin
                            width={width}
                            onClick={() => onEventClick(evt.id)}
                            isClashing={clashingIds?.has(evt.id)}
                        />
                    )
                })}
            </div>
        </div>
    );
};
