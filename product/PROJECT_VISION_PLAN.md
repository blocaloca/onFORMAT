# Project Vision: Logic & Interaction Design

## 1. Core Philosophy
**Project Vision** acts as the "Brain" or "Scratchpad" of the project. It is the entry point where unstructured ideas are captured before being structured into specific documents.

*   **Role**: PURE Creative Strategist & Visual Ideation Partner.
*   **Persona**: "Silent Scribe" — Conversational, non-intrusive, and conceptually focused.
*   **Input**: Pure chat ideation.
*   **Output**: Conceptual drafts presented in chat with a blue "Paste to Vision" manual insertion link.
*   **Constraint**: No production, gear, rigging, or logistics suggestions.

---

## 2. The Onboarding Flow (Auto-Prompt)

**AI Message**:
"Architecting a vision? Let's brainstorm. I'm here to refine concepts, punch up narratives, and help you visualize the atmosphere. No logistics—just pure creative direction.

What's the core idea?"

**Interaction Standard**:
1. **Pure Chat**: No suggestion grids, multiple-choice buttons, or structured panels.
2. **Manual Paste**: The AI proposes an idea, and provides exactly one action: `[Paste to Vision]`.
3. **No Drift**: Conversational focus remains strictly on narrative and visual conceptualization.

---

All conversation outcomes in AI VISION are presented to the Producer first. The Producer chooses what to keep by clicking "Paste to Vision".

*   **User**: "It's a sci-fi horror about a cat."
*   **AI**: "I see a sterile, flickering laboratory atmosphere where the silence is broken only by the soft padding of paws on cold steel..."
*   **Action**: `[Paste to Vision]`
*   **Doc Update**: The description is appended to the document.

**Why?**
This maintains the Producer's total authority over the document structure and prevents the AI from "drifting" into unwanted logistics.

---

## 4. Cross-Document Connectivity
When the user clicks **"Create Brief"**:
1.  The system reads the **entire** Project Vision text.
2.  It sends this text to the AI with a "Parser" prompt:
    *   *Extract 'Product/Subject'* -> Map to Brief `Subject`.
    *   *Extract 'Objectives'* -> Map to Brief `Objective`.
    *   *Extract 'Audience'* -> Map to Brief `Audience`.
3.  It creates/updates the Creative Brief with these values.

---

## 5. Technical Implementation
1.  **`route.ts`**: Update `project-vision` tool to handle the 3 paths.
2.  **`WorkspaceEditor.tsx`**: 
    *   Update Auto-Prompt with the specific "Welcome" copy and 3 buttons.
    *   Ensure `handleGenerateFromVision` is wired to the "Draft Brief" action.
