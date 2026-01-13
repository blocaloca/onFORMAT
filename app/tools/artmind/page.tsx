// DEPRECATED - Phase 1 Cleanup (2025-12-26)
// This AI tool conflicts with production-first philosophy per onFORMAT_CORE.md
// Route remains for backward compatibility but is not linked in UI
// Scheduled for removal in Phase 2 cleanup

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ChatInterface from '@/components/ChatInterface'

export const dynamic = 'force-dynamic'

function ArtMindContent() {
  const [user, setUser] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [projectName, setProjectName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)
    
    const projectId = searchParams.get('project')
    if (projectId) {
      loadExistingProject(projectId)
    } else {
      setLoading(false)
    }
  }

  const loadExistingProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      
      setProject(data)
      setShowNameInput(false)
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!projectName.trim() || !user) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productType: 'ArtMind Studio',
          name: projectName,
          data: { projectType: 'creative-direction' },
        }),
      })

      const data = await response.json()
      setProject(data)
      setShowNameInput(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const updateProject = async (newData: any) => {
    if (!project) return

    try {
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: { ...project.data, ...newData },
        }),
      })
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <nav className="border-b border-white/20 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-300 hover:text-white transition">
              ← Back
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎨</span>
              <div>
                <h1 className="text-xl font-bold text-white">ArtMind Studio</h1>
                {project && (
                  <p className="text-sm text-purple-300">{project.name}</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-purple-200">{user?.email}</div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        {showNameInput ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-5xl text-center mb-6">🎨</div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Create New Project
              </h2>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createProject()}
                placeholder="Enter project name..."
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                autoFocus
              />
              <button
                onClick={createProject}
                disabled={!projectName.trim()}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Project
              </button>
            </div>
          </div>
        ) : (
          <ChatInterface
            toolType="ArtMind"
            toolIcon="🎨"
            toolName="ArtMind Studio"
            projectId={project?.id}
            projectContext={project?.data}
            onProjectUpdate={updateProject}
          />
        )}
      </div>
    </div>
  )
}

export default function ArtMindPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtMindContent />
    </Suspense>
  )
}
