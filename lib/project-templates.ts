// onFORMAT Project Templates - Phase 1 Cleanup
// Aligned with onFORMAT_CORE.md
// Date: 2025-12-26

export interface DocumentType {
  type: string
  label: string
  icon: string
  description?: string
  deprecated?: boolean // Mark non-core documents
}

export interface TemplateStage {
  id: string
  name: string
  color: string
  emoji: string
  documents: DocumentType[]
}

export interface ProjectTemplate {
  id: string
  name: string
  icon: string
  description: string
  principalCreator: string
  stages: TemplateStage[]
  tier: 'core' | 'pro' | 'studio'
  deprecated?: boolean
}

// Core onFORMAT Templates - Production-First
export const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  'commercial-photography': {
    id: 'commercial-photography',
    name: 'Commercial Photography',
    icon: '📸',
    description: 'Professional photo production from concept to delivery',
    principalCreator: 'Photographer, Producer',
    tier: 'core',
    stages: [
      {
        id: 'concept',
        name: 'Concept',
        color: '#8B7FA8',
        emoji: '💡',
        documents: [
          { type: 'brief', label: 'Brief', icon: '📋' },
          { type: 'creative-direction', label: 'Creative Direction', icon: '🎨', description: 'Visual references, mood, creative approach' },
          { type: 'shot-scene-book', label: 'Shot & Scene Book', icon: '📸', description: 'Shot list and scene breakdown' }
        ]
      },
      {
        id: 'plan',
        name: 'Plan',
        color: '#8EA091',
        emoji: '📋',
        documents: [
          { type: 'locations-sets', label: 'Locations & Sets', icon: '📍', description: 'Location details, studios, set considerations' },
          { type: 'casting', label: 'Casting & Talent', icon: '👤' },
          { type: 'crew-list', label: 'Crew List', icon: '👥' },
          { type: 'schedule', label: 'Schedule', icon: '📅' },
          { type: 'budget', label: 'Budget', icon: '💰' }
        ]
      },
      {
        id: 'execute',
        name: 'Execute',
        color: '#A8956D',
        emoji: '🎬',
        documents: [
          { type: 'call-sheet', label: 'Call Sheet', icon: '📋' },
          { type: 'on-set-notes', label: 'On-Set Notes', icon: '📝' },
          { type: 'releases', label: 'Releases', icon: '📝' },
          { type: 'client-selects', label: 'Client Selects', icon: '⭐' }
        ]
      },
      {
        id: 'wrap',
        name: 'Wrap',
        color: '#7A94A8',
        emoji: '✓',
        documents: [
          { type: 'deliverables-licensing', label: 'Deliverables & Licensing', icon: '📄', description: 'Final deliverables, usage rights, licensing' },
          { type: 'archive-log', label: 'Archive Log', icon: '📦' }
        ]
      }
    ]
  },

  'commercial-video': {
    id: 'commercial-video',
    name: 'Commercial Video',
    icon: '🎬',
    description: 'Full production workflow from concept to delivery',
    principalCreator: 'Producer, Director',
    tier: 'core',
    stages: [
      {
        id: 'concept',
        name: 'Concept',
        color: '#8B7FA8',
        emoji: '💡',
        documents: [
          { type: 'brief', label: 'Brief', icon: '📋' },
          { type: 'creative-direction', label: 'Creative Direction', icon: '🎨', description: 'Treatment, visual approach, creative concept' },
          { type: 'shot-scene-book', label: 'Shot & Scene Book', icon: '📸', description: 'Shot list and scene breakdown' }
        ]
      },
      {
        id: 'plan',
        name: 'Plan',
        color: '#8EA091',
        emoji: '📋',
        documents: [
          { type: 'locations-sets', label: 'Locations & Sets', icon: '📍', description: 'Location details, studios, set considerations' },
          { type: 'casting', label: 'Casting & Talent', icon: '👤' },
          { type: 'crew-list', label: 'Crew List', icon: '👥' },
          { type: 'schedule', label: 'Schedule', icon: '📅' },
          { type: 'budget', label: 'Budget', icon: '💰' }
        ]
      },
      {
        id: 'execute',
        name: 'Execute',
        color: '#A8956D',
        emoji: '🎬',
        documents: [
          { type: 'call-sheet', label: 'Call Sheet', icon: '📋' },
          { type: 'on-set-notes', label: 'On-Set Notes', icon: '📝' },
          { type: 'releases', label: 'Releases', icon: '📝' },
          { type: 'client-selects', label: 'Client Selects', icon: '⭐' }
        ]
      },
      {
        id: 'wrap',
        name: 'Wrap',
        color: '#7A94A8',
        emoji: '✓',
        documents: [
          { type: 'deliverables-licensing', label: 'Deliverables & Licensing', icon: '📄', description: 'Final deliverables, usage rights, licensing' },
          { type: 'archive-log', label: 'Archive Log', icon: '📦' }
        ]
      }
    ]
  },

  // DEPRECATED TEMPLATE - Marked for removal in Phase 2
  'social-content': {
    id: 'social-content',
    name: 'Social Media Content',
    icon: '📱',
    description: '[DEPRECATED] Use Commercial Photography or Commercial Video instead',
    principalCreator: 'Content Creator, Influencer',
    tier: 'core',
    deprecated: true,
    stages: [] // Empty - template deprecated
  }
}

// Legacy document type mappings for backward compatibility
export const LEGACY_DOCUMENT_MAPPINGS: Record<string, string> = {
  'mood-board': 'creative-direction',
  'treatment': 'creative-direction',
  'shot-book': 'shot-scene-book',
  'shot-list': 'shot-scene-book',
  'location-scout': 'locations-sets',
  'location-permits': 'locations-sets',
  'locations': 'locations-sets',
  'crew-booking': 'crew-list',
  'usage-licensing': 'deliverables-licensing',
  'license-tracking': 'deliverables-licensing',
  'deliverables-tracker': 'deliverables-licensing',
  'production-log': 'on-set-notes',
  'direction-notes': 'on-set-notes',
  'image-selects': 'client-selects',
  'live-selects': 'client-selects',
  'archive': 'archive-log'
}

// Get canonical document type from legacy name
export function getCanonicalDocumentType(legacyType: string): string {
  return LEGACY_DOCUMENT_MAPPINGS[legacyType] || legacyType
}

export function getTemplate(templateId: string): ProjectTemplate | undefined {
  const template = PROJECT_TEMPLATES[templateId]
  if (template?.deprecated) {
    console.warn(`Template "${templateId}" is deprecated. Use commercial-photography or commercial-video instead.`)
  }
  return template
}

export function getAllTemplates(): ProjectTemplate[] {
  // Filter out deprecated templates from UI
  return Object.values(PROJECT_TEMPLATES).filter(t => !t.deprecated)
}

export function getCoreTemplates(): ProjectTemplate[] {
  return Object.values(PROJECT_TEMPLATES).filter(t => t.tier === 'core' && !t.deprecated)
}

// Get all document types across all templates (for document type validation)
export function getAllDocumentTypes(): string[] {
  const types = new Set<string>()

  Object.values(PROJECT_TEMPLATES).forEach(template => {
    if (!template.deprecated) {
      template.stages.forEach(stage => {
        stage.documents.forEach(doc => {
          if (!doc.deprecated) {
            types.add(doc.type)
          }
        })
      })
    }
  })

  return Array.from(types)
}
