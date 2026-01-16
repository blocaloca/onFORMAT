# Known Document & PDF Issues

This document tracks recurring issues related to Document Templates and PDF Generation in the Creative OS application, along with their proven solutions.

## 1. Ghost Downloads (Browser Opening Dropped Files)

**Symptoms:**
- User drags an image to an uploader but "misses" (drops it on the whitespace), causing the browser to navigate to the image file.
- User drops an image *on* an uploader, but the browser *still* opens it (Download triggered).

**Root Cause:**
- Browsers have a default behavior for `dragover` and `drop` events: they open/download the file.
- Events bubble up. If a child component (Uploader) doesn't `stopPropagation()`, the event reaches the document root/window, triggering the default behavior.

**Proven Solutions:**
1.  **Component Level:**
    - Any drop zone (e.g., `ImageUploader`) **MUST** call `e.preventDefault()` **AND** `e.stopPropagation()` on `dragover`, `dragleave`, and `drop`.
    - This ensures valid drops are handled locally and don't bubble.

2.  **Global Level (Safety Net):**
    - To catch "missed" drops (whitespace), attach a `window` event listener in a `useEffect` (Client-Side Only) at the Layout or Editor level.
    - **Do NOT** attach this to a `div` prop (e.g., `<div onDrop={...}>`) if it risks hydration mismatches or layout bugs. Use `window.addEventListener`.
    - **Code Snippet:**
      ```typescript
      useEffect(() => {
          const preventDefault = (e: DragEvent) => e.preventDefault();
          window.addEventListener('dragover', preventDefault);
          window.addEventListener('drop', preventDefault);
          return () => {
              window.removeEventListener('dragover', preventDefault);
              window.removeEventListener('drop', preventDefault);
          };
      }, []);
      ```

## 2. PDF Functionality & Layout

**Symptoms:**
- Text cutting off, weird padding, or alignment issues in generated PDFs.
- "Ghost" downloads of PDFs (downloading repeatedly or automatically).
- "Module not found" errors during build regarding `canvas` or `jsdom`.

**Root Cause:**
- `html2canvas` and `jspdf` rely on the *rendered* DOM. If the DOM looks different on screen vs. print media queries, the capture will be off.
- Next.js Server Components cannot use browser-only libraries like `html2canvas` directly in the render body. They must be dynamically imported or used inside `useEffect` / Event Handlers.

**Proven Solutions:**
1.  **Visual Consistency:**
    - Use a fixed-width container for the PDF generation (e.g., `w-[816px]` for Portrait, `w-[1056px]` for Landscape) to ensure 1:1 mapping with the PDF page size.
    - Avoid `100vh` or flexible units that might change during the capture process.

2.  **Dependencies:**
    - Ensure `html2canvas` is configured with `useCORS: true` to handle external images (Supabase Storage).
    - Ensure `scale: 2` (or higher) in `html2canvas` options for crisp text.

## 3. Deployment / Build

**Symptoms:**
- `500 Internal Server Error` on routes using `supabase`.
- Build failures due to missing Environment Variables.

**Proven Solutions:**
- **Robust Route Handlers:** Always wrap `createClient` calls or API logic in `try/catch` blocks.
- **Fallbacks:** Provide fallback strings for `process.env` variables in `lib/` files to prevent build-time crashes (even if functionality fails at runtime, the build should pass).

## 4. PDF Text Visibility & Alignment (Inputs vs. Print)

**Symptoms:**
- Text typed into `<input>` or `<textarea>` fields appears on screen but is **missing** or invisible in the generated PDF.
- Text that does appear is misaligned (vertically centered on screen but jumps around in PDF).

**Root Cause:**
- `html2canvas` has known issues capturing the `value` of HTML `<input>` elements reliably, especially with custom styling or positioning.
- Vertical alignment differs between browser input rendering and the canvas text rendering.

**Proven Solutions:**
1.  **Conditional Rendering (`isPrinting`):**
    - Pass an `isPrinting` prop to the template when rendering the hidden view for PDF generation.
    - **Swap Elements:** When `isPrinting` is true, render a standard `<div>` or `<span>` containing the text instead of the `<input>`.
    - **Snippet:**
      ```tsx
      {isPrinting ? (
          <div className="...">
              {item.textValue}
          </div>
      ) : (
          <input
              value={item.textValue}
              onChange={...}
              className="..."
          />
      )}
      ```

2.  **Strict Styling Parity:**
    - To ensure the PDF looks exactly like the interactive version, apply **identical** styling classes to both the input and the div.
    - **Crucial Properties:**
        - Explicit `h-[value]` (Height).
        - Explicit `leading-[value]` (Line height) to force vertical centering.
        - Text alignment (`text-left`, `text-center`) and Uppercase/Tracking.
        - `items-center` on the parent flex container.
    - **Example**: `h-4 leading-4 text-[10px] font-bold uppercase tracking-widest` should be on BOTH the input and the div.

3.  **High Contrast Colors:**
    - PDF generation can wash out subtle grays (`text-zinc-400`). Use `text-black` or `text-zinc-900` for primary text data to ensure legibility.
