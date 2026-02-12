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

    // INDUSTRIAL DESIGN SYSTEM OVERRIDE
    const baseStyles = "relative overflow-hidden rounded-sm font-bold uppercase tracking-widest transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/20 border border-emerald-500",
        secondary: "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white hover:bg-zinc-800",
        ghost: "bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-800/50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-[10px]",
        md: "px-5 py-2.5 text-xs",
        lg: "px-8 py-3 text-sm"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
