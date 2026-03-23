/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
import React from 'react';

export interface DocumentMetadata {
    projectName?: string;
    clientName?: string;
    date?: string;
    version?: string;
    producer?: string;
    directorNames?: string;
    isTreatment?: boolean;
    projectId?: string;
}

interface DocumentLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    hideHeader?: boolean;
    plain?: boolean; // Deprecated but kept for compatibility, effectively always false now for visual pages
    orientation?: 'portrait' | 'landscape';
    metadata?: DocumentMetadata;
    isPrinting?: boolean;
}

export const DocumentLayout = ({
    title,
    subtitle,
    children,
    className = '',
    hideHeader = false,
    orientation = 'portrait',
    metadata,
    isPrinting = false
}: DocumentLayoutProps) => {

    // Dimensions in pixels (96DPI): 8.5in = 816px, 11in = 1056px
    // --- MODULAR WORKSPACE REFACTOR ---
    // If not printing, we use the "Control Panel" fluid layout.
    // If printing, we use the fixed "Paper" layout.

    // Printing Logic
    const width = orientation === 'landscape' ? 1056 : 816;
    const height = orientation === 'landscape' ? 816 : 1056;

    if (!isPrinting) {
        // --- CONTROL PANEL MODE (Fixed Paper Size Support) ---
        return (
            <div className={`
                mx-auto flex flex-col gap-6 
                bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl mb-6 shadow-sm
                p-10
                transition-colors duration-200
                ${className}
            `}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    maxHeight: `${height}px`,
                    overflow: 'hidden'
                }}>
                {/* Header (Simplified for Control Panel) */}
                {!hideHeader && (
                    <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-2">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-sans font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
                            {metadata?.date && (
                                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                                    {metadata.date}
                                </span>
                            )}
                        </div>

                        {/* Status / Metadata Pill */}
                        {metadata && (
                            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                                <span className="hidden sm:inline">{metadata.projectName || 'UNTITLED'}</span>
                                {metadata.clientName && <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">{'/' + '/'}</span>}
                                {metadata.clientName && <span className="hidden sm:inline">{metadata.clientName}</span>}
                            </div>
                        )}
                    </div>
                )}

                {/* Content Area */}
                <div className="font-sans leading-relaxed flex-1 relative min-h-0 z-0 text-zinc-900 dark:text-zinc-100 overflow-y-auto -m-2 p-2 rounded">
                    {children}
                </div>
            </div>
        );
    }

    // --- PRINT MODE (Fixed Paper) ---
    // User Request: Make document 20% larger in workspace (1.2x scale)
    // FIX: reset scaling for Print Room to prevent cropping
    // Always use standard 96DPI dimensions (1.0 scale) to ensure Editor matches PDF output (WYSIWYG).
    // Zooming is handled by the parent container's CSS transform.
    const SCALE = 1.0;
    // const width = orientation === 'landscape' ? 1056 : 816;
    // const height = orientation === 'landscape' ? 816 : 1056;

    return (
        <>
            {/* Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: ${orientation};
                        margin: 0;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .document-page {
                        width: 100% !important;
                        height: 100% !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        page-break-after: always;
                    }
                }
            `}</style>

            <div
                className={`document-page bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl mb-6 shadow-sm mx-auto relative flex flex-col gap-8 ${className}`}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    padding: '32px 40px 40px 40px', // Balance between 'moving up' and 'not clipping'
                    marginBottom: '40px' // Spacing between pages in editor
                }}
            >
                {/* Header */}
                <div className="flex-shrink-0 relative z-50 bg-white dark:bg-zinc-950">
                    {!hideHeader && (
                        <div>
                            <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
                                <h1 className="text-3xl font-black uppercase tracking-normal leading-tight">{title}</h1>
                                {metadata && metadata.date && (
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pb-1">
                                        {metadata.date}
                                    </div>
                                )}
                            </div>

                            {metadata && (
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-zinc-400 min-h-[1.25rem]">
                                    <div className="flex items-center gap-4">
                                        {(metadata.clientName || !metadata.projectName) && (
                                            <div className="flex gap-2">
                                                <span>{metadata.clientName || 'UNKNOWN CLIENT'}</span>
                                                <span>{'/' + '/'}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <span className="text-black dark:text-zinc-100">{metadata.projectName || 'UNTITLED PROJECT'}</span>
                                        </div>
                                    </div>

                                    {(metadata.producer || metadata.directorNames) ? (
                                        <div className="flex gap-2">
                                            <span>{metadata.isTreatment ? 'DIRECTOR' : 'PRODUCER'}</span>
                                            <span className="text-black dark:text-zinc-100">{metadata.isTreatment ? metadata.directorNames : metadata.producer}</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 opacity-0">
                                            <span>PRODUCER</span>
                                            <span className="text-black dark:text-zinc-100">-</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Area - Flex Grow to fill page */}
                <div className="font-sans leading-relaxed flex-1 relative min-h-0 z-0">
                    {children}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between text-[8px] text-gray-400 font-mono uppercase">
                    <span>Generated by onFORMAT</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </>
    );
};
