import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { callAI, AIProvider } from '@/lib/ai-providers'

type ToolTypeLocal = keyof typeof SYSTEM_PROMPTS | 'Director'
type PhaseLabel = 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP'

/**
 * GOVERNING LAW (hard rules)
 */
const CORE_SYSTEM_BLOCK = `
You are onFORMAT Director.

onFORMAT has 4 phases:
- CONCEPT (what/why)
- PLAN (how/when/who/where/how much)
- EXECUTE (shoot day / production operations)
- WRAP (deliverables, licensing, archive)

Production-first. Decision-first. Calm, precise.

GLOBAL RULES:
- Every output supports a producer decision.
- Do NOT invent facts (locations, pricing, availability, laws, talent, deliverables, timelines).
- Do NOT invent brand values, mission, “ethos”, sustainability claims, founder story, origin story, USPs, audience motivations, or product attributes unless the user states them.
- If required inputs are missing: ask AT MOST TWO questions and stop.
- If user asks for something outside the current phase:
  1) acknowledge the request
  2) state current phase
  3) ask 1–2 questions to either (a) complete current phase or (b) confirm the phase jump

VOICE RULES (NO DRIFT):
- Do not praise the idea. Do not “pitch” the project.
- Avoid adjectives like: great, compelling, exciting, amazing, unique, vibrant, authentic, engaging (unless user used them).
- No motivational language. No filler.
- The first line must be neutral and factual, based only on what the user said.

FORMAT RULES:
- Use plain headings (no markdown bold lists like "- **BRIEF**").
- Keep sections short. If more detail is needed, mark [TBD] and ask questions instead.
- If you would exceed any limit below, TRUNCATE and stop.

IMPORTANT:
- Default phase is CONCEPT.
- The user can explicitly jump phases. Handle cleanly without drama.
- If a PHASE JUMP block is active, ask EXACTLY ONE question and stop.
`

const CONCEPT_PIPELINE_RULES = `
PHASE: CONCEPT (default)

CONCEPT PIPELINE (these inform each other):
1) Brief (intent + format + objective)
2) Creative Direction (objective -> style anchor + do/don’t)
3) Shot & Scene Book (creative direction -> must-have shots/beats)

OUTPUT SHAPE (always):
A) 1 short neutral sentence: ONLY facts the user provided (no added claims)
B) CONCEPT WORKING DRAFT with 3 sections:
   BRIEF
   CREATIVE DIRECTION
   SHOT & SCENE BOOK
C) Then ask AT MOST TWO questions total and STOP

DRAFT RULES:
- Use [TBD] for anything not provided.
- Max TWO bullets per section. No nested bullets.
- Do NOT discuss budget, schedule/timeline, locations, crew, equipment, deliverables, casting, or shot counts unless the user explicitly asks.

Allowed CONCEPT questions ONLY (pick up to 2 total):
- Format (photo / video / hybrid)
- Intent (personal / commercial / editorial)
- One objective / message / outcome
- One style anchor (reference type or vibe words)
`

const PLAN_PIPELINE_RULES = `
PHASE: PLAN

PLAN PIPELINE (these inform each other):
1) Budget
2) Schedule
3) Locations & Sets
4) Crew List
5) Casting & Talent (only if applicable)

OUTPUT SHAPE (always):
A) 1 short neutral sentence: ONLY facts the user provided + the NEXT decision (neutral)
B) PLAN WORKING DRAFT with 5 sections:
   BUDGET
   SCHEDULE
   LOCATIONS & SETS
   CREW LIST
   CASTING & TALENT (if applicable)
C) Then ask AT MOST TWO questions total and STOP

DRAFT RULES:
- Use [TBD] for anything not provided.
- Max TWO bullets per section. No nested bullets.
- Do NOT invent locations, pricing, availability, laws, talent, deliverables, timelines.
- Do NOT output generic “itemized cost categories” lists.
- The Budget section is NOT a full budget table yet; it is a budget GATE that unlocks the next planning decision.

PLAN FIRST-TURN (BUDGET GATE) RULE:
- If the user says they want to start with budget (or we are newly in PLAN), you MUST ask ONLY these questions (max two) and nothing else:
  1) "Is the budget known or unknown?"
  2) If unknown: "What is the ceiling or range?"
- Do NOT ask about scope, shoot days, locations, talent, crew, or deliverables until the budget gate is answered.

Allowed PLAN questions (pick up to 2 total, only what unlocks the next decision):
- Budget known vs unknown
- Budget ceiling/range
`

/**
 * Deterministic Phase Jump handler (hard stop, no model)
 */
