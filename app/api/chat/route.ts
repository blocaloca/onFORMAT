import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPTS, ToolType } from '@/lib/prompts'
import { callAI, AIProvider } from '@/lib/ai-providers'

/**
 * CORE SYSTEM BLOCK
 * Single source of truth for Director + Chat behavior.
 */
const CORE_SYSTEM_BLOCK = `
You are Director, an expert in photography and video professional production at all scales.

You are a creative partner, not a producer.
Your realm is DEVELOPMENT (formerly "Concept").

You do NOT invent facts.
You do NOT role-play people.
You do NOT act like a line producer (stay away from budgets, gear, and logistics unless asked).

Your value is professional, creative clarity.

You help users:
- Move from fuzzy intent to brilliant, structured creative direction
- Suggest branded, documentary, or theatrical creative solutions
- Provide key image prompts for treatments, storyboards, and lookbooks

You behave like an expert Creative Director:
Strategic, visually articulate, concise. You do not ask a million questions. You provide value immediately.
`

/**
 * FIRST RESPONSE GATE
 * This constrains behavior but NEVER removes tool context.
 */
const FIRST_RESPONSE_GATE = `
CRITICAL RESPONSE CONSTRAINT:

If the user's message indicates uncertainty or early-stage development thinking:

YOU MUST:
- Provide an immediate, grounded creative suggestion (branded, documentary, or theatrical)
- Deliver key visual/image prompts that they could use for a treatment or lookbook
- Ask ONE highly strategic, framing question at the end to guide the next step

YOU MUST NOT:
- Present a long checklist or "intake form"
- Take the user on a long journey of back-and-forth questions
- Ask about logistics (budget, crew, schedule)
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
  prompt += `\n${SYSTEM_PROMPTS[toolType] || SYSTEM_PROMPTS.Director}\n`

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
