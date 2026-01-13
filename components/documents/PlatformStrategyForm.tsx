'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface PlatformStrategyFormHandle {
  getData: () => any
}

interface PlatformStrategyFormProps {
  content: any
  onChange: (content: any) => void
}

interface Platform {
  id: string
  name: string
  enabled: boolean
  objectives: string
  contentTypes: string
  postingFrequency: string
  bestPractices: string
  notes: string
}

const platformDefaults = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E1306C' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { id: 'facebook', name: 'Facebook', icon: '👍', color: '#1877F2' },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: '#FFFC00' }
]

const PlatformStrategyForm = forwardRef<PlatformStrategyFormHandle, PlatformStrategyFormProps>(
  ({ content, onChange }, ref) => {
    const [platforms, setPlatforms] = useState<Platform[]>(() => {
      if (content && Array.isArray(content.platforms)) {
        return content.platforms
      }
      // Default: Instagram, TikTok, YouTube enabled
      return platformDefaults.map(p => ({
        id: p.id,
        name: p.name,
        enabled: ['instagram', 'tiktok', 'youtube'].includes(p.id),
        objectives: '',
        contentTypes: '',
        postingFrequency: '',
        bestPractices: '',
        notes: ''
      }))
    })

    const [overallStrategy, setOverallStrategy] = useState(content?.overallStrategy || '')
    const [targetAudience, setTargetAudience] = useState(content?.targetAudience || '')
    const [brandVoice, setBrandVoice] = useState(content?.brandVoice || '')

    useImperativeHandle(ref, () => ({
      getData: () => ({ platforms, overallStrategy, targetAudience, brandVoice })
    }))

    useEffect(() => {
      onChange({ platforms, overallStrategy, targetAudience, brandVoice })
    }, [platforms, overallStrategy, targetAudience, brandVoice])

    const updatePlatform = (id: string, field: keyof Platform, value: any) => {
      setPlatforms(platforms.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const togglePlatform = (id: string) => {
      updatePlatform(id, 'enabled', !platforms.find(p => p.id === id)?.enabled)
    }

    const getPlatformIcon = (id: string) => {
      return platformDefaults.find(p => p.id === id)?.icon || '📱'
    }

    const getPlatformColor = (id: string) => {
      return platformDefaults.find(p => p.id === id)?.color || '#8EA091'
    }

    const enabledPlatforms = platforms.filter(p => p.enabled)

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="font-semibold text-[#1D1D1F] flex items-center gap-2">
            <span className="text-2xl">📱</span>
            Platform Strategy
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Define your approach for each social platform ({enabledPlatforms.length} platforms active)
          </p>
        </div>

        {/* Overall Strategy */}
        <div className="p-6 border-b border-[#E5E5EA] space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Overall Strategy
            </label>
            <textarea
              value={overallStrategy}
              onChange={(e) => setOverallStrategy(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="What are your overall social media goals and approach?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Audience
              </label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
                placeholder="Who are you trying to reach?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Voice & Tone
              </label>
              <textarea
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
                placeholder="How should your brand sound? (e.g., Professional, Casual, Humorous)"
              />
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="p-6 border-b border-[#E5E5EA] bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-3">Active Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const color = getPlatformColor(platform.id)
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                    platform.enabled
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{getPlatformIcon(platform.id)}</span>
                  <span className={`font-medium text-sm ${platform.enabled ? 'text-purple-700' : 'text-gray-600'}`}>
                    {platform.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Platform Details */}
        <div className="p-6 space-y-6">
          {enabledPlatforms.map((platform) => {
            const color = getPlatformColor(platform.id)
            return (
              <div
                key={platform.id}
                className="border-2 rounded-lg overflow-hidden"
                style={{ borderColor: color + '40' }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: color + '10' }}
                >
                  <span className="text-3xl">{getPlatformIcon(platform.id)}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg" style={{ color }}>{platform.name}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-4 bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Platform Objectives
                    </label>
                    <textarea
                      value={platform.objectives}
                      onChange={(e) => updatePlatform(platform.id, 'objectives', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="What do you want to achieve on this platform? (e.g., Brand awareness, Lead generation)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Content Types
                      </label>
                      <textarea
                        value={platform.contentTypes}
                        onChange={(e) => updatePlatform(platform.id, 'contentTypes', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        placeholder="What types of content? (e.g., Reels, Stories, Carousels)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Posting Frequency
                      </label>
                      <input
                        type="text"
                        value={platform.postingFrequency}
                        onChange={(e) => updatePlatform(platform.id, 'postingFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                        placeholder="e.g., 3x per week, Daily"
                      />
                      <label className="block text-xs font-semibold text-gray-600 mb-1 mt-3">
                        Best Practices
                      </label>
                      <textarea
                        value={platform.bestPractices}
                        onChange={(e) => updatePlatform(platform.id, 'bestPractices', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                        placeholder="Platform-specific tips and best practices..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={platform.notes}
                      onChange={(e) => updatePlatform(platform.id, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Any additional notes, links, or resources for this platform..."
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {enabledPlatforms.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <span className="text-6xl block mb-4">📱</span>
              <p className="text-gray-500 mb-2">No platforms selected</p>
              <p className="text-sm text-gray-400">Enable platforms above to define your strategy</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2 text-sm">💡 Platform Strategy Tips</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Each platform has a unique audience and content style</li>
              <li>• Repurpose content strategically rather than posting identical content everywhere</li>
              <li>• Focus on 2-3 platforms and do them well rather than spreading too thin</li>
              <li>• Track metrics specific to each platform's goals</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
)

PlatformStrategyForm.displayName = 'PlatformStrategyForm'

export default PlatformStrategyForm
