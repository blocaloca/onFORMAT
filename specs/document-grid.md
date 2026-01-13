# DocumentGrid Component Specification

## Purpose
Container component that displays multiple DocumentCard components in a responsive grid layout. Handles the "+ Add Document" placeholder and empty states.

## File Location
`components/DocumentGrid.tsx`

## Visual Layout

### Grid Responsive Behavior
- Mobile (<768px): 1 column, full width
- Tablet (768-1024px): 2 columns, 16px gap
- Desktop (1024-1440px): 3 columns, 20px gap
- Large (>1440px): 4 columns, 24px gap

### Container
- Padding: 24px
- Background: Light gray (#F5F5F7)
- Max width: 1600px (centered)

### Empty State
When no documents exist:
- Centered content (vertically and horizontally)
- Large icon or illustration (document icon)
- Heading: "No documents yet"
- Subtext: "Create your first document to get started"
- Primary button: "+ New Document"

### Add Document Placeholder
Always show as last card in grid:
- Same dimensions as DocumentCard
- Dashed border: 2px dashed #D1D1D6
- Background: White (#FFFFFF)
- Centered content:
  - Large "+" icon (48px, gray-400)
  - Text: "Add Document" (gray-600)
- Hover state:
  - Border: 2px solid #D1D1D6
  - Background: #FAFAFA
  - Scale: 1.02
  - Cursor: pointer
- Click: Opens document type selector

## TypeScript Interface

```typescript
interface Document {
  id: string
  type: string
  title: string
  stage: 'concept' | 'develop' | 'plan' | 'execute' | 'wrap'
  progress: number
  status: 'draft' | 'in-progress' | 'review' | 'approved'
  metadata: Record<string, any>
  updated_at: string
}

interface DocumentGridProps {
  documents: Document[]
  onDocumentClick: (id: string) => void
  onAddDocument?: () => void
  isLoading?: boolean
}
```

## States

### Loading State
Show 6 skeleton cards:
- Same size as real cards
- Pulsing animation
- Light gray background (#E5E5EA)
- No Add Document placeholder visible during loading

### Error State
- Centered error message
- Retry button
- Error icon (red)
- Message: "Failed to load documents"

### Empty State
When documents.length === 0 and not loading:
- Show centered empty state as described above
- No grid visible
- "+ New Document" button calls `onAddDocument()`

## Behavior

### Click Handlers
- Clicking a DocumentCard calls `onDocumentClick(id)` with document ID
- Clicking Add Document placeholder calls `onAddDocument()`
- If handlers not provided, clicks do nothing

### Sorting
- Default sort: `updated_at` descending (most recent first)
- Add Document placeholder always appears last

### Accessibility
- Grid has role="list"
- Each DocumentCard has role="listitem"
- Add Document placeholder is keyboard accessible (tabIndex={0})
- Add Document placeholder responds to Enter/Space keys

## Implementation Notes

1. Use Tailwind's responsive grid classes:
   - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
   - `gap-4 md:gap-4 lg:gap-5 xl:gap-6`

2. Add Document placeholder should match DocumentCard height dynamically

3. Component should be purely presentational - no data fetching

4. Document interface differs from DocumentCard - needs adapter/mapper

5. Map document.stage to DocumentCard.stage (lowercase to capitalized)

6. Map document.status to DocumentCard.status:
   - 'draft' → 'Draft'
   - 'in-progress' → 'In Progress'
   - 'review' → 'Review'
   - 'approved' → 'Final'

7. Map document.updated_at (string) to DocumentCard.lastEdited (Date)
