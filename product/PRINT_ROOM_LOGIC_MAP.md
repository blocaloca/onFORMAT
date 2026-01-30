# Print Room Logic Map

This document outlines the end-to-end data flow and logic for the **Print Room** feature in `onFormat`. It details how user inputs travel from the editor to the final PDF preview and export.

## 1. High-Level Architecture

The Print Room operates on a **"Single Source of Truth"** model. All data displayed in the Print Room is fetched directly from the active project's `phases` object, ensuring that the PDF output matches the user's workspace exactly.

### Data Flow Diagram
```mermaid
graph TD
    UserInput[User Types in Editor] -->|Realtime Save| SupabaseDB[(Supabase Database)]
    SupabaseDB -->|Sync| PageComponent[Page Component]
    PageComponent -->|Pass Data| ProjectContext[ProjectContext Provider]
    
    subgraph Print Room Logic
        ProjectContext -->|getToolData(id)| PrintDashboard[Print Dashboard]
        PrintDashboard -->|Selected ID| PrintPreview[Print Preview Pane]
        PrintPreview -->|Fetch & Injects| Template[Document Template]
        Template -->|Renders| PDFPreview[Visual Preview]
    end
    
    PrintDashboard -->|Export Action| PDFFactory[PDF Factory]
    PDFFactory -->|Download| FinalPDF[project-package.pdf]
```

---

## 2. Data Retrieval Strategy (`ProjectContext`)

The core of the logic resides in the `getToolData(toolId)` function within `ProjectContext.tsx`. This function is responsible for finding the correct version of a document.

### Search Strategy (Phase Precedence)
Since a tool (e.g., "Script", "Budget") might exist in multiple phases (e.g., a drafted version in `DEVELOPMENT` and a locked version in `PRE_PRODUCTION`), the system scans phases in a specific order to find the **first available draft**.

**Search Order:**
1.  `DEVELOPMENT`
2.  `PRE_PRODUCTION`
3.  `ON_SET`
4.  `POST`

**Logic:**
```typescript
// Iterates through phases in the order they appear in the data object
for (const phase of phases) {
    if (phase.drafts[toolId]) {
        return phase.drafts[toolId]; // Returns the first match found!
    }
}
```

> **Troubleshooting Note (Missing User Data):**
> If you see unexpected data (e.g., "Making Waves in Paradise"), it often means the search found a draft in an earlier phase (like `DEVELOPMENT`) before finding your latest work in `PRE_PRODUCTION`, or vice-versa, depending on key order. **Ensure you are editing the document in the phase you expect.**

### Universal Unwrapper
Data in the database can sometimes be stored as an array (history of saves) or a single object. To handle this, `getToolData` applies a universal unwrapping logic:

1.  **Parse JSON**: If data is a string, parse it.
2.  **Extract Item**:
    *   If data is an `Array`: Return the **first item** (`data[0]`).
    *   If data is an `Object`: Return the object itself.

---

## 3. Document Rendering (`PrintPreview.tsx`)

The `PrintPreview` component is responsible for visualizing the selected document.

**Key Logic:**
*   **Single Page vs. Multi-Page**:
    *   The preview container allows content to flow naturally.
    *   Templates like **Treatment** or **Script** return multiple `DocumentLayout` components (pages), which stack vertically.
    *   Templates like **Call Sheet** return a single `DocumentLayout`.
*   **Data Injection**:
    *   The component calls `getToolData(targetToolId)` immediately before rendering.
    *   It injects metadata (Project Name, Date, Producer) into the template via the `metadata` prop.

---

## 4. Template Logic (e.g., `DirectorsTreatmentTemplate`)

Templates are responsible for converting raw JSON data into visual HTML/CSS pages.

**Structure:**
*   **Slides/Pages Loop**: The treatment template iterates over `data.slides`.
*   **Layout Generation**: For *each* slide, it renders a full `<DocumentLayout>` component.
    *   If `data.slides` has 3 items -> 3 Pages are rendered.
    *   If `data.slides` has 1 item -> 1 Page is rendered.

> **Why you might see 3 pages instead of 1:**
> If the legacy migration logic triggers (converting old "Scenes" data into "Slides"), it might generate extra slides from older data stored in the same document object. The template prioritizes `data.slides`, but falls back to migrating `data.scenes` if slides are missing.

---

## 5. PDF Export (`PdfDocumentFactory`)

When you click "Export Selection":
1.  **Playlist Construction**: The system builds a list of selected tool IDs.
2.  **Batch Fetching**: It calls `getToolData` for every tool in the list.
3.  **PDF Generation**: It uses `@react-pdf/renderer` to generate a PDF blob.
    *   *Crucial Reference*: The Factory uses the **exact same** `getToolData` logic as the Preview, ensuring WYSIWYG accuracy.

---

## Troubleshooting Checklist

If data appears missing or incorrect:

1.  **Check the Phase**: Are you editing the treatment in `DEVELOPMENT` but the Print Room is pulling from `PRE_PRODUCTION`?
2.  **Check for "Ghost" Data**: Is there legacy data (e.g., `scenes` array) in the database object that is being auto-migrated into slides?
3.  **Check Array Wrappers**: Is the latest save actually at index `0` of the array? (The logic assumes `data[0]` is the latest/active version).
