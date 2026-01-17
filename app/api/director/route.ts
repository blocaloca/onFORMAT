import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { callAI, AIProvider } from '@/lib/ai-providers'

type ToolTypeLocal = keyof typeof SYSTEM_PROMPTS | 'Director'
type PhaseLabel = 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP'
type GateLabel = 'BUDGET' | 'SCOPE' | 'LOCATIONS' | 'TALENT' | null

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
- Use plain headings (no markdown headings or bold styling).
- Keep sections short. If more detail is needed, mark [TBD] and ask questions instead.
`

const CONCEPT_PIPELINE_RULES = `
PHASE: CONCEPT (default)

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
`

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

function budgetGateResponse(): string {
  return [
    `PHASE: PLAN`,
    `BUDGET (GATE)`,
    ``,
    `Is the budget known or unknown?`,
    `If unknown: what is the ceiling or range?`,
  ].join('\n')
}

function scopeFitGateResponse(): string {
  return [
    `PHASE: PLAN`,
    `SCOPE FIT (GATE)`,
    ``,
    `How many shoot days do you expect? (1 / 2 / 3+)`,
    `Complexity: simple / standard / complex`,
  ].join('\n')
}

function locationsGateResponse(): string {
  return [
    `PHASE: PLAN`,
    `LOCATIONS (GATE)`,
    ``,
    `Is the location known or unknown?`,
    `Environment type: studio / interior / exterior / mixed`,
  ].join('\n')
}

function talentGateResponse(): string {
  return [
    `PHASE: PLAN`,
    `TALENT (GATE)`,
    ``,
    `Talent needed? (yes/no)`,
    `If yes: talent type (model / real customer / spokesperson / other)`,
  ].join('\n')
}

function lastUserText(messages: any[]): string {
  const last = messages?.slice().reverse().find((m) => m?.role === 'user')?.content
  return String(last || '').trim()
}

function lastAssistantText(messages: any[]): string {
  const last = messages?.slice().reverse().find((m) => m?.role === 'assistant')?.content
  return String(last || '')
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
  const all = String(
    messages
      ?.filter((m: any) => m?.role === 'user')
      .map((m: any) => String(m?.content || ''))
      .join('\n') || ''
  )

  const hasFormat = /\b(photo|photography|video|film|hybrid)\b/i.test(all)
  const hasIntent = /\b(personal|commercial|editorial)\b/i.test(all)
  const hasObjective =
    /\b(to promote|to launch|to sell|to announce|goal|objective|message|story|campaign|awareness)\b/i.test(all)

  return hasFormat && hasIntent && hasObjective
}

/** Gate answer parsing (single-message, strict) */
function budgetAnswered(text: string): boolean {
  const t = text.toLowerCase()

  // known/unknown phrasing
  if (/\b(known|unknown)\b/.test(t) && /\bbudget\b/.test(t)) return true

  // range/ceiling numeric
  if (/\$\s*\d/.test(t)) return true
  if (/\b\d+\s*(k|grand)\b/.test(t)) return true
  if (/\b\d+\s*-\s*\d+\b/.test(t)) return true

  return false
}

function scopeAnswered(text: string): boolean {
  const t = text.toLowerCase()
  const hasDays = /\b(1\s*day|2\s*days|3\+|one day|two days|1|2|3\+)\b/.test(t)
  const hasComplexity = /\b(simple|standard|complex)\b/.test(t)
  return hasDays && hasComplexity
}

function locationsAnswered(text: string): boolean {
  const t = text.toLowerCase()
  const hasKnown = /\b(known|unknown)\b/.test(t)
  const hasEnv = /\b(studio|interior|exterior|mixed)\b/.test(t)
  return hasKnown && hasEnv
}

function talentAnswered(text: string): boolean {
  const t = text.toLowerCase()
  const hasYesNo = /\b(yes|no)\b/.test(t)
  if (!hasYesNo) return false

  const yes = /\byes\b/.test(t)
  if (!yes) return true // "no" is complete

  return /\b(model|customer|spokesperson|other)\b/.test(t)
}

function activeGateFromAssistant(lastA: string): GateLabel {
  if (/BUDGET \(GATE\)/i.test(lastA)) return 'BUDGET'
  if (/SCOPE FIT \(GATE\)/i.test(lastA)) return 'SCOPE'
  if (/LOCATIONS \(GATE\)/i.test(lastA)) return 'LOCATIONS'
  if (/TALENT \(GATE\)/i.test(lastA)) return 'TALENT'
  return null
}

function buildToolSystemBlock(toolType: ToolTypeLocal): string {
  if (toolType === 'Director') return ''
  return SYSTEM_PROMPTS[toolType] || ''
}

function buildSystemPrompt(toolType: ToolTypeLocal, messages: any[]): string {
  const userText = lastUserText(messages)
  const explicitPhase = detectExplicitPhaseRequest(userText)

  if (explicitPhase === 'PLAN') return `${CORE_SYSTEM_BLOCK}\n\n${PLAN_PIPELINE_RULES}\n`
  if (explicitPhase === 'EXECUTE' || explicitPhase === 'WRAP') {
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
  return 'openai'
}

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
    const lastA = lastAssistantText(messages)

    const explicitPhase = detectExplicitPhaseRequest(userText)
    const implicitPhase = detectImplicitPhaseJump(userText)
    const requestedPhase = explicitPhase || implicitPhase

    const conceptComplete = isConceptComplete(messages)

    const wantsBudgetStart =
      /\b(start with budget|start with the budget|budget first)\b/i.test(userText) ||
      /\bi want to start with budget\b/i.test(userText)

    const planSelectedFromJump = /PHASE JUMP REQUEST DETECTED:\s*PLAN/i.test(lastA) && userText === '2'

    // If we are already in a PLAN gate, enforce it deterministically.
    const activeGate = activeGateFromAssistant(lastA)
    if (activeGate === 'BUDGET') {
      if (!budgetAnswered(userText)) {
        return NextResponse.json({ message: budgetGateResponse(), usage: null, provider: 'none' })
      }
      return NextResponse.json({ message: scopeFitGateResponse(), usage: null, provider: 'none' })
    }
    if (activeGate === 'SCOPE') {
      if (!scopeAnswered(userText)) {
        return NextResponse.json({ message: scopeFitGateResponse(), usage: null, provider: 'none' })
      }
      return NextResponse.json({ message: locationsGateResponse(), usage: null, provider: 'none' })
    }
    if (activeGate === 'LOCATIONS') {
      if (!locationsAnswered(userText)) {
        return NextResponse.json({ message: locationsGateResponse(), usage: null, provider: 'none' })
      }
      return NextResponse.json({ message: talentGateResponse(), usage: null, provider: 'none' })
    }
    if (activeGate === 'TALENT') {
      if (!talentAnswered(userText)) {
        return NextResponse.json({ message: talentGateResponse(), usage: null, provider: 'none' })
      }
      // Gates complete, fall through to model call below.
    }

    // Enter PLAN gate flow if user requested PLAN/budget-first or provided budget info or selected option 2.
    const enteringPlan =
      explicitPhase === 'PLAN' ||
      wantsBudgetStart ||
      planSelectedFromJump ||
      budgetAnswered(userText) ||
      (requestedPhase === 'PLAN' && budgetAnswered(userText))

    // If concept not complete and user is trying to jump to PLAN/EXECUTE/WRAP, offer phase jump,
    // but NEVER do this if we're entering PLAN (budget-first etc).
    if (!conceptComplete && requestedPhase && requestedPhase !== 'CONCEPT' && !enteringPlan) {
      return NextResponse.json({ message: phaseJumpResponse(requestedPhase), usage: null, provider: 'none' })
    }

    // If entering PLAN, start the deterministic gate chain.
    if (enteringPlan) {
      // If current user message doesn't answer budget, ask budget gate.
      if (!budgetAnswered(userText)) {
        return NextResponse.json({ message: budgetGateResponse(), usage: null, provider: 'none' })
      }
      // Budget answered in this message: ask scope fit next.
      if (!scopeAnswered(userText)) {
        return NextResponse.json({ message: scopeFitGateResponse(), usage: null, provider: 'none' })
      }
      // Scope answered in this message: ask locations next.
      if (!locationsAnswered(userText)) {
        return NextResponse.json({ message: locationsGateResponse(), usage: null, provider: 'none' })
      }
      // Locations answered in this message: ask talent next.
      if (!talentAnswered(userText)) {
        return NextResponse.json({ message: talentGateResponse(), usage: null, provider: 'none' })
      }
      // If somehow they answered all four in one message, fall through to model call.
    }

    // Model call (only after gate flow is complete or we’re not in PLAN gate flow)
    const systemPrompt = buildSystemPrompt(tool, messages)
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