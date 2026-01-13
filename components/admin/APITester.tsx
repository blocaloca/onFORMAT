'use client'

import { useState } from 'react'

export default function APITester() {
  const [provider, setProvider] = useState<'anthropic' | 'openai'>('anthropic')
  const [testMessage, setTestMessage] = useState('Hello, are you working?')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [providerUsed, setProviderUsed] = useState<string>('')

  const testAPI = async () => {
    setLoading(true)
    setError('')
    setResponse('')
    setProviderUsed('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testMessage }],
          toolType: 'budget', // Required field
          provider: provider
        })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResponse(data.message)
        setProviderUsed(data.provider || provider)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#1D1D1F]">🤖 AI Provider Tester</h2>
        <p className="text-sm text-[#1D1D1F] mt-1">Test AI responses and verify API connections with custom messages</p>
      </div>

      {/* Provider Selector */}
      <div className="mb-4">
        <label className="block font-medium text-[#1D1D1F] mb-2">AI Provider</label>
        <div className="flex gap-4">
          <button
            onClick={() => setProvider('anthropic')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              provider === 'anthropic'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🟣 Anthropic (Claude)
          </button>
          <button
            onClick={() => setProvider('openai')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              provider === 'openai'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🟢 OpenAI (GPT-4)
          </button>
        </div>
      </div>

      {/* Test Message */}
      <div className="mb-4">
        <label className="block font-medium text-[#1D1D1F] mb-2">Test Message</label>
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          className="w-full p-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter a test message..."
        />
      </div>

      {/* Test Button */}
      <button
        onClick={testAPI}
        disabled={loading || !testMessage.trim()}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Testing {provider === 'anthropic' ? 'Claude' : 'GPT-4'}...
          </span>
        ) : (
          `Test ${provider === 'anthropic' ? 'Claude' : 'GPT-4'}`
        )}
      </button>

      {/* Response */}
      {response && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <strong className="text-green-800">✅ Success!</strong>
            <span className="text-xs text-green-700 font-medium">
              Provider: {providerUsed === 'anthropic' ? 'Claude' : 'GPT-4'}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <strong className="text-red-800">❌ Error</strong>
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
            <p className="font-semibold mb-1">Common fixes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check API key in .env.local</li>
              <li>Restart dev server after adding key</li>
              <li>Verify API key is valid</li>
              <li>Check account has credits/access</li>
            </ul>
          </div>
        </div>
      )}

      {/* Fallback Info */}
      {providerUsed && providerUsed !== provider && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ Fallback used: Requested <strong>{provider}</strong> but used <strong>{providerUsed}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
