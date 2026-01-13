// @ts-nocheck
/**
 * Professional output templates for production-ready documents
 * These templates ensure all outputs look like they came from a real production company
 */

export const TEMPLATES = {
  // LuxPixPro Templates
  shotList: {
    header: `SHOT LIST
Project: {projectName}
Date: {date}
Director: {director}

FORMAT: 16:9 | CAMERA: {camera} | FPS: {fps}
`,
    table: `
| SHOT | DESCRIPTION | SETUP | LENS | MOVEMENT | LIGHTING | DURATION |
|------|-------------|-------|------|----------|----------|----------|
`,
    row: `| {num} | {desc} | {setup} | {lens} | {movement} | {lighting} | {duration} |
`,
  },

  callSheet: {
    format: `CALL SHEET
Production: {projectName}
Shoot Date: {date}
Location: {location}

CREW CALL TIMES:
Production: {prodCall}
Camera: {cameraCall}
Lighting: {lightingCall}
Sound: {soundCall}

SCHEDULE:
{schedule}

LOCATION:
Address: {address}
Parking: {parking}
Basecamp: {basecamp}

EQUIPMENT:
{equipment}

NOTES:
{notes}
`,
  },

  budget: {
    format: `PRODUCTION BUDGET
Project: {projectName}
Total: ${totalBudget}

PRE-PRODUCTION: ${preTotal}
{preLineItems}

PRODUCTION: ${prodTotal}
{prodLineItems}

POST-PRODUCTION: ${postTotal}
{postLineItems}

CONTINGENCY (10%): ${contingency}

NOTES:
- All rates are day rates unless specified
- Equipment includes insurance
- Location fees include permits
`,
  },

  equipmentList: {
    format: `EQUIPMENT LIST
Project: {projectName}

CAMERA PACKAGE:
{camera}

LENS PACKAGE:
{lenses}

SUPPORT:
{support}

LIGHTING:
{lighting}

AUDIO:
{audio}

GRIP:
{grip}

NOTES:
{notes}
`,
  },

  // GenStudioPro Templates
  characterDNA: {
    format: `CHARACTER DNA SHEET
Name: {name}
Project: {projectName}

CORE VISUAL IDENTITY:
{coreDescription}

PERMANENT IDENTIFYING FEATURES:
{permanentFeatures}

BASE PROMPT TEMPLATE:
{basePrompt}

PLATFORM SETTINGS:
Midjourney: {mjSettings}
Runway: {runwaySettings}
Kling: {klingSettings}
Pika: {pikaSettings}

CONSISTENCY NOTES:
- These features appear in EVERY generation
- Do not alter or remove permanent features
- Use this exact base prompt for all scenes
`,
  },

  scenePrompts: {
    format: `SCENE PROMPTS
Project: {projectName}
Character: {characterName}

{scenes}
`,
    scene: `
SCENE {num}: {sceneName}

MIDJOURNEY:
{mjPrompt}

RUNWAY GEN-3:
{runwayPrompt}

KLING AI:
{klingPrompt}

PIKA 1.5:
{pikaPrompt}

---
`,
  },

  // ArtMind Templates
  creativeBrief: {
    format: `CREATIVE BRIEF
{projectName}

CLIENT: {client}
PROJECT: {project}
DATE: {date}

OBJECTIVE:
{objective}

TARGET AUDIENCE:
{target}

KEY INSIGHT:
{insight}

CAMPAIGN CONCEPT:
{concept}

EXECUTIONAL TERRITORIES:
{territories}

DELIVERABLES:
{deliverables}

TIMELINE:
{timeline}

BUDGET:
{budget}

SUCCESS METRICS:
{metrics}
`,
  },

  conceptTerritories: {
    format: `CONCEPT TERRITORIES
Project: {projectName}

{territories}

RECOMMENDATION:
{recommendation}
`,
    territory: `
TERRITORY {num}: "{name}"

Concept: {concept}

Why it works: {rationale}

Risk factor: {risk}

Executional notes: {notes}

---
`,
  },

  campaignBudget: {
    format: `CAMPAIGN BUDGET
Project: {projectName}
Total: ${total}

{categories}

PAYMENT SCHEDULE:
- 50% on project start
- 25% on production completion
- 25% on final delivery

NOTES:
{notes}
`,
    category: `
{categoryName}: ${categoryTotal}
{lineItems}
`,
    lineItem: `  - {item}: ${cost}
`,
  },

  moodboardDirection: {
    format: `MOODBOARD DIRECTION
Project: {projectName}

VISUAL TONE:
{tone}

COLOR PALETTE:
{colors}

TYPOGRAPHY DIRECTION:
{typography}

IMAGERY APPROACH:
{imagery}

REFERENCE EXAMPLES:
{references}

EXECUTION NOTES:
{notes}
`,
  },
}

/**
 * Helper function to fill template with data
 */
export function fillTemplate(
  template: string,
  data: Record<string, string | number>
): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
  }
  return result
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generate shot list table row
 */
export function formatShotRow(shot: {
  num: number
  description: string
  setup: string
  lens: string
  movement: string
  lighting: string
  duration: string
}): string {
  return fillTemplate(TEMPLATES.shotList.row, shot)
}

/**
 * Generate budget line item
 */
export function formatBudgetLine(
  item: string,
  cost: number,
  indent: boolean = true
): string {
  const prefix = indent ? '  - ' : ''
  return `${prefix}${item}: ${formatCurrency(cost)}\n`
}
