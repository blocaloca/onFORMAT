import React from 'react';
import { PrintItem } from './types';
import { getTemplateForTool } from '../TemplateRegistry';

interface PrintPreviewProps {
    items: PrintItem[];
    phases: any;
    coverSettings: {
        showCover: boolean;
        title: string;
        subtitle: string;
        date: string;
        orientation?: 'portrait' | 'landscape';
    };
}

export const PrintPreview = ({ items, phases, coverSettings }: PrintPreviewProps) => {

    // Helper to get draft data
    const getDraftData = (toolKey: string) => {
        // Search phases for the draft
        for (const phaseKey in phases) {
            const draft = phases[phaseKey]?.drafts?.[toolKey];
            if (draft) {
                try {
                    // Try parsing if string
                    return typeof draft === 'string' ? JSON.parse(draft) : draft;
                } catch (e) {
                    return { text: draft }; // Fallback for plain text
                }
            }
        }
        return {};
    };

    const selectedItems = items.filter(i => i.isSelected);

    const isCoverLandscape = coverSettings.orientation === 'landscape';
    const coverWidth = isCoverLandscape ? "w-[1056px]" : "w-[816px]";
    const coverHeight = isCoverLandscape ? "h-[816px]" : "h-[1056px]";

    return (
        <div className="flex flex-col gap-8 items-center py-10 w-full">

            {/* --- Cover Page --- */}
            {coverSettings.showCover && (
                <div
                    id="print-node-COVER"
                    className={`bg-white shadow-2xl ${coverWidth} ${coverHeight} relative flex flex-col items-center justify-center text-black shrink-0`}
                    style={{ transformOrigin: 'top center' }}
                >
                    <div className="text-center space-y-8">
                        <h1 className="text-5xl font-black uppercase tracking-normal text-zinc-900 max-w-2xl leading-tight">{coverSettings.title}</h1>
                        <div className="w-24 h-1.5 bg-black mx-auto" />
                        <h2 className="text-lg font-bold tracking-[0.3em] uppercase text-zinc-500">{coverSettings.subtitle}</h2>
                        <p className="pt-8 font-mono text-xs text-zinc-400 font-bold tracking-widest">{coverSettings.date}</p>
                    </div>

                    {/* Footer / Branding */}
                    <div className="absolute bottom-16 left-0 right-0 text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold">Created with onFORMAT</p>
                    </div>
                </div>
            )}

            {/* --- Documents --- */}
            {selectedItems.map((item, index) => {
                const Template = getTemplateForTool(item.toolKey);
                const data = getDraftData(item.toolKey);

                const isLandscape = item.orientation === 'landscape';
                const widthClass = isLandscape ? "w-[1056px]" : "w-[816px]";
                const heightClass = isLandscape ? "h-[816px]" : "h-[1056px]";

                return (
                    <div
                        key={item.id}
                        className={`bg-white shadow-2xl ${widthClass} ${heightClass} relative overflow-hidden shrink-0 group`}
                        id={`print-node-${item.id}`}
                    >
                        {/* Render Template */}
                        <div className="w-full h-full p-0">
                            <Template
                                data={data}
                                plain={false}
                                orientation={item.orientation}
                                isPrinting={true} // Hint to templates to hide UI controls
                                metadata={{
                                    projectName: coverSettings.title,
                                    date: coverSettings.date
                                }}
                                onUpdate={() => { }} // No-op for read-only preview
                            />
                        </div>

                        {/* Hover Overlay info */}
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Page {index + 1}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {selectedItems.length === 0 && !coverSettings.showCover && (
                <div className="text-center text-zinc-500 mt-20">
                    <p>No documents selected.</p>
                </div>
            )}
        </div>
    );
};
