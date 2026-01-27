# PLAN: Operation "Headless" Pattern
**Goal:** Decouple Business Logic & AI from the UI Layer to enable skinning/theming without functionality risk.

This plan follows the **Entity-Component-System (ECS)** philosophy used in game development:
*   **Entities (Data)**: The raw JSON from Supabase.
*   **System (Logic/AI)**: The "Brain" that processes data, handles AI, and calculates states.
*   **Components (UI)**: The "Skin" that merely renders what the System tells it to.

---

### Phase 1: The Semantic Foundation (Theme Engine)
*Before touching code, we must define the "Language" of the design.*

1.  **Expand `lib/theme/tokens.ts`**:
    *   Currently, we only have basic colors. We must exhaustively map:
        *   **Typography**: `text.heading.xl`, `text.body.sm` (abstracting font families).
        *   **Spacing**: `space.container.padding`, `space.item.gap`.
        *   **Motion**: `duration.fast`, `ease.bounce`.
    *   **Deliverable**: A complete Design System API. The UI will strictly use `tokens.text.error` instead of `text-red-500`.

### Phase 2: The "Brain" Extraction (Logic Layer)
*Move thinking out of React components.*

1.  **Create "Stores" (State Management)**:
    *   Instead of `useState` inside `DashboardPage.tsx`, strictly use custom hooks that return **only data and handlers**.
    *   *Example:* `useDashboardLogic()` returns `{ projects, isLoading, createProject(data) }`.
    *   **Outcome**: The `DashboardPage.tsx` becomes a "dumb" view layer that just calls functions. It doesn't know *how* a project is created, only *that* it can be created.

2.  **Centralize AI Services (`lib/ai/`)**:
    *   **The Hub**: Create a central `AiService` class.
    *   **The Registry**: Move all hardcoded prompts from API routes into a structured `PromptRegistry` (JSON/YAML).
    *   **Context Builders**: Write pure functions that "prepare" data for AI.
        *   *Bad:* UI sends raw text to API.
        *   *Good:* UI sends `documentId`. logic layer fetches context, formats it, picks the prompt, and sends to LLM.

### Phase 3: The "Skin" Separation (UI Refactoring)
*Refactor one module at a time.*

1.  **The "Prop-Drilling" Standard**:
    *   UI Components (e.g., `Button`, `Card`, `Editor`) must accept **Data Interfaces**, not raw implementation details.
    *   *Rule:* A `ProjectCard` should accept a `ProjectViewModel`, not a raw Supabase row. The Logic Layer does the transformation.

2.  **Generic Template Architecture**:
    *   Refactor `*Template.tsx` (Call Sheet, Schedule, etc.) into two parts:
        *   `CallSheetLogic.ts`: Handles date math, "wrap" logic, and data validation.
        *   `CallSheetView.tsx`: Receiving state from the logic file and rendering pixels.

### Phase 4: Verification Strategy (The Safe Path)
*How to do this without breaking production.*

1.  **Shadow Implementation**:
    *   Do not overwrite `DashboardPage.tsx` immediately.
    *   Create `app/dashboard/v2/page.tsx`.
    *   Build the new "Headless" logic hooks giving them to the new V2 view.
    *   Once V2 behaves identical to V1, you simply swap the import or route.

2.  **Visual Regression Testing**:
    *   Because we rely on `tokens.ts`, changing a token (e.g., "Primary Color") updates the *entire* site instantly. We can test "Skins" by simply swapping the token file.

### Summary
By the end of this plan, your codebase looks like this:
*   `lib/core/`: The Brain (Typescript only, no React).
*   `lib/theme/`: The Skin Defaults (Tokens).
*   `components/`: Dumb Views (React only, no business logic).
