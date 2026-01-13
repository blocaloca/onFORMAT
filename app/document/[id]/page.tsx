'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BudgetForm from '@/components/documents/BudgetForm'
import CallSheetForm from '@/components/documents/CallSheetForm'
import ShotListForm from '@/components/documents/ShotListForm'
import BriefForm from '@/components/documents/BriefForm'
import ShotBookForm from '@/components/documents/ShotBookForm'
import RichTextForm from '@/components/documents/RichTextForm'
import GenericListForm from '@/components/documents/GenericListForm'
import MediaGalleryForm from '@/components/documents/MediaGalleryForm'
import GenericStructuredForm from '@/components/documents/GenericStructuredForm'
import ContentPillarsForm from '@/components/documents/ContentPillarsForm'
import PlatformStrategyForm from '@/components/documents/PlatformStrategyForm'
import PostingCalendarForm from '@/components/documents/PostingCalendarForm'
import CrewListForm from '@/components/documents/CrewListForm'
import LocationScoutForm from '@/components/documents/LocationScoutForm'
import MoodBoardForm from '@/components/documents/MoodBoardForm'
import { getFormConfig, hasSpecializedForm } from '@/lib/document-form-types'
import {
  detectStructuredContent,
  parseShotList,
  parseBudget,
  parseCallSheetCrew,
  parseCallSheetTalent,
  parseBrief
} from '@/lib/ai-parsers'
// import { exportAsPDF } from '@/lib/export-documents'
// DEPRECATED: exportAsDOCX, exportAsExcel - hidden in UI but kept in lib for future use

interface Document {
  id: string
  project_id: string
  type: string
  title: string
  stage: string
  content: any
  status: string
  progress: number
  metadata: any
  created_at: string
  updated_at: string
}

interface Project {
  id: string
  name: string
  template_id: string
}

