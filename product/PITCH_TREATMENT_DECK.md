# Pitch: Modular Directors Treatment Deck

**The Concept:**
Transform the Treatment from a linear list into a **Modular Slide Deck**. Instead of just adding a "Scene", users build a custom presentation page by page.

**Core Features:**

1.  **The "Add Slide" Experience:**
    *   Instead of just a button, users get a small menu when clicking "Add Page":
        *   **Introduction/Vision:** Sets up the hook.
        *   **Story/Narrative:** Focuses on text flow.
        *   **Characters/Casting:** Grid layout for faces.
        *   **Production Design:** Visual-heavy layout.
        *   **Cinematography:** Split layout (Ref image + Tech specs).
        *   **Mood Board:** Full-screen collage.

2.  **Flexible Layout Engine:**
    *   Each slide has a **Layout Toggle** in its header (Icon based):
        *   📝 **Text Only:** Optimized for long narrative reading.
        *   🖼️ **Image Focus:** Large visuals with minimal captions (best for Vision/Design).
        *   🌗 **Split (Left/Right):** Perfect for Shot references next to notes.
    *   This empowers the director to match the *medium* to the *message*.

3.  **Smart Categories (The "Logic Hook"):**
    *   By categorizing slides, we allow the AI "Silent Scribe" to perform **"Ghost Drafting"**.
    *   *Example:* If you enable AI, it can check your Brief's "Tone" and automatically draft the text for your "Cinematography" slide ("We will use anamorphic lenses to capture the grittiness...").
    *   *Example:* "Characters" slide can auto-populate with the Cast List generated in the Brief.

4.  **YouTube Integration:**
    *   For the "YouTube" category, we render a specific **"Reference Embed"** layout.
    *   User pastes a URL -> We fetch the thumbnail and title automatically (simulated for now) and display it as a "Click to Play reference" card.

**Technical Execution Plan:**
*   **Refactor Data Model:** `scenes: TreatmentScene[]` becomes `slides: TreatmentSlide[]`.
*   **New Component:** `<TreatmentSlide />` that accepts `layout` and `category` props to render differently.
*   **Migration:** We will need to migrate existing `scenes` into `slides` with a default "Split" layout to preserve data.

**Why this wins:**
It feels like building a Keynote/PowerPoint presentation but constrained to professional film standards. It moves "onFormat" from a form-filler to a creative design tool.
