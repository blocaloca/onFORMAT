# Document Logic & AI Behavior Matrix

This document outlines the **Logic Matrix**—the functional rules, parsing patterns, and AI strategies that govern the "Connective Logic" across the onFORMAT system.

**Core Philosophy:**
*   **ASSIST Mode**: "Help me move faster." (Validation, Math, Checks).
*   **DEVELOP Mode**: "Do the heavy lifting." (Generation, Drafting, Creative Pivots).

**Parsing Engine**: The `WorkspaceEditor` regex engine listens for markdown keys (e.g., `**Scene:**`) in AI responses and automatically populates structured data. Be precise.

---

## 🏗️ Phase 1: DEVELOPMENT

### 1. Project Vision
*   **Role**: The "War Room". High-level ideation.
*   **AI Strategy**: Ask for "Seed Idea". Offer 3 distinct starting points.
*   **Parsing**: None (Raw Output).

### 2. Creative Brief
*   **Role**: The constraints and strategy.
*   **Logic Flow**:
    1.  **Subject/Product**: "First things first. What are we filming?"
    2.  **Objective**: "What is the primary goal?"
    3.  **Deliverables Loop**: "What assets?" -> "Any more?" (No global usage step).
    4.  **Completion**: Offers "Draft Treatment" or "Start Pre-Production".
*   **Parsing Keys**:
    -   `**Subject/Product:**`
    -   `**Objective:**`
    -   `**Target Audience:**`
    -   `**Tone:**` / `**Key Message:**`
    -   `**Deliverables:**` (Parses comma/newline separated list).

### 3. AV Script
*   **Role**: Two-column narrative blueprint.
*   **AI Strategy**:
    -   Check "Stats: Scene X" context to prompt for next beat.
    -   "How does it start?" -> "What happens next?"
*   **Parsing Keys**:
    -   `**Scene:**` (Scene Number)
    -   `**Time:**` (HH:MM:SS)
    -   `**Visual:**` (Action Description)
    -   `**Audio:**` (Dialogue/SFX)
*   **Action Example**:
    ```json
    {
      "label": "Opening Scene",
      "payload": "**Scene:** 1\n**Time:** 00:00:05\n**Visual:** EXT. CITY\n**Audio:** SFX: Sirens."
    }
    ```

### 4. Director's Treatment
*   **Role**: The pitch. Narrative persuasion.
*   **Parsing Keys**:
    -   `**Narrative Arc:**`
    -   `**Character Philosophy:**`
    -   `**Visual Language:**`
    -   `**Director:**`

### 5. Storyboard / Moodboard
*   **Role**: Visual texture.
*   **Parsing Keys**:
    -   `**Scene:**` (Generates Image Caption Item).

---

## 📋 Phase 2: PRE-PRODUCTION

### 6. Shot List
*   **Role**: Execution plan.
*   **AI Strategy**:
    -   Analyzes Script (if available) or asks for "Establishing Scene".
    -   Suggests "Master" -> "Coverage" (Medium, CU).
    -   Context Hint: "Stats: Scene X. Add coverage or move to next?"
*   **Parsing Keys**:
    -   `**Scene:**`
    -   `**Size:**` (Wide, Medium, Close Up)
    -   `**Angle:**` (Eye Level, Low Angle)
    -   `**Movement:**` (Static, Pan, Tracking)
    -   `**Description:**`
*   **Action Example**:
    ```json
    {
      "label": "Wide Master",
      "payload": "**Scene:** 1\n**Size:** Wide\n**Angle:** Eye Level\n**Movement:** Static\n**Description:** INT. ROOM"
    }
    ```

### 7. Schedule
*   **Role**: Time management.
*   **Parsing**: (Planned: `**Day:**`, `**Call Time:**`, `**Scenes:**`).

### 8. Budget
*   **Role**: Money management.
*   **Parsing**: (Planned: `**Line Item:**`, `**Cost:**`).

---

## 🎬 Phase 3: ON SET & POST

(Logic Matrix to be expanded for these phases as stability is confirmed).