export default function DocumentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const [document, setDocument] = useState<Document | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [contentText, setContentText] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // AI Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Ref to access form component methods
  const formRef = useRef<any>(null)

  useEffect(() => {
    loadDocument()
  }, [params.id])

  async function loadDocument() {
    try {
      console.log('========================================')
      console.log('Loading document:', params.id)
      console.log('========================================')

      // Load document
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', params.id)
        .single()

      if (docError) {
        console.error('Error loading document:', docError)
        throw docError
      }

      console.log('Document loaded:', docData)
      console.log('Document type:', docData.type)
      console.log('Document type (exact):', JSON.stringify(docData.type))
      setDocument(docData)
      setIsCompleted(docData.completed || false)

      // Set content text
      if (typeof docData.content === 'string') {
        setContentText(docData.content)
      } else if (typeof docData.content === 'object') {
        setContentText(JSON.stringify(docData.content, null, 2))
      } else {
        setContentText('')
      }

      // Load project info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, template_id')
        .eq('id', docData.project_id)
        .single()

      if (projectError) {
        console.error('Error loading project:', projectError)
      } else {
        console.log('Project loaded:', projectData)
        setProject(projectData)
      }

      // Load message history for this document
      await loadMessageHistory(params.id as string)
    } catch (error) {
      console.error('Failed to load document:', error)
      alert('Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  async function loadMessageHistory(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading message history:', error)
        return
      }

      if (data && data.length > 0) {
        setMessages(data.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })))
        console.log('✅ Loaded', data.length, 'messages from history')
      }
    } catch (error) {
      console.error('Failed to load message history:', error)
    }
  }

  async function saveMessage(message: { role: 'user' | 'assistant'; content: string }) {
    if (!document) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found, cannot save message')
        return
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          project_id: document.project_id,
          document_id: document.id,
          user_id: user.id,
          role: message.role,
          content: message.content
        })

      if (error) throw error
      console.log('💾 Message saved to database')
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  // Helper to save with specific content
  async function saveContent(docToSave: any) {
    setSaving(true)
    setSaved(false)

    try {
      console.log('💾 saveContent called')
      console.log('Document ID:', docToSave.id)
      console.log('Document type:', docToSave.type)
      console.log('Content to save:', JSON.stringify(docToSave.content, null, 2))

      const { error } = await supabase
        .from('documents')
        .update({
          content: docToSave.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', docToSave.id)

      if (error) throw error

      console.log('✅ Save successful!')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('❌ Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    if (!document) return

    setSaving(true)
    setSaved(false)

    try {
      console.log('========================================')
      console.log('Saving document:', document.id)
      console.log('Document type:', document.type)
      console.log('========================================')

      // For structured documents (budget, call-sheet, etc), content is already an object
      // For text documents, parse from contentText
      let contentToSave: any
      const structuredTypes = [
        'budget', 'call-sheet', 'shot-list', 'brief', 'shot-book',
        'content-pillars', 'platform-strategy', 'posting-calendar', 'content-calendar',
        'crew-list', 'location-scout'
      ]

      if (structuredTypes.includes(document.type)) {
        contentToSave = document.content
        console.log('📦 Content to save:', JSON.stringify(contentToSave, null, 2))
      } else {
        try {
          contentToSave = JSON.parse(contentText)
        } catch {
          contentToSave = contentText
        }
      }

      const { data, error } = await supabase
        .from('documents')
        .update({
          content: contentToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id)
        .select()
        .single()

      if (error) {
        console.error('Error saving document:', error)
        throw error
      }

      console.log('✅ Document saved successfully!')
      console.log('Saved content:', JSON.stringify(data.content, null, 2))
      setDocument(data)
      setSaved(true)

      // Hide "Saved" message after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save document:', error)
      alert('Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  async function toggleComplete() {
    if (!document) return

    const newState = !isCompleted
    setIsCompleted(newState)

    try {
      const { error } = await supabase
        .from('documents')
        .update({ completed: newState })
        .eq('id', document.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating completion status:', error)
      setIsCompleted(!newState) // Revert on error
    }
  }

  const handleBackToProject = () => {
    if (project) {
      router.push(`/project/${project.id}`)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !document) return

    const userMessage = inputMessage.trim()
    setInputMessage('')

    // Create user message object
    const userMsg = { role: 'user' as const, content: userMessage }

    // Add user message to chat
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setAiLoading(true)

    // Save user message to database
    await saveMessage(userMsg)

    try {
      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          toolType: document.type,
          projectContext: {
            projectName: project?.name,
            templateId: project?.template_id,
            documentType: document.type,
            documentStage: document.stage,
            currentContent: document.content
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Create assistant message object
      const assistantMsg = { role: 'assistant' as const, content: data.message }

      // Add AI response to chat
      setMessages([...newMessages, assistantMsg])

      // Save assistant message to database
      await saveMessage(assistantMsg)
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMsg = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages([...newMessages, errorMsg])

      // Save error message to database
      await saveMessage(errorMsg)
    } finally {
      setAiLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAddToForm = async (messageContent: string) => {
    if (!document) return

    console.log('🎬 Adding AI content to form...')
    console.log('Document type:', document.type)
    console.log('Current document content:', document.content)

    try {
      let itemsAdded = 0

      switch (document.type) {
        case 'shot-list': {
          const shots = parseShotList(messageContent)
          console.log('📸 Parsed shots:', shots.length, shots)
          if (shots.length > 0 && formRef.current?.addShots) {
            console.log('✅ Calling formRef.current.addShots()')
            formRef.current.addShots(shots)
            itemsAdded = shots.length
            showNotification(`Added ${itemsAdded} shots to your shot list`)
            console.log('📝 Document content after adding shots:', document.content)
          }
          break
        }

        case 'budget': {
          const budgetItems = parseBudget(messageContent)
          if (budgetItems.length > 0 && formRef.current?.addBudgetItems) {
            formRef.current.addBudgetItems(budgetItems)
            itemsAdded = budgetItems.length
            showNotification(`Added ${itemsAdded} budget items`)
          }
          break
        }

        case 'call-sheet': {
          const crew = parseCallSheetCrew(messageContent)
          const talent = parseCallSheetTalent(messageContent)
          const totalItems = crew.length + talent.length

          if (totalItems > 0 && formRef.current?.addCallSheetData) {
            formRef.current.addCallSheetData({ crew, talent })
            showNotification(`Added ${crew.length} crew and ${talent.length} talent`)
          }
          break
        }

        case 'brief': {
          console.log('📋 Parsing brief from AI response...')
          const briefData = parseBrief(messageContent)
          console.log('📋 Parsed brief data:', briefData)

          // Count how many fields were populated
          const fieldsPopulated = Object.values(briefData).filter(v => v && v.trim()).length

          if (fieldsPopulated > 0 && formRef.current?.setBriefData) {
            console.log('📋 Calling setBriefData with', fieldsPopulated, 'fields')
            formRef.current.setBriefData(briefData)
            showNotification(`Populated ${fieldsPopulated} brief fields`)
          } else {
            showNotification('Could not extract brief data from AI response')
          }
          break
        }

        default:
          showNotification('Auto-populate not supported for this document type yet')
      }
    } catch (error) {
      console.error('Error adding to form:', error)
      showNotification('Failed to add items to form')
    }
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">Document Not Found</h1>
          <p className="text-gray-600 mb-4">This document doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5EA]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToProject}
                className="text-gray-600 hover:text-[#1D1D1F] flex items-center gap-2"
              >
                ← Back to {project?.name || 'Project'}
              </button>
              <div className="h-6 w-px bg-[#E5E5EA]"></div>
              <div>
                <h1 className="text-2xl font-bold text-[#1D1D1F]">{document.title}</h1>
                <p className="text-sm text-[#1D1D1F]">
                  {document.type} • {document.stage} • {document.status}
                </p>
              </div>
            </div>

            {/* Right: Complete, Save, Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  readOnly
                  className="w-5 h-5"
                />
                <span>{isCompleted ? '✓ Complete' : 'Mark Complete'}</span>
              </button>

              {saved && (
                <span className="text-sm text-green-600 font-medium">✓ Saved</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  📤 Export
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <button
                      onClick={() => {
                        // exportAsPDF(document)
                        alert('PDF Export is momentarily disabled for maintenance. Please use the Print feature.')
                        setShowExportMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>📄</span> Export as PDF
                    </button>
                    {/* DEPRECATED - Phase 1 Cleanup (2025-12-26)
                        DOCX and Excel exports hidden per onFORMAT_CORE.md
                        Functions remain in lib/export-documents.ts for future use
                    <button
                      onClick={async () => {
                        await exportAsDOCX(document)
                        setShowExportMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-t"
                    >
                      <span>📝</span> Export as DOCX
                    </button>
                    <button
                      onClick={async () => {
                        await exportAsExcel(document)
                        setShowExportMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-t"
                    >
                      <span>📊</span> Export as Excel
                    </button>
                    */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-73px)]">
        {/* Left: Content Editor (65%) */}
        <div className="flex-1 w-[65%] p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Smart form system - automatically selects the right form based on document type */}
            {(() => {
              const handleContentChange = (newContent: any) => {
                const updatedDoc = { ...document, content: newContent }
                setDocument(updatedDoc)
                setTimeout(() => saveContent(updatedDoc), 500)
              }

              // Check if there's a specialized form first
              if (document.type === 'brief') {
                return (
                  <BriefForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'budget') {
                return (
                  <BudgetForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'call-sheet') {
                return (
                  <CallSheetForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'shot-list') {
                return (
                  <ShotListForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'shot-book') {
                return (
                  <ShotBookForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'mood-board') {
                return (
                  <MoodBoardForm
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'content-pillars') {
                return (
                  <ContentPillarsForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'platform-strategy') {
                return (
                  <PlatformStrategyForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'posting-calendar' || document.type === 'content-calendar') {
                return (
                  <PostingCalendarForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'crew-list') {
                return (
                  <CrewListForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              if (document.type === 'location-scout') {
                return (
                  <LocationScoutForm
                    ref={formRef}
                    content={document.content}
                    onChange={handleContentChange}
                  />
                )
              }

              // No specialized form - use smart generic form system
              const formConfig = getFormConfig(document.type)

              switch (formConfig.formType) {
                case 'structured-list':
                  return (
                    <GenericListForm
                      ref={formRef}
                      content={document.content}
                      onChange={handleContentChange}
                      documentType={document.type}
                    />
                  )

                case 'media-gallery':
                  return (
                    <MediaGalleryForm
                      ref={formRef}
                      content={document.content}
                      onChange={handleContentChange}
                      documentType={document.type}
                    />
                  )

                case 'structured-form':
                  return (
                    <GenericStructuredForm
                      ref={formRef}
                      content={document.content}
                      onChange={handleContentChange}
                      documentType={document.type}
                    />
                  )

                case 'rich-text':
                default:
                  return (
                    <RichTextForm
                      ref={formRef}
                      content={document.content}
                      onChange={handleContentChange}
                    />
                  )
              }
            })()}

            {/* Document Metadata */}
            <div className="mt-6 bg-white rounded-xl border border-[#E5E5EA] p-6">
              <h3 className="font-semibold text-[#1D1D1F] mb-4">Document Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-[#1D1D1F]">{document.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Stage:</span>
                  <p className="font-medium text-[#1D1D1F]">{document.stage}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium text-[#1D1D1F]">{document.status}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500 text-sm mb-2 block">Progress: {document.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={document.progress}
                    onChange={(e) => {
                      const newProgress = parseInt(e.target.value)
                      setDocument({ ...document, progress: newProgress })
                      // Auto-save progress change
                      setTimeout(async () => {
                        await supabase
                          .from('documents')
                          .update({ progress: newProgress })
                          .eq('id', document.id)
                      }, 500)
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    style={{
                      background: `linear-gradient(to right, #9333ea 0%, #9333ea ${document.progress}%, #E5E5EA ${document.progress}%, #E5E5EA 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium text-[#1D1D1F]">
                    {new Date(document.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="font-medium text-[#1D1D1F]">
                    {new Date(document.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Chat Panel (35%) */}
        <div className="w-[35%] bg-white border-l border-[#E5E5EA] flex flex-col h-full max-h-full overflow-hidden">
          {/* Chat Header */}
          <div className="flex-shrink-0 p-4 border-b border-[#E5E5EA]">
            <h2 className="text-lg font-bold text-[#1D1D1F]">🤖 AI Assistant</h2>
            <p className="text-xs text-gray-500 mt-1">
              Ask me anything about your {document.type}
            </p>
          </div>

          {/* Chat Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="font-semibold text-[#1D1D1F] mb-2">Ready to help!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  I can help you create, refine, and organize your {document.type}.
                </p>
                <div className="space-y-2 w-full">
                  <button
                    onClick={() => setInputMessage('Help me create a complete ' + document.type)}
                    className="w-full text-left px-4 py-3 bg-[#F5F5F7] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                  >
                    📋 Create from scratch
                  </button>
                  <button
                    onClick={() => setInputMessage('What should I include in this ' + document.type + '?')}
                    className="w-full text-left px-4 py-3 bg-[#F5F5F7] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                  >
                    💡 Get suggestions
                  </button>
                  <button
                    onClick={() => setInputMessage('Review my current ' + document.type + ' and suggest improvements')}
                    className="w-full text-left px-4 py-3 bg-[#F5F5F7] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                  >
                    🔍 Review & improve
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                // Detect if AI message contains structured data
                const isAI = msg.role === 'assistant'
                const structuredData = isAI && document
                  ? detectStructuredContent(msg.content, document.type)
                  : { hasStructuredData: false, dataType: null }

                return (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm">
                          {msg.role === 'user' ? '💬' : '🤖'}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </div>

                          {/* Add to Form button for AI messages with structured data */}
                          {structuredData.hasStructuredData && (
                            <button
                              onClick={() => handleAddToForm(msg.content)}
                              className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                            >
                              <span>📋</span>
                              <span>Add to {document.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F5F5F7] rounded-lg px-4 py-3 border border-[#E5E5EA]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🤖</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-[#E5E5EA]">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={aiLoading}
                className="flex-1 px-4 py-3 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || aiLoading}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
