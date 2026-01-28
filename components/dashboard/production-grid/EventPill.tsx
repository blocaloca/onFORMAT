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
                group
                absolute top-1 bottom-1 rounded-sm text-[10px] font-bold uppercase tracking-wide
                flex items-center gap-2 px-2 overflow-hidden whitespace-nowrap shadow-sm hover:brightness-110 transition-all z-10
                ${bgClass} ${textClass}
                ${isClashing ? 'ring-2 ring-white ring-offset-2 ring-offset-red-500 z-50' : ''}
            `}
            style={style}
            title={`${isClashing ? '⚠️ CONFLICT: ' : ''}${event.title} - ${event.description || ''}`}
        >
            {/* Tooltip */}
            <div className="hidden group-hover:flex flex-col absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-sm text-white text-[10px] px-3 py-2 rounded-md shadow-2xl whitespace-nowrap z-50 pointer-events-none border border-white/10 min-w-[120px]">
                <span className="font-bold uppercase tracking-wider mb-0.5">{event.title}</span>
                {event.description && <span className="text-zinc-400 font-mono text-[9px] truncate max-w-[200px]">{event.description}</span>}
                {isClashing && <span className="text-red-400 font-bold mt-1 animate-pulse">⚠️ CONFLICT DETECTED</span>}

                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>

            {isClashing && <span className="text-white animate-pulse">⚠️</span>}
            <Icon size={12} className="shrink-0" />
            <span className="truncate">{event.title}</span>
        </button>
    );
};
