'use client'

import { useState } from 'react'
import DocumentGrid, { GridDocument } from '@/components/DocumentGrid'
import StageSelector from '@/components/StageSelector'

export default function TestCardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const [activeStage, setActiveStage] = useState<string | null>(null)

  // Sample documents in GridDocument format (API format)
  const sampleDocuments: GridDocument[] = [
    {
      id: '1',
      title: 'Summer Campaign Brief',
      type: 'Brief',
      stage: 'concept',
      status: 'draft',
      progress: 25,
      metadata: {},
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
      id: '2',
      title: 'Product Launch Script',
      type: 'Script',
      stage: 'develop',
      status: 'in-progress',
      progress: 60,
      metadata: {},
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
      id: '3',
      title: 'Q4 Production Budget',
      type: 'Budget',
      stage: 'plan',
      status: 'review',
      progress: 85,
      metadata: {},
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
    },
    {
      id: '4',
      title: 'Hero Character DNA',
      type: 'Character DNA',
      stage: 'execute',
      status: 'approved',
      progress: 100,
      metadata: {},
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 1 week ago
    },
    {
      id: '5',
      title: 'Location Shot List',
      type: 'Shot List',
      stage: 'execute',
      status: 'in-progress',
      progress: 45,
      metadata: {},
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: '6',
      title: 'Spring Campaign Wrap Report',
      type: 'Campaign Strategy',
      stage: 'wrap',
      status: 'approved',
      progress: 100,
      metadata: {},
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() // 45 days ago
    }
  ]

  const handleDocumentClick = (id: string) => {
    console.log('Clicked document:', id)
  }

  const handleAddDocument = () => {
    console.log('Add document clicked')
    alert('Document type selector would open here')
  }

  const handleDocumentSelect = (stage: string, type: string) => {
    console.log(`Selected: ${type} in ${stage} stage`)
    alert(`Creating ${type} document in ${stage} stage`)
    setActiveStage(stage)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1D1D1F] mb-2">Component Test Page</h1>
          <p className="text-gray-600 mb-4">Testing StageSelector and DocumentGrid components</p>

          {/* State controls */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Toggle Loading: {isLoading ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowEmpty(!showEmpty)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Toggle Empty: {showEmpty ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* StageSelector Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">StageSelector</h2>
          <StageSelector
            stages={[
              { id: 'concept', name: 'Concept', color: '#9333ea', emoji: '💡', documents: [] },
              { id: 'develop', name: 'Develop', color: '#3b82f6', emoji: '✏️', documents: [] },
              { id: 'plan', name: 'Plan', color: '#10b981', emoji: '📋', documents: [] },
              { id: 'execute', name: 'Execute', color: '#f59e0b', emoji: '🎬', documents: [] },
              { id: 'deliver', name: 'Deliver', color: '#ef4444', emoji: '✅', documents: [] }
            ]}
            onDocumentSelect={handleDocumentSelect}
            activeStage={activeStage}
          />
        </div>

        {/* DocumentGrid Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">DocumentGrid</h2>
          <DocumentGrid
            documents={showEmpty ? [] : sampleDocuments}
            onDocumentClick={handleDocumentClick}
            onAddDocument={handleAddDocument}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-12 p-6 bg-white border border-[#E5E5EA] rounded-lg">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">Stage Color System</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { stage: 'Concept', color: 'purple', desc: 'Initial ideation' },
              { stage: 'Develop', color: 'blue', desc: 'Content creation' },
              { stage: 'Plan', color: 'cyan', desc: 'Production planning' },
              { stage: 'Execute', color: 'emerald', desc: 'Active production' },
              { stage: 'Wrap', color: 'amber', desc: 'Completion & review' }
            ].map(({ stage, color, desc }) => (
              <div key={stage} className="text-center">
                <div className={`w-12 h-12 rounded-lg bg-${color}-100 border border-${color}-200 mx-auto mb-2`} />
                <p className={`text-${color}-600 font-semibold`}>{stage}</p>
                <p className="text-gray-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-6 bg-white border border-[#E5E5EA] rounded-lg">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">Status Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { status: 'Draft', icon: '○', desc: 'Initial draft', color: 'text-gray-600' },
              { status: 'In Progress', icon: '◐', desc: 'Active work', color: 'text-blue-600' },
              { status: 'Review', icon: '◕', desc: 'Under review', color: 'text-purple-600' },
              { status: 'Final', icon: '●', desc: 'Completed', color: 'text-emerald-600' },
              { status: 'Archived', icon: '◎', desc: 'Archived', color: 'text-amber-600' }
            ].map(({ status, icon, desc, color }) => (
              <div key={status} className="text-center">
                <div className={`text-3xl ${color} mb-2`}>{icon}</div>
                <p className="text-[#1D1D1F] font-semibold text-sm">{status}</p>
                <p className="text-gray-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
