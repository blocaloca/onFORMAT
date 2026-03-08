# Print Room WYSIWYG Architecture

## Overview
The legacy Print Room utilized `@react-pdf/renderer` to manually rebuild DOM layouts using a separate, specialized rendering engine. This natively caused massive visual discrepancies (missing fields, incorrect line widths, broken layouts, and absent fonts) because it inherently dual-programmed the interface. 

To ensure **100% WYSIWYG (What You See Is What You Get)** accuracy, the Print Room now operates on an Image-Based PDF Generation Pipeline. 

## The Core Pipeline

The Print Room relies on two open-source libraries to capture the actual browser DOM and paste it onto a blank PDF document:
- **`html2canvas`**: Captures a mathematically precise "retina" screenshot of a specific DOM node.
- **`jspdf`**: Generates a standard PDF document and embeds those screenshot vectors onto standard Letter pages.

### 1. The Rendering Wrapper (`PDFPreviewWrapper.tsx`)
In the preview pane, each selected document is mapped and injected directly into a strictly constrained DOM element matching standard US Letter dimensions (816x1056 px for Portrait, 1056x816 px for Landscape).

Crucially, this wrapper applies a specific class: `.print-page-capture` and a data attribute `data-orientation` so the export engine knows exactly which containers to target.

```tsx
<div
    className="bg-white origin-top-left print-page-capture"
    data-orientation={orientation}
    style={{ ... }}
>
    <div className="w-full h-full relative">
        {children}
    </div>
</div>
```

### 2. The Export Engine (`PrintDashboard.tsx`)
When the Export button is triggered, the `handleExport` sequence bypasses `@react-pdf/renderer` entirely. It scans the active DOM for every rendered element containing the `.print-page-capture` selector.

It iterates through these nodes sequentially, asking `html2canvas` to paint the exact computed pixel data onto an isolated canvas buffer at `scale: 2` (to guarantee crisp text). It then passes that pristine JPEG data directly into `jsPDF`.

```typescript
// 1. Initialize jsPDF
const pdfOut = new jsPDF({
    orientation: masterOrientation === 'landscape' ? 'l' : 'p',
    unit: 'pt',
    format: 'letter'
});

// 2. Loop through all rendered pages and capture them
const elements = document.querySelectorAll('.print-page-capture');

for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    
    // Check orientation logic...
    if (i > 0) pdfOut.addPage('letter', pageOrientation);

    // 3. Capture high-res screenshot of the raw DOM element
    const canvas = await html2canvas(el, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#FFFFFF',
    });
    
    // 4. Inject exact Image Data into the PDF page
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdfOut.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
}

// 5. Download the exact replica
pdfOut.save(`Project - Package.pdf`);
```

## Core Benefits
1. **Zero Double-Coding**: You never have to build a component for React and then separately re-build it for the PDF engine. If you style it in standard Tailwind for the Print Room Preview, it is automatically flawless in the PDF.
2. **Guaranteed Consistency**: Colors, spacing, borders, transparent PNG overlays, and complex layered CSS grids render accurately every time.
3. **Cross-Phase Reliability**: This pattern instantly supports any newly added document template without needing custom PDF factory logic to mirror it.
