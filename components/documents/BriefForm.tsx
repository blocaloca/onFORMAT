'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface BriefData {
  projectObjective: string
  targetAudience: string
  keyMessages: string
  toneAndStyle: string
  visualDirection: string
  brandGuidelines: string
  deliverables: string
  budgetRange: string
  timeline: string
  stakeholders: string
  successMetrics: string
  constraints: string
  additionalNotes: string
}

interface BriefFormProps {
  content: any
  onChange: (content: BriefData) => void
}

export interface BriefFormHandle {
  setBriefData: (data: Partial<BriefData>) => void
}

const BriefForm = forwardRef<BriefFormHandle, BriefFormProps>(({ content, onChange }, ref) => {
  const [briefData, setBriefData] = useState<BriefData>(() => {
    if (content && content.projectObjective !== undefined) {
      return content
    }
    return {
      projectObjective: '',
      targetAudience: '',
      keyMessages: '',
      toneAndStyle: '',
      visualDirection: '',
      brandGuidelines: '',
      deliverables: '',
      budgetRange: '',
      timeline: '',
      stakeholders: '',
      successMetrics: '',
      constraints: '',
      additionalNotes: ''
    }
  })

  useEffect(() => {
    console.log('📋 BriefForm useEffect triggered')
    console.log('Current brief data:', JSON.stringify(briefData, null, 2))
    onChange(briefData)
    console.log('✅ Called onChange - parent should receive this data')
  }, [briefData])

  useImperativeHandle(ref, () => ({
    setBriefData: (data: Partial<BriefData>) => {
      console.log('📋 BriefForm.setBriefData called with:', data)
      setBriefData(prev => ({ ...prev, ...data }))
    }
  }))

  const updateField = (field: keyof BriefData, value: string) => {
    setBriefData({ ...briefData, [field]: value })
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
        <h2 className="font-semibold text-[#1D1D1F]">Creative Brief</h2>
        <p className="text-xs text-gray-500 mt-1">
          Define the project objectives, audience, and key requirements
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Objective */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Project Objective
          </label>
          <textarea
            value={briefData.projectObjective}
            onChange={(e) => updateField('projectObjective', e.target.value)}
            placeholder="What is the goal of this project? What problem are we solving?"
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={4}
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Target Audience
          </label>
          <textarea
            value={briefData.targetAudience}
            onChange={(e) => updateField('targetAudience', e.target.value)}
            placeholder="Who is this project for? Demographics, psychographics, behavior..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={3}
          />
        </div>

        {/* Key Messages */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Key Messages
          </label>
          <textarea
            value={briefData.keyMessages}
            onChange={(e) => updateField('keyMessages', e.target.value)}
            placeholder="What are the main messages we want to communicate?"
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={3}
          />
        </div>

        {/* Deliverables */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Deliverables
          </label>
          <textarea
            value={briefData.deliverables}
            onChange={(e) => updateField('deliverables', e.target.value)}
            placeholder="List all required deliverables (e.g., 50 retouched images, 5 hero shots, social media cutdowns...)"
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={4}
          />
        </div>

        {/* Tone and Style */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Tone & Style
          </label>
          <textarea
            value={briefData.toneAndStyle}
            onChange={(e) => updateField('toneAndStyle', e.target.value)}
            placeholder="Describe the desired tone and style (e.g., professional, playful, luxurious, authentic...)"
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={2}
          />
        </div>

        {/* Visual Direction */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Visual Direction
          </label>
          <textarea
            value={briefData.visualDirection}
            onChange={(e) => updateField('visualDirection', e.target.value)}
            placeholder="Visual style, color palette, mood, references, cinematography notes..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={3}
          />
        </div>

        {/* Brand Guidelines */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Brand Guidelines
          </label>
          <textarea
            value={briefData.brandGuidelines}
            onChange={(e) => updateField('brandGuidelines', e.target.value)}
            placeholder="Brand colors, fonts, logo usage, dos and don'ts..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={2}
          />
        </div>

        {/* Budget Range and Timeline - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
              Budget Range
            </label>
            <input
              type="text"
              value={briefData.budgetRange}
              onChange={(e) => updateField('budgetRange', e.target.value)}
              placeholder="e.g., $10,000 - $15,000"
              className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[#1D1D1F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
              Timeline
            </label>
            <input
              type="text"
              value={briefData.timeline}
              onChange={(e) => updateField('timeline', e.target.value)}
              placeholder="e.g., 4 weeks, Due March 15"
              className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[#1D1D1F]"
            />
          </div>
        </div>

        {/* Stakeholders */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Stakeholders & Approvals
          </label>
          <textarea
            value={briefData.stakeholders}
            onChange={(e) => updateField('stakeholders', e.target.value)}
            placeholder="Who needs to approve this? Key decision makers, contacts..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={2}
          />
        </div>

        {/* Success Metrics */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Success Metrics
          </label>
          <textarea
            value={briefData.successMetrics}
            onChange={(e) => updateField('successMetrics', e.target.value)}
            placeholder="How will we measure success? KPIs, goals, metrics..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={2}
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Constraints & Limitations
          </label>
          <textarea
            value={briefData.constraints}
            onChange={(e) => updateField('constraints', e.target.value)}
            placeholder="Technical limitations, legal restrictions, timing constraints..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={2}
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
            Additional Notes
          </label>
          <textarea
            value={briefData.additionalNotes}
            onChange={(e) => updateField('additionalNotes', e.target.value)}
            placeholder="Any other important information or considerations..."
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-[#1D1D1F]"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
})

BriefForm.displayName = 'BriefForm'

export default BriefForm
