'use client'

import React, { useState } from 'react'

export type DocumentStage = 'Concept' | 'Develop' | 'Plan' | 'Execute' | 'Wrap'
export type DocumentType = 'Brief' | 'Script' | 'Budget' | 'Shot List' | 'Schedule' | 'Character DNA' | 'Asset List' | 'Campaign Strategy' | 'Creative Direction'
export type DocumentStatus = 'Draft' | 'In Progress' | 'Review' | 'Final' | 'Archived'

export interface Document {
  id: string
  title: string
  type: DocumentType
  stage: DocumentStage
  status: DocumentStatus
  progress: number // 0-100
  lastEdited: Date
}

interface DocumentCardProps {
  document: Document
  onClick?: () => void
  onDelete?: (id: string) => void
}

const stageColors: Record<DocumentStage, { bg: string; border: string; text: string; glow: string; badgeBg: string }> = {
  Concept: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    glow: 'shadow-purple-100',
    badgeBg: 'bg-purple-100'
  },
  Develop: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    glow: 'shadow-blue-100',
    badgeBg: 'bg-blue-100'
  },
  Plan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    glow: 'shadow-cyan-100',
    badgeBg: 'bg-cyan-100'
  },
  Execute: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    glow: 'shadow-emerald-100',
    badgeBg: 'bg-emerald-100'
  },
  Wrap: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    glow: 'shadow-amber-100',
    badgeBg: 'bg-amber-100'
  }
}

const statusIcons: Record<DocumentStatus, string> = {
  Draft: '○',
  'In Progress': '◐',
  Review: '◕',
  Final: '●',
  Archived: '◎'
}

export default function DocumentCard({ document, onClick, onDelete }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const colors = stageColors[document.stage]
  const statusIcon = statusIcons[document.status]

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(document.id)
    }
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  return (
    <div>
      <div
        onClick={onClick}
        className={`
          bg-white border-[#E5E5EA]
          border rounded-lg p-4 cursor-pointer
          transition-all duration-200
          hover:scale-105 hover:shadow-lg
          relative
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="text-[#1D1D1F] font-semibold text-lg mb-1 leading-tight">
              {document.title}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {document.type}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`${colors.text} text-2xl`}>
              {statusIcon}
            </div>

            {/* Menu Button */}
            {onDelete && (
              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
                  title="More options"
                >
                  ⋮
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-[#E5E5EA] rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Progress</span>
            <span className={colors.text}>{document.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.text.replace('text-', 'bg-')} transition-all duration-300`}
              style={{ width: `${document.progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className={`${colors.text} font-medium px-2 py-1 rounded ${colors.badgeBg} border ${colors.border}`}>
            {document.stage}
          </span>
          <span className="text-gray-400">
            {formatDate(document.lastEdited)}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">
              Delete {document.title}?
            </h2>
            <p className="text-gray-600 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 border border-[#E5E5EA] text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
