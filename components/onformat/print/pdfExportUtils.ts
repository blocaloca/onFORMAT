import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Capture the "Print Nodes" from the DOM and stitch them into a PDF.
 * This approach guarantees WYSIWYG accuracy because we are screenshotting
 * exactly what React rendered.
 */
export const generatePdfFromDom = async (
    items: { id: string, orientation: 'portrait' | 'landscape' }[],
    coverSettings: { showCover: boolean, title: string },
    outputFilename = 'production-package.pdf'
) => {

    // Create a PDF with initial settings (will vary per page)
    const pdf = new jsPDF('p', 'pt', 'a4');
    // Delete the default first page so we can add our own
    pdf.deletePage(1);

    const nodesToPrint: HTMLElement[] = [];

    // 1. Gather Nodes (Cover + Items)
    // We assume the DOM nodes have IDs like "print-node-COVER" and "print-node-[id]"
    // NOTE: The Cover Page needs an ID in the PrintPreview component!
    if (coverSettings.showCover) {
        const coverNode = document.getElementById('print-node-COVER');
        if (coverNode) nodesToPrint.push(coverNode);
    }

    items.forEach(item => {
        const node = document.getElementById(`print-node-${item.id}`);
        if (node) nodesToPrint.push(node);
    });

    if (nodesToPrint.length === 0) {
        alert("No pages to print!");
        return;
    }

    // 2. Iterate and Snapshot
    for (const node of nodesToPrint) {
        // We must ensure the node is visible and not scaled for the snapshot.
        // However, since we are using `PrintPreview` which might be scaled in the UI,
        // we might need to handle high-res capture carefully.
        // `html2canvas` usually captures computed styles.

        // Wait a tick to ensure rendering
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(node, {
            scale: 2, // 2x scale for Retina-like quality
            useCORS: true, // Allow loading remote images
            logging: false,
            letterRendering: true, // Fixes font kerning/smashing issues
            allowTaint: true
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Determine layout based on node dimensions
        // Standard A4 Points: 595.28 x 841.89
        // We use the node's clientWidth/Height to decide orientation
        const isLandscape = node.clientWidth > node.clientHeight;
        const orientation = isLandscape ? 'l' : 'p';
        const format = [node.clientWidth * 0.75, node.clientHeight * 0.75]; // Convert px to pt approx (1px = 0.75pt) - simplifed approach

        // Actually simpler: Just set the page size to match the canvas aspect ratio
        // We want strict A4 or Letter, OR just "Fit content".
        // Let's stick to valid A4 dimensions if possible, or just add the image as a full page.

        const imgWidth = isLandscape ? 842 : 595;
        const imgHeight = isLandscape ? 595 : 842;

        pdf.addPage(isLandscape ? 'a4' : 'a4', orientation);

        // Add image to full page
        // pdf.addImage(imageData, format, x, y, width, height)
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    // 3. Save
    pdf.save(outputFilename);
};
