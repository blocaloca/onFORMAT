---
description: Implementation plan for linking Directors Treatment, Storyboard, and Lookbook with AV Script.
---

# Integration Plan: Treatment, Storyboard & Lookbook

## 1. Data Model & Primary Key Strategy
The `scene_number` (string/number) from the **AV Script** is the "Source of Truth".
- **AV Script**: Defines the existence of a scene (e.g., "1", "2", "2A").
- **Storyboard**: Consumes `scene_number` to visualize specific beats.
- **Lookbook**: Serves as a centralized asset repository (Images) that can be referenced by the Storyboard.

### Schemas
**AV Script (`av-script`)**
```json
{
  "rows": [
    { "id": "uuid", "scene": "1", "visual": "...", "audio": "..." }
  ]
}
```

**Storyboard (`storyboard`)**
```json
{
  "frames": [
    { 
      "id": "uuid", 
      "sceneNumber": "1",   // << Links to AV Script
      "image": "url",        // Uploaded or Pinned
      "scriptSyncStatus": "synced" | "orphaned" // Derived at runtime
    }
  ]
}
```

**Lookbook (`lookbook`)**
```json
{
  "assets": [
    { "id": "uuid", "url": "...", "category": "Tone" }
  ]
}
```

**Directors Treatment (`directors-treatment`)**
```json
{
  "approach": "Rich text...",
  "tone": "Rich text...",
  "narrativeArc": "Rich text...",
  "sections": [...] // Legacy support
}
```

## 2. Component Architecture Changes

### A. `DraftEditor.tsx` (The Controller)
- **Action**: Must extract `importedAVScript` and `importedLookbook` from `phases['DEVELOPMENT']`.
- **Action**: Pass these as `metadata` prop to:
  - `StoryboardTemplate` (needs both)
  - `DirectorsTreatmentTemplate` (needs Lookbook ideally, or just context)
  - `LookbookTemplate` (self-contained, but maybe needs script context?)

### B. `DirectorsTreatmentTemplate.tsx`
- **Action**: Replace generic scene list with dedicated TextAreas for:
  - **Approach** (The "How")
  - **Tone** (The "Feel")
  - **Narrative Arc** (The "Story")

### C. `StoryboardTemplate.tsx` (The Hub)
- **UI**: Switch to Grid View (Cards).
- **Scene Link**:
  - Each card has a "Scene #" input.
  - **Logic**: Compare card's `sceneNumber` vs. `metadata.importedAVScript.rows`.
  - **Visual Feedback**: If scene is missing in AV Script -> Red Border + "Scene Deleted" Warning.
- **Lookbook Sync**:
  - "Pin Image" button on card -> Opens simple selector showing images from `metadata.importedLookbook`.
  - On select -> copies URL to Storyboard frame.

### D. `LookbookTemplate.tsx`
- Ensure it allows basic image URL addition/management so there is data to pin.

## 3. Execution Steps
1. **Modify `DraftEditor.tsx`**: Wire up the cross-document data flow.
2. **Update `DirectorsTreatmentTemplate.tsx`**: Implement the 3-section structure.
3. **Update `StoryboardTemplate.tsx`**: Implement the logic-linked Grid View and Pinning feature.