function phaseJumpResponse(target: PhaseLabel): string {
  return [
    `PHASE JUMP REQUEST DETECTED: ${target}`,
    ``,
    `You want to start in ${target}.`,
    `CONCEPT usually comes first.`,
    ``,
    `Would you like to:`,
    `1) Finish the CONCEPT first (working draft)`,
    `2) Start a custom workflow at ${target}`,
    ``,
    `Which option do you want: 1 or 2?`,
  ].join('\n')
}

/**
 * Deterministic PLAN Budget Gate (hard stop, no model)
 */
function budgetGateResponse(): string {
  return [
    `PHASE: PLAN`,
    `BUDGET (GATE)`,
    ``,
    `Is the budget known or unknown?`,
    `If unknown: what is the ceiling or range?`,
  ].join('\n')
}

function lastUserText(messages: any[]): string {
  const last = messages?.slice().reverse().find((m) => m?.role === 'user')?.content
  return String(last || '')
}

function allUserText(messages: any[]): string {
  return String(
    messages
      ?.filter((m) => m?.role === 'user')
      .map((m) => String(m?.content || ''))
      .join('\n') || ''
  )
}

function detectExplicitPhaseRequest(text: string): PhaseLabel | null {
  const t = text.toLowerCase()

  if (/\b(go to|switch to|move to|advance to|enter)\s+(concept)\b/.test(t)) return 'CONCEPT'
  if (/\b(go to|switch to|move to|advance to|enter)\s+(plan)\b/.test(t)) return 'PLAN'
  if (/\b(go to|switch to|move to|advance to|enter)\s+(execute)\b/.test(t)) return 'EXECUTE'
  if (/\b(go to|switch to|move to|advance to|enter)\s+(wrap)\b/.test(t)) return 'WRAP'

  if (/\bready to plan\b/.test(t)) return 'PLAN'
  if (/\bready to execute\b/.test(t)) return 'EXECUTE'
  if (/\bready to wrap\b/.test(t)) return 'WRAP'

  return null
}

function detectImplicitPhaseJump(text: string): PhaseLabel | null {
  if (/(budget|estimate|pricing|rate|timeline|schedule|crew|location|permit|casting|deliverable)/i.test(text))
    return 'PLAN'
  if (/(call sheet|shoot day|on set|set notes|production notes|client selects)/i.test(text)) return 'EXECUTE'
  if (/(licens|usage rights|deliverables?\b|archive|handoff|final delivery)/i.test(text)) return 'WRAP'
  return null
}

function isConceptComplete(messages: any[]): boolean {
  const t = allUserText(messages)
  const hasFormat = /\b(photo|photography|video|film|hybrid)\b/i.test(t)
  const hasIntent = /\b(personal|commercial|editorial)\b/i.test(t)
  const hasObjective =
    /\b(to promote|to launch|to sell|to announce|goal|objective|message|story|campaign|awareness)\b/i.test(t)
  return hasFormat && hasIntent && hasObjective
}

/**
 * Budget gate is considered answered if user clearly states:
 * - budget known/unknown OR gives a numeric range/ceiling
 */
function isBudgetGateAnswered(messages: any[]): boolean {
  const t = allUserText(messages).toLowerCase()

  if (/\b(budget is|budget:)\s*(known|unknown)\b/.test(t)) return true
  if (/\b(known budget|unknown budget)\b/.test(t)) return true

  if (/\$\s*\d/.test(t)) return true
  if (/\b\d{3,}\b/.test(t) && /\b(budget|ceiling|range|cap|max)\b/.test(t)) return true
  if (/\b\d+\s*(k|grand)\b/.test(t)) return true
  if (/\b\d+\s*-\s*\d+\b/.test(t)) return true

  return false
}

function buildToolSystemBlock(toolType: ToolTypeLocal): string {
  if (toolType === 'Director') return ''
  return SYSTEM_PROMPTS[toolType] || ''
}

/**
 * Detect whether the user already answered the phase jump question (picked 1 or 2)
 * AFTER the most recent phase-jump offer.
 */
function getPhaseJumpSelectionAfterLastOffer(messages: any[]): '1' | '2' | null {
  // Find the last assistant message that contains the offer.
  let lastOfferIndex = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m?.role === 'assistant' && typeof m?.content === 'string' && m.content.includes('PHASE JUMP REQUEST DETECTED:')) {
      lastOfferIndex = i
      break
    }
  }
  if (lastOfferIndex === -1) return null

  // Look for the first user reply after that offer that is clearly 1 or 2.
  for (let j = lastOfferIndex + 1; j < messages.length; j++) {
    const m = messages[j]
    if (m?.role !== 'user') continue
    const t = String(m?.content || '').trim().toLowerCase()
    if (t === '1' || t === 'option 1') return '1'
    if (t === '2' || t === 'option 2') return '2'
  }
  return null
}

