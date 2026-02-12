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
export default function DocumentGrid({ documents, onDocumentClick, onDocumentDelete, onAddDocument, isLoading, viewMode = 'grid', searchTerm }: DocumentGridProps) {
  // Sort documents by updated_at (newest first)
  const sortedDocuments = [...documents].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-sm p-4 animate-pulse h-[180px] border border-zinc-800">
              <div className="h-5 bg-zinc-800 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-8"></div>
              <div className="flex justify-between mt-auto pt-8">
                <div className="h-3 bg-zinc-800 rounded w-16"></div>
                <div className="h-3 bg-zinc-800 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (documents.length === 0) {
    if (searchTerm) {
      return (
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="bg-zinc-900/30 rounded-sm p-12 border border-zinc-800 text-center">
            <div className="text-5xl mb-4 opacity-50">🔍</div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-2">
              No documents found for "{searchTerm}"
            </h3>
            <p className="text-xs text-zinc-500 font-mono">
              // Try a different query
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-dashed border-zinc-800 rounded-sm bg-zinc-900/10">
          <div className="text-zinc-700 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-2">No Documents Initialized</h2>
          <p className="text-xs text-zinc-500 font-mono mb-6">Select a stage to begin operations</p>
          {onAddDocument && (
            <button
              onClick={onAddDocument}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm border border-zinc-700 transition-all"
            >
              Initialize Document
            </button>
          )}
        </div>
      </div>
    )
  }

  // Grid with documents
  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {viewMode === 'grid' ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
          {/* Add Document Card (Industrial) */}
          {onAddDocument && (
            <div
              onClick={onAddDocument}
              className="group bg-zinc-900/30 border border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/80 rounded-sm p-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-full border border-zinc-700 group-hover:border-emerald-500 group-hover:bg-emerald-500/10 flex items-center justify-center mb-3 transition-colors text-zinc-500 group-hover:text-emerald-500">
                <span className="text-xl font-light">+</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-emerald-400 transition-colors">Add Document</p>
            </div>
          )}
        </div>
      ) : (
        /* List View (Industrial) */
        <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950">
          <div className="divide-y divide-zinc-900">
            {sortedDocuments.map((doc) => {
              const cardDoc = mapDocumentToCard(doc)
              const colors = {
                'Concept': 'text-purple-400',
                'Develop': 'text-blue-400',
                'Plan': 'text-cyan-400',
                'Execute': 'text-emerald-400',
                'Wrap': 'text-amber-400'
              }[cardDoc.stage] || 'text-zinc-400'

              return (
                <div
                  key={doc.id}
                  onClick={() => onDocumentClick(doc.id)}
                  className="flex items-center justify-between p-4 hover:bg-zinc-900 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <span className="text-2xl opacity-70 grayscale group-hover:grayscale-0 transition-all">{getDocumentIcon(doc.type)}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">{doc.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-zinc-500 mt-1">
                        <span className="tracking-wider">{doc.type}</span>
                        <span className="text-zinc-700">//</span>
                        <span className={`${colors} tracking-wider`}>{cardDoc.stage}</span>
                        <span className="text-zinc-700">//</span>
                        <span className={cardDoc.status === 'Final' ? 'text-emerald-500' : 'text-zinc-500'}>{cardDoc.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-zinc-500">{doc.progress}% <span className="text-zinc-700">|</span> <span className={doc.progress === 100 ? 'text-emerald-500' : 'text-zinc-400'}>COMPLETED</span></p>
                      <p className="text-[9px] font-mono text-zinc-600 uppercase">
                        Updated {new Date(doc.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    {onDocumentDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDocumentDelete(doc.id)
                        }}
                        className="text-zinc-600 hover:text-white p-2 hover:bg-zinc-800 rounded-sm transition"
                        title="Delete"
                      >
                        ⋮
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {onAddDocument && (
            <button
              onClick={onAddDocument}
              className="w-full p-4 border-t border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              <span>+ Add New Entry</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
