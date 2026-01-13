'use client'

import React, { useEffect, useMemo, useState } from 'react'

type Phase = 'CONCEPT' | 'PLAN' | 'EXECUTE' | 'WRAP'

type ToolKey =
  | 'Director'
  | 'brief'
  | 'creative-direction'
  | 'shot-scene-book'
  | 'budget'
  | 'schedule'
  | 'locations-sets'
  | 'crew-list'
  | 'casting-talent'
  | 'call-sheet'
  | 'on-set-notes'
  | 'client-selects'
  | 'deliverables-licensing'
  | 'archive-log'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const PHASES: Phase[] = ['CONCEPT', 'PLAN', 'EXECUTE', 'WRAP']

const TOOLS_BY_PHASE: Record<Phase, { key: ToolKey; label: string }[]> = {
  CONCEPT: [
    { key: 'Director', label: 'Director' },
    { key: 'brief', label: 'Brief' },
    { key: 'creative-direction', label: 'Creative Direction' },
    { key: 'shot-scene-book', label: 'Shot & Scene Book' },
  ],
  PLAN: [
    { key: 'Director', label: 'Director' },
    { key: 'budget', label: 'Budget' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'locations-sets', label: 'Locations & Sets' },
    { key: 'crew-list', label: 'Crew List' },
    { key: 'casting-talent', label: 'Casting & Talent' },
  ],
  EXECUTE: [
    { key: 'Director', label: 'Director' },
    { key: 'call-sheet', label: 'Call Sheet' },
    { key: 'on-set-notes', label: 'On-Set Notes' },
    { key: 'client-selects', label: 'Client Selects' },
  ],
  WRAP: [
    { key: 'Director', label: 'Director' },
    { key: 'deliverables-licensing', label: 'Deliverables & Licensing' },
    { key: 'archive-log', label: 'Archive Log' },
  ],
}

type PhaseState = {
  locked: boolean
  // drafts by tool key
  drafts: Partial<Record<ToolKey, string>>
}

type AppState = {
  activePhase: Phase
  activeTool: ToolKey
  phases: Record<Phase, PhaseState>
  chat: ChatMsg[]
}

const STORAGE_KEY = 'onformat_v0_state'

function makeInitialState(): AppState {
  const basePhaseState: PhaseState = { locked: false, drafts: {} }
  return {
    activePhase: 'CONCEPT',
    activeTool: 'Director',
    phases: {
      CONCEPT: { ...basePhaseState },
      PLAN: { ...basePhaseState },
      EXECUTE: { ...basePhaseState },
      WRAP: { ...basePhaseState },
    },
    chat: [],
  }
}

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

/**
 * Minimal "handoff":
 * When you lock a phase, we build a payload summary from that phase's drafts.
 * That payload becomes context the next phases can use (UI can show it; server can send it).
 */
function buildHandoffPayload(phases: AppState['phases']): Record<string, any> {
  const payload: Record<string, any> = {}
  for (const p of PHASES) {
    payload[p] = {
      locked: phases[p].locked,
      drafts: phases[p].drafts,
    }
  }
  return payload
}

