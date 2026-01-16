# Document Logic & AI Interaction Pattern

This document defines the "Verified Perfect" logic for AI-User interaction within the Creative OS.
**Status**: CANONICAL. Apply this pattern to all future document integrations.

## Core Interaction Philosophy
1.  **Scribe First**: The AI defaults to *action* over *conversation*. If the user provides content, paste it immediately.
2.  **Auto-Paste**: Content updates happen in the *background* via the chat stream. The user sees a confirmation ("Notes added"), not a manual "Add" button.
3.  **Implicit Navigation**: After an action, immediately offer the next logical step (e.g., "Describe Images" -> "Another Image" or "Write Notes").
4.  **Clean UI**: Technical protocol strings (`**Header:**`) are used for state transmission but **masked** from the visual chat interface.

---

## 1. The AI Strategy (`app/api/onformat-v0/route.ts`)

### Auto-Paste Response
Instead of returning a `draft_prefill` action that requires a click, **embed the content directly in the message** using a Markdown protocol.

**Pattern:**
```json
{
  "thought": "User provided notes. Auto-adding.",
  "message": "Notes added.\n\n**Notes:** {{User Input}}",
  "actions": [
     { "label": "Next Step", "type": "suggestion", "payload": "..." }
  ]
}
```

### Action Handling
- **Actions** must be provided in the `actions` JSON key.
- **NEVER** output actions as text in the `message` body.
- Use `suggestion` type for navigation (triggers the next prompt).

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
