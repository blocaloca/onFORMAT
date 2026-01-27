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
}

export const EventPill = ({ event, width, left, onClick, isClashing }: EventPillProps) => {

    // Style logic based on event type
    let bgClass = "bg-zinc-800";
    let textClass = "text-white";
    let Icon = Calendar;

    if (event.type === 'SHOOT_DAY') {
        Icon = Video;
        bgClass = "bg-red-500";
        textClass = "text-white";
    } else if (event.type === 'POST_DEADLINE') {
        Icon = Sparkles;
        bgClass = "bg-amber-500";
        textClass = "text-white";
    }

    // Dynamic Style
    const style: React.CSSProperties = {
        width: `${width}px`,
        left: `${left}px`,
    };

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            className={`
                absolute top-1 bottom-1 rounded-sm text-[10px] font-bold uppercase tracking-wide
                flex items-center gap-2 px-2 overflow-hidden whitespace-nowrap shadow-sm hover:brightness-110 transition-all z-10
                ${bgClass} ${textClass}
                ${isClashing ? 'ring-2 ring-white ring-offset-2 ring-offset-red-500 z-50' : ''}
            `}
            style={style}
            title={`${isClashing ? '⚠️ CONFLICT: ' : ''}${event.title} - ${event.description || ''}`}
        >
            {isClashing && <span className="text-white animate-pulse">⚠️</span>}
            <Icon size={12} className="shrink-0" />
            <span className="truncate">{event.title}</span>
        </button>
    );
};
