import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const GlassButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: GlassButtonProps) => {

    // INDUSTRIAL DESIGN SYSTEM OVERRIDE - Machined Glass
    const baseStyles = "relative overflow-hidden rounded-sm font-mono font-bold uppercase tracking-widest transition-all duration-500 tactile flex items-center justify-center gap-2 select-none active:scale-[0.98]";

    const variants = {
        primary: `
            bg-zinc-900 text-white 
            shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_1px_2px_rgba(0,0,0,0.1)] 
            hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:bg-zinc-800
        `,
        secondary: `
            bg-white/80 backdrop-blur-sm text-zinc-900 border border-zinc-200/60
            shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)]
            hover:bg-white hover:border-zinc-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]
        `,
        ghost: "bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-[10px]",
        md: "px-5 py-2.5 text-xs",
        lg: "px-8 py-3 text-sm"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} group`}
            {...props}
        >
            {/* Top Edge Highlight for Machined Glass Look */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            {children}
        </button>
    );
};
