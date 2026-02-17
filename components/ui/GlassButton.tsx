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
    const baseStyles = "relative overflow-hidden rounded-none font-mono font-bold uppercase tracking-widest transition-all duration-100 tactile flex items-center justify-center gap-2 select-none";

    const variants = {
        primary: "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent",
        secondary: "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900",
        ghost: "bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
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
