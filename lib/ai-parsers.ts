// AI Response Parsers - Extract structured data from AI-generated content

export interface ParsedShotListItem {
  shot: string
  description: string
  size: string
  movement: string
  duration: string
}

export interface ParsedBudgetItem {
  category: string
  item: string
  rate: string
  quantity: string
  total: string
}

export interface ParsedCallSheetCrew {
  role: string
  name: string
  callTime: string
  phone: string
}

export interface ParsedCallSheetTalent {
  talent: string
  role: string
  callTime: string
  readyTime: string
}

/**
 * Detect if AI response contains structured data that can be parsed
 */
export function detectStructuredContent(text: string, documentType: string): {
  hasStructuredData: boolean
  dataType: string | null
} {
  const lowerText = text.toLowerCase()

  switch (documentType) {
    case 'shot-list':
      // Look for shot list patterns: numbers, shot descriptions, table-like format
      const hasShotPattern = /\d+\s*\|/.test(text) || /shot\s+\d+/i.test(text)
      return {
        hasStructuredData: hasShotPattern,
        dataType: hasShotPattern ? 'shot-list' : null,
      }

    case 'budget':
      // Look for budget patterns: currency, line items, totals
      const hasBudgetPattern = /\$[\d,]+/.test(text) && (/category|line item|total/i.test(text) || /\|/.test(text))
      return {
        hasStructuredData: hasBudgetPattern,
        dataType: hasBudgetPattern ? 'budget' : null,
      }

    case 'call-sheet':
      // Look for call sheet patterns: times, roles, crew/talent
      const hasCallSheetPattern = /\d{1,2}:\d{2}\s*(am|pm)/i.test(text) && (/crew|talent|call time/i.test(text))
      return {
        hasStructuredData: hasCallSheetPattern,
        dataType: hasCallSheetPattern ? 'call-sheet' : null,
      }

    case 'brief':
      // Look for brief patterns: objective, audience, deliverables, tone, visual, etc.
      const hasBriefPattern =
        /objective|audience|deliverable|timeline|budget|message|tone|style|visual|brand|stakeholder|metric|constraint/i.test(text) &&
        text.length > 100 // Should have substantial content
      return {
        hasStructuredData: hasBriefPattern,
        dataType: hasBriefPattern ? 'brief' : null,
      }

    default:
      return { hasStructuredData: false, dataType: null }
  }
}

/**
 * Parse shot list from AI response
 */
export function parseShotList(text: string): ParsedShotListItem[] {
  const shots: ParsedShotListItem[] = []

  // Try to parse table format first (SHOT | DESCRIPTION | SIZE/ANGLE | MOVEMENT | DURATION)
  const lines = text.split('\n')

  for (const line of lines) {
    // Skip header lines and empty lines
    if (!line.trim() || /^(shot|---|\|?\s*shot\s*\|)/i.test(line)) continue

    // Match table format with pipes
    const tableMatch = line.match(/^\|?\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|?/i)
    if (tableMatch) {
      shots.push({
        shot: tableMatch[1].trim(),
        description: tableMatch[2].trim(),
        size: tableMatch[3].trim(),
        movement: tableMatch[4].trim(),
        duration: tableMatch[5].trim(),
      })
      continue
    }

    // Match numbered list format: "1 | Description | Size | Movement | Duration"
    const listMatch = line.match(/^(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)$/i)
    if (listMatch) {
      shots.push({
        shot: listMatch[1].trim(),
        description: listMatch[2].trim(),
        size: listMatch[3].trim(),
        movement: listMatch[4].trim(),
        duration: listMatch[5].trim(),
      })
      continue
    }

    // Match simpler format: "Shot 1: Wide establishing shot - WS, Locked off, 0:03"
    const simpleMatch = line.match(/shot\s+(\d+)[:\s]*([^-]+)\s*-\s*([^,]+),\s*([^,]+),\s*(.+)/i)
    if (simpleMatch) {
      shots.push({
        shot: simpleMatch[1].trim(),
        description: simpleMatch[2].trim(),
        size: simpleMatch[3].trim(),
        movement: simpleMatch[4].trim(),
        duration: simpleMatch[5].trim(),
      })
    }
  }

  return shots
}

/**
 * Parse budget from AI response
 */
export function parseBudget(text: string): ParsedBudgetItem[] {
  const items: ParsedBudgetItem[] = []
  const lines = text.split('\n')

  let currentCategory = 'General'

  for (const line of lines) {
    // Skip header lines and empty lines
    if (!line.trim() || /^(category|---|\|?\s*category\s*\|)/i.test(line)) continue

    // Detect category headers (e.g., "PRE-PRODUCTION:" or "Production")
    const categoryMatch = line.match(/^([A-Z][A-Z\s-]+):\s*$/i)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      continue
    }

    // Match table format: CATEGORY | LINE ITEM | RATE | DAYS/QTY | TOTAL
    const tableMatch = line.match(/^\|?\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*\$?([\d,]+)\|?/i)
    if (tableMatch) {
      items.push({
        category: tableMatch[1].trim() || currentCategory,
        item: tableMatch[2].trim(),
        rate: tableMatch[3].trim(),
        quantity: tableMatch[4].trim(),
        total: tableMatch[5].trim().replace(/,/g, ''),
      })
      continue
    }

    // Match bullet point format: "- Location scout: $500/day × 2 = $1,000"
    const bulletMatch = line.match(/[-•]\s*([^:]+):\s*\$?([\d,]+)(?:\/(\w+))?\s*[×x]\s*(\d+)\s*=\s*\$?([\d,]+)/i)
    if (bulletMatch) {
      items.push({
        category: currentCategory,
        item: bulletMatch[1].trim(),
        rate: `$${bulletMatch[2]}${bulletMatch[3] ? '/' + bulletMatch[3] : ''}`,
        quantity: bulletMatch[4],
        total: bulletMatch[5].replace(/,/g, ''),
      })
    }
  }

  return items
}

