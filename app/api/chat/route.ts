import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPTS, ToolType } from '@/lib/prompts'
import { callAI, AIProvider } from '@/lib/ai-providers'

/**
 * CORE SYSTEM BLOCK
 * Single source of truth for Director + Chat behavior.
 */
const CORE_SYSTEM_BLOCK = `
You are onFORMAT.

You are a production-first assistant for producers, photographers,
videographers, and content creators.

You do NOT invent facts.
You do NOT role-play people.
You do NOT pitch ideas.
You do NOT behave like a creative partner.
You do NOT guess real-world availability, pricing, permissions, or logistics.

Your value is professional clarity.

You help users:
- Reduce ambiguity without forcing premature decisions
- Move from fuzzy intent to structured thinking
- Prepare industry-standard production documents
- Make fewer, better decisions — not more options

You behave like an experienced producer:
calm, efficient, and allergic to unnecessary meetings.
`

/**
 * FIRST RESPONSE GATE
 * This constrains behavior but NEVER removes tool context.
 */
const FIRST_RESPONSE_GATE = `
CRITICAL FIRST-RESPONSE CONSTRAINT:

If the user's message indicates uncertainty, early-stage thinking,
or lack of clarity (e.g. “details are fuzzy”, “not sure yet”,
“early stages”, “just starting”, “figuring it out”):

YOU MUST:
- Acknowledge that uncertainty is normal
- Reflect what is known (even if minimal)
- Ask NO MORE THAN TWO questions total
- Ask only high-leverage framing questions

YOU MUST NOT:
- Present a checklist
- Ask about budget, crew, equipment, schedule, or deliverables
- Reference documents, stages, or workflows
- Ask nested or multi-part questions
- Sound like an intake form

Allowed question types:
- Directional (photo / video / hybrid)
- Intent (commercial / editorial / social)
- Location certainty (known / unfamiliar)

This response is for ORIENTATION ONLY.
Completion is explicitly forbidden at this stage.
`

function buildSystemPrompt(
  toolType: ToolType,
  aiMood: string,
  isEarlyStage: boolean
) {
  const tone =
    aiMood === 'technical'
      ? 'Use precise, technical language.'
      : aiMood === 'cinematic'
        ? 'Use clear language with light visual awareness.'
        : 'Use plain, professional, client-safe language.'

  let prompt = `
${CORE_SYSTEM_BLOCK}

COMMUNICATION TONE:
${tone}
`

  if (isEarlyStage) {
    prompt += `\n${FIRST_RESPONSE_GATE}\n`
  }

  // 🔑 CRITICAL: tool guidance is ALWAYS included
  prompt += `\n${SYSTEM_PROMPTS[toolType] || SYSTEM_PROMPTS.LuxPixPro}\n`

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const { messages, toolType, projectContext, aiMood, provider } =
      await request.json()

    if (!toolType) {
      return NextResponse.json(
        { error: 'toolType is required' },
        { status: 400 }
      )
    }

    if (!SYSTEM_PROMPTS[toolType as ToolType]) {
      return NextResponse.json(
        { error: `Invalid tool type: ${toolType}` },
        { status: 400 }
      )
    }

    const lastUserMessage =
      messages?.slice().reverse().find((m: any) => m.role === 'user')?.content ||
      ''

    const isEarlyStage =
      /fuzzy|not sure|early|just starting|figuring/i.test(lastUserMessage)

    let systemPrompt = buildSystemPrompt(
      toolType as ToolType,
      aiMood || 'practical',
      isEarlyStage
    )

    /**
     * DOCUMENT CONTEXT
     * Only allowed AFTER early-stage ambiguity is resolved
     */
    if (projectContext && !isEarlyStage) {
      systemPrompt += `\n\nCURRENT PROJECT CONTEXT:\n${JSON.stringify(
        projectContext,
        null,
        2
      )}\n\n`

      const documentType = projectContext.documentType || toolType

      systemPrompt += `DOCUMENT-SPECIFIC GUIDANCE:\n`

      switch (documentType) {
        case 'budget':
          systemPrompt += `
- Do not invent rates
- Flag missing inputs instead of guessing
- Use conservative assumptions
`
          break

        case 'brief':
          systemPrompt += `
- Organize existing intent
- Do not introduce new concepts
`
          break

        case 'call-sheet':
          systemPrompt += `
- Use standard formatting
- Do not invent people, times, or locations
`
          break

        default:
          systemPrompt += `
- Identify gaps and risks
- Suggest structure, not content
`
      }
    }

    const selectedProvider: AIProvider = provider || 'openai'
    const response = await callAI(messages, systemPrompt, selectedProvider)

    return NextResponse.json({
      message: response.message,
      usage: response.usage,
      provider: response.provider
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
