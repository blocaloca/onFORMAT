# Assessment of Develop Phase Flow

## Current Status (As of Assessment)

### Logic Flow
1.  **Project Vision (Entry)**:
    *   User enters manual text or uses the "Workshop with AI" chat.
    *   **Action**: "Create Brief" button triggers a transfer.
    *   **Mechanism**: The *text content* of the Vision page is sent to the AI, which interprets it to populate a *fresh* Creative Brief.
    *   **Gap**: If the user only chats with the AI but doesn't write in the document, `page.content` is empty, and the Brief generation lacks context.

2.  **Creative Brief (Destination)**:
    *   Upon transfer, the AI fills fields (Product, Audience, etc.) based on the prompt.
    *   User reviews and refines.

### User Feedback Analysis
*   **"It was better before"**: The removal of the "Create Brief" button and the change to strictly conversational logic was disjointed. The user prefers the explicit action available in the UI.
*   **"Prompt user twice..."**: The user wants the AI to be more proactive in *gathering* information conversationally (2 turns) before suggesting the move.
*   **"Goal: Keep creative high level"**: The Vision phase should be about "Feeling" and "Style", not "Logistics".

## Proposed "Improved Flow"

We propose a hybrid model that uses **Conversation-First** gathering but maintains **Document-Based** truth.

### The New Workflow

1.  **Phase 1: The Inspiration Loop (Project Vision)**
    *   **User Action**: User opens Project Vision.
    *   **AI State**: Instead of "How can I help?", the AI opens with a specific, high-level probe: *"Let's define the soul of this project. What is the core emotion or message?"*
    *   **Interaction**:
        *   **Turn 1**: User answers (e.g., "It's gritty and raw").
        *   **Turn 2**: AI acknowledges and asks for the **Visual Language**: *"Understood. How do you see this visually? (e.g. Handheld, Cinematic, colors...)"*
        *   **Closing**: After capturing these two pillars, the AI presents a **"Generate Brief" Action Button** directly in the chat.

2.  **Phase 2: The "Smart Transfer"**
    *   **Action**: When user clicks "Generate Brief" (or the manual button above), the system:
        *   **Aggregates** both the *Document Text* AND the *Chat History*. This is critical to ensure conversational nuggets aren't lost.
        *   **Transitions** to the Creative Brief tool.
        *   **Populates** the Brief's "Vision" field with a synthesized summary of the chat.
        *   **Populates** "Target Audience", "Tone checks", etc.

3.  **Phase 3: Downstream Logic**
    *   The populated Brief becomes the "Source of Truth" for AV Scripts and Storyboards, ensuring the high-level vision captured in Phase 1 is respected.

## Implementation Steps
1.  **Restore UI**: The "Create Brief" button has been restored to ensure the current workflow remains functional. (Done).
2.  **Update WorkspaceEditor**:
    *   Modify `handleGenerateFromVision` to include `state.chat['project-vision']` in the prompt context. This fixes the "empty content" gap.
    *   Implement the "2-Turn Logic" in the System Prompt or Chat State manager (requires backend or complex client state).
3.  **Refine Initial Prompt**: Restore the simpler "Inspire" prompt but keep the specific Action Buttons ("Define Emotion", "Visual Style") to guide the user without forcing them.

### Immediate Next Step
We will update `WorkspaceEditor.tsx` to include the **Chat History** in the context sent to the Brief generator. This ensures that even if you just talk to the AI, the Brief gets the info.
