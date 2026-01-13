'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  toolType: 'LuxPixPro' | 'GenStudioPro' | 'ArtMind'
  toolIcon: string
  toolName: string
  projectId?: string
  projectContext?: any
  onProjectUpdate?: (data: any) => void
}

export default function ChatInterface({
  toolType,
  toolIcon,
  toolName,
  projectId,
  projectContext,
  onProjectUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // AI Mode Settings (parked, passed through only)
  const [aiMode, setAiMode] = useState('cinematographer')
  const [aiMood, setAiMood] = useState('cinematic')
  const [aiScale, setAiScale] = useState('full-crew')
  const [showSettings, setShowSettings] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load message history when component mounts
  useEffect(() => {
    if (projectId) {
      loadMessageHistory()
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `${toolName}\nCreative ${
            toolType === 'ArtMind'
              ? 'Direction'
              : toolType === 'GenStudioPro'
              ? 'Generation'
              : 'Production'
          } Workflow.\n\nTell me what you’re thinking about.`,
        },
      ])
      setLoadingHistory(false)
    }
  }, [projectId])

  const loadMessageHistory = async () => {
    if (!projectId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setMessages(
          data.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))
        )
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const saveMessage = async (message: Message) => {
    if (!projectId) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('messages').insert({
        project_id: projectId,
        user_id: user.id,
        role: message.role,
        content: message.content,
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    await saveMessage(userMessage)

    try {
      const response = await fetch('/api/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          toolType,
          projectContext,
          aiMode,
          aiMood,
          aiScale,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `API error ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      }

      setMessages(prev => [...prev, assistantMessage])
      await saveMessage(assistantMessage)

      onProjectUpdate?.({ lastMessage: data.message })
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Something went wrong while contacting the Director. Check the console for details.',
        },
      ])
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white">Loading conversation…</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{toolIcon}</span>
                  <span className="font-semibold text-purple-300">
                    {toolName}
                  </span>
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/20 p-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto flex gap-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message…"
            rows={3}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-8 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
