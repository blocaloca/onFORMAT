---
description: Implementation plan for Vision-to-Brief AI Workflow.
---

# Feature: Project Vision to Creative Brief Workflow

## Goal
Streamline the transition from "Vision" (Ideation) to "Brief" (Strategy).
1.  **AI Trigger**: Add a "Generate Brief" button in the Project Vision tool.
2.  **Action**: On click, it triggers an AI synthesis of the Vision Board.
3.  **Navigation**: Automatically switches the view to the `Creative Brief` tool.
4.  **Population**: Pre-fills the Brief fields (Product, Objective, etc.) with the synthesized data.
5.  **Refinement**: Spawns a "Librarian/Partner" chat prompt to ask specific questions for any missing fields.

## Implementation Steps

### 1. Update `CreativeConceptTemplate.tsx` (Project Vision)
-   Add a **"Generate Brief"** button in the header/toolbar.
-   **Handler**: `onGenerateBrief` prop.
-   **UI**: Prominent but cleaner than a generic "AI" button. Maybe "Move to Strategy"?

### 2. Update `DraftEditor.tsx` (The Controller)
-   Implement the `handleGenerateBriefFromVision` logic.
-   **Step A**: Read current `project-vision` data.
-   **Step B**: (Mock or Real) AI Call -> Extract:
    -   Product Name / Subject
    -   Objective
    -   Target Audience
    -   Tone
    -   Key Message
-   **Step C**: Construct a new `BriefData` object.
-   **Step D**: Update the `brief` draft in `phases['STRATEGY']` (or `DEVELOPMENT`).
-   **Step E**: Call `onNavigate('brief')`.
-   **Step F**: Trigger the AI Chat Sidebar (`onOpenAi`) with a specific context prompt:
    > "I've drafted a brief based on your vision board. I need clarification on [Missing Field] and [Missing Field] to finalize it."

### 3. Update `BriefTemplate.tsx`
-   Ensure it can gracefully handle partial data (it already does).
-   Ensure the fields match the extraction logic.

### 4. Wire it all up
-   Pass the `onGenerateBrief` handler from `WorkspaceEditor` -> `DraftEditor` -> `CreativeConceptTemplate`.

## Data Mapping
**Vision (Unstructured)** -> **Brief (Structured)**
-   *Images/Keywords* -> **Tone**
-   *Title/Header* -> **Product/Subject**
-   *Notes* -> **Objective/Key Message**

## Execution
1.  Modify `DraftEditor.tsx` to add the handler `handleGenerateBrief`.
2.  Modify `CreativeConceptTemplate.tsx` to add the UI trigger.
3.  Simulate the AI extraction (heuristics for now) to demonstrate the immediate "Magic" feel.
