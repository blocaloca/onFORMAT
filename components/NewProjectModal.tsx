'use client'

import { useState, useEffect } from 'react'
import { getAllTemplates } from '@/lib/project-templates'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (projectName: string, templateId: string, color: string) => void
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
  const [selectedColor, setSelectedColor] = useState('#3B82F6') // Default Digital Blue

  const builtInTemplates = getAllTemplates()
  const allTemplates = [...customTemplates, ...builtInTemplates]

  useEffect(() => {
    if (isOpen) {
      setProjectName('')
      setSelectedTemplate('')
      setSelectedColor('#3B82F6')
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
    onCreate(projectName, selectedTemplate, selectedColor)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
            <h2 className="text-xs font-black uppercase text-white tracking-[0.2em]">New Operation</h2>
          </div>
          <div className="text-[10px] font-mono text-zinc-600">PN-{Math.floor(Math.random() * 1000)}</div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
              Project Name / Codename
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="ENTER PROJECT IDENTIFIER..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-sm text-sm font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-all uppercase tracking-wide"
              autoFocus
            />
          </div>

          {/* Project Color */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
              System Color
            </label>
            <div className="flex gap-3">
              {[
                { name: 'Digital Blue', value: '#3B82F6', bg: 'bg-blue-500' },
                { name: 'Sun Yellow', value: '#FBBF24', bg: 'bg-amber-400' },
                { name: 'Signal Green', value: '#22C55E', bg: 'bg-emerald-500' },
                { name: 'Soft Lavender', value: '#A855F7', bg: 'bg-purple-500' },
                { name: 'Machined Silver', value: '#71717A', bg: 'bg-zinc-500' },
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full ${color.bg} transition-all ${selectedColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'opacity-50 hover:opacity-100'}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
              Select Framework
            </label>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-sm text-xs font-bold text-zinc-300 focus:outline-none focus:border-emerald-500 focus:text-white appearance-none uppercase tracking-wide"
              >
                <option value="">Select Template...</option>

                {/* Custom Templates */}
                {customTemplates.length > 0 && (
                  <optgroup label="MY TEMPLATES">
                    {customTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Built-in Templates */}
                <optgroup label="SYSTEM TEMPLATES">
                  {builtInTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              {/* Custom Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-zinc-600" />
            </div>
          </div>

          {/* Hint */}
          <div className="pt-2 border-t border-zinc-900">
            <p className="text-[10px] font-mono text-zinc-600 uppercase">
              // Initializing project structure...
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            Abort
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-500 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}
