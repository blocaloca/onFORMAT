'use client'

import { useEffect, useState } from 'react'

interface APIStatus {
  openai: 'online' | 'offline' | 'checking'
  anthropic: 'online' | 'offline' | 'checking'
  openaiTime?: number
  anthropicTime?: number
  openaiError?: string
  anthropicError?: string
}

export default function AIProviderStatus() {
  const [activeProvider, setActiveProvider] = useState<'openai' | 'anthropic'>('openai')
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    openai: 'checking',
    anthropic: 'checking'
  })
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved preference
    const savedProvider = localStorage.getItem('aiProvider') as 'openai' | 'anthropic' | null
    if (savedProvider) {
      setActiveProvider(savedProvider)
    }
    checkProviders()
  }, [])

  const checkProviders = async () => {
    setApiStatus({
      openai: 'checking',
      anthropic: 'checking'
    })

    // Check OpenAI
    const openaiStart = Date.now()
    try {
      const res = await fetch('/api/test-openai')
      const data = await res.json()
      setApiStatus(prev => ({
        ...prev,
        openai: data.status === 'online' ? 'online' : 'offline',
        openaiTime: Date.now() - openaiStart,
        openaiError: data.error
      }))
    } catch (error: any) {
      setApiStatus(prev => ({
        ...prev,
        openai: 'offline',
        openaiError: error.message
      }))
    }

    // Check Anthropic
    const anthropicStart = Date.now()
    try {
      const res = await fetch('/api/test-anthropic')
      const data = await res.json()
      setApiStatus(prev => ({
        ...prev,
        anthropic: data.status === 'online' ? 'online' : 'offline',
        anthropicTime: Date.now() - anthropicStart,
        anthropicError: data.error
      }))
    } catch (error: any) {
      setApiStatus(prev => ({
        ...prev,
        anthropic: 'offline',
        anthropicError: error.message
      }))
    }
  }

  const savePreference = () => {
    localStorage.setItem('aiProvider', activeProvider)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testProvider = async (provider: 'openai' | 'anthropic') => {
    setTesting(true)
    try {
      const res = await fetch('/api/admin/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          message: 'Say "Hello!" if you can read this.'
        })
      })
      const data = await res.json()
      alert(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} Response:\n\n${data.response || data.error}`)
    } catch (error: any) {
      alert(`Test failed: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢'
      case 'offline': return '🔴'
      case 'checking': return '⚪'
      default: return '⚪'
    }
  }

  const getStatusText = (status: string, time?: number, error?: string) => {
    if (status === 'online') return `Connected • ${time}ms response`
    if (status === 'checking') return 'Checking connection...'
    return `Offline${error ? `: ${error}` : ''}`
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA] p-6 mb-6">
      <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6">🤖 AI Provider Status</h2>

      {/* Active Provider Selection */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
          Active AI Provider
        </label>
        <select
          value={activeProvider}
          onChange={(e) => setActiveProvider(e.target.value as 'openai' | 'anthropic')}
          className="w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1D1D1F] mb-3"
        >
          <option value="openai">OpenAI (GPT-4 Turbo) - Recommended for Reliability</option>
          <option value="anthropic">Anthropic (Claude Haiku) - Cost Savings (50% cheaper)</option>
        </select>
        <p className="text-sm text-gray-600 mb-3">
          {activeProvider === 'openai'
            ? '💰 More expensive (~$0.03/1k tokens) but 99.9% uptime and faster responses'
            : '💸 50% cheaper (~$0.0015/1k tokens) but occasional downtime'}
        </p>
        <button
          onClick={savePreference}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {saved ? '✓ Preference Saved!' : 'Save Preference'}
        </button>
      </div>

      {/* Status Display - Single Source of Truth */}
      <div className="space-y-3 mb-6">
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          activeProvider === 'openai'
            ? 'bg-purple-50 border-2 border-purple-500'
            : 'bg-gray-50 border border-[#E5E5EA]'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStatusIcon(apiStatus.openai)}</span>
            <div>
              <div className="font-semibold text-[#1D1D1F]">
                OpenAI (GPT-4 Turbo)
              </div>
              <div className="text-sm text-gray-600">
                {getStatusText(apiStatus.openai, apiStatus.openaiTime, apiStatus.openaiError)}
              </div>
            </div>
          </div>
          {activeProvider === 'openai' && (
            <span className="text-xs font-semibold text-purple-600 px-3 py-1 bg-purple-100 rounded-full">
              ACTIVE
            </span>
          )}
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg ${
          activeProvider === 'anthropic'
            ? 'bg-purple-50 border-2 border-purple-500'
            : 'bg-gray-50 border border-[#E5E5EA]'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStatusIcon(apiStatus.anthropic)}</span>
            <div>
              <div className="font-semibold text-[#1D1D1F]">
                Anthropic (Claude Haiku)
              </div>
              <div className="text-sm text-gray-600">
                {getStatusText(apiStatus.anthropic, apiStatus.anthropicTime, apiStatus.anthropicError)}
              </div>
            </div>
          </div>
          {activeProvider === 'anthropic' && (
            <span className="text-xs font-semibold text-purple-600 px-3 py-1 bg-purple-100 rounded-full">
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => testProvider('openai')}
          disabled={testing || apiStatus.openai !== 'online'}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Test OpenAI'}
        </button>
        <button
          onClick={() => testProvider('anthropic')}
          disabled={testing || apiStatus.anthropic !== 'online'}
          className="flex-1 px-4 py-2 border border-[#E5E5EA] text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Anthropic
        </button>
        <button
          onClick={checkProviders}
          className="px-6 py-2 border border-[#E5E5EA] text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          ↻ Refresh
        </button>
      </div>
    </div>
  )
}
