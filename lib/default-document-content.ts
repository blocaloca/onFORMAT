/**
 * Default content for pre-populated documents
 * When a project is created, certain documents are auto-created with starter content
 */

import { BudgetData } from '@/components/documents/BudgetForm'

/**
 * Get default budget content based on template type
 */
export function getDefaultBudgetContent(templateId: string): BudgetData {
  // Photography budget defaults
  if (templateId === 'commercial-photography') {
    return {
      lineItems: [
        { category: 'Crew', description: 'Photographer (day rate)', amount: 0 },
        { category: 'Crew', description: 'Photo Assistant', amount: 0 },
        { category: 'Crew', description: 'Stylist', amount: 0 },
        { category: 'Equipment', description: 'Camera & Lenses', amount: 0 },
        { category: 'Equipment', description: 'Lighting Package', amount: 0 },
        { category: 'Equipment', description: 'Grip & Stands', amount: 0 },
        { category: 'Location', description: 'Studio Rental', amount: 0 },
        { category: 'Location', description: 'Location Fees', amount: 0 },
        { category: 'Talent', description: 'Model Fees', amount: 0 },
        { category: 'Production', description: 'Props & Wardrobe', amount: 0 },
        { category: 'Production', description: 'Catering', amount: 0 },
        { category: 'Post-Production', description: 'Retouching', amount: 0 },
      ],
      contingency: 10,
      subtotal: 0,
      total: 0
    }
  }

  // Social media budget defaults
  if (templateId === 'social-content') {
    return {
      lineItems: [
        { category: 'Crew', description: 'Content Creator (day rate)', amount: 0 },
        { category: 'Crew', description: 'Videographer/Photographer', amount: 0 },
        { category: 'Equipment', description: 'Camera & Gear', amount: 0 },
        { category: 'Equipment', description: 'Lighting & Audio', amount: 0 },
        { category: 'Talent', description: 'On-Camera Talent', amount: 0 },
        { category: 'Production', description: 'Props & Set Dressing', amount: 0 },
        { category: 'Production', description: 'Location Fees', amount: 0 },
        { category: 'Post-Production', description: 'Editing', amount: 0 },
        { category: 'Post-Production', description: 'Graphics & Motion', amount: 0 },
        { category: 'Distribution', description: 'Platform Promotion', amount: 0 },
      ],
      contingency: 10,
      subtotal: 0,
      total: 0
    }
  }

  // Commercial video budget defaults
  if (templateId === 'commercial-video') {
    return {
      lineItems: [
        { category: 'Crew', description: 'Director (day rate)', amount: 0 },
        { category: 'Crew', description: 'Producer', amount: 0 },
        { category: 'Crew', description: 'DP/Cinematographer', amount: 0 },
        { category: 'Crew', description: 'Camera Operator', amount: 0 },
        { category: 'Crew', description: 'Gaffer', amount: 0 },
        { category: 'Crew', description: 'Sound Mixer', amount: 0 },
        { category: 'Equipment', description: 'Camera Package', amount: 0 },
        { category: 'Equipment', description: 'Lighting Package', amount: 0 },
        { category: 'Equipment', description: 'Grip & Electric', amount: 0 },
        { category: 'Equipment', description: 'Sound Package', amount: 0 },
        { category: 'Location', description: 'Location Fees', amount: 0 },
        { category: 'Location', description: 'Permits', amount: 0 },
        { category: 'Talent', description: 'Principal Talent', amount: 0 },
        { category: 'Talent', description: 'Extras', amount: 0 },
        { category: 'Production', description: 'Wardrobe & Props', amount: 0 },
        { category: 'Production', description: 'Catering', amount: 0 },
        { category: 'Post-Production', description: 'Editing', amount: 0 },
        { category: 'Post-Production', description: 'Color Grading', amount: 0 },
        { category: 'Post-Production', description: 'Sound Mix', amount: 0 },
      ],
      contingency: 10,
      subtotal: 0,
      total: 0
    }
  }

  // Brand campaign budget defaults
  if (templateId === 'brand-campaign') {
    return {
      lineItems: [
        { category: 'Creative', description: 'Creative Director', amount: 0 },
        { category: 'Creative', description: 'Art Director', amount: 0 },
        { category: 'Creative', description: 'Copywriter', amount: 0 },
        { category: 'Design', description: 'Graphic Designer', amount: 0 },
        { category: 'Design', description: 'Motion Designer', amount: 0 },
        { category: 'Production', description: 'Photo/Video Production', amount: 0 },
        { category: 'Media', description: 'Media Buying', amount: 0 },
        { category: 'Media', description: 'Social Media Management', amount: 0 },
      ],
      contingency: 10,
      subtotal: 0,
      total: 0
    }
  }

  // Fallback default budget
  return {
    lineItems: [
      { category: 'Crew', description: '', amount: 0 },
      { category: 'Equipment', description: '', amount: 0 },
      { category: 'Location', description: '', amount: 0 },
      { category: 'Post-Production', description: '', amount: 0 },
    ],
    contingency: 10,
    subtotal: 0,
    total: 0
  }
}

/**
 * Get list of documents to pre-populate for a given template
 */
export interface InitialDocument {
  type: string
  title: string
  stage: string
  content: any
  status: 'draft'
}

export function getInitialDocuments(templateId: string): InitialDocument[] {
  const documents: InitialDocument[] = []

  // Photography template
  if (templateId === 'commercial-photography') {
    documents.push(
      { type: 'brief', title: 'Brief', stage: 'develop', content: {}, status: 'draft' },
      { type: 'creative-direction', title: 'Creative Direction', stage: 'develop', content: {}, status: 'draft' },
      { type: 'shot-scene-book', title: 'Shot & Scene Book', stage: 'develop', content: {}, status: 'draft' },
      { type: 'budget', title: 'Budget', stage: 'plan', content: getDefaultBudgetContent(templateId), status: 'draft' },
      { type: 'call-sheet', title: 'Call Sheet', stage: 'execute', content: {}, status: 'draft' }
    )
  }

  // Social media template
  if (templateId === 'social-content') {
    documents.push(
      { type: 'brief', title: 'Brief', stage: 'develop', content: {}, status: 'draft' },
      { type: 'creative-direction', title: 'Creative Direction', stage: 'develop', content: {}, status: 'draft' },
      { type: 'schedule', title: 'Schedule', stage: 'develop', content: {}, status: 'draft' },
      { type: 'budget', title: 'Budget', stage: 'plan', content: getDefaultBudgetContent(templateId), status: 'draft' }
    )
  }

  // Commercial video template
  if (templateId === 'commercial-video') {
    documents.push(
      { type: 'brief', title: 'Brief', stage: 'pre-production', content: {}, status: 'draft' },
      { type: 'creative-direction', title: 'Treatment', stage: 'pre-production', content: {}, status: 'draft' },
      { type: 'budget', title: 'Budget', stage: 'pre-production', content: getDefaultBudgetContent(templateId), status: 'draft' },
      { type: 'call-sheet', title: 'Call Sheet', stage: 'production', content: {}, status: 'draft' },
      { type: 'shot-scene-book', title: 'Shot List', stage: 'production', content: {}, status: 'draft' }
    )
  }

  // Brand campaign template
  if (templateId === 'brand-campaign') {
    documents.push(
      { type: 'brief', title: 'Brand Brief', stage: 'develop', content: {}, status: 'draft' },
      { type: 'creative-direction', title: 'Creative Strategy', stage: 'develop', content: {}, status: 'draft' },
      { type: 'shot-scene-book', title: 'Moodboard', stage: 'develop', content: {}, status: 'draft' }
    )
  }

  return documents
}
