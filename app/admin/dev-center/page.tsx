'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AIProviderStatus from '@/components/admin/AIProviderStatus'
import QuickFixes from '@/components/admin/QuickFixes'
import APIKeyManager from '@/components/admin/APIKeyManager'

interface AuditResult {
  timestamp: string
  status: string
  failedChecks: number
  checks: {
    database?: any
    tables?: any
    auth?: any
    environment?: any
    apiKey?: any
    documentForms?: any
  }
}

export default function DevCenterPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [runningAudit, setRunningAudit] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== 'casteelio@gmail.com') {
      router.push('/404')
      return
    }

    setUser(user)
    setLoading(false)
    // Auto-run audit on load
    runAudit()
  }

  const runAudit = async () => {
    setRunningAudit(true)
    try {
      const response = await fetch('/api/admin/audit')
      const data = await response.json()
      setAuditResult(data)
    } catch (error) {
      console.error('Audit failed:', error)
    } finally {
      setRunningAudit(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '🟢'
      case 'fail':
        return '🔴'
      case 'warning':
        return '🟡'
      case 'generic':
        return '🟡'
      default:
        return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dev Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-[#E5E5EA] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🛠️</span>
              <div>
                <h1 className="text-3xl font-bold text-[#1D1D1F]">Creative OS - Dev Center</h1>
                <p className="text-gray-500">System diagnostics and admin tools</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* AI Provider Status - Unified View */}
        <AIProviderStatus />

        {/* API Key Management */}
        <APIKeyManager />

        {/* Quick Actions */}
        <QuickFixes />

        {/* System Audit */}
        <div className="bg-white rounded-xl border border-[#E5E5EA] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1D1D1F]">📋 Database & System Audit</h2>
              <p className="text-sm text-[#1D1D1F] mt-1">Detailed system diagnostics and database health check</p>
            </div>
            <button
              onClick={runAudit}
              disabled={runningAudit}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {runningAudit ? 'Running...' : 'Run Audit'}
            </button>
          </div>

          {auditResult ? (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getStatusIcon(auditResult.status)}</span>
                    <div>
                      <div className="font-semibold text-lg">
                        {auditResult.status === 'pass' ? 'All Systems Operational' : 'Issues Detected'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last run: {new Date(auditResult.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {auditResult.failedChecks > 0 && (
                    <div className="text-red-600 font-semibold">
                      {auditResult.failedChecks} failed checks
                    </div>
                  )}
                </div>
              </div>

              {/* Database */}
              {auditResult.checks.database && (
                <div className="border border-[#E5E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{getStatusIcon(auditResult.checks.database.status)}</span>
                    <span className="font-semibold">Database Connection</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    {auditResult.checks.database.message}
                  </p>
                </div>
              )}

              {/* Tables */}
              {auditResult.checks.tables && (
                <div className="border border-[#E5E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold">Database Tables</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-6">
                    {Object.entries(auditResult.checks.tables).map(([table, data]: [string, any]) => (
                      <div key={table} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(data.status)}</span>
                          <span className="text-sm font-medium">{table}</span>
                        </div>
                        <span className="text-xs text-gray-500">{data.count} records</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Environment Variables */}
              {auditResult.checks.environment && (
                <div className="border border-[#E5E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span>{getStatusIcon(auditResult.checks.environment.status)}</span>
                    <span className="font-semibold">Environment Variables</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-6">
                    {Object.entries(auditResult.checks.environment.variables).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span>{value ? '✅' : '❌'}</span>
                        <span className={value ? 'text-gray-700' : 'text-red-600'}>{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API Key */}
              {auditResult.checks.apiKey && (
                <div className="border border-[#E5E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{getStatusIcon(auditResult.checks.apiKey.status)}</span>
                    <span className="font-semibold">Anthropic API Key</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-sm text-gray-600">{auditResult.checks.apiKey.message}</p>
                    {auditResult.checks.apiKey.prefix && (
                      <p className="text-xs font-mono text-gray-500">
                        Prefix: {auditResult.checks.apiKey.prefix}...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Document Forms */}
              {auditResult.checks.documentForms && (
                <div className="border border-[#E5E5EA] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Document Forms</span>
                    <div className="text-sm text-gray-600">
                      {auditResult.checks.documentForms.specialized} specialized / {auditResult.checks.documentForms.total} total
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-6">
                    {Object.entries(auditResult.checks.documentForms.forms).map(([type, data]: [string, any]) => (
                      <div key={type} className="flex items-center gap-2 text-sm">
                        <span>{data.hasSpecializedForm ? '✅' : '🟡'}</span>
                        <span className={data.hasSpecializedForm ? 'text-gray-700' : 'text-yellow-700'}>
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 ml-6">
                    <p className="text-sm text-blue-800">
                      ✅ Generic forms now available for all document types!
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click "Run Audit" to check system status
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">✅ Completed</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• AI API connection with enhanced logging</li>
                <li>• Smart generic form system (60+ document types)</li>
                <li>• Document pre-population</li>
                <li>• Custom template creator</li>
                <li>• Stage editor modal</li>
                <li>• Delete custom template feature</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🔄 Next Up</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Test all document forms systematically</li>
                <li>• Fix white text visibility issues</li>
                <li>• Simplify template builder UX</li>
                <li>• Add more auto-fix tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
