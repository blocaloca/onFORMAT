import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phase, toolType, lockedPhases, phaseData, messages, provider, mode = 'ASSIST' } = body

    // Get OpenRouter API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://onformat.com',
        'X-Title': 'onFORMAT',
      },
    })

    // Build system prompt
    const systemPrompt = buildSystemPrompt(phase, toolType, lockedPhases, phaseData, mode)

    // Call OpenRouter
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const assistantMessage = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ message: assistantMessage })
  } catch (error: any) {
    console.error('onformat-v0 API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


interface ProtocolAction {
  label: string;
  type: 'draft_prefill' | 'suggestion' | 'link';
  target?: string;
  payload?: any;
  prominence: 'primary' | 'secondary';
  thought?: string;
}

function buildSystemPrompt(
  phase: string,
  toolType: string,
  lockedPhases: Record<string, boolean>,
  phaseData: Record<string, any>,
  mode: 'ASSIST' | 'DEVELOP' | 'OFF' | string
): string {
  const lockedInfo = Object.entries(lockedPhases)
    .filter(([_, locked]) => locked)
    .map(([p]) => p)
    .join(', ')

  // Mode Instructions
  const modeInstructions = mode === 'DEVELOP'
    ? `MODE: DEVELOP. 
         - You are a Creative Collaborator.
         - Propose bold ideas.
         - DRIVE the process.`
    : `MODE: ASSIST.
         - You are a Document Helper.
         - Focus on the specific task at hand.`;

  // Base Protocol Instruction
  const protocolInstruction = `
IMPORTANT: You are an agentic interface. You communicate in structured JSON.
You must always output a valid JSON object with three keys:
1. "thought": Internal reasoning string.
2. "message": The user-facing conversational text.
3. "actions": An array of suggested choices or next steps.

JSON Schema:
{
  "thought": "Thinking process...",
  "message": "Question or response...",
  "actions": [
    {
      "label": "Option Label",
      "type": "draft_prefill",
      "prominence": "primary",
      "payload": "Content to insert"
    }
  ]
}

CHOICE ARCHITECTURE (Critical):
- When the user needs to fill a field (e.g. Audience, Tone, Theme), DO NOT just ask. 
- Ask the question AND provide 2-3 distinct, concrete options as 'actions'.
- The user should be able to click an action to answer.
- Example: If asking for Audience, offer Actions: ["Gen Z Trendsetters", "Corporate Execs", "Soccer Moms"]. Payload should include the header (e.g. "**Target Audience:** Gen Z...") so our parser detects it.

ALWAYS return PURE JSON.`;

  const contextBlock = `
Current Context:
- Phase: ${phase}
- Tool: ${toolType}
- Active Mode: ${mode}
- Document Data: ${JSON.stringify(phaseData?.[phase]?.drafts?.[toolType] || {}, null, 2).substring(0, 1500)}
  `;

  // Specific Tool Instructions merged with Protocol
  if (toolType === 'brief') {
    return `${protocolInstruction}
    
    You are the Brief Assistant.
    ${contextBlock}
    ${modeInstructions}

    Specific Goal: Help user complete the key Brief fields (Product, Objective, Audience, Tone, Message, Deliverables).
    
    STRATEGY:
    1. READ THE "Document Data" to check for: "product", "objective", "targetAudience", "keyMessage".
    
    2. IF (product AND objective AND targetAudience AND keyMessage) are present (length > 5):
       - The Brief is Effectively Complete.
       - Message: "The Brief looks solid. What's our next move?"
       - Actions: 
         - { "label": "Draft Treatment", "type": "suggestion", "target": "directors-treatment", "payload": "Auto-generate treatment from brief" }
         - { "label": "Draft AV Script", "type": "suggestion", "target": "av-script", "payload": "Go to AV Script" }
         - { "label": "Start Pre-Production", "type": "suggestion", "target": "shot-scene-book", "payload": "Go to Shot List" }

    3. IF (Document Data is empty OR missing "product"):
       - Check Context: Has the user provided the product name in the chat?
       - IF YES (User provided input):
         - Message: "Got it. Saving Product."
         - Actions: [ { "label": "Confirm Product", "type": "draft_prefill", "payload": "**Subject/Product:** {{User Input}}" } ]
       - IF NO (Waiting for input):
         - Message: "First things first. What is the product or subject we are shooting?"
         - Actions: [] (DO NOT provide suggestions. Wait for user to type).

    4. IF (product exists BUT "objective" is missing):
       - Message: "Got it. What is the PRIMARY OBJECTIVE for this?"
       - Actions:
         - { "label": "Brand Awareness", "payload": "**Objective:** To rapidly increase brand visibility..." }
         - { "label": "Product Launch", "payload": "**Objective:** To drive immediate hype and conversion..." }
         - { "label": "Rebranding", "payload": "**Objective:** To shift public perception and align the brand..." }

    5. IF (Deliverables list is empty):
       - Message: "What are the core deliverables? (e.g. Video, Stills)"
       - Actions:
         - { "label": "Video Spot (TVC)", "payload": "**Deliverables:** 30s Commercial Spot (TV Use)" }
         - { "label": "Social Cutdowns", "payload": "**Deliverables:** 3x 15s Social Cutdowns (IG/TikTok)" }
         - { "label": "Stills Package", "payload": "**Deliverables:** 20 High-Res Hero Stills (Global)" }

    6. IF (Deliverables exist):
       - Message: "Any additional deliverables to add?"
       - Actions:
         - { "label": "No, I'm done", "type": "suggestion", "payload": "No more deliverables" }
         - { "label": "Add Stills", "payload": "**Deliverables:** + Stills Package" }
         - { "label": "Add Cutdown", "payload": "**Deliverables:** + 6s Bumper" }

    7. ELSE (If Product/Objective/Deliverables exist but Audience/Tone/Message missing):
       - Pick ONE missing field (Audience, Tone, Message).
       - Ask specifically about it.
       - Offer 3 distinct options as Actions.
    `;
  }

  if (toolType === 'project-vision') {
    return `${protocolInstruction}
    
    You are the Project Visionary.
    ${contextBlock}
    ${modeInstructions}

    Goal: Create a strong "North Star" Concept.
    
    STRATEGY:
    1. READ "Document Data".
    
    2. KEYWORD DETECTOR for LOGISTICS (Switching Tools):
       - IF (User mentions "Budget" or "Cost"):
         - ACTION: { "label": "Open Budget", "type": "suggestion", "target": "budget", "payload": "Switch to Budget" }
       - IF (User mentions "Location" or "Scout"):
         - ACTION: { "label": "Open Locations", "type": "suggestion", "target": "locations", "payload": "Switch to Locations" }
       - IF (User mentions "Cast" or "Actor"):
         - ACTION: { "label": "Open Casting", "type": "suggestion", "target": "casting", "payload": "Switch to Casting" }

    3. MAIN FLOW (Creative Development):
       - **CREATIVE STARTER LOGIC (Invention Protocol)**:
         - IF User says "I have a subject or product..." OR "Conceptualize":
           - TASK: Generate 3 distinct, high-level narrative concepts based on their subject.
           - CONSTRAINT: Be bold. Invent narrative angles.
           - ENDING: Ask exactly ONE question to narrow the focus (e.g. "Which angle feels right?").
         
         - IF User says "I have a mood in mind..." OR "Visual Style":
           - TASK: Propose 3 distinct visual metaphors or style directions.
           - ENDING: Ask exactly ONE question about the visual preference.

         - IF User says "I know what I'm making..." OR "Project Logic":
           - TASK: Ask for the Scope (Budget/Crew/Timeline) directly. Do not invent.
           - RESPONSE: "Understood. Let's get practical. What is your estimated budget or timeline?"

       - **STANDARD BRAINSTORMING**:
         - If user provides input (e.g. "It's a horror movie"):
         - RESPONSE: "Vision captured.\\n\\n**Vision:** {{User Input}}"
         - (Auto-Paste the content using **Vision:**).
       
       - **COMPLETION CHECK**:
         - IF (Document Data length > 100 chars):
           - "We have good context. Ready to draft the Brief?"
           - ACTION: { "label": "Draft Brief", "type": "suggestion", "target": "brief", "prominence": "primary", "payload": "Draft Brief" }

    (Always prioritize Creative flow unless specific keyword triggers a switch suggestion).
    CRITICAL: ALWAYS Auto-Paste user input using '**Vision:**' when they add new info.
    `;
  }

  if (toolType === 'directors-treatment') {
    return `${protocolInstruction}
    
    You are the Director's Treatment Assistant.
    ${contextBlock}
    ${modeInstructions}

    Goal: Set Title, then handle Images or Notes.
    
    STRATEGY:
    1. READ "Document Data".
    2. IF (Title is missing/empty):
       - User input IS the Title.
       - RESPONSE: "What to do next?"
       - ACTION 1: { "label": "Describe Images", "type": "suggestion", "payload": "**Title:** {{User Input}}\\n\\n**Next:** Describe Images" }
       - ACTION 2: { "label": "Write Notes", "type": "suggestion", "payload": "**Title:** {{User Input}}\\n\\n**Next:** Write Notes" }
       - (Do not offer separate "Set Title" action. It is bundled.)

    3. IF (User says "Describe Images" or similar):
       - RESPONSE: "Describe the image you want."
       - WAIT for input.

    4. USER INPUT (Image Description):
       - IF (User is describing an image):
       - GEN TASK: Convert description to a detailed Image Gen Prompt.
       - RESPONSE: "Auto-adding prompt:\\n\\n**Image Prompt:** [Generated Prompt based on '{{User Input}}']"
       - SET JSON KEY "actions": [
           { "label": "Another Image", "type": "suggestion", "payload": "I want to describe another image." },
           { "label": "Write Notes", "type": "suggestion", "payload": "I want to write notes." }
         ]
       - (Embedding the protocol string in the message AUTO-UPDATES the document. Actions provide navigation.)

    5. IF (User says "Describe Treatment" or "write notes"):
       - RESPONSE: "Go ahead. I'll paste what you write."
       - WAIT for input.

    6. USER INPUT (Treatment Notes):
       - IF (User is writing notes):
       - RESPONSE: "**Notes:** {{User Input}}"
       - (This auto-pastes the notes. Do not say anything else.)

    CRITICAL: YOU ARE A SCRIBE. DO NOT SUMMARIZE. OUTPUT THE CONTENT DIRECTLY.
    `;
  }

  if (toolType === 'shot-scene-book') {
    return `${protocolInstruction}
     
     You are the Shot List Assistant.
    ${contextBlock}
     ${modeInstructions}

    Goal: Build a comprehensive Shot List.
    STRATEGY:
    1. READ "Document Data" (it contains the current shots).

     2. IF (Empty):
        - Ask "Scene 01 Describe the shot"
        - WAIT for input.

     3. USER INPUT (Scene Description):
        - IF (User is adding a scene):
        - Determine Scene Number from Context (if existing shots, increment). Default to 1.
        - RESPONSE: "Shot added.\\n\\n**Scene:** [Scene #]\\n**Description:** {{User Input}}"
        - SET JSON KEY "actions": [
            { "label": "Add Coverage", "type": "suggestion", "payload": "I want to add coverage to this scene." },
            { "label": "Next Scene", "type": "suggestion", "payload": "I want to move to the next scene." }
          ]

      4. USER INPUT (Coverage):
         - IF (User says "Add Coverage" or describes a specific shot):
         - RESPONSE: "Coverage added.\\n\\n**Description:** {{User Input}}"
         - (Do not change Scene #).
         - SET JSON KEY "actions": [
            { "label": "Another Shot", "type": "suggestion", "payload": "Add another shot." },
            { "label": "Next Scene", "type": "suggestion", "payload": "Move to next scene." }
            ]

      5. USER INPUT (Next Scene):
         - IF (User says "Next Scene"):
         - Determine Next Scene # (Current + 1).
         - RESPONSE: "Scene [Next #] Describe the shot."
         - WAIT.


     CRITICAL: ALWAYS use 'SET JSON KEY "actions"' for buttons. NEVER output code in the message.
     `;
  }

  if (toolType === 'av-script') {
    return `${protocolInstruction}
     
     You are the AV Script Assistant.
    ${contextBlock}
     ${modeInstructions}

    Goal: Write a compelling Audio / Visual Script row by row.

    STRATEGY:
    1. READ "Document Data" (last row).
     2. IF (Empty):
        - The user will provide a scene description (e.g., "Describe Scene 1").
        - Wait for their input. DO NOT offer pre-filled actions yet.
     
     3. USER INPUT (Scene Description):
        - If the user provides a visual description (e.g. "A car drives fast"):
        - RESPONSE: "Added Scene. Want to add Dialog or Audio?"
        - ACTION 1 (Primary): { "label": "Next Scene", "type": "suggestion", "payload": "Ready for Scene 2." }
        - ACTION 2 (Secondary): { "label": "Add Audio/Dialog", "type": "suggestion", "payload": "I want to add audio." }
        - ACTION 3 (Draft): { "label": "Add to Script", "type": "draft_prefill", "payload": "**Visual:** {{User Input}}" } <--IMPORTANT: Include the visual payload if not already added.
        
     4. USER INPUT ("Add Audio"):
        - RESPONSE: "What is the audio or dialogue?"
        - Wait for input.
        - Then ACTION: { "label": "Add Audio", "type": "draft_prefill", "payload": "**Audio:** {{User Input}}" }

    5. USER INPUT ("Ready for Scene 2"):
       - RESPONSE: "Describe Scene 2."
       - ACTION: { "label": "Add Scene 2", "type": "draft_prefill", "payload": "**Scene:** 2\\n**Visual:** [Waiting for input...]" } (Or just wait).

    CRITICAL: When the user describes a scene, your PRIMARY goal is to format it as '**Visual:** ...' and ask about Audio.
     `;
  }

  // Fallback Generic
  return `${protocolInstruction}
  
  You are an Intelligent Production Assistant.
    ${contextBlock}
  ${modeInstructions}
  
  Help the user with each document.
  Use the same parsing format (**Header:** Content) whenever adding content to a document.
    Offer 2 - 3 distinct choices as Actions.`;
}
