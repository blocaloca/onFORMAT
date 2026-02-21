// Mobile Polish Update - RETRY 2 - 10:47 AM
import React from 'react';

export default function OnSetMobileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Enforce Dark Mode for OnSET Mobile ("Field Monitor" aesthetic)
    return (
        <div className="fixed inset-0 w-full bg-zinc-200 overflow-hidden flex flex-col font-sans antialiased text-black">
            {/* Chassis Container with Inner Shadow */}
            <div className="absolute inset-0 w-full h-full shadow-[inset_0_0_50px_rgba(0,0,0,1)] pointer-events-none z-50" />

            {/* Content Area - Filling remaining space */}
            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden p-0">
                {children}
            </main>
        </div>
    );
}
