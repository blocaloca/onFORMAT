import React from 'react';
import { PrintItem } from './types';
import { getTemplateForTool } from '../TemplateRegistry';
import { useProject } from '../ProjectContext';

interface PrintPreviewProps {
    // We now support a single target for the "Preview Pane"
    targetToolId?: string | null;

    // Legacy support for multi-item (if needed for factory, but factory uses GlobalPdfDocument)
    // We can remove 'items' and 'phases' from here if this is only for the UI Preview
    items?: PrintItem[];
    phases?: any;

    coverSettings: {
        showCover: boolean;
        title: string;
        subtitle: string;
        date: string;
        orientation?: 'portrait' | 'landscape';
    };
    orientationOverride?: 'portrait' | 'landscape';
}

export const PrintPreview = ({ items = [], coverSettings, orientationOverride }: PrintPreviewProps) => {
    const { getToolData, activeProject } = useProject();

    // Dimensions
    const getDims = (isLandscape: boolean) => ({
        widthClass: isLandscape ? "w-[1056px]" : "w-[816px]",
        heightClass: isLandscape ? "h-[816px]" : "h-[1056px]"
    });

    const masterDims = getDims(orientationOverride === 'landscape');

    // Cover Dimensions
    const isCoverLandscape = coverSettings.orientation === 'landscape';
    const coverDims = getDims(isCoverLandscape);

    return (
        <>
            {/* 1. Cover Page */}
            {coverSettings.showCover && (
                <div
                    id="print-node-COVER"
                    className={`bg-white shadow-2xl ${coverDims.widthClass} ${coverDims.heightClass} relative flex flex-col items-center justify-center text-black shrink-0`}
                    style={{ transformOrigin: 'top center' }}
                >
                    <div className="text-center space-y-8">
                        <h1 className="text-5xl font-black uppercase tracking-normal text-zinc-900 max-w-2xl leading-tight">{coverSettings.title}</h1>
                        <div className="w-24 h-1.5 bg-black mx-auto" />
                        <h2 className="text-lg font-bold tracking-[0.3em] uppercase text-zinc-500">{coverSettings.subtitle}</h2>
                        <p className="pt-8 font-mono text-xs text-zinc-400 font-bold tracking-widest">{coverSettings.date}</p>
                    </div>
                    <div className="absolute bottom-16 left-0 right-0 text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold">Created with onFORMAT</p>
                    </div>
                </div>
            )}

            {/* 2. Sequence of Items */}
            {items.map((item) => {
                const Template = getTemplateForTool(item.id);
                const toolData = getToolData(item.id);

                const injectedMetadata = {
                    projectName: activeProject?.name || coverSettings.title,
                    date: coverSettings.date,
                    producer: activeProject?.owner_name,
                };

                return (
                    <div key={item.id} className="flex flex-col items-center w-full">
                        {Template ? (
                            <Template
                                data={toolData}
                                plain={false}
                                orientation={orientationOverride || 'portrait'}
                                isPrinting={true}
                                metadata={injectedMetadata}
                                onUpdate={() => { }}
                            />
                        ) : (
                            <div className={`bg-white shadow-xl ${masterDims.widthClass} ${masterDims.heightClass} flex items-center justify-center text-zinc-300 text-xs font-mono uppercase tracking-widest`}>
                                Template Not Found for {item.label}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Empty State Help Text */}
            {(!items || items.length === 0) && !coverSettings.showCover && (
                <div className="text-zinc-500 text-sm font-mono mt-20">
                    Select documents from the sidebar to preview
                </div>
            )}
        </>
    );
};
