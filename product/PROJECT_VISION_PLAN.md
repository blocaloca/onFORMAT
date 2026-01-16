# Project Vision: Logic & Interaction Design

## 1. Core Philosophy
**Project Vision** acts as the "Brain" or "Scratchpad" of the project. It is the entry point where unstructured ideas are captured before being structured into specific documents.

*   **Role**: Creative & Production Partner.
*   **Input**: Natural language brainstorming (Chat).
*   **Output**: A rich text document ("Vision Doc") containing concept details, logistical constraints, and rough notes.
*   **Connection**: Content in the Vision Doc is **parsed** to auto-populate the *Creative Brief*, *Budget*, and *Schedule*.

---

## 2. The Onboarding Flow (Auto-Prompt)

**AI Message**:
"Welcome. I'm your Creative & Production Partner. I can help you develop concepts, characters, and visual styles, or help you scope budgets and logistics.

Where should we start?"

**Primary Actions**:
1.  **Creative Development** (Label: "Creative Assist")
    *   *Goal*: Flesh out the idea.
    *   *Prompt*: "Let's brainstorm. What is the core idea or genre?"
2.  **Production Planning** (Label: "Production Assist")
    *   *Goal*: Define scope.
    *   *Prompt*: "Let's talk logistics. what is your estimated budget or timeline?"
3.  **Create Brief** (Label: "Draft Brief")
    *   *Goal*: Fast-track to execution.
    *   *Action*: Trigger `generate_brief_from_vision`.

---

## 3. The "Auto-Paste" Strategy
All conversation outcomes in Project Vision are auto-pasted into the document body to build context.

*   **User**: "It's a sci-fi horror about a cat."
*   **AI**: "Concept added."
*   **Doc Update**: `**Concept:** Sci-fi horror about a cat.`

**Why?**
This ensures the Vision Doc accumulates keywords ("Sci-fi", "Horror", "Cat") that the **Brief Parser** will later look for.

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