export default function OnformatV0Page() {
  const [state, setState] = useState<AppState>(() => {
    const stored = safeJsonParse<AppState>(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
    return stored ?? makeInitialState()
  })

  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const activePhaseState = state.phases[state.activePhase]
  const tools = TOOLS_BY_PHASE[state.activePhase]

  const lockedPhases = useMemo(() => {
    const out: Record<Phase, boolean> = { CONCEPT: false, PLAN: false, EXECUTE: false, WRAP: false }
    for (const p of PHASES) out[p] = state.phases[p].locked
    return out
  }, [state.phases])

  const phaseData = useMemo(() => buildHandoffPayload(state.phases), [state.phases])

  function setPhase(next: Phase) {
    setState((s) => {
      // If locked, you can still view other phases. This is v0.
      const nextTool = TOOLS_BY_PHASE[next][0]?.key ?? 'Director'
      return { ...s, activePhase: next, activeTool: nextTool }
    })
  }

  function setTool(tool: ToolKey) {
    setState((s) => ({ ...s, activeTool: tool }))
  }

  function resetAll() {
    setState(makeInitialState())
    setInput('')
    setError(null)
  }

  function lockPhase() {
    setState((s) => ({
      ...s,
      phases: {
        ...s.phases,
        [s.activePhase]: { ...s.phases[s.activePhase], locked: true },
      },
    }))
  }

  function unlockPhase() {
    setState((s) => ({
      ...s,
      phases: {
        ...s.phases,
        [s.activePhase]: { ...s.phases[s.activePhase], locked: false },
      },
    }))
  }

  function saveDraftForActiveTool(text: string) {
    setState((s) => ({
      ...s,
      phases: {
        ...s.phases,
        [s.activePhase]: {
          ...s.phases[s.activePhase],
          drafts: {
            ...s.phases[s.activePhase].drafts,
            [s.activeTool]: text,
          },
        },
      },
    }))
  }

  async function send() {
    const trimmed = input.trim()
    if (!trimmed) return
    setError(null)
    setIsSending(true)

    // Chat history for model
    const nextChat: ChatMsg[] = [...state.chat, { role: 'user', content: trimmed }]

    // v0: we always include explicit phase and tool. No inference.
    const body = {
      phase: state.activePhase,
      toolType: state.activeTool,
      lockedPhases,
      phaseData, // all drafts + locked flags
      messages: nextChat,
      provider: 'openai', // or leave null and let server pick
    }

    try {
      const res = await fetch('/api/onformat-v0', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `HTTP ${res.status}`)
      }
      const json = await res.json()
      const assistantMsg = String(json?.message ?? '')
      setState((s) => ({
        ...s,
        chat: [...nextChat, { role: 'assistant', content: assistantMsg }],
      }))
      setInput('')
    } catch (e: any) {
      setError(e?.message || 'Request failed')
    } finally {
      setIsSending(false)
    }
  }

  const currentDraft = activePhaseState.drafts[state.activeTool] ?? ''

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial', padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>onFORMAT v0 (test UI)</h1>
        <button onClick={resetAll} style={{ padding: '6px 10px' }}>Reset</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Phase locked:</span>
          <span style={{ fontSize: 12 }}>
            {state.activePhase}: {activePhaseState.locked ? 'YES' : 'NO'}
          </span>
          {!activePhaseState.locked ? (
            <button onClick={lockPhase} style={{ padding: '6px 10px' }}>Lock</button>
          ) : (
            <button onClick={unlockPhase} style={{ padding: '6px 10px' }}>Unlock</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '160px 220px 1fr', gap: 12 }}>
        {/* Phases */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Phases</div>
          {PHASES.map((p) => {
            const active = state.activePhase === p
            const locked = state.phases[p].locked
            return (
              <button
                key={p}
                onClick={() => setPhase(p)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  marginBottom: 6,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: active ? '#f2f2f2' : '#fff',
                  fontWeight: active ? 600 : 500,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{p}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{locked ? 'LOCK' : ''}</span>
              </button>
            )
          })}
        </div>

        {/* Tools */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Tools</div>
          {tools.map((t) => {
            const active = state.activeTool === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTool(t.key)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  marginBottom: 6,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: active ? '#f2f2f2' : '#fff',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Main */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10, minHeight: 520 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Chat */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, minHeight: 480 }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                Chat (phase={state.activePhase}, tool={state.activeTool})
              </div>

              <div style={{ height: 320, overflow: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
                {state.chat.length === 0 ? (
                  <div style={{ fontSize: '12px', opacity: '0.6' }}>No messages yet.</div>
                ) : (
                  state.chat.map((m, idx) => (
                    <div key={idx} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{m.role.toUpperCase()}</div>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{m.content}</div>
                      {m.role === 'assistant' && !activePhaseState.locked && (
                        <button
                          onClick={() => saveDraftForActiveTool(m.content)}
                          style={{
                            marginTop: 6,
                            padding: '4px 8px',
                            fontSize: 11,
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          Insert into Draft
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type here..."
                  style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc', color: '#000' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (!isSending) send()
                    }
                  }}
                />
                <button onClick={send} disabled={isSending} style={{ padding: '10px 14px' }}>
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </div>

              {error && <div style={{ marginTop: 8, color: 'crimson', fontSize: 12 }}>{error}</div>}
            </div>

            {/* Draft */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, minHeight: 480 }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Working Draft (per tool)</div>

              <textarea
                value={currentDraft}
                onChange={(e) => saveDraftForActiveTool(e.target.value)}
                placeholder="Draft text for this tool..."
                style={{
                  width: '100%',
                  height: 360,
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 12,
                  color: '#000',
                }}
                disabled={activePhaseState.locked}
              />

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                {activePhaseState.locked ? 'Locked: draft editing disabled.' : 'Unlocked: edit freely.'}
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>Handoff Payload (read-only)</div>
              <pre
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #eee',
                  background: '#fafafa',
                  fontSize: 11,
                  height: 120,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(phaseData[state.activePhase], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        This UI is intentionally deterministic. Phase is chosen by click, not inferred from text.
      </div>
    </div>
  )
}
