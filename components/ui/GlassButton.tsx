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
    const baseStyles = "relative overflow-hidden rounded-sm font-mono font-bold uppercase tracking-widest transition-all duration-75 ease-out flex items-center justify-center gap-2 select-none active:scale-[0.98]";

    const variants = {
        primary: `
            bg-blue-500 text-white shadow-sm shadow-blue-900/20
            shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
            active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.2)]
            hover:brightness-110
        `,
        secondary: `
            bg-zinc-200 text-zinc-900 border border-zinc-300 shadow-sm
            active:bg-zinc-300 active:shadow-inner
            hover:bg-white hover:border-zinc-400
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
            {variant === 'primary' && (
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            )}

            {children}
        </button>
    );
};
