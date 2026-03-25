# Document Logic & AI Interaction Pattern

This document defines the "Verified Perfect" logic for AI-User interaction within the Creative OS.
**Status**: CANONICAL. Apply this pattern to all future document integrations.

6. ## Core Interaction Philosophy
7. 1.  **Pure Chat Context**: The AI defaults to a natural, conversational partner ("Silent Scribe"). No multiple-choice grids or distracting panels.
8. 2.  **Specific Snippets**: Payload is locked down to specific snippets of text rather than the entire project state to maximize focus and reduce token costs.
9. 3.  **Manual Integration**: The system prioritizes the Producer's authority. The AI proposes, the user "Pastes" or copies content manually (using the blue "Paste to Vision" link).
10. 4.  **Concise & Impactful**: Responses are intentionally brief, acting as a creative "punch up" rather than a verbose summary.

---

## 1. The AI Strategy (`app/api/onformat-v0/route.ts`)

### Model & Payload Lockdown
- **Model**: `openai/gpt-5-nano` (Optimized for cost/speed).
- **Payload**: Restricted to TWO messages (System + User Prompt).
- **System Persona**: Expert Creative Director Assistant focused on refinement and brainstorming.

### Action Handling
- **Pure Chat Link**: Responses facilitate manual document insertion via a single blue inline link: `[Paste to Vision]`. 
- **No Structured Actions**: Multi-step "Action Decks" and "Suggestion Grids" are deprecated in favor of a clean chat-only workflow.

---

## 2. The Frontend Parser (`components/onformat/WorkspaceEditor.tsx`)

### Auto-Parse Effect
A global effect listens to the `chat` state. When a new message arrives from the `assistant`:
1.  It extracts the `message` text (ignoring the `actions` JSON).
2.  It runs `saveDraftForActiveTool(messageText)`.

### Tool-Specific Parsing
`saveDraftForActiveTool` contains regex logic for each tool to map protocol strings to state.

**Example (Treatment):**
```typescript
const notesMatch = incoming.match(/\*\*Notes:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
if (notesMatch) {
    // Update state.narrativeArc or similar
}
```

---

## 3. The UI Sanitizer (`components/onformat/ChatInterface.tsx`)

The chat window must strictly hide the "plumbing". Use regex in the render loop to strip technical strings.

**Pattern:**
```typescript
const displayContent = textContent
    .replace(/\*\*Notes:\*\*[\s\S]*$/, 'Notes added.')
    .replace(/\*\*Image Prompt:\*\*[\s\S]*$/, 'Prompt generated.')
    .trim();
```

---

## Implementation Checklist (Next Document: Shot List)
1.  [ ] **Template Check**: Verify `ShotListTemplate.tsx` structure (`rows` array, specific fields).
2.  [ ] **Auto-Prompt**: Ensure `WorkspaceEditor` prompts "Describe Scene 1" on load.
3.  [ ] **Parser**: Update `WorkspaceEditor` to parse `**Scene:**`, `**Shot:**`, `**Description:**`.
4.  [ ] **Stragey**: Update `route.ts` for `shot-scene-book` to use Auto-Paste logic.
5.  [ ] **UI**: Add regex mask for `**Scene:**` to `ChatInterface`.
