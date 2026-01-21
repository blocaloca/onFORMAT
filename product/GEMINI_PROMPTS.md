# Gemini Prompt Sets for onFORMAT Development

Use these prompt sets to guide development, stress-test the product, and refine the AI logic.

---

## Set 1: The "Production Reality" Stress Test
**Goal:** Validate User Experience (UX) and Logic by simulating real-world set pressure.
**Format:** Copy/Paste into Gemini context with relevant code snippets.

> **Prompt:**
> "Act as a veteran Line Producer who is skeptical of technology. I am going to describe a user flow in the [Specific Tool, e.g., Mobile Camera Report].
> 
> My goal is for this tool to be usable one-handed, in bright sunlight, while holding a coffee.
> 
> **Scenario:**
> The camera crew just finished a complex Steadicam shot (Scene 3, Shot 4B). The Director loved it and called 'Circle Take', but the AC (Assistant Camera) realized the focus buzzed slightly at the end. They start rolling immediately on the next take. A new mag (A004) was just loaded.
> 
> **Instructions:**
> 1. Walk me through the exact clicks/taps required in the current UI to capture this status change (Good -> NG vs Circle) and the Roll Change.
> 2. Point out where the UI interacts poorly with physical reality (e.g., 'These buttons are too small', 'This modal hides the context I need').
> 3. Rate the 'Time to Log' on a scale of 1-10 (10 being instant)."

---

## Set 2: The "Librarian" Consistency Check (Architecture)
**Goal:** Ensure the "ASSIST Mode" is behaving as a strict source-of-truth validator, not a creative generator.
**Type:** Architectural Review.

> **Prompt:**
> "You are the 'Librarian' system architect for onFORMAT. Your core principle is 'Safety & Consistency'.
> 
> analyzing the data structures for [e.g., Call Sheet] and [e.g., Production Schedule]:
> 
> 1. **Identify Single Points of Failure:** Where is data duplicated rather than referenced? (e.g., Is 'Shoot Date' stored in two places that can drift apart?)
> 2. **Define the 'Write' Permissions:** Create a strict logic table for the AI. If a user asks the AI to 'Change the Call Time to 6 AM', explicitly list which fields in the underlying JSON must update, and which verified constraints (e.g., Child Actor hours) must be checked.
> 3. **Draft the System Prompt:** Write the strict system prompt for the ASSIST model that prevents it from answering creative questions (e.g., 'Make this schedule funnier') and politely redirects to DEVELOP mode."

---

## Set 3: "The Liaison" Personality & Proactivity
**Goal:** Develop the "Context-Aware Fork" and proactive suggestion engine.
**Type:** Feature Ideation.

> **Prompt:**
> "Adopt the persona of a highly proactive 'Unit Production Manager' (The Liaison).
> 
> I am a user currently working on the **[Current Phase, e.g., Scripting]**.
> 
> **Context:**
> The script mentions a 'burning car' in Scene 4.
> 
> **Task:**
> 1. **Analyze the Fork:** What are the immediate downstream documents that need to know about a 'burning car'? (e.g., SFX Budget, Safety Officer, Location Permit).
> 2. **Draft the 'Action Deck' Card:** Write the copy for a UI card that appears in the 'Action Deck'. It should not be annoying ('Clippy'). It should be helpful.
>    - *Bad:* 'It looks like you have fire! Want help?'
>    - *Good:* 'Scene 4 contains Pyrotechnics. <Button>Draft Safety Risk Assessment</Button> <Button>Add to SFX Budget</Button>'
> 3. **Logic Flow:** Describe the trigger mechanism. How does the system detect 'Fire' -> 'Offer Safety Doc' without hallucinating?"
