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
              bg-white dark:bg-zinc-950
              border border-zinc-200 dark:border-zinc-800
              rounded-none
              font-mono text-sm text-zinc-900 dark:text-zinc-100
              placeholder-zinc-400 dark:placeholder-zinc-600
              focus:bg-zinc-50 dark:focus:bg-zinc-900 
              focus:border-zinc-400 dark:focus:border-zinc-600 
              focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600
              focus:outline-none
              transition-colors duration-150
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
