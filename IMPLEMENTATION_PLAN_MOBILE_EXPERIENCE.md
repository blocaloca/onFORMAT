# Implementation Plan: onSET Mobile Experience Hardening

## Objective
Eliminate "demo" artifacts and "empty" states from the mobile experience. Ensure a strict, professional landing state that only reveals content when explicitly permitted.

## Current State Analysis (Reverted Codebase)
1.  **The "Demo" Leak**:
    *   Result: When no `onset-mobile-control` document exists (or it's empty), the app injects default tools (`call-sheet`, `production-schedule`, etc.) to "fill space".
    *   Code Culprit: `app/onset/[id]/page.tsx` (Lines 177-181 and 478-482).
2.  **The "Empty" Greeting**:
    *   Result: The app tries to auto-select the first tab ('call-sheet'). If that document is empty, the user sees a blank/empty Call Sheet template.
    *   Code Culprit: `fetchData` auto-selection logic (Line 185).

## Proposed Changes

### 1. Strict "Zero Trust" Initialization
*   **Action**: Remove all "Default Tools" fallback logic.
*   **Result**: If `onset-mobile-control` is missing or grants no permissions, `availableKeys` will be `[]` (Empty Array).

### 2. The "Landing State" (New View)
Instead of forcing a tab selection, we will introduce a `LandingView` component that renders when `activeTab` is null/empty.

**Design Specs**:
*   **Background**: Deep black/pure black (Zinc-950/Black).
*   **Branding**: Centered "onSET" logo (Theme-aware: WT for Dark, BK for Light).
*   **Project Name**: Displayed elegantly (e.g., `font-mono tracking-widest`).
*   **Status Indicator**:
    *   If `availableKeys.length > 0`: "Select a tool below" (or auto-select first).
    *   If `availableKeys.length === 0`: "Standby. No active documents."
*   **Document Aesthetic**: All document views (Script, Shot List, Call Sheet) must use white backgrounds with black text ("Paper" theme) regardless of system dark mode.

### 4. UI Standardization (The "Paper" Theme)
*   **Objective**: Match OnSet Mobile's document aesthetic to the Desktop version's high-contrast professional standard.
*   **Action**: Eliminate "dark grey on black" text and standardize on light-on-dark (for UI) and dark-on-light (for documents).
*   **Result**: High-contrast, premium readability across all mobile views.

## Implementation Steps

### Step 1: Clean Data Fetching
In `app/onset/[id]/page.tsx`:
*   Remove the `if (availableKeys.length === 0 ... defaults = ...)` block in `fetchData`.
*   Remove the matching fallback in the `nav` render.
*   Update `activeTab` logic: If `availableKeys` is empty, set `activeTab` to `''` (empty string).

### Step 2: Build `LandingView` Component
Create a local component (or inline) for the landing state:
```tsx
const MobileLanding = ({ projectName, status }: any) => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
        <div className="mb-8 opacity-20">
            <img src="/onset_logo.png" className="w-24 grayscale" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-widest text-white mb-2">
            {projectName}
        </h1>
        <div className="h-px w-12 bg-zinc-800 my-4 mx-auto" />
        <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
            {status}
        </p>
    </div>
);
```

### Step 3: Main Render Logic
Update the `main` render:
```tsx
<main className="...">
    {activeTab === '' ? (
        <MobileLanding 
            projectName={data.project?.name} 
            status={availableKeys.length > 0 ? "Select a Document" : "Awaiting Documents"}
        />
    ) : (
        // Existing View Logic (ScriptView, ShotListView, etc.)
    )}
</main>
```

### Step 4: Verification
*   **Scenario A (No Permissions)**: User sees Landing Page ("Awaiting Documents"). Bottom Nav is empty. No "Call Sheet" ghost.
*   **Scenario B (Has Permissions)**: User sees Landing Page or First Doc. Bottom Nav shows ONLY permitted docs.

---
## Logic Safety Confirmation
*   **Permissions**: The underlying ABC/Crew logic remains **untouched**. We are simply changing the *visual result* of "No Permissions" from "Show Demo Content" to "Show Landing Page".
*   **Data Sync**: Realtime subscriptions and data fetching `useEffect` hooks are preserved exactly as is.

## Suggestions for "Professional Polish" (Add-ons)
1.  **Functional System Menu**:
    *   *Current State*: The `<Menu />` icon is non-functional decoration.
    *   *Proposal*: Implement a slide-out drawer containing:
        *   **Crew Identity**: "Logged in as [Email] ([Role])"
        *   **Sync Health**: "Last updated: [Time] • Connection: Stable"
        *   **Support**: Link to Production Office (if configured).
        *   **Logout**: Essential for shared set devices.
2.  **Haptic Feedback**: Add subtle vibration on tab switches (if supported/safe) for a tactile "device" feel.

---
**Approval Required**: confirms removal of "Demo" features and introduction of "Landing State".
