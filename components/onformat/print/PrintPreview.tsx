/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { PrintItem } from './types';
import { getTemplateForTool } from '../TemplateRegistry';
import { useProject } from '../ProjectContext';
import { PDFPreviewWrapper } from './PDFPreviewWrapper';

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
        studioLogo?: string | null;
    };
    orientationOverride?: 'portrait' | 'landscape';
}

export const PrintPreview = ({ items = [], coverSettings, orientationOverride, scale = 0.75 }: PrintPreviewProps & { scale?: number }) => {
    const { getToolData, getToolStack, activeProject } = useProject();

    // Dimensions


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
                    <PDFPreviewWrapper orientation={coverSettings.orientation || 'portrait'} scale={scale}>
                        <div className="bg-white flex flex-col items-center justify-center text-black w-full h-full">
                            <div className="text-center space-y-8 p-12 w-full h-full flex flex-col items-center justify-center relative">
                                {coverSettings.studioLogo && (
                                    <div className="absolute top-16 left-0 right-0 flex justify-center">
                                        <img src={coverSettings.studioLogo} alt="Studio Logo" style={{ width: '200px', objectFit: 'contain', marginBottom: '24px' }} />
                                    </div>
                                )}
                                <h1 className="text-5xl font-black uppercase tracking-normal text-zinc-900 max-w-2xl leading-tight mt-12">{coverSettings.title}</h1>
                                <div className="w-24 h-1.5 bg-black mx-auto" />
                                <h2 className="text-lg font-bold tracking-[0.3em] uppercase text-zinc-500">{coverSettings.subtitle}</h2>
                                <p className="pt-8 font-mono text-xs text-zinc-400 font-bold tracking-widest">{coverSettings.date}</p>

                                <div className="absolute bottom-16 left-0 right-0 text-center">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold">Created with onFORMAT</p>
                                </div>
                            </div>
                        </div>
                    </PDFPreviewWrapper>
                );
            })()}

            {/* 2. Sequence of Items */}
            {items.flatMap((item) => {
                const Template = getTemplateForTool(item.id);
                // Use getToolStack from context to get all versions

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

                return indices.sort((a, b) => a - b).map((idx) => {
                    const versionData = stack[idx] || {};
                    const uniqueKey = `${item.id}-${idx}`;

                    const injectedMetadata = {
                        projectName: activeProject?.name || coverSettings.title,
                        date: coverSettings.date,
                        producer: activeProject?.owner_name,
                    };

                    return (
                        <PDFPreviewWrapper
                            key={uniqueKey}
                            orientation={orientationOverride || 'portrait'}
                            scale={scale}
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
                                <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-mono uppercase tracking-widest border-2 border-dashed border-zinc-200 rounded-lg">
                                    Template Not Found for {item.label}
                                </div>
                            )}
                        </PDFPreviewWrapper>
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
