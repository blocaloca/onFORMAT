'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuickFixes() {
  const router = useRouter()
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<string>('')

  const fixes = [
    {
      name: 'Clear Browser Cache',
      icon: '🗑️',
      action: () => {
        window.location.reload()
      }
    },
    {
      name: 'Test Create Project',
      icon: '📁',
      action: () => {
        router.push('/dashboard')
      }
    },
    {
      name: 'View Documentation',
      icon: '📚',
      action: () => {
        // Show docs in new tab
        const docs = [
          'BUGS_FIXED.md',
          'PHASE_3_COMPLETE.md',
          'CONTEXT_AWARE_AI.md',
          'OPENAI_INTEGRATION_COMPLETE.md'
        ]
        docs.forEach(doc => {
          window.open(`/${doc}`, '_blank')
        })
      }
    },
    {
      name: 'Open Supabase',
      icon: '🗄️',
      action: () => {
        window.open('https://supabase.com/dashboard', '_blank')
      }
    }
  ]

  const handleAction = async (action: () => void) => {
    setFixing(true)
    setResult('')
    try {
      await action()
      setResult('✅ Action completed')
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setFixing(false)
      setTimeout(() => setResult(''), 3000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">⚡ Quick Actions</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fixes.map((fix, index) => (
          <button
            key={index}
            onClick={() => handleAction(fix.action)}
            disabled={fixing}
            className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition disabled:opacity-50 text-center"
          >
            <div className="text-3xl mb-2">{fix.icon}</div>
            <div className="font-semibold text-sm text-[#1D1D1F]">{fix.name}</div>
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm font-medium">
          {result}
        </div>
      )}
    </div>
  )
}
