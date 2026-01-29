# Pitch: The "Project Print Room"
**"From Digital Workspace to Physical Package"**

## The Problem
Currently, formatting (Landscape/Portrait) and Exporting are "hidden features" stuck inside the editor.
- Users want to create a **Package** (e.g., A "Greenlight Deck" combining Script + Budget + Schedule).
- Formatting one document shouldn't be a generic toggle; it should be a deliberate publishing choice.
- Users need a "Cover Page" to make their work look professional.

## The Solution: A Dedicated "Print Dashboard"
We move all "Output" logic out of the *Working* state and into a *Publishing* state.

### 1. The Architecture
We introduce a new Tool Key: `project-export` (Label: "Print & Export").
This is not a text editor. It is a **Layout Engine**.

**The UI Layout:**
*   **Left Column (The Playlist):**
    *   **"Cover Page" Toggle:** Enable to auto-generate a sleek cover with Project Name, Date, Client.
    *   **Document Selector:** A checklist of all *Drafts* available in the project.
        *   [x] Creative Brief (Portrait)
        *   [x] Director's Treatment (Landscape)
        *   [ ] Budget (Skipped)
        *   [x] Schedule (Landscape)
    *   **Drag & Drop:** Reorder the list to tell a story.
    *   **Orientation Overrides:** A quick toggle next to each item in the list 🔄.

*   **Right Column (The Live Preview):**
    *   A continuous, vertical scrollable view of the *entire* package.
    *   Renders the actual components (e.g., `<BriefTemplate />`, `<TreatmentTemplate />`) but with a prop `isPrinting={true}`.
    *   **WYSIWYG:** What you see here is *exactly* what gets burned to the PDF.

### 2. The "Cover Page" Engine
A simple mini-form in the Left Column:
*   **Title:** Defaults to Project Name.
*   **Subtitle:** E.g., "Pre-Production Package".
*   **Date:** Auto-filled.
*   **Logo/Hero Image:** Drag and drop an asset here.

### 3. The Technical Execution
*   **Reusability is King:** We do *not* rewrite the PDF logic. We reuse the React Components.
    *   We import `BriefTemplate`, `TreatmentTemplate`, from `DraftEditor.tsx` imports.
    *   We wrap them in a `<PrintContainer>` shell that strips the edit-borders.
*   **PDF Generation:**
    *   We use the **"Snapshot Strategy"**. We take the rendered "Live Preview" DOM.
    *   We iterate through the DOM nodes (`.print-page`).
    *   We use `html2canvas` + `jspdf` to snap each page and compile them into a single `Project_Name_Package.pdf`.

### 4. Why this wins
1.  **Monetization Hook:** The "Custom Cover Page" and "Multi-Doc Package" can be a **Pro Feature**. Free users can only print single docs.
2.  **Professionalism:** It forces the user to review their work as a *whole* before sending it out.
3.  **Code Hygiene:** It cleans up `DraftEditor.tsx` by removing all the `jspdf` clutter and "Is Landscape?" state management from the writing experience.

## Implementation Steps
1.  Add `project-export` to the Tool Enumeration.
2.  Create `components/onformat/print/PrintDashboard.tsx`.
3.  Move the "Download PDF" logic from `DraftEditor` to `PrintDashboard`.

*Shall we build the "Print Room"?*
