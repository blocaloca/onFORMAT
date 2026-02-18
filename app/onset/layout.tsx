import React from 'react';

export default function OnSetMobileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Enforce Dark Mode for OnSET Mobile ("Field Monitor" aesthetic)
    return (
        <div className="dark min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans antialiased">
            {/* Chassis Container with Inner Shadow */}
            <div className="min-h-screen w-full relative shadow-[inset_0_0_50px_rgba(0,0,0,1)] pointer-events-none z-50 fixed inset-0" />

            {/* Content Area */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
