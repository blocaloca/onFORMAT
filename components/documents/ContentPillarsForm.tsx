'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface ContentPillarsFormHandle {
  getData: () => any
}

interface ContentPillarsFormProps {
  content: any
  onChange: (content: any) => void
}

interface Pillar {
  id: string
  name: string
  description: string
  themes: string
  contentIdeas: string
  examples: string
}

const ContentPillarsForm = forwardRef<ContentPillarsFormHandle, ContentPillarsFormProps>(
  ({ content, onChange }, ref) => {
    const [pillars, setPillars] = useState<Pillar[]>(() => {
      if (content && Array.isArray(content.pillars)) {
        return content.pillars
      }
      // Default 3 pillars
      return [
        { id: '1', name: 'Pillar 1', description: '', themes: '', contentIdeas: '', examples: '' },
        { id: '2', name: 'Pillar 2', description: '', themes: '', contentIdeas: '', examples: '' },
        { id: '3', name: 'Pillar 3', description: '', themes: '', contentIdeas: '', examples: '' }
      ]
    })

    const [overview, setOverview] = useState(content?.overview || '')

    useImperativeHandle(ref, () => ({
      getData: () => ({ pillars, overview })
    }))

    useEffect(() => {
      onChange({ pillars, overview })
    }, [pillars, overview])

    const updatePillar = (id: string, field: keyof Pillar, value: string) => {
      setPillars(pillars.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const addPillar = () => {
      const newId = String(pillars.length + 1)
      setPillars([...pillars, {
        id: newId,
        name: `Pillar ${newId}`,
        description: '',
        themes: '',
        contentIdeas: '',
        examples: ''
      }])
    }

    const removePillar = (id: string) => {
      if (pillars.length > 1) {
        setPillars(pillars.filter(p => p.id !== id))
      }
    }

    const pillarColors = ['#8EA091', '#8B7FA8', '#B47864', '#7A94A8', '#A8956D', '#D1758B']

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="font-semibold text-[#1D1D1F] flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Content Pillars
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Define your core content themes and strategy
          </p>
        </div>

        {/* Overview */}
        <div className="p-6 border-b border-[#E5E5EA] bg-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content Strategy Overview
          </label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            placeholder="Describe your overall content strategy, target audience, and goals..."
          />
        </div>

        {/* Pillars */}
        <div className="p-6 space-y-6">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              className="border-2 rounded-lg overflow-hidden"
              style={{ borderColor: pillarColors[index % pillarColors.length] }}
            >
              {/* Pillar Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: `${pillarColors[index % pillarColors.length]}15` }}
              >
                <input
                  type="text"
                  value={pillar.name}
                  onChange={(e) => updatePillar(pillar.id, 'name', e.target.value)}
                  className="text-lg font-bold bg-transparent border-none outline-none flex-1"
                  style={{ color: pillarColors[index % pillarColors.length] }}
                  placeholder={`Pillar ${index + 1} Name`}
                />
                {pillars.length > 1 && (
                  <button
                    onClick={() => removePillar(pillar.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Pillar Fields */}
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={pillar.description}
                    onChange={(e) => updatePillar(pillar.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                    placeholder="What is this pillar about? What value does it provide?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Key Themes & Topics
                  </label>
                  <textarea
                    value={pillar.themes}
                    onChange={(e) => updatePillar(pillar.id, 'themes', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                    placeholder="List the main themes, topics, or categories (e.g., Education, Inspiration, Behind-the-scenes)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Content Ideas
                  </label>
                  <textarea
                    value={pillar.contentIdeas}
                    onChange={(e) => updatePillar(pillar.id, 'contentIdeas', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    placeholder="Brainstorm specific content ideas for this pillar..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Examples & References
                  </label>
                  <textarea
                    value={pillar.examples}
                    onChange={(e) => updatePillar(pillar.id, 'examples', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                    placeholder="Links to examples, competitor content, or inspiration..."
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addPillar}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition font-semibold"
          >
            + Add Another Pillar
          </button>
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">💡 Content Pillar Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Aim for 3-5 core pillars that align with your brand</li>
              <li>• Each pillar should serve a distinct purpose for your audience</li>
              <li>• Balance educational, entertaining, and promotional content</li>
              <li>• Use pillars to maintain consistency in your content calendar</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
)

ContentPillarsForm.displayName = 'ContentPillarsForm'

export default ContentPillarsForm
