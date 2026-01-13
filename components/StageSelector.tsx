'use client'

import { useState, useRef, useEffect } from 'react'
import { TemplateStage } from '@/lib/project-templates'

interface StageSelectorProps {
  stages: TemplateStage[]
  onDocumentSelect: (stage: string, type: string) => void
  activeStage?: string | null
}

export default function StageSelector({ stages, onDocumentSelect, activeStage }: StageSelectorProps) {
  const [openStage, setOpenStage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenStage(null)
      }
    }

    if (openStage) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openStage])

  // Keyboard handler
  const handleKeyDown = (event: React.KeyboardEvent, stage: string) => {
    if (event.key === 'Escape') {
      setOpenStage(null)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleStage(stage)
    }
  }

  const toggleStage = (stage: string) => {
    setOpenStage(openStage === stage ? null : stage)
  }

  const handleDocumentSelect = (stage: string, type: string) => {
    onDocumentSelect(stage, type)
    setOpenStage(null)
  }

  return (
    <div ref={containerRef} className="w-full max-w-[1200px] mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-3">
        {stages.map((stage) => {
          const isOpen = openStage === stage.id
          const isActive = activeStage === stage.id

          return (
            <div key={stage.id} className="relative flex-1 min-w-[140px]">
              <button
                onClick={() => toggleStage(stage.id)}
                onKeyDown={(e) => handleKeyDown(e, stage.id)}
                className={`
                  w-full h-12 px-4 rounded-lg
                  border transition-all duration-150
                  flex items-center justify-between gap-2
                  font-semibold text-[15px]
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    isOpen
                      ? 'border-opacity-30 shadow-sm'
                      : 'border-[#E5E5EA] bg-white hover:bg-[#F9F9F9]'
                  }
                `}
                style={
                  isOpen
                    ? {
                        backgroundColor: `${stage.color}0D`, // 5% opacity
                        borderColor: `${stage.color}4D`, // 30% opacity
                      }
                    : {}
                }
              >
                <span className="flex items-center gap-2">
                  <span>{stage.emoji}</span>
                  <span className="text-[#1D1D1F]">{stage.name}</span>
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div
                  className={`
                    absolute top-full left-0 mt-2 w-full md:min-w-[200px]
                    bg-white border border-[#E5E5EA] rounded-lg
                    shadow-lg z-50 p-2
                    animate-in fade-in slide-in-from-top-2 duration-200
                  `}
                >
                  {stage.documents.map((doc) => (
                    <button
                      key={doc.type}
                      onClick={() => handleDocumentSelect(stage.id, doc.type)}
                      className={`
                        w-full h-10 px-3 rounded-md
                        flex items-center gap-2
                        text-[14px] font-medium text-[#1D1D1F]
                        transition-colors duration-150
                        hover:bg-[#F9F9F9]
                        focus:outline-none focus:bg-[#F9F9F9]
                      `}
                      style={{
                        '--active-bg': `${stage.color}0D` // 5% opacity for active state
                      } as React.CSSProperties}
                    >
                      <span className="text-lg">{doc.icon}</span>
                      <span>{doc.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
