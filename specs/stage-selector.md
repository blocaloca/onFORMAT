# StageSelector Component Specification

## Purpose
Horizontal bar with 5 stage dropdown buttons. Each dropdown shows document types available for that stage. Clicking a document type triggers creation flow.

## File Location
`components/StageSelector.tsx`

## Visual Design

### Layout
- Horizontal flex container
- Full width, centered with max-width: 1200px
- Padding: 16px
- Background: Transparent
- 5 equally-spaced stage buttons

### Stage Buttons
- Height: 48px
- Width: auto (evenly distributed, min 140px each)
- Background: White
- Border: 1px solid #E5E5EA
- Border-radius: 8px
- Spacing: 12px gap between buttons
- Font: 15px, semi-bold

### Active State (when dropdown open)
- Background: Light tint of stage color (5% opacity)
- Border: Stage color at 30% opacity
- Dropdown icon rotates 180deg

### Hover State
- Background: Light gray (#F9F9F9)
- Border: Stage color at 20% opacity
- Slight lift (2px)
- Cursor: pointer

## The 5 Stages
```typescript
const STAGES = {
  concept: {
    emoji: '💡',
    label: 'Concept',
    color: '#8B7FA8',
    documents: [
      { type: 'brief', label: 'Brief', icon: '📋' },
      { type: 'moodboard', label: 'Moodboard', icon: '🖼️' },
      { type: 'research', label: 'Research', icon: '🔍' }
    ]
  },
  develop: {
    emoji: '🌱',
    label: 'Develop',
    color: '#8EA091',
    documents: [
      { type: 'script', label: 'Script', icon: '📝' },
      { type: 'storyboard', label: 'Storyboard', icon: '🎨' },
      { type: 'character-dna', label: 'Character DNA', icon: '👤' }
    ]
  },
  plan: {
    emoji: '📊',
    label: 'Plan',
    color: '#B47864',
    documents: [
      { type: 'budget', label: 'Budget', icon: '💰' },
      { type: 'shot-list', label: 'Shot List', icon: '📸' },
      { type: 'schedule', label: 'Schedule', icon: '📅' },
      { type: 'call-sheet', label: 'Call Sheet', icon: '📋' }
    ]
  },
  execute: {
    emoji: '▶️',
    label: 'Execute',
    color: '#A65D5D',
    documents: [
      { type: 'production-log', label: 'Production Log', icon: '📓' },
      { type: 'dailies', label: 'Dailies', icon: '🎬' }
    ]
  },
  wrap: {
    emoji: '✓',
    label: 'Wrap',
    color: '#7A94A8',
    documents: [
      { type: 'archive', label: 'Archive', icon: '📦' },
      { type: 'post-mortem', label: 'Post-Mortem', icon: '📊' }
    ]
  }
}
```

## Dropdown Menu Design

When stage button clicked, dropdown appears below:

### Dropdown Menu Styling
- Background: White
- Border: 1px solid #E5E5EA
- Border-radius: 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.1)
- Padding: 8px
- Position: Absolute, below button
- Z-index: 50

### Menu Items
- Height: 40px
- Padding: 12px
- Border-radius: 6px
- Hover: Background #F9F9F9
- Active: Background stage color at 5% opacity
- Font: 14px, medium weight
- Icon + Text layout (8px gap)

## TypeScript Interface
```typescript
interface StageConfig {
  emoji: string
  label: string
  color: string
  documents: DocumentType[]
}

interface DocumentType {
  type: string
  label: string
  icon: string
}

interface StageSelectorProps {
  onDocumentSelect: (stage: string, type: string) => void
  activeStage?: string | null
}
```

## Behavior

### Click Stage Button
1. Open dropdown menu
2. Highlight button with stage color
3. Rotate dropdown arrow 180deg
4. Close any other open dropdowns

### Click Document Type
1. Call `onDocumentSelect(stage, type)`
2. Close dropdown
3. Reset button to normal state

### Click Outside
1. Close dropdown
2. Reset button to normal state

### Keyboard Navigation
- Tab: Move between stage buttons
- Enter/Space: Open/close dropdown
- Arrow Up/Down: Navigate menu items
- Escape: Close dropdown

## Mobile Behavior (< 768px)

Convert to vertical stack:
- Full width buttons (no horizontal scroll)
- Stack vertically with 8px gap
- Dropdown appears below button (full width)
- Consider accordion-style (tap to expand)

## Animations

### Dropdown Open/Close
- Duration: 200ms
- Easing: ease-in-out
- Properties: opacity, transform (translateY)

### Button States
- Hover: 150ms ease
- Active: instant
- Border color: 200ms ease

## Implementation Notes

1. Use React state to track which dropdown is open
2. Use `useRef` and click-outside detection
3. Dropdown should overlay content (position: absolute)
4. Smooth transitions (200ms) for dropdown open/close
5. Prevent scroll when dropdown open on mobile
6. Dropdown should align left edge with button

## Example Usage
```tsx
<StageSelector
  onDocumentSelect={(stage, type) => {
    console.log(`Creating ${type} in ${stage} stage`)
    createDocument(stage, type)
  }}
  activeStage="concept"
/>
```

## Testing

Update app/test-card/page.tsx to include StageSelector above the DocumentGrid. When a document type is selected, show an alert with the stage and type.

THEN: Build components/StageSelector.tsx according to this spec.