/**
 * Determine if PLAN has been accepted via the phase-jump flow.
 * This is the latch that stops the infinite loop.
 */
function isPlanAccepted(messages: any[]): boolean {
  return getPhaseJumpSelectionAfterLastOffer(messages) === '2'
}

/**
 * Decide which phase rules to apply for the model call (when we do call it).
 * - If user explicitly says "go to plan", use PLAN.
 * - If PLAN accepted via option 2, use PLAN.
 * - Otherwise default CONCEPT.
 */
function resolveActivePhase(messages: any[], userText: string): PhaseLabel {
  const explicit = detectExplicitPhaseRequest(userText)
  if (explicit) return explicit

  if (isPlanAccepted(messages)) return 'PLAN'

  return 'CONCEPT'
}

function buildSystemPromptForPhase(toolType: ToolTypeLocal, phase: PhaseLabel): string {
  if (phase === 'PLAN') {
    return `${CORE_SYSTEM_BLOCK}\n\n${PLAN_PIPELINE_RULES}\n`
  }

  if (phase === 'EXECUTE' || phase === 'WRAP') {
    return `${CORE_SYSTEM_BLOCK}\n\n${buildToolSystemBlock(toolType)}\n`
  }

  return `${CORE_SYSTEM_BLOCK}\n\n${CONCEPT_PIPELINE_RULES}\n`
}

function normalizeProvider(input: any): AIProvider | null {
  const v = String(input || '').toLowerCase()
  if (v === 'openai' || v === 'anthropic') return v as AIProvider
  return null
}

function pickDefaultProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  return 'anthropic'
}

/**
 * Some environments probe with GET/HEAD/OPTIONS.
 * Keep POST as the only supported action.
 */
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export async function HEAD() {
  return new NextResponse(null, { status: 405 })
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, toolType, provider } = body || {}

    if (!toolType) return NextResponse.json({ error: 'toolType is required' }, { status: 400 })
    if (!Array.isArray(messages)) return NextResponse.json({ error: 'messages must be an array' }, { status: 400 })

    const tool = toolType as ToolTypeLocal
    const isKnownTool = tool === 'Director' || Object.prototype.hasOwnProperty.call(SYSTEM_PROMPTS, tool)
    if (!isKnownTool) return NextResponse.json({ error: `Invalid toolType: ${toolType}` }, { status: 400 })

    const userText = lastUserText(messages)

    const explicitPhase = detectExplicitPhaseRequest(userText)
    const implicitPhase = detectImplicitPhaseJump(userText)
    const requestedPhase = explicitPhase || implicitPhase

    const conceptComplete = isConceptComplete(messages)
    const planAccepted = isPlanAccepted(messages)

    // --- HARD STOP 1: Phase jump offer (only if concept incomplete AND PLAN not already accepted) ---
    // Important: Once user chooses option 2, we stop offering and proceed to PLAN.
    if (!conceptComplete && requestedPhase && requestedPhase !== 'CONCEPT' && !planAccepted) {
      return NextResponse.json({
        message: phaseJumpResponse(requestedPhase),
        usage: null,
        provider: 'none',
      })
    }

    // --- HARD STOP 2: PLAN Budget Gate ---
    // Trigger when:
    // - user explicitly enters PLAN, OR
    // - user says budget first, OR
    // - PLAN has been accepted via option 2
    const wantsBudgetStart =
      /\b(start with budget|start with the budget|budget first)\b/i.test(userText) ||
      /\bi want to start with budget\b/i.test(userText)

    const activePhase = resolveActivePhase(messages, userText)

    const shouldGateBudget = activePhase === 'PLAN' || wantsBudgetStart || planAccepted

    if (shouldGateBudget && !isBudgetGateAnswered(messages)) {
      return NextResponse.json({
        message: budgetGateResponse(),
        usage: null,
        provider: 'none',
      })
    }

    // --- Model call ---
    const systemPrompt = buildSystemPromptForPhase(tool, activePhase)
    const selectedProvider: AIProvider = normalizeProvider(provider) || pickDefaultProvider()
    const response = await callAI(messages, systemPrompt, selectedProvider)

    return NextResponse.json({
      message: response.message,
      usage: response.usage,
      provider: response.provider,
    })
  } catch (error: any) {
    console.error('Director route error:', error)
    return NextResponse.json({ error: error?.message || 'Director failed' }, { status: 500 })
  }
}