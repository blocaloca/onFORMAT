'use client'

import { useState, useEffect } from 'react'

interface StatusData {
  anthropic: {
    status: 'online' | 'offline' | 'checking'
    error?: string
  }
  openai: {
    status: 'online' | 'offline' | 'checking'
    error?: string
  }
  database: {
    status: 'online' | 'offline' | 'checking'
    error?: string
  }
}

export default function SystemStatus() {
  const [status, setStatus] = useState<StatusData>({
    anthropic: { status: 'checking' },
    openai: { status: 'checking' },
    database: { status: 'checking' }
  })

  useEffect(() => {
    checkAllSystems()
  }, [])

  const checkAllSystems = async () => {
    // Check Anthropic
    try {
      const res = await fetch('/api/test-anthropic')
      const data = await res.json()
      setStatus(prev => ({
        ...prev,
        anthropic: { status: data.status, error: data.error }
      }))
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        anthropic: { status: 'offline', error: error.message }
      }))
    }

    // Check OpenAI
    try {
      const res = await fetch('/api/test-openai')
      const data = await res.json()
      setStatus(prev => ({
        ...prev,
        openai: { status: data.status, error: data.error }
      }))
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        openai: { status: 'offline', error: error.message }
      }))
    }

    // Check Database (via admin audit)
    try {
      const res = await fetch('/api/admin/audit')
      const data = await res.json()
      setStatus(prev => ({
        ...prev,
        database: {
          status: data.checks?.database?.status === 'pass' ? 'online' : 'offline',
          error: data.checks?.database?.message
        }
      }))
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        database: { status: 'offline', error: error.message }
      }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1D1D1F]">🔌 AI Provider Status</h2>
          <p className="text-sm text-[#1D1D1F] mt-1">Real-time connection status for AI services</p>
        </div>
        <button
          onClick={checkAllSystems}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
        >
          Refresh Status
        </button>
      </div>

      <div className="space-y-3">
        <StatusRow
          label="Anthropic API (Claude)"
          status={status.anthropic.status}
          error={status.anthropic.error}
        />
        <StatusRow
          label="OpenAI API (GPT-4)"
          status={status.openai.status}
          error={status.openai.error}
        />
        <StatusRow
          label="Database Connection"
          status={status.database.status}
          error={status.database.error}
        />
      </div>

      {(status.anthropic.status === 'offline' || status.openai.status === 'offline') && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Missing API Keys</p>
          <p className="text-xs text-yellow-700">
            Add the following to <code className="bg-yellow-100 px-1 rounded">.env.local</code>:
          </p>
          <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-x-auto">
{`# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=REDACTED-...

# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...`}
          </pre>
          <p className="text-xs text-yellow-700 mt-2">
            Then restart the dev server: <code className="bg-yellow-100 px-1 rounded">npm run dev</code>
          </p>
        </div>
      )}
    </div>
  )
}

interface StatusRowProps {
  label: string
  status: 'online' | 'offline' | 'checking'
  error?: string
}

function StatusRow({ label, status, error }: StatusRowProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600'
      case 'offline':
        return 'text-red-600'
      case 'checking':
        return 'text-yellow-600'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return '🟢'
      case 'offline':
        return '🔴'
      case 'checking':
        return '🟡'
    }
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#1D1D1F]">{label}</span>
        <span className={`${getStatusColor()} font-semibold text-sm`}>
          {getStatusIcon()} {status}
        </span>
      </div>
      {error && status === 'offline' && (
        <p className="text-xs text-red-600 mt-1 ml-6">{error}</p>
      )}
    </div>
  )
}
