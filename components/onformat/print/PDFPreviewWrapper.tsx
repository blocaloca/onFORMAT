import React, { ReactNode } from 'react';

interface PDFPreviewWrapperProps {
    orientation: 'portrait' | 'landscape';
    scale?: number;
    children: ReactNode;
    toolId?: string;
    multiPage?: boolean;
}

export const PDFPreviewWrapper = ({ orientation, scale = 0.75, children, toolId, multiPage = false }: PDFPreviewWrapperProps) => {
    const w = orientation === 'landscape' ? 1056 : 816;
    const h = orientation === 'landscape' ? 816 : 1056;
    const scaledW = w * scale;
    const scaledH = h * scale;

    // Multi-page mode: zoom scales both visual and layout dimensions so all pages
    // stack correctly and the preview container can scroll through them all.
    if (multiPage) {
        return (
            <div className="flex flex-col items-center w-full">
                <div style={{ width: scaledW }}>
                    <div style={{ zoom: scale }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // Single-page mode (cover page): fixed-size clipped card.
    return (
        <div className="flex flex-col items-center w-full mb-8">
            <div
                className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-zinc-200/50 relative overflow-hidden shrink-0"
                style={{ width: scaledW, height: scaledH }}
            >
                <div
                    className="bg-white origin-top-left"
                    data-orientation={orientation}
                    data-toolid={toolId}
                    style={{
                        width: w,
                        height: h,
                        transform: `scale(${scale})`,
                    }}
                >
                    <div className="w-full h-full relative overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
