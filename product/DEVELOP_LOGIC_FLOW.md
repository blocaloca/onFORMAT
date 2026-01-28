# Develop Phase: Automatic Shot List Logic Flow

This document details the optimal logic flow to move from a blank state to a complete, automatically generated Shot List, minimizing manual redundancy while maximizing creative control.

## High-Level Pipeline

1.  **Project Vision** (Inspiration & Funnel)
2.  **Creative Brief** (Structured Data)
3.  **AV Script** (Narrative Structure)
4.  **Shot List** (Technical Execution)

---

## Step 1: Project Vision (The "Funnel")
**Goal:** Establish the creative parameters without forcing technical details.

*   **Field: Content** (Chat or Text)
    *   **Logic:** User selects project type (Commercial, Music Video, etc.). The AI asks 2-3 probing questions about *Feeling* and *Visual Style*.
    *   **Output:** A high-level text summary (e.g., "A gritty, high-energy commercial for a sports drink, featuring handheld camera work and fast cuts.").
    *   **Automation:** This text is actively listening. When the user clicks "Create Brief", this summary is passed as the `Vision Context`.

## Step 2: Creative Brief (The "Source of Truth")
**Goal:** Structure the Vision into actionable data points.

*   **Input:** Receives `Vision Context` from Step 1.
*   **Field: Product / Vision** -> Auto-filled from Step 1 summary.
*   **Field: Objective** -> AI infers from inputs (e.g., "Increase brand awareness").
*   **Field: Target Audience** -> AI infers (e.g., "Gen Z athletes").
*   **Field: Tone & Style** -> AI extracts keywords (e.g., "Gritty", "Handheld", "Desaturated").
*   **Field: Key Message** -> AI proposes a tagline.
*   **Transition:** Once the Brief is approved (or at least defined), it becomes the referencing anchor for the Script.

## Step 3: AV Script (The "Narrative Architecture")
**Goal:** Break the abstract Brief into linear Time/Visual/Audio blocks.

*   **Trigger:** User enters AV Script tool.
*   **Logic:**
    *   System checks for an existing Creative Brief.
    *   **Prompt:** "I see a Brief for [Project Name]. Generate script scenarios?"
    *   **Action:** If "Yes", AI generates 3 distinct concepts based on the Brief's `Objective` and `Tone`.
    *   **Selection:** User picks one concept.
*   **Automation:** AI fills the Script Rows:
    *   **Scene #**: Auto-incremented (1, 2, 3...)
    *   **Visual**: Descriptive action derived from the selected concept (e.g., "Close up of sweat dripping...").
    *   **Audio**: Dialogue or SFX matching the Visual.
    *   **Time**: Estimated duration based on text length.

## Step 3.5: Visual Development Branching (The "Director's Eye")
**Goal:** Identify key moments for visual exploration (Treatment/Storyboard) and automate asset creation.

*   **Trigger:** Post-Script Generation.
*   **Logic:**
    *   AI analyzes the script to identify **"Signature Scenes"**—moments with high visual impact or emotional weight.
    *   **Recommendation:** "Scene 3 and Scene 7 are visually strong. Add to Treatment?"
*   **Asset Generation:**
    *   **Action:** "Generate Image Prompt" for selected scenes.
    *   **Logic:** Combines `Script Visual` + `Brief Tone` + `technical camera adjectives`.
    *   **Output:** A high-fidelity Midjourney/DALL-E prompt (e.g., "Cinematic wide shot, anamorphic lens, intense sweat dripping, neon lighting, cyberpunk palette --ar 16:9").
    *   **Routing:** User can one-click send this prompt to the built-in *Image Generator*.

## Step 4: The Shot List (The "Blueprint")
**Goal:** Translate Narrative (Script) into Technical Instructions (Camera).

*   **Trigger:** User enters Shot List tool.
*   **Logic:**
    *   System detects existing AV Script Rows.
    *   **Button:** "Import from AV Script" (Existing functionality, but enhanced).
*   **The "Magic" Transformation (Proposed):**
    *   Instead of just copying the `Visual` text to `Description`, the AI *analyzes* the Script Row to deduce camera specs.
    *   **Script Row:** "Close up of sweat dripping..."
    *   **Shot List Fields:**
        *   **Size:** AI tags as `Close Up` (from text analysis).
        *   **Angle:** AI infers `Eye Level` or `Macro`.
        *   **Movement:** AI infers `Static` or `Handheld` (based on Brief's "Gritty" tone).
        *   **Description:** "Sweat dripping on brow. Intense focus."
    *   **Image Attachment:** If a visual was generated in Step 3.5, it is automatically linked to the corresponding Shot.
*   **Result:** A fully populated Shot List where Camera Specs are pre-filled based on the narrative context, ready for the DP to tweak rather than build from scratch.

---

## Summary of Data Flow

| Source Document | Field | Target Document | Field | Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Project Vision** | *Chat/Text* | **Creative Brief** | `Vision` / `Tone` | Summarization & Extraction |
| **Creative Brief** | `Objective` / `Tone` | **AV Script** | `Visual` / `Audio` | Creative Generation (Concepts) |
| **AV Script** | `Visual` | **Shot List** | `Description` | Direct Copy |
| **AV Script** | `Visual` (Context) | **Shot List** | `Size` / `Angle` | Interpretation / Classification |

This flow ensures that a decision made in Step 1 (e.g., "Gritty Style") ripples all the way down to Step 4 (defaulting shots to "Handheld"), providing a cohesive and automated production spine.
