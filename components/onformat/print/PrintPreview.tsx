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

export const PrintPreview = ({ items = [], coverSettings, orientationOverride, scale = 0.75 }: PrintPreviewProps & { scale?: number }) => {
    const { getToolData, getToolStack, activeProject } = useProject();

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
            {coverSettings.showCover && (() => {
                // Cover Dimensions Logic
                const isL = coverSettings.orientation === 'landscape';
                const w = isL ? 1056 : 816;
                const h = isL ? 816 : 1056;
                const scaledW = w * scale;
                const scaledH = h * scale;

                return (
                    <div
                        id="print-node-COVER"
                        className="bg-white shadow-2xl relative shrink-0 mb-8"
                        style={{ width: scaledW, height: scaledH, overflow: 'hidden' }}
                    >
                        <div
                            className={`w-[${w}px] h-[${h}px] flex flex-col items-center justify-center text-black`}
                            style={{
                                width: w,
                                height: h,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left'
                            }}
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
                    </div>
                );
            })()}

            {/* 2. Sequence of Items */}
            {items.flatMap((item) => {
                const Template = getTemplateForTool(item.id);
                // Use getToolStack from context to get all versions
                // @ts-ignore
                const stack = getToolStack ? getToolStack(item.id) : [getToolData(item.id)];

                // Determine indices to render
                let indices = item.selectedVersions;
                // Fallback: If no explicit selection, default to Latest (last item) if stack exists
                if (!indices || indices.length === 0) {
                    if (Array.isArray(stack) && stack.length > 0) {
                        indices = [stack.length - 1];
                    } else {
                        indices = [0];
                    }
                }

                // Render each selected day/version
                // @ts-ignore
                return indices.sort((a, b) => a - b).map((idx) => {
                    const versionData = stack[idx] || {};
                    const uniqueKey = `${item.id}-${idx}`;

                    const injectedMetadata = {
                        projectName: activeProject?.name || coverSettings.title,
                        date: coverSettings.date,
                        producer: activeProject?.owner_name,
                    };

                    const isItemLandscape = (orientationOverride || 'portrait') === 'landscape';
                    const w = isItemLandscape ? 1056 : 816;
                    const h = isItemLandscape ? 816 : 1056;
                    const scaledW = w * scale;
                    const scaledH = h * scale;

                    return (
                        <div key={uniqueKey} className="flex flex-col items-center w-full mb-8">
                            <div
                                className="bg-white shadow-xl relative overflow-hidden"
                                style={{ width: scaledW, height: scaledH }}
                            >
                                <div
                                    style={{
                                        width: w,
                                        height: h,
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'top left'
                                    }}
                                >
                                    {Template ? (
                                        <Template
                                            data={versionData}
                                            plain={false}
                                            orientation={orientationOverride || 'portrait'}
                                            isPrinting={true}
                                            metadata={injectedMetadata}
                                            onUpdate={() => { }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-mono uppercase tracking-widest">
                                            Template Not Found for {item.label}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                });
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
