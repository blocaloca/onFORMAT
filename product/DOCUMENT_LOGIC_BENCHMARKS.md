# Document Logic & AI Behavior Benchmarks

This document outlines the functional logic and expected AI behavior (ASSIST vs DEVELOP) for every document type in the onFORMAT system. It serves as the benchmark for implementing specific tool calls and context handlers.

**Core Philosophy:**
*   **ASSIST Mode (The Fixer/Librarian):** Efficient, low-token count, high speed. "Help me move faster." checks logic, fixes math, flags errors. Minimal conversation.
*   **DEVELOP Mode (The Creative Partner/Doer):** Strategic, constructive, opinionated. "Do the heavy lifting." Fills forms completely based on context, pivots strategies, offers creative solutions.

---

## 🏗️ Phase 1: DEVELOPMENT
*Focus: The "What" and "Why". Creative shaping and narrative.*

### 1. Project Vision (New!)
**Function**: The "War Room" / Working Canvas. High-level project strategy and ideation.
- **ASSIST**: Summarizes chat notes into bullet points. Organizes random thoughts.
- **DEVELOP**: "Build a full project strategy from this transcript." "Pivot the genre to Horror-Comedy and update the themes." Acts as a creative director.

### 2. Creative Brief
**Function**: The constraints and client goals.
- **ASSIST**: "Objective is missing." "Deliverables list is formatted incorrectly." (Validation).
- **DEVELOP**: "Draft a full brief for a Nike Commercial based on their 2024 brand guidelines." (Generation).

### 3. AV Script
**Function**: Two-column narrative blueprint.
- **ASSIST**: Checks reading timing. Flags audio/video sync issues.
- **DEVELOP**: "Rewrite the dialogue to be punchier." "Generate visual descriptions for this voiceover."

### 4. Director's Treatment
**Function**: The pitch. Narrative and visual persuasion.
- **ASSIST**: Formatting checks. Ensures sections match the Brief's requirements.
- **DEVELOP**: "Write a 'Visual Approach' section describing a moody, noir aesthetic."

### 5. Moodboard (Creative Direction)
**Function**: Visual texture and color strategy.
- **ASSIST**: "Extract the hex color palette from these images."
- **DEVELOP**: "Generate a grid of images for 'Cyberpunk Seoul' styling." "Suggest 5 key visual words."

### 6. Lookbook
**Function**: Technical visual strategy (Camera/Lighting).
- **ASSIST**: "These lenses don't match the sensor size entered."
- **DEVELOP**: "Suggest a lighting package for a 'High-Key Commercial' look."

---

## 📋 Phase 2: PRE-PRODUCTION
*Focus: The "How". Logistics, Resources, and Planning.*

### 7. Shot List
**Function**: The bridge between story and execution.
- **ASSIST**: "Calculate total setup time." "You missed coverage for Scene 5."
- **DEVELOP**: "Generate a standard coverage shot list (Wide, Med, CU) for every scene in the script."

### 8. Schedule
**Function**: Time management.
- **ASSIST**: "Sunrise is at 6am, move Scene 1 earlier." "Sort scenes by location."
- **DEVELOP**: "Create an optimized 3-day schedule that prioritizes actor availability."

### 9. Budget
**Function**: Money management.
- **ASSIST**: Math verification. "Line 42 does not sum correctly."
- **DEVELOP**: "Estimate the cost of a 10-person crew for 2 days in NYC."

### 10. Crew List
**Function**: Personnel.
- **ASSIST**: "Auto-fill contact info from previous project." "Flag missing HODs."
- **DEVELOP**: "Suggest a standard crew size for a $50k budget music video."

### 11. Casting / Talent
**Function**: Who is on camera.
- **ASSIST**: "Flag conflicts between shoot dates and actor availability."
- **DEVELOP**: "Generate character breakdowns for a 'Gritty Detective' and a 'Naive Rookie'."

### 12. Locations
**Function**: Where it happens.
- **ASSIST**: "Calculate travel time from Basecamp." "Check power requirements."
- **DEVELOP**: "Find 5 industrial warehouse locations in Los Angeles with permit links."

### 13. Equipment List
**Function**: The Gear.
- **ASSIST**: "Cross-check this list against the Shot Log requirements."
- **DEVELOP**: "Build a standard 'Arri Alexa Mini' camera package."

### 14. Wardrobe & Props
**Function**: Physical items.
- **ASSIST**: "Group items by Scene." "Flag continuity errors."
- **DEVELOP**: "List all props mentioned in the script." "Suggest a color palette for the Lead."

---

## 🎬 Phase 3: ON SET
*Focus: Execution. Speed, Accuracy, Reality.*

### 15. Call Sheet
**Function**: Daily orders.
- **ASSIST**: "Pull weather data for tomorrow." "Auto-fill Nearest Hospital."
- **DEVELOP**: N/A (Strict safety/logistical document).

### 16. On-Set Notes
**Function**: Producer/Scripty logs.
- **ASSIST**: "Log current time." "Link note to Scene 4."
- **DEVELOP**: "Summarize the day's notes into a Wrap Report email."

### 17. Camera / Sound / DIT Logs
**Function**: Technical metadata.
- **ASSIST**: "Duplicate previous entry." "Calculate card space remaining."
- **DEVELOP**: N/A.

---

## 📦 Phase 4: POST-PRODUCTION
*Focus: Completion. Organization, Delivery.*

### 18. Client Selects
**Function**: Feedback loop.
- **ASSIST**: "Tally checks." "Filter by 'Approved'."
- **DEVELOP**: "Summarize client feedback trends (e.g., 'They hate the blue shirt')."

### 19. Deliverables
**Function**: Handover.
- **ASSIST**: "Check file specs against platform requirements."
- **DEVELOP**: N/A.

### 20. Archive Log
**Function**: Storage.
- **ASSIST**: "Generate LTO tape label."
- **DEVELOP**: N/A.
