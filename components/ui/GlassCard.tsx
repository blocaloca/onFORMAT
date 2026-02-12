import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className = '', onClick, hoverEffect = false }: GlassCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-zinc-900/50 
        border border-zinc-800
        rounded-sm
        p-6
        transition-all duration-200
        ${hoverEffect ? 'hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
