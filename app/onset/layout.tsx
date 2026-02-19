// Mobile Polish Update - RETRY 2 - 10:47 AM
import React from 'react';

export default function OnSetMobileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Enforce Dark Mode for OnSET Mobile ("Field Monitor" aesthetic)
    return (
        <div className="dark h-[100dvh] overflow-hidden bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans antialiased flex flex-col">
            {/* Chassis Container with Inner Shadow */}
            <div className="absolute inset-0 w-full h-full shadow-[inset_0_0_50px_rgba(0,0,0,1)] pointer-events-none z-50" />

            {/* Content Area - Filling remaining space */}
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}
