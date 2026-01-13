import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const GlassInput = ({ label, error, className = '', ...props }: GlassInputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-4 py-3
          bg-white/50 dark:bg-black/30
          backdrop-blur-md
          border border-gray-200 dark:border-white/10
          rounded-xl
          text-gray-900 dark:text-white
          placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
          transition-all duration-300
          ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};
