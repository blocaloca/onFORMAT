// Test AI parser functions
const { parseBudget, parseShotList, parseCallSheetCrew, parseBrief } = require('./lib/ai-parsers.ts')

console.log('=== TESTING AI PARSERS ===\n')

// Test 1: Budget Parser
console.log('TEST 1: Budget Parser (Table Format)')
const budgetText = `
Here's a budget breakdown:

| Category | Line Item | Rate | Days/Qty | Total |
| Production | Director | $4,000/day | 2 | $8,000 |
| Production | DP | $3,000/day | 2 | $6,000 |
| Equipment | Camera package | $1,500/day | 2 | $3,000 |
`
try {
  const budgetItems = parseBudget(budgetText)
  console.log(`✓ Parsed ${budgetItems.length} budget items`)
  console.log(JSON.stringify(budgetItems, null, 2))
} catch (e) {
  console.error('✗ Budget parser failed:', e.message)
}

// Test 2: Budget Parser (Bullet Format)
console.log('\nTEST 2: Budget Parser (Bullet Format)')
const budgetBullets = `
PRE-PRODUCTION:
- Location scout: $500/day × 2 = $1,000
- Casting: $800 × 1 = $800

PRODUCTION:
- Director: $4,000/day × 2 = $8,000
`
try {
  const budgetItems = parseBudget(budgetBullets)
  console.log(`✓ Parsed ${budgetItems.length} budget items`)
  console.log(JSON.stringify(budgetItems, null, 2))
} catch (e) {
  console.error('✗ Budget parser failed:', e.message)
}

// Test 3: Shot List Parser
console.log('\nTEST 3: Shot List Parser')
const shotText = `
| Shot | Description | Size/Angle | Movement | Duration |
| 1 | Wide establishing of office | WS | Locked off | 0:03 |
| 2 | Close up of hands typing | CU | Handheld | 0:02 |
`
try {
  const shots = parseShotList(shotText)
  console.log(`✓ Parsed ${shots.length} shots`)
  console.log(JSON.stringify(shots, null, 2))
} catch (e) {
  console.error('✗ Shot list parser failed:', e.message)
}

// Test 4: Brief Parser
console.log('\nTEST 4: Brief Parser')
const briefText = `
Project Objective: Create a compelling 30-second commercial for Nike

Target Audience: Athletes aged 18-35 who value performance

Key Messages:
- Just do it
- Performance matters
- Innovation in every step

Deliverables: 1x 30s hero video, 3x 15s cutdowns
`
try {
  const brief = parseBrief(briefText)
  console.log(`✓ Parsed ${Object.keys(brief).length} brief fields`)
  console.log(JSON.stringify(brief, null, 2))
} catch (e) {
  console.error('✗ Brief parser failed:', e.message)
}

console.log('\n=== TESTS COMPLETE ===')
