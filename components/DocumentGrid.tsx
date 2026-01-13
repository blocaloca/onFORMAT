'use client'

import DocumentCard, { Document as CardDocument, DocumentStage, DocumentStatus, DocumentType } from './DocumentCard'

// Grid Document interface (from API/database)
export interface GridDocument {
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
  documents: GridDocument[]
  onDocumentClick: (id: string) => void
  onDocumentDelete?: (id: string) => void
  onAddDocument?: () => void
  isLoading?: boolean
  viewMode?: 'grid' | 'list'
  searchTerm?: string
}

// Helper function to get document type icon
const getDocumentIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'brief': '📋',
    'budget': '💰',
    'script': '📝',
    'storyboard': '🎬',
    'casting': '🎭',
    'talent': '🎭',
    'shot-list': '📷',
    'call-sheet': '📞',
    'schedule': '📅',
    'moodboard': '🎨',
    'research': '🔍',
    'character-dna': '👤',
    'production-log': '📊',
    'dailies': '🎥',
    'archive': '📦',
    'post-mortem': '📈'
  }
  return iconMap[type] || '📄'
}

// Mapper functions
const mapStage = (stage: string): DocumentStage => {
  const stageMap: Record<string, DocumentStage> = {
    'concept': 'Concept',
    'develop': 'Develop',
    'plan': 'Plan',
    'execute': 'Execute',
    'wrap': 'Wrap'
  }
  return stageMap[stage] || 'Concept'
}

const mapStatus = (status: string): DocumentStatus => {
  const statusMap: Record<string, DocumentStatus> = {
    'draft': 'Draft',
    'in-progress': 'In Progress',
    'review': 'Review',
    'approved': 'Final'
  }
  return statusMap[status] || 'Draft'
}

const mapDocumentToCard = (doc: GridDocument): CardDocument => {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.type as DocumentType,
    stage: mapStage(doc.stage),
    status: mapStatus(doc.status),
    progress: doc.progress,
    lastEdited: new Date(doc.updated_at)
  }
}

// Skeleton Card Component
function SkeletonCard() {
  return (
    <div className="bg-[#E5E5EA] rounded-lg p-4 animate-pulse h-[180px]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mb-3">
        <div className="h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </div>
    </div>
  )
}

// Add Document Placeholder Component
function AddDocumentCard({ onClick }: { onClick?: () => void }) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      onClick={onClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      className="
        bg-white rounded-lg p-4 cursor-pointer
        border-2 border-dashed border-[#D1D1D6]
        transition-all duration-200
        hover:border-solid hover:border-[#D1D1D6] hover:bg-[#FAFAFA] hover:scale-[1.02]
        flex flex-col items-center justify-center
        min-h-[180px]
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      "
    >
      <div className="text-5xl text-gray-400 mb-2">+</div>
      <p className="text-gray-600 font-medium">Add Document</p>
    </div>
  )
}

// Empty State Component
function EmptyState({ onAddDocument }: { onAddDocument?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-gray-400 mb-4">
        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">No documents yet</h2>
      <p className="text-gray-600 mb-2">Select a stage above to create your first document</p>
      <p className="text-sm text-gray-500">Documents are organized by project stages</p>
    </div>
  )
}

export default function DocumentGrid({ documents, onDocumentClick, onDocumentDelete, onAddDocument, isLoading, viewMode = 'grid', searchTerm }: DocumentGridProps) {
  // Sort documents by updated_at (newest first)
  const sortedDocuments = [...documents].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-4 lg:gap-5 xl:gap-6"
          role="list"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (documents.length === 0) {
    // Check if this is a search with no results vs truly no documents
    if (searchTerm) {
      return (
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="bg-white rounded-xl p-12 border border-[#E5E5EA] text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">
              No documents found for "{searchTerm}"
            </h3>
            <p className="text-gray-600">
              Try a different search term
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <EmptyState onAddDocument={onAddDocument} />
      </div>
    )
  }

  // Grid with documents
  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {viewMode === 'grid' ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-4 lg:gap-5 xl:gap-6"
          role="list"
        >
          {sortedDocuments.map((doc) => (
            <div key={doc.id} role="listitem">
              <DocumentCard
                document={mapDocumentToCard(doc)}
                onClick={() => onDocumentClick(doc.id)}
                onDelete={onDocumentDelete ? () => onDocumentDelete(doc.id) : undefined}
              />
            </div>
          ))}
          {onAddDocument && (
            <div role="listitem">
              <AddDocumentCard onClick={onAddDocument} />
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div>
          <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden mb-4">
            <div className="divide-y divide-[#E5E5EA]">
              {sortedDocuments.map((doc) => {
                const cardDoc = mapDocumentToCard(doc)
                const colors = {
                  'Concept': 'text-purple-600',
                  'Develop': 'text-blue-600',
                  'Plan': 'text-cyan-600',
                  'Execute': 'text-emerald-600',
                  'Wrap': 'text-amber-600'
                }[cardDoc.stage] || 'text-gray-600'

                return (
                  <div
                    key={doc.id}
                    onClick={() => onDocumentClick(doc.id)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition cursor-pointer relative"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">{getDocumentIcon(doc.type)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#1D1D1F]">{doc.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span className={colors}>{cardDoc.stage}</span>
                          <span>•</span>
                          <span>{cardDoc.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{doc.progress}% complete</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {onDocumentDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDocumentDelete(doc.id)
                          }}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-100 transition"
                          title="More options"
                        >
                          ⋮
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {onAddDocument && (
            <button
              onClick={onAddDocument}
              className="w-full p-4 border-2 border-dashed border-[#D1D1D6] rounded-lg text-gray-600 font-medium hover:border-solid hover:bg-[#FAFAFA] transition"
            >
              + Add Document
            </button>
          )}
        </div>
      )}
    </div>
  )
}
