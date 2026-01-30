import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GlobalPdfDocument } from './pdf-factory/PdfDocumentFactory';
import { useProject } from '../ProjectContext'; // Adjust path if needed
import { TOOL_TYPES } from './types';

// SSR Safe PDF Viewer
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center w-full h-full bg-zinc-100 text-zinc-400 font-mono text-xs">
                INITIALIZING PDF ENGINE...
            </div>
        ),
    }
);

interface PrintPreviewProps {
    targetToolId?: string | null;
    coverSettings: {
        showCover: boolean;
        title: string;
        subtitle: string;
        date: string;
        orientation?: 'portrait' | 'landscape';
    };
    orientationOverride?: 'portrait' | 'landscape';
}

export const PrintPreview = ({ targetToolId, coverSettings, orientationOverride }: PrintPreviewProps) => {
    const { activeProject } = useProject();

    // Prepare Items for Factory
    // If targetToolId is present, we create a single-item playlist.
    // Ideally we ignore 'coverSettings.showCover' inside the specific document view unless requested.
    // But GlobalPdfDocument logic is: if coverSettings.showCover, show it.
    // For "Preview", we usually want just the document.
    // We will override showCover to false if a specific tool is selected, to focus on the content.

    const previewItems = useMemo(() => {
        if (!targetToolId) return []; // Empty playlist -> Cover only (if enabled)

        const meta = TOOL_TYPES[targetToolId];
        return [{
            id: targetToolId,
            toolKey: targetToolId,
            label: meta ? meta.label : targetToolId,
            isSelected: true,
            orientation: orientationOverride || meta.defaultOrient || 'portrait',
            pageCountEstimate: 1
        }];
    }, [targetToolId, orientationOverride]);

    // Derived Cover Settings for Preview Context
    // If we are looking at a specific tool, hide the cover page to avoid scrolling past it.
    const previewCoverSettings = useMemo(() => ({
        ...coverSettings,
        showCover: !targetToolId && coverSettings.showCover // Only show cover if NO tool selected AND enabled
    }), [coverSettings, targetToolId]);

    // Handle initial state or missing data
    if (!activeProject) {
        return <div className="text-zinc-500 text-xs font-mono p-10">Loading Project Context...</div>;
    }

    return (
        <div className="w-full h-full flex flex-col bg-zinc-900/50" style={{ flex: 1, minHeight: '60vh' }}>
            <PDFViewer width="100%" height="100%" className="w-full h-full border-none" showToolbar={true}>
                <GlobalPdfDocument
                    items={previewItems}
                    phases={activeProject.data.phases}
                    coverSettings={previewCoverSettings}
                    producer={activeProject.owner_name}
                />
            </PDFViewer>
        </div>
    );
};
