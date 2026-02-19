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
        'A': 'bg-[#E11D48] text-white shadow-red-900/20', // Solid Red
        'B': 'bg-[#3B82F6] text-white shadow-blue-900/20', // Solid Blue
        'C': 'bg-[#F59E0B] text-white shadow-amber-900/20', // Solid Gold
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
