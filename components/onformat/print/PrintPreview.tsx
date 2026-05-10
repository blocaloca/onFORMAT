/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { getTemplateForTool } from '../TemplateRegistry';
import { useProject } from '../ProjectContext';
import { PDFPreviewWrapper } from './PDFPreviewWrapper';
import { PrintContext } from './PrintContext';

interface CoverSettings {
    showCover: boolean;
    title: string;
    subtitle: string;
    date: string;
}

interface PrintPreviewProps {
    toolId: string | null;
    orientation: 'portrait' | 'landscape';
    coverSettings: CoverSettings;
    scale?: number;
    versionIndex?: number; // undefined or -1 = latest; 0+ = specific day
    previewData?: any; // pre-fetched data passed from PrintDashboard — bypasses internal useProject lookup
}

export const PrintPreview = ({ toolId, orientation, coverSettings, scale = 0.75, versionIndex, previewData }: PrintPreviewProps) => {
    const { getToolData, getToolStack, activeProject } = useProject();

    // Cover page (no document selected) — hidden when toggle is off
    if (toolId === null) {
        if (!coverSettings.showCover) return null;
        return (
            <PDFPreviewWrapper orientation="portrait" scale={scale} toolId="cover">
                <div className="bg-white w-full h-full flex items-center justify-center relative">
                    <div className="text-center p-12 flex flex-col items-center justify-center w-full h-full relative">
                        <h1 className="text-5xl font-black uppercase tracking-normal text-zinc-900 max-w-2xl leading-tight">
                            {coverSettings.title || 'Untitled Project'}
                        </h1>
                        <div className="w-24 h-1.5 bg-black mx-auto my-8" />
                        <h2 className="text-lg font-bold tracking-[0.3em] uppercase text-zinc-500">
                            {coverSettings.subtitle}
                        </h2>
                        <p className="mt-8 font-mono text-xs text-zinc-400 font-bold tracking-widest">
                            {coverSettings.date}
                        </p>
                        <div className="absolute bottom-10 left-0 right-0 text-center">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold">
                                Created with onFORMAT
                            </p>
                        </div>
                    </div>
                </div>
            </PDFPreviewWrapper>
        );
    }

    // Single document preview
    const Template = getTemplateForTool(toolId);
    let data: any;
    if (previewData !== undefined) {
        // Use pre-fetched data passed directly from PrintDashboard (preferred — avoids stale context lookup)
        data = previewData;
    } else {
        const stack = getToolStack ? (getToolStack(toolId) || []) : [];
        const currentDraft = getToolData(toolId);
        data = (versionIndex !== undefined && versionIndex >= 0 && stack[versionIndex])
            ? stack[versionIndex]
            : (stack.length > 0 ? stack[stack.length - 1] : (currentDraft || {}));
    }

    const metadata = {
        projectName: coverSettings.title,
        date: coverSettings.date,
        producer: activeProject?.owner_name,
    };

    return (
        <PrintContext.Provider value={true}>
            <PDFPreviewWrapper orientation={orientation} scale={scale} toolId={toolId} multiPage={true}>
                {Template ? (
                    <Template
                        data={data}
                        plain={false}
                        orientation={orientation}
                        isPrinting={true}
                        metadata={metadata}
                        onUpdate={() => {}}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-zinc-300 text-xs font-mono uppercase tracking-widest text-center px-8">
                            No print template for this document type yet
                        </p>
                    </div>
                )}
            </PDFPreviewWrapper>
        </PrintContext.Provider>
    );
};
