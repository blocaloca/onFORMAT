# Revised Plan: The Consolidated "Print Room"
**Target:** Centralize all Output, Layout, and Export logic into a single dedicated dashboard.

## The Vision
The "Print Room" becomes the **Layout & Publishing Hub**.
*   **Absorbed Inputs:**
    *   Orientation Toggle (Portrait/Landscape) -> Moves here.
    *   "Export PDF" Button -> Moves here.
*   **Sticky Settings:** Changing orientation in the Print Room *saves* that preference for the document globally (so when you go back to edit, it's still correct).
*   **Dark Mode UI:** The dashboard itself matches the app's dark aesthetic (`bg-zinc-950`), but the *Document Preview* remains on a white/paper canvas for WYSIWYG accuracy.

## Phase 1: The Shell & Routing (Foundation)
*   **Objective:** Create the `PrintDashboard` component and ensuring the "Print Room" button correctly routes to it.
*   **Key Action:**
    *   Create `components/onformat/print/PrintDashboard.tsx`.
    *   Update `DraftEditor` to render `PrintDashboard` when `activeTool === 'project-export'`.
    *   Wire up the "Close / Back to Edit" button to return to the previous tool.

## Phase 2: The "Playlist" & Layout Logic (Input)
*   **Objective:** Build the Left Sidebar controls.
*   **Key Features:**
    *   **Document List:** Fetch user's actual document data from `phases`.
    *   **Selection Logic:** Checkboxes to include/exclude docs.
    *   **Orientation Toggle:** Per-document toggle (persists to state).
    *   **Cover Page Builder:** Simple form inputs (Title, Date, Logo).

## Phase 3: The Live Preview Engine (Output)
*   **Objective:** Render the documents to the screen exactly as they will print.
*   **Key Mechanism:**
    *   Reuse existing templates (`BriefTemplate`, etc.) but wrap them in a `<PrintPageContainer>` that enforces A4/Letter dimensions and creates page breaks.
    *   **Scale to Fit:** Use CSS `transform: scale()` to fit the paper view into the screen real estate.

## Phase 4: The PDF Generator (Action)
*   **Objective:** Click "Print Bundle" -> Download PDF.
*   **Technical Shift:**
    *   Instead of `jspdf` manually drawing text, we will use **DOM Snapshotting**.
    *   Iterate through the *rendered* preview nodes.
    *   Generate a high-quality PDF that matches the screen pixel-perfectly.

## Phase 5: Cleanup & Absorption ("The Great Migration")
*   **Objective:** Remove old buttons from the main workspace.
*   **Action:**
    *   Remove `ImageExportButton` and Orientation toggles from `DocumentNavBar`.
    *   Ensure the "Print Room" button is the *only* output action.

---
**Why this works:** It prevents "Time Out" because we separate the *UI building* (Phases 1-3) from the complex *PDF Generation logic* (Phase 4).
