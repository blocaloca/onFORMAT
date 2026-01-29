# Separation of Concerns Strategy: "Headless Core"

Yes, separation is critical for future-proofing (re-skinning or offline porting).

## 1. The Current State (Critique)
Right now, `DraftEditor.tsx` acts as a "God Component"—it handles:
*   **State:** (versions, undo/redo)
*   **Logic:** (AI imports, migrations)
*   **Rendering:** (Choosing which Template to show)
*   **Navigation:** (NavBar)

This makes "skinning" hard because the logic is intertwined with the `<div>` structure.

## 2. The Strategy: "Headless" Logic Hooks
To enable easy re-skinning or offline usage (e.g., Electron/Tauri app), we should extract logic into **Custom Hooks**.

**Example Structure:**

```typescript
// useDraftLogic.ts (The Brain)
// Handles saving, loading, locking, and AI parsing.
// output -> { activeData, updateField, isLocked }
const { activeData, updateField } = useDraftLogic(draftId);

// DocumentPreview.tsx (The Skin)
// Pure UI. No API calls. Just receives data and renders pixels.
<BriefTemplate data={activeData} onChange={updateField} />
```

## 3. Offline Portability (Tauri / Electron)
If we separate correctly:
*   **The Logic Layer (`useDraftLogic`)** can detect the environment.
    *   *Web:* Calls Supabase API.
    *   *Desktop:* Calls `window.fs.writeFile` (File System).
*   **The UI Layer** remains exactly the same. It doesn't care if the data came from the Cloud or the Hard Drive.

## 4. Immediate Application (The Print Room)
For the Print Room we are about to build, I will enforce this strict separation:
1.  **`usePrintRoomState`**: A hook that manages the list of documents, cover page data, and selection state.
2.  **`PrintDashboardLayout`**: A dumb UI component that just takes that state and renders the `divs`.

This ensures that if you want to completely redesign the visual interface later, you don't break the PDF generation logic.
