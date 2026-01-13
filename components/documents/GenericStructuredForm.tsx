'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface GenericStructuredFormHandle {
  getData: () => any
}

interface GenericStructuredFormProps {
  content: any
  onChange: (content: any) => void
  documentType: string
}

const GenericStructuredForm = forwardRef<GenericStructuredFormHandle, GenericStructuredFormProps>(
  ({ content, onChange, documentType }, ref) => {
    // Define fields based on document type
    const getFieldsForType = (type: string): { name: string; label: string; placeholder: string; type: 'text' | 'textarea' }[] => {
      // Strategy documents
      if (type.includes('strategy') || type.includes('brief')) {
        return [
          { name: 'objective', label: 'Objective', placeholder: 'What is the main goal or purpose?', type: 'textarea' },
          { name: 'audience', label: 'Target Audience', placeholder: 'Who is this for?', type: 'textarea' },
          { name: 'keyMessage', label: 'Key Message', placeholder: 'What should people remember?', type: 'textarea' },
          { name: 'deliverables', label: 'Deliverables', placeholder: 'What will be produced?', type: 'textarea' },
          { name: 'timeline', label: 'Timeline', placeholder: 'Key dates and milestones', type: 'text' },
          { name: 'budget', label: 'Budget', placeholder: 'Budget range or allocation', type: 'text' },
          { name: 'notes', label: 'Additional Notes', placeholder: 'Any other relevant information', type: 'textarea' }
        ]
      }

      // Guidelines documents
      if (type.includes('guideline') || type.includes('tone-voice')) {
        return [
          { name: 'overview', label: 'Overview', placeholder: 'Brief introduction', type: 'textarea' },
          { name: 'do', label: 'Do', placeholder: 'What to do (best practices)', type: 'textarea' },
          { name: 'dont', label: "Don't", placeholder: 'What to avoid', type: 'textarea' },
          { name: 'examples', label: 'Examples', placeholder: 'Concrete examples', type: 'textarea' },
          { name: 'references', label: 'References', placeholder: 'Links or citations', type: 'textarea' }
        ]
      }

      // Research/Analysis
      if (type.includes('research') || type.includes('analysis') || type.includes('profile')) {
        return [
          { name: 'summary', label: 'Summary', placeholder: 'Key findings overview', type: 'textarea' },
          { name: 'demographics', label: 'Demographics', placeholder: 'Age, location, income, etc.', type: 'textarea' },
          { name: 'psychographics', label: 'Psychographics', placeholder: 'Values, interests, behaviors', type: 'textarea' },
          { name: 'insights', label: 'Insights', placeholder: 'What did we learn?', type: 'textarea' },
          { name: 'opportunities', label: 'Opportunities', placeholder: 'How can we act on this?', type: 'textarea' }
        ]
      }

      // Performance/Reports
      if (type.includes('report') || type.includes('performance')) {
        return [
          { name: 'period', label: 'Reporting Period', placeholder: 'Date range', type: 'text' },
          { name: 'metrics', label: 'Key Metrics', placeholder: 'Numbers and KPIs', type: 'textarea' },
          { name: 'results', label: 'Results', placeholder: 'What happened?', type: 'textarea' },
          { name: 'insights', label: 'Insights', placeholder: 'Why did it happen?', type: 'textarea' },
          { name: 'nextSteps', label: 'Next Steps', placeholder: 'What should we do?', type: 'textarea' }
        ]
      }

      // Licensing/Rights
      if (type.includes('license') || type.includes('rights') || type.includes('usage')) {
        return [
          { name: 'asset', label: 'Asset', placeholder: 'What is being licensed?', type: 'text' },
          { name: 'licenseType', label: 'License Type', placeholder: 'Exclusive, non-exclusive, etc.', type: 'text' },
          { name: 'territories', label: 'Territories', placeholder: 'Geographic scope', type: 'text' },
          { name: 'duration', label: 'Duration', placeholder: 'Start and end dates', type: 'text' },
          { name: 'platforms', label: 'Platforms', placeholder: 'Where can it be used?', type: 'textarea' },
          { name: 'restrictions', label: 'Restrictions', placeholder: 'Any limitations?', type: 'textarea' }
        ]
      }

      // Content organization
      if (type.includes('pillar') || type.includes('metadata') || type.includes('hashtag')) {
        return [
          { name: 'primary', label: 'Primary', placeholder: 'Main content theme or tag', type: 'text' },
          { name: 'secondary', label: 'Secondary', placeholder: 'Supporting themes or tags', type: 'text' },
          { name: 'tertiary', label: 'Tertiary', placeholder: 'Additional themes or tags', type: 'text' },
          { name: 'description', label: 'Description', placeholder: 'Explain the organization', type: 'textarea' },
          { name: 'examples', label: 'Examples', placeholder: 'Sample content for each category', type: 'textarea' }
        ]
      }

      // Default generic fields
      return [
        { name: 'title', label: 'Title', placeholder: 'Document title', type: 'text' },
        { name: 'description', label: 'Description', placeholder: 'Brief description', type: 'textarea' },
        { name: 'details', label: 'Details', placeholder: 'Detailed information', type: 'textarea' },
        { name: 'notes', label: 'Notes', placeholder: 'Additional notes', type: 'textarea' }
      ]
    }

    const fields = getFieldsForType(documentType)

    const [formData, setFormData] = useState(() => {
      const initialData: Record<string, string> = {}
      fields.forEach(field => {
        initialData[field.name] = (content && content[field.name]) || ''
      })
      return initialData
    })

    useImperativeHandle(ref, () => ({
      getData: () => formData
    }))

    useEffect(() => {
      onChange(formData)
    }, [formData])

    const updateField = (fieldName: string, value: string) => {
      setFormData({ ...formData, [fieldName]: value })
    }

    const getTitle = () => {
      return documentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <h2 className="font-semibold text-[#1D1D1F]">{getTitle()}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete the fields below to build your {getTitle().toLowerCase()}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2 text-sm">💡 Tips</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Be specific and concise in your answers</li>
              <li>• Use bullet points for lists</li>
              <li>• Include measurable goals when possible</li>
              <li>• Reference any supporting documents or resources</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
)

GenericStructuredForm.displayName = 'GenericStructuredForm'

export default GenericStructuredForm
