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
}

export const DocumentLayout = ({
    title,
    subtitle,
    children,
    className = '',
    hideHeader = false,
    orientation = 'portrait',
    metadata
}: DocumentLayoutProps) => {

    // Dimensions in pixels (96DPI): 8.5in = 816px, 11in = 1056px
    const width = orientation === 'landscape' ? 1056 : 816;
    const height = orientation === 'landscape' ? 816 : 1056;

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
                className={`document-page bg-white shadow-xl mx-auto relative flex flex-col gap-8 ${className}`}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    padding: '32px 40px 40px 40px', // Balance between 'moving up' and 'not clipping'
                    marginBottom: '40px' // Spacing between pages in editor
                }}
            >
                {/* Header */}
                <div className="flex-shrink-0 relative z-50 bg-white">
                    {!hideHeader && (
                        <div>
                            <div className="flex justify-between items-end border-b border-zinc-200 pb-4 mb-6">
                                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{title}</h1>
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
                                                <span>//</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <span className="text-black">{metadata.projectName || 'UNTITLED PROJECT'}</span>
                                        </div>
                                    </div>

                                    {(metadata.producer || metadata.directorNames) ? (
                                        <div className="flex gap-2">
                                            <span>{metadata.isTreatment ? 'DIRECTOR' : 'PRODUCER'}</span>
                                            <span className="text-black">{metadata.isTreatment ? metadata.directorNames : metadata.producer}</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 opacity-0">
                                            <span>PRODUCER</span>
                                            <span className="text-black">-</span>
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
