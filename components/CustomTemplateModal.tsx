'use client'

import { useState } from 'react'
import { getAllTemplates } from '@/lib/project-templates'

interface CustomTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: any) => void
}

export default function CustomTemplateModal({ isOpen, onClose, onSave }: CustomTemplateModalProps) {
  const [step, setStep] = useState(1)
  const [templateName, setTemplateName] = useState('')
  const [templateIcon, setTemplateIcon] = useState('📸')
  const [templateDescription, setTemplateDescription] = useState('')
  const [copyFromTemplate, setCopyFromTemplate] = useState<string | null>(null)
  const [stages, setStages] = useState<any[]>([])
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null)
  const [showStageEditor, setShowStageEditor] = useState(false)

  // Phase 1 Cleanup: All templates are now unlocked
  const existingTemplates = getAllTemplates()

  // All available document types
  const allDocumentTypes = [
    { type: 'brief', label: 'Brief', icon: '📋' },
    { type: 'mood-board', label: 'Mood Board', icon: '🖼️' },
    { type: 'shot-book', label: 'Shot Book', icon: '📸' },
    { type: 'art-book', label: 'Art Book', icon: '🎨' },
    { type: 'budget', label: 'Budget', icon: '💰' },
    { type: 'call-sheet', label: 'Call Sheet', icon: '📋' },
    { type: 'script', label: 'Script', icon: '📝' },
    { type: 'storyboard', label: 'Storyboard', icon: '🎬' },
    { type: 'shot-list', label: 'Shot List', icon: '📷' },
    { type: 'schedule', label: 'Schedule', icon: '📅' },
    { type: 'crew-list', label: 'Crew List', icon: '👥' },
    { type: 'casting', label: 'Casting', icon: '👤' },
    { type: 'platform-strategy', label: 'Platform Strategy', icon: '📱' },
    { type: 'content-calendar', label: 'Content Calendar', icon: '📅' },
    { type: 'brand-guidelines', label: 'Brand Guidelines', icon: '📖' }
  ]

  if (!isOpen) return null

  const handleCopyTemplate = () => {
    if (copyFromTemplate) {
      const template = existingTemplates.find(t => t.id === copyFromTemplate)
      if (template) {
        setStages(JSON.parse(JSON.stringify(template.stages))) // Deep copy
      }
    }
    setStep(3)
  }

  const handleStartFromScratch = () => {
    setStages([
      {
        id: 'stage-1',
        name: 'Stage 1',
        color: '#8EA091',
        emoji: '🌱',
        documents: []
      }
    ])
    setStep(3)
  }

  const addStage = () => {
    setStages([...stages, {
      id: `stage-${stages.length + 1}`,
      name: `Stage ${stages.length + 1}`,
      color: '#8EA091',
      emoji: '📊',
      documents: []
    }])
  }

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const customTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      icon: templateIcon,
      description: templateDescription,
      principalCreator: 'Custom',
      tier: 'free',
      stages: stages,
      isCustom: true
    }
    onSave(customTemplate)
    onClose()
  }

  const emojiOptions = ['📸', '🎬', '🎨', '🎵', '📱', '🎪', '📻', '🖼️', '🎥', '📺', '🎞️', '📷', '🎯', '💡', '🚀', '⚡']

  const updateStageDocuments = (documents: any[]) => {
    if (editingStageIndex === null) return
    const newStages = [...stages]
    newStages[editingStageIndex].documents = documents
    setStages(newStages)
  }

  const updateStageName = (name: string) => {
    if (editingStageIndex === null) return
    const newStages = [...stages]
    newStages[editingStageIndex].name = name
    setStages(newStages)
  }

  const updateStageColor = (color: string) => {
    if (editingStageIndex === null) return
    const newStages = [...stages]
    newStages[editingStageIndex].color = color
    setStages(newStages)
  }

  const updateStageEmoji = (emoji: string) => {
    if (editingStageIndex === null) return
    const newStages = [...stages]
    newStages[editingStageIndex].emoji = emoji
    setStages(newStages)
  }

  const toggleDocument = (docType: any) => {
    if (editingStageIndex === null) return
    const currentStage = stages[editingStageIndex]
    const existingDoc = currentStage.documents.find((d: any) => d.type === docType.type)

    if (existingDoc) {
      // Remove document
      updateStageDocuments(currentStage.documents.filter((d: any) => d.type !== docType.type))
    } else {
      // Add document
      updateStageDocuments([...currentStage.documents, docType])
    }
  }

  const stageColors = [
    { color: '#8EA091', label: 'Green' },
    { color: '#8B7FA8', label: 'Purple' },
    { color: '#B47864', label: 'Brown' },
    { color: '#7A94A8', label: 'Blue' },
    { color: '#A8956D', label: 'Gold' },
    { color: '#D1758B', label: 'Pink' },
    { color: '#6B9080', label: 'Teal' },
    { color: '#9C89B8', label: 'Lavender' }
  ]

  const stageEmojis = ['🌱', '📊', '💡', '🎬', '✓', '🚀', '⚡', '🎯', '📋', '🎨', '💰', '📸', '🎥', '📱', '🎪', '📻']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Stage Editor Modal */}
      {showStageEditor && editingStageIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E5E5EA] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1D1D1F]">Edit Stage</h3>
              <button
                onClick={() => setShowStageEditor(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stage Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stage Name
                </label>
                <input
                  type="text"
                  value={stages[editingStageIndex].name}
                  onChange={(e) => updateStageName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1D1D1F]"
                  placeholder="e.g., Pre-Production"
                />
              </div>

              {/* Stage Emoji */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stage Icon
                </label>
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{stages[editingStageIndex].emoji}</div>
                  <div className="flex-1">
                    <div className="grid grid-cols-8 gap-2">
                      {stageEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => updateStageEmoji(emoji)}
                          className={`text-3xl p-2 rounded-lg hover:bg-purple-50 transition ${
                            stages[editingStageIndex].emoji === emoji ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-gray-50'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stage Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {stageColors.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      onClick={() => updateStageColor(colorOption.color)}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg transition ${
                        stages[editingStageIndex].color === colorOption.color
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: colorOption.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{colorOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Documents ({stages[editingStageIndex].documents.length} selected)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Select which documents should be available in this stage
                </p>
                <div className="border border-[#E5E5EA] rounded-lg max-h-[300px] overflow-y-auto">
                  {allDocumentTypes.map((docType) => {
                    const isSelected = stages[editingStageIndex].documents.some(
                      (d: any) => d.type === docType.type
                    )
                    return (
                      <label
                        key={docType.type}
                        className={`flex items-center gap-3 p-3 border-b border-[#E5E5EA] last:border-b-0 cursor-pointer transition ${
                          isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDocument(docType)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-2xl">{docType.icon}</span>
                        <span className="font-medium text-[#1D1D1F]">{docType.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E5E5EA] px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowStageEditor(false)}
                className="px-6 py-3 border border-[#E5E5EA] rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowStageEditor(false)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5EA] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1D1D1F]">Create Custom Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span>Basic Info</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span>Start From</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span>Stages</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Wedding Photography"
                  className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon
                </label>
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{templateIcon}</div>
                  <div className="flex-1">
                    <div className="grid grid-cols-8 gap-2">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setTemplateIcon(emoji)}
                          className={`text-3xl p-2 rounded-lg hover:bg-purple-50 transition ${
                            templateIcon === emoji ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-gray-50'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="e.g., Complete wedding day coverage from prep to reception"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1D1D1F]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-[#E5E5EA] rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!templateName.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Copy or Start Fresh */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">
                  Start with existing template? (Optional)
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition">
                    <input
                      type="radio"
                      name="startMethod"
                      checked={copyFromTemplate === null}
                      onChange={() => setCopyFromTemplate(null)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1D1D1F]">Start from scratch</p>
                      <p className="text-sm text-gray-600">Build your workflow step by step</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition">
                    <input
                      type="radio"
                      name="startMethod"
                      checked={copyFromTemplate !== null}
                      onChange={() => setCopyFromTemplate(existingTemplates[0]?.id || null)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1D1D1F] mb-2">Copy from existing template</p>
                      {copyFromTemplate !== null && (
                        <select
                          value={copyFromTemplate || ''}
                          onChange={(e) => setCopyFromTemplate(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {existingTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.icon} {template.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        This will copy all stages and documents
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-[#E5E5EA] rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={copyFromTemplate ? handleCopyTemplate : handleStartFromScratch}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Customize Stages */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1D1D1F]">
                  Stages ({stages.length})
                </h3>
                <button
                  onClick={addStage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                >
                  + Add Stage
                </button>
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div key={index} className="bg-gray-50 border border-[#E5E5EA] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{stage.emoji}</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={stage.name}
                            onChange={(e) => {
                              const newStages = [...stages]
                              newStages[index].name = e.target.value
                              setStages(newStages)
                            }}
                            className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg font-semibold text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Documents ({stage.documents.length}): {stage.documents.map((d: any) => d.label).join(', ') || 'None yet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingStageIndex(index)
                            setShowStageEditor(true)
                          }}
                          className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded transition"
                        >
                          Edit
                        </button>
                        {stages.length > 1 && (
                          <button
                            onClick={() => removeStage(index)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-[#E5E5EA] rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Save Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
