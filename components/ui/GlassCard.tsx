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
        bg-white/70 dark:bg-black/40 
        backdrop-blur-xl 
        border border-white/20 dark:border-white/10
        shadow-lg
        rounded-2xl
        p-6
        transition-all duration-300
        ${hoverEffect ? 'hover:scale-[1.02] hover:shadow-xl hover:bg-white/80 dark:hover:bg-black/50 cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
      
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};
