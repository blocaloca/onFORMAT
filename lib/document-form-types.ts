// Document form type categorization
// This maps each document type to its appropriate form template

export type FormTemplateType = 'structured-list' | 'rich-text' | 'media-gallery' | 'structured-form'

export interface DocumentFormConfig {
  formType: FormTemplateType
  fields?: string[]
  listType?: 'simple' | 'detailed'
}

// Map document types to their form templates
export const DOCUMENT_FORM_CONFIG: Record<string, DocumentFormConfig> = {
  // === STRUCTURED LIST FORMS ===
  // Budget-style forms (category, description, amount)
  'budget': { formType: 'structured-list', listType: 'detailed' },
  'crew-list': { formType: 'structured-list', listType: 'detailed' },
  'equipment-list': { formType: 'structured-list', listType: 'simple' },
  'gear-list': { formType: 'structured-list', listType: 'simple' },
  'casting': { formType: 'structured-list', listType: 'detailed' },
  'talent-brief': { formType: 'structured-list', listType: 'detailed' },
  'crew-booking': { formType: 'structured-list', listType: 'detailed' },

  // Call sheet-style forms (crew/talent schedules)
  'call-sheet': { formType: 'structured-list', listType: 'detailed' },
  'schedule': { formType: 'structured-list', listType: 'detailed' },
  'production-schedule': { formType: 'structured-list', listType: 'detailed' },
  'posting-schedule': { formType: 'structured-list', listType: 'detailed' },
  'posting-calendar': { formType: 'structured-list', listType: 'detailed' },
  'content-calendar': { formType: 'structured-list', listType: 'detailed' },

  // Shot list-style forms (shot breakdowns)
  'shot-list': { formType: 'structured-list', listType: 'detailed' },
  'shot-book': { formType: 'structured-list', listType: 'detailed' },
  'shoot-plan': { formType: 'structured-list', listType: 'detailed' },
  'shoot-blocks': { formType: 'structured-list', listType: 'detailed' },

  // Simple lists
  'locations': { formType: 'structured-list', listType: 'simple' },
  'location-scout': { formType: 'structured-list', listType: 'simple' },
  'location-permits': { formType: 'structured-list', listType: 'simple' },
  'content-tracker': { formType: 'structured-list', listType: 'simple' },
  'deliverables-tracker': { formType: 'structured-list', listType: 'simple' },
  'approval-tracking': { formType: 'structured-list', listType: 'simple' },

  // === RICH TEXT FORMS ===
  // Narrative/script content
  'script': { formType: 'rich-text' },
  'treatment': { formType: 'rich-text' },
  'scripts-prompts': { formType: 'rich-text' },
  'content-ideas': { formType: 'rich-text' },

  // Notes and documentation
  'production-log': { formType: 'rich-text' },
  'script-notes': { formType: 'rich-text' },
  'edit-notes': { formType: 'rich-text' },
  'color-notes': { formType: 'rich-text' },
  'sound-mix': { formType: 'rich-text' },
  'vfx-notes': { formType: 'rich-text' },
  'on-set-notes': { formType: 'rich-text' },
  'direction-notes': { formType: 'rich-text' },
  'dit-notes': { formType: 'rich-text' },
  'retouching-notes': { formType: 'rich-text' },
  'audio-log': { formType: 'rich-text' },
  'client-revisions': { formType: 'rich-text' },

  // Archive and documentation
  'archive': { formType: 'rich-text' },
  'archive-log': { formType: 'rich-text' },
  'archive-documentation': { formType: 'rich-text' },
  'case-study': { formType: 'rich-text' },

  // === MEDIA GALLERY FORMS ===
  // Visual content
  'mood-board': { formType: 'media-gallery' },
  'moodboard': { formType: 'media-gallery' },
  'art-book': { formType: 'media-gallery' },
  'storyboard': { formType: 'media-gallery' },
  'design-assets': { formType: 'media-gallery' },
  'visual-style-guide': { formType: 'media-gallery' },
  'image-selects': { formType: 'media-gallery' },
  'client-selects': { formType: 'media-gallery' },
  'live-selects': { formType: 'media-gallery' },
  'reference-images': { formType: 'media-gallery' },

  // === STRUCTURED FORM TEMPLATES ===
  // Briefs and strategy
  'brief': { formType: 'structured-form', fields: ['objective', 'audience', 'message', 'deliverables', 'budget', 'timeline'] },
  'brand-brief': { formType: 'structured-form', fields: ['brand', 'objective', 'audience', 'positioning', 'deliverables'] },
  'campaign-strategy': { formType: 'structured-form', fields: ['objective', 'audience', 'channels', 'timeline', 'budget'] },
  'platform-strategy': { formType: 'structured-form', fields: ['platforms', 'objectives', 'audience', 'content-types', 'posting-frequency'] },

  // Guidelines and documentation
  'brand-guidelines': { formType: 'structured-form', fields: ['colors', 'typography', 'voice', 'logo-usage', 'examples'] },
  'brand-guidelines-doc': { formType: 'structured-form', fields: ['colors', 'typography', 'voice', 'logo-usage', 'examples'] },
  'tone-voice': { formType: 'structured-form', fields: ['brand-voice', 'do', 'dont', 'examples'] },
  'content-pillars': { formType: 'structured-form', fields: ['pillar-1', 'pillar-2', 'pillar-3', 'themes'] },

  // Research and analysis
  'audience-profile': { formType: 'structured-form', fields: ['demographics', 'psychographics', 'behaviors', 'pain-points'] },
  'audience-research': { formType: 'structured-form', fields: ['demographics', 'insights', 'opportunities'] },

  // Technical specs
  'usage-licensing': { formType: 'structured-form', fields: ['usage-rights', 'territories', 'duration', 'exclusivity'] },
  'platform-rights': { formType: 'structured-form', fields: ['platforms', 'territories', 'duration'] },
  'license-tracking': { formType: 'structured-form', fields: ['asset', 'license-type', 'expiry', 'restrictions'] },

  // Performance and reporting
  'performance-report': { formType: 'structured-form', fields: ['metrics', 'results', 'insights', 'next-steps'] },

  // Metadata and categorization
  'hashtags-metadata': { formType: 'structured-form', fields: ['hashtags', 'keywords', 'tags', 'categories'] },
  'captions-copy': { formType: 'structured-form', fields: ['primary-caption', 'alt-text', 'cta', 'hashtags'] },

  // Other structured content
  'music-cue': { formType: 'structured-form', fields: ['timecode', 'track', 'usage', 'licensing'] },
  'approval-workflow': { formType: 'structured-form', fields: ['approver', 'status', 'feedback', 'deadline'] },
  'typography-layout': { formType: 'structured-form', fields: ['fonts', 'sizes', 'hierarchy', 'spacing'] },

  // Additional missing configs
  'production-insurance': { formType: 'structured-form', fields: ['policy-type', 'coverage', 'premium', 'provider', 'expiry'] },
  'broadcast-masters': { formType: 'structured-list', listType: 'detailed' },
  'social-cutdowns': { formType: 'structured-list', listType: 'detailed' },
  'clean-feeds': { formType: 'structured-list', listType: 'detailed' },
  'media-organization': { formType: 'structured-list', listType: 'detailed' },
  'edits-versions': { formType: 'structured-list', listType: 'detailed' },
  'digital-drafting': { formType: 'media-gallery' },
}

// Get form config for a document type (with fallback)
export function getFormConfig(documentType: string): DocumentFormConfig {
  return DOCUMENT_FORM_CONFIG[documentType] || { formType: 'rich-text' }
}

// Check if a document type has a specialized form component
export function hasSpecializedForm(documentType: string): boolean {
  const specialized = ['brief', 'budget', 'call-sheet', 'shot-list', 'shot-book', 'mood-board']
  return specialized.includes(documentType)
}