/**
 * Parse call sheet crew from AI response
 */
export function parseCallSheetCrew(text: string): ParsedCallSheetCrew[] {
  const crew: ParsedCallSheetCrew[] = []
  const lines = text.split('\n')

  let inCrewSection = false

  for (const line of lines) {
    // Detect crew section
    if (/crew schedule/i.test(line)) {
      inCrewSection = true
      continue
    }

    // Exit crew section when we hit talent section
    if (/talent schedule/i.test(line)) {
      inCrewSection = false
      break
    }

    if (!inCrewSection) continue

    // Skip header lines and empty lines
    if (!line.trim() || /^(role|---|\|?\s*role\s*\|)/i.test(line)) continue

    // Match table format: ROLE | NAME | CALL TIME | PHONE
    const match = line.match(/^\|?\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|?/i)
    if (match) {
      crew.push({
        role: match[1].trim(),
        name: match[2].trim(),
        callTime: match[3].trim(),
        phone: match[4].trim(),
      })
    }
  }

  return crew
}

/**
 * Parse call sheet talent from AI response
 */
export function parseCallSheetTalent(text: string): ParsedCallSheetTalent[] {
  const talent: ParsedCallSheetTalent[] = []
  const lines = text.split('\n')

  let inTalentSection = false

  for (const line of lines) {
    // Detect talent section
    if (/talent schedule/i.test(line)) {
      inTalentSection = true
      continue
    }

    // Exit talent section when we hit another section
    if (inTalentSection && /^[A-Z\s]+:$/i.test(line)) {
      break
    }

    if (!inTalentSection) continue

    // Skip header lines and empty lines
    if (!line.trim() || /^(talent|---|\|?\s*talent\s*\|)/i.test(line)) continue

    // Match table format: TALENT | ROLE | CALL TIME | READY TIME
    const match = line.match(/^\|?\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|?/i)
    if (match) {
      talent.push({
        talent: match[1].trim(),
        role: match[2].trim(),
        callTime: match[3].trim(),
        readyTime: match[4].trim(),
      })
    }
  }

  return talent
}

export interface ParsedBrief {
  projectObjective?: string
  targetAudience?: string
  keyMessages?: string
  toneAndStyle?: string
  visualDirection?: string
  brandGuidelines?: string
  deliverables?: string
  budgetRange?: string
  timeline?: string
  stakeholders?: string
  successMetrics?: string
  constraints?: string
  additionalNotes?: string
}

/**
 * Parse brief content from AI response
 */
export function parseBrief(text: string): ParsedBrief {
  const brief: ParsedBrief = {}

  // Helper function to extract content after a heading
  const extractSection = (heading: string): string | undefined => {
    const patterns = [
      new RegExp(`${heading}[:\\s]+([^\\n]+(?:\\n(?!\\n|[A-Z][^:]+:)[^\\n]+)*)`, 'i'),
      new RegExp(`\\*\\*${heading}\\*\\*[:\\s]+([^\\n]+(?:\\n(?!\\n|\\*\\*)[^\\n]+)*)`, 'i'),
      new RegExp(`## ${heading}[:\\s]*\\n+([^\\n]+(?:\\n(?!\\n|##)[^\\n]+)*)`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    return undefined
  }

  // Extract each field with various heading variations
  brief.projectObjective =
    extractSection('Project Objective') ||
    extractSection('Objective') ||
    extractSection('Goal') ||
    extractSection('Purpose')

  brief.targetAudience =
    extractSection('Target Audience') ||
    extractSection('Audience') ||
    extractSection('Who is this for')

  brief.keyMessages =
    extractSection('Key Messages') ||
    extractSection('Messages') ||
    extractSection('Main Messages')

  brief.deliverables =
    extractSection('Deliverables') ||
    extractSection('What we need') ||
    extractSection('Outputs')

  brief.budgetRange =
    extractSection('Budget Range') ||
    extractSection('Budget') ||
    extractSection('Cost')

  brief.timeline =
    extractSection('Timeline') ||
    extractSection('Schedule') ||
    extractSection('Timeframe')

  brief.toneAndStyle =
    extractSection('Tone and Style') ||
    extractSection('Tone & Style') ||
    extractSection('Tone') ||
    extractSection('Style')

  brief.visualDirection =
    extractSection('Visual Direction') ||
    extractSection('Visual Style') ||
    extractSection('Look and Feel') ||
    extractSection('Aesthetic')

  brief.brandGuidelines =
    extractSection('Brand Guidelines') ||
    extractSection('Brand') ||
    extractSection('Brand Standards')

  brief.stakeholders =
    extractSection('Stakeholders') ||
    extractSection('Approvals') ||
    extractSection('Key Contacts') ||
    extractSection('Decision Makers')

  brief.successMetrics =
    extractSection('Success Metrics') ||
    extractSection('KPIs') ||
    extractSection('Metrics') ||
    extractSection('Goals')

  brief.constraints =
    extractSection('Constraints') ||
    extractSection('Limitations') ||
    extractSection('Restrictions')

  brief.additionalNotes =
    extractSection('Additional Notes') ||
    extractSection('Notes') ||
    extractSection('Other considerations')

  return brief
}
