import React from 'react';
import { ProductionEvent } from '@/lib/production-grid/types';
import { tokens } from '@/lib/theme/tokens';
import { Sparkles, MapPin, Video, Calendar } from 'lucide-react';

interface EventPillProps {
    event: ProductionEvent;
    width: number; // width in pixels
    left: number; // offset in pixels
    onClick?: () => void;
    isClashing?: boolean;
    onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseLeave?: () => void;
}

export const EventPill = ({ event, width, left, onClick, isClashing, onMouseEnter, onMouseLeave }: EventPillProps) => {

    // Style logic based on event type
    // Map Project Colors to Pill Colors (Brighter variants for visibility against dark/light modes)
    const COLOR_MAP: Record<string, string> = {
        'green': 'bg-emerald-600 border-emerald-500',
        'purple': 'bg-purple-600 border-purple-500',
        'orange': 'bg-orange-600 border-orange-500',
        'blue': 'bg-blue-600 border-blue-500',
        'red': 'bg-red-600 border-red-500',
    };

    // Default Fallback
    let bgClass = COLOR_MAP[event.projectColor || ''] || "bg-zinc-800 border-zinc-700";
    let textClass = "text-white";
    let Icon = Calendar;

    // Icon Logic remains Type-Based
    if (event.type === 'SHOOT_DAY') {
        Icon = Video;
    } else if (event.type === 'POST_DEADLINE') {
        Icon = Sparkles;
        // Optional: Keep deadline distinct? User asked for "Project Color", so let's stick to that for now unless specific overrides requested.
    }

    // Dynamic Style
    const style: React.CSSProperties = {
        width: `${width}px`,
        left: `${left}px`,
    };

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
                group
                absolute top-1 bottom-1 rounded-sm text-[10px] font-bold uppercase tracking-wide
                flex items-center gap-2 px-2 whitespace-nowrap shadow-sm hover:brightness-110 transition-all z-10 hover:z-[60]
                ${bgClass} ${textClass}
                ${isClashing ? 'ring-2 ring-white ring-offset-2 ring-offset-red-500 z-50' : ''}
            `}
            style={style}
            title="" // Disable native tooltip since we have custom one
        >
            {isClashing && <span className="text-white animate-pulse">⚠️</span>}
            <Icon size={12} className="shrink-0" />
            <span className="truncate">{event.title}</span>
        </button>
    );
};
