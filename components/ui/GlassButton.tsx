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

    const baseStyles = "relative overflow-hidden rounded-xl font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md";

    const variants = {
        primary: "bg-[#1D1D1F] text-white hover:bg-black shadow-lg hover:shadow-xl border border-transparent",
        secondary: "bg-white/60 dark:bg-white/10 text-[#1D1D1F] dark:text-white border border-white/20 hover:bg-white/80 dark:hover:bg-white/20 shadow-sm",
        ghost: "bg-transparent hover:bg-white/20 text-[#1D1D1F] dark:text-white"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
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
