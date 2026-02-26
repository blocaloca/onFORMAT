// Mobile Polish Update
import React from 'react';

export default function OnSetMobileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Light Mode enforced per user request
    return (
        <div className="fixed inset-0 w-full bg-zinc-100 overflow-hidden flex flex-col font-sans antialiased text-zinc-900">
            {/* Content Area - Filling remaining space */}
            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden p-0">
                {children}
            </main>
        </div>
    );
}
