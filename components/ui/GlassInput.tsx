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
              w-full px-4 py-3
              bg-zinc-950
              border border-zinc-800
              rounded-sm
              text-xs font-bold text-white uppercase tracking-wide
              placeholder-zinc-700
              focus:bg-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-0
              transition-all duration-200
              ${error ? 'border-red-500' : ''}
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
