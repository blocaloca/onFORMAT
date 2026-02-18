import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const GlassInput = ({ label, error, className = '', ...props }: GlassInputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                    {label}
                </label>
            )}
            <input
                className={`
              w-full px-3 py-2
              bg-zinc-200/40 dark:bg-zinc-900/40
              border border-zinc-300 dark:border-zinc-800
              rounded-sm
              font-mono text-sm text-foreground
              placeholder-zinc-400 dark:placeholder-zinc-600
              focus:bg-white dark:focus:bg-zinc-950
              focus:border-black dark:focus:border-white
              focus:ring-1 focus:ring-black dark:focus:ring-white
              focus:outline-none
              transition-all duration-200
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-[9px] uppercase font-bold text-red-500 tracking-wide">{error}</p>
            )}
        </div>
    );
};
