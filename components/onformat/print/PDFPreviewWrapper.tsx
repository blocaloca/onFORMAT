import React, { ReactNode } from 'react';

interface PDFPreviewWrapperProps {
    orientation: 'portrait' | 'landscape';
    scale?: number;
    children: ReactNode;
}

export const PDFPreviewWrapper = ({ orientation, scale = 0.75, children }: PDFPreviewWrapperProps) => {
    // Exact standard US Letter aspect ratio at 96 DPI
    // Portrait: 8.5" x 11" (816px x 1056px)
    // Landscape: 11" x 8.5" (1056px x 816px)
    const w = orientation === 'landscape' ? 1056 : 816;
    const h = orientation === 'landscape' ? 816 : 1056;
    const scaledW = w * scale;
    const scaledH = h * scale;

    return (
        <div
            className="flex flex-col items-center w-full mb-8"
        >
            <div
                className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-zinc-200/50 relative overflow-hidden shrink-0"
                style={{ width: scaledW, height: scaledH }}
            >
                <div
                    className="bg-white origin-top-left"
                    style={{
                        width: w,
                        height: h,
                        transform: `scale(${scale})`,
                    }}
                >
                    <div className="w-full h-full relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
