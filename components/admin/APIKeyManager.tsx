'use client'

import { useState } from 'react'

export default function APIKeyManager() {
  const [showOpenAI, setShowOpenAI] = useState(false)
  const [openaiKey, setOpenaiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const saveOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      setResult({ type: 'error', message: 'Please enter a valid API key' })
      return
    }

    if (!openaiKey.startsWith('sk-')) {
      setResult({ type: 'error', message: 'OpenAI API keys should start with "sk-"' })
      return
    }

    setSaving(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/save-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai',
          apiKey: openaiKey
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          type: 'success',
          message: 'API key saved! Restart the dev server to apply changes.'
        })
        setOpenaiKey('')
        setShowOpenAI(false)
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to save API key' })
      }
    } catch (error: any) {
      setResult({ type: 'error', message: error.message || 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1D1D1F]">🔑 API Key Management</h2>
          <p className="text-sm text-[#1D1D1F] mt-1">Configure your AI provider API keys</p>
        </div>
      </div>

      {/* Anthropic Key Status */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟣</span>
            <div>
              <div className="font-semibold text-green-900">Anthropic API Key</div>
              <div className="text-sm text-green-700">✅ Configured and working</div>
            </div>
          </div>
        </div>
      </div>

      {/* OpenAI Key Manager */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟢</span>
            <div>
              <div className="font-semibold text-blue-900">OpenAI API Key</div>
              <div className="text-sm text-blue-700">Optional - Add for automatic fallback</div>
            </div>
          </div>
          {!showOpenAI && (
            <button
              onClick={() => setShowOpenAI(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              Add OpenAI Key
            </button>
          )}
        </div>

        {showOpenAI && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-blue-700 mt-1">
                Get your key from:{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  https://platform.openai.com/api-keys
                </a>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveOpenAIKey}
                disabled={saving || !openaiKey.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </span>
                ) : (
                  'Save API Key'
                )}
              </button>
              <button
                onClick={() => {
                  setShowOpenAI(false)
                  setOpenaiKey('')
                  setResult(null)
                }}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-lg border ${
          result.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{result.type === 'success' ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                result.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              {result.type === 'success' && (
                <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-900">
                  <p className="font-semibold">Next steps:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Stop the dev server (Ctrl+C in terminal)</li>
                    <li>Run: <code className="bg-green-200 px-1 rounded">npm run dev</code></li>
                    <li>Refresh this page to verify OpenAI is online</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-900">
          <strong>💡 How it works:</strong> This will update your <code className="bg-purple-100 px-1 rounded">.env.local</code> file
          with the OpenAI API key. The system will automatically use OpenAI as a fallback if Anthropic fails or is unavailable.
        </p>
      </div>
    </div>
  )
}
