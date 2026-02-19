import React from 'react';
import { cn } from '@/lib/utils';

type UnitType = 'A' | 'B' | 'C';

interface UnitBadgeProps {
    unit: UnitType;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const UnitBadge = ({ unit, className, size = 'md' }: UnitBadgeProps) => {
    const colors = {
        'A': 'bg-[#3B82F6] text-white shadow-blue-900/20', // Digital Blue
        'B': 'bg-[#FBBF24] text-white shadow-amber-900/20', // Amber
        'C': 'bg-[#22C55E] text-white shadow-green-900/20', // Signal Green
    };

    const sizes = {
        'sm': 'w-5 h-5 text-[9px]',
        'md': 'w-6 h-6 text-[10px]',
        'lg': 'w-8 h-8 text-xs',
    };

    const colorClass = colors[unit] || 'bg-zinc-500 text-white'; // Fallback
    const sizeClass = sizes[size] || sizes['md'];

    return (
        <div className={cn(
            "flex items-center justify-center font-mono font-bold rounded-sm shadow-sm select-none",
            colorClass,
            sizeClass,
            "border border-white/10", // Subtle inner highlight
            className
        )}>
            {unit || '?'}
        </div>
    );
};
