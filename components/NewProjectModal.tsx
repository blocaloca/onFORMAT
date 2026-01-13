'use client'

import { useState, useEffect } from 'react'
import { getAllTemplates } from '@/lib/project-templates'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (projectName: string, templateId: string) => void
  onBrowseTemplates: () => void
  customTemplates: any[]
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreate,
  onBrowseTemplates,
  customTemplates
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const builtInTemplates = getAllTemplates()
  const allTemplates = [...customTemplates, ...builtInTemplates]

  useEffect(() => {
    if (isOpen) {
      setProjectName('')
      setSelectedTemplate('')
    }
  }, [isOpen])

  const handleCreate = () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }
    if (!selectedTemplate) {
      alert('Please select a template')
      return
    }
    onCreate(projectName, selectedTemplate)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E5EA]">
          <h2 className="text-2xl font-bold text-[#1D1D1F]">Create New Project</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Summer Campaign 2025"
              className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1D1D1F]"
              autoFocus
            />
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
              Choose Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1D1D1F] bg-white"
            >
              <option value="">Select a template...</option>

              {/* Custom Templates */}
              {customTemplates.length > 0 && (
                <optgroup label="My Custom Templates">
                  {customTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.icon} {template.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Built-in Templates */}
              <optgroup label="Built-in Templates">
                {builtInTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.icon} {template.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Hint */}
          <div className="pt-2">
            <p className="text-sm text-gray-500">
              Scroll down to see all available templates on the dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5E5EA] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[#E5E5EA] text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}
