'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ImageExportButtonProps {
    title: string;
    onNewVersion?: () => void;
    nextVersionLabel?: string;
    orientation?: 'portrait' | 'landscape';
    onExportPdf?: (scope: 'current' | 'all') => void;
    isExportingPdf?: boolean;
}

export const ImageExportButton = ({ title, onExportPdf, isExportingPdf }: ImageExportButtonProps) => {
    const [showPdfMenu, setShowPdfMenu] = useState(false);

    if (!onExportPdf) return null;

    return (
        <div className="flex items-center gap-1 bg-zinc-800 p-0.5 rounded-sm relative">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowPdfMenu(!showPdfMenu)}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-sm hover:bg-zinc-600 disabled:opacity-50"
                    title="Export PDF options"
                >
                    {isExportingPdf ? 'Generating...' : 'Export PDF'}
                    <ChevronDown size={10} />
                </button>

                {showPdfMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPdfMenu(false)} />
                        <div className="absolute top-full right-0 mt-1 w-32 bg-zinc-900 border border-zinc-700 shadow-xl rounded-sm py-1 z-20 flex flex-col">
                            <button
                                onClick={() => {
                                    onExportPdf('current');
                                    setShowPdfMenu(false);
                                }}
                                className="text-left px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                                Current Version
                            </button>
                            <button
                                onClick={() => {
                                    onExportPdf('all');
                                    setShowPdfMenu(false);
                                }}
                                className="text-left px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400 transition-colors"
                            >
                                All Versions
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
