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
        'A': 'bg-red-600 text-white shadow-red-900/20', // Camera Red
        'B': 'bg-blue-600 text-white shadow-blue-900/20', // Camera Blue
        'C': 'bg-amber-500 text-white shadow-amber-900/20', // Camera Gold
    };

    const sizes = {
        'sm': 'w-5 h-5 text-[9px]',
        'md': 'w-6 h-6 text-[10px]',
        'lg': 'w-8 h-8 text-xs',
    };

    return (
        <div className={cn(
            "flex items-center justify-center font-mono font-bold rounded-sm shadow-sm select-none",
            colors[unit],
            sizes[size],
            "border border-white/10", // Subtle inner highlight
            className
        )}>
            {unit}
        </div>
    );
};
