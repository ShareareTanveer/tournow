'use client'

import { useState } from 'react'
import {
  FiSave, FiCheckCircle, FiAlertCircle, FiLoader, FiStar,
  FiTrash2, FiZap, FiEye, FiEyeOff, FiChevronDown, FiPlus,
} from 'react-icons/fi'

// ─── Provider definitions ─────────────────────────────────────────────────────

const PROVIDERS = [
  {
    value:        'openai',
    label:        'OpenAI',
    placeholder:  'sk-...',
    defaultModel: 'gpt-4o-mini',
    color:        'emerald',
    models: [
      'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo',
    ],
  },
  {
    value:        'groq',
    label:        'Groq',
    placeholder:  'gsk_...',
    defaultModel: 'llama-3.3-70b-versatile',
    color:        'indigo',
    models: [
      'llama-3.3-70b-versatile', 'llama-3.1-8b-instant',
      'mixtral-8x7b-32768', 'gemma2-9b-it',
    ],
  },
  {
    value:        'gemini',
    label:        'Google Gemini',
    placeholder:  'AIzaSy...',
    defaultModel: 'gemini-1.5-flash',
    color:        'blue',
    models: [
      'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro',
    ],
  },
  {
    value:        'openrouter',
    label:        'OpenRouter',
    placeholder:  'sk-or-v1-...',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    color:        'violet',
    models: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemma-2-9b-it:free',
      'mistralai/mistral-7b-instruct:free',
      'anthropic/claude-3-haiku',
    ],
  },
] as const

type ProviderValue = typeof PROVIDERS[number]['value']

// ─── State row ────────────────────────────────────────────────────────────────

interface ProviderRow {
  id?:         string
  provider:    ProviderValue
  apiKey:      string
  model:       string
  isActive:    boolean
  isPrimary:   boolean
  configured:  boolean   // true if already saved to DB
}

type TestState = 'idle' | 'testing' | 'ok' | 'fail'

interface Props {
  initial: ProviderRow[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiSettingsForm({ initial }: Props) {
  const [rows, setRows] = useState<ProviderRow[]>(() => {
    const map = new Map(initial.map(r => [r.provider, r]))
    return PROVIDERS.map(p => {
      const saved = map.get(p.value)
      if (saved) return { ...saved, configured: true }
      return {
        provider:   p.value,
        apiKey:     '',
        model:      p.defaultModel,
        isActive:   false,
        isPrimary:  false,
        configured: false,
      }
    })
  })

  const [saving,      setSaving]      = useState<ProviderValue | null>(null)
  const [saved,       setSaved]       = useState<ProviderValue | null>(null)
  const [deleting,    setDeleting]    = useState<ProviderValue | null>(null)
  const [testState,   setTestState]   = useState<Partial<Record<ProviderValue, TestState>>>({})
  const [testMsg,     setTestMsg]     = useState<Partial<Record<ProviderValue, string>>>({})
  const [showKey,     setShowKey]     = useState<Partial<Record<ProviderValue, boolean>>>({})
  const [showModels,  setShowModels]  = useState<Partial<Record<ProviderValue, boolean>>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  function update(provider: ProviderValue, field: keyof ProviderRow, value: unknown) {
    setRows(prev => prev.map(r => {
      if (r.provider !== provider) {
        if (field === 'isPrimary' && value === true) return { ...r, isPrimary: false }
        return r
      }
      return { ...r, [field]: value }
    }))
  }

  async function save(provider: ProviderValue) {
    const row = rows.find(r => r.provider === provider)
    if (!row) return
    if (!row.apiKey.trim() || row.apiKey.startsWith('•')) {
      setGlobalError(`Enter a valid API key for ${provider}`)
      return
    }
    setSaving(provider)
    setGlobalError(null)
    setSaved(null)
    try {
      const res = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(row),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setRows(prev => prev.map(r => r.provider === provider ? { ...r, ...data, configured: true } : r))
      setSaved(provider)
      setTimeout(() => setSaved(null), 2500)
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function remove(provider: ProviderValue) {
    if (!confirm(`Remove ${provider} configuration? This cannot be undone.`)) return
    setDeleting(provider)
    try {
      const res = await fetch('/api/ai/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Delete failed')
      // Reset to unconfigured state
      const p = PROVIDERS.find(x => x.value === provider)!
      setRows(prev => prev.map(r => r.provider === provider ? {
        provider: p.value, apiKey: '', model: p.defaultModel,
        isActive: false, isPrimary: false, configured: false,
      } : r))
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  async function test(provider: ProviderValue) {
    const row = rows.find(r => r.provider === provider)
    if (!row) return
    if (!row.apiKey.trim() || row.apiKey.startsWith('•')) {
      setGlobalError('Enter (or re-enter) the API key before testing')
      return
    }
    setTestState(s => ({ ...s, [provider]: 'testing' }))
    setTestMsg(m => ({ ...m, [provider]: '' }))
    try {
      const res = await fetch('/api/ai/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider, apiKey: row.apiKey, model: row.model }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Connection failed')
      setTestState(s => ({ ...s, [provider]: 'ok' }))
      setTestMsg(m => ({ ...m, [provider]: `Connected — model: ${data.model}` }))
    } catch (err: unknown) {
      setTestState(s => ({ ...s, [provider]: 'fail' }))
      setTestMsg(m => ({ ...m, [provider]: err instanceof Error ? err.message : 'Failed' }))
    }
  }

  return (
    <div className="space-y-5">
      {globalError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <FiAlertCircle size={15} className="shrink-0" /> {globalError}
        </div>
      )}

      {PROVIDERS.map((p) => {
        const row       = rows.find(r => r.provider === p.value)!
        const isSaving  = saving   === p.value
        const isSaved   = saved    === p.value
        const isDeleting = deleting === p.value
        const tState    = testState[p.value] ?? 'idle'
        const tMsg      = testMsg[p.value] ?? ''
        const keyVisible = showKey[p.value] ?? false
        const modelsOpen = showModels[p.value] ?? false

        return (
          <div key={p.value} className={`border rounded-2xl p-5 transition-colors ${
            row.isActive
              ? 'border-violet-200 bg-violet-50/30'
              : row.configured
                ? 'border-gray-200 bg-gray-50/50'
                : 'border-dashed border-gray-200 bg-white'
          }`}>
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  row.isActive ? 'bg-emerald-500' : row.configured ? 'bg-gray-400' : 'bg-gray-200'
                }`} />
                <span className="font-bold text-gray-800">{p.label}</span>
                {row.isPrimary && (
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    <FiStar size={10} /> Primary
                  </span>
                )}
                {!row.configured && (
                  <span className="text-[11px] text-gray-400 font-medium">Not configured</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {row.configured && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={e => update(p.value, 'isActive', e.target.checked)}
                        className="accent-violet-500"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={row.isPrimary}
                        onChange={e => update(p.value, 'isPrimary', e.target.checked)}
                        className="accent-violet-500"
                      />
                      Primary
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* ── Fields ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* API Key */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">API Key</label>
                <div className="relative flex items-center">
                  <input
                    type={keyVisible ? 'text' : 'password'}
                    value={row.apiKey}
                    placeholder={p.placeholder}
                    onChange={e => update(p.value, 'apiKey', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-9 focus:outline-none focus:border-violet-400 bg-white font-mono"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowKey(s => ({ ...s, [p.value]: !keyVisible }))}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {keyVisible ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                  </button>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Model</label>
                <div className="relative">
                  <input
                    type="text"
                    value={row.model}
                    onChange={e => update(p.value, 'model', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-9 focus:outline-none focus:border-violet-400 bg-white"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowModels(s => ({ ...s, [p.value]: !modelsOpen }))}
                    title="Show model suggestions"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiChevronDown size={13} className={`transition-transform ${modelsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Model suggestions dropdown */}
                  {modelsOpen && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {p.models.map(m => (
                        <button
                          key={m} type="button"
                          onClick={() => { update(p.value, 'model', m); setShowModels(s => ({ ...s, [p.value]: false })) }}
                          className={`w-full text-left text-xs px-3 py-2 hover:bg-violet-50 transition-colors font-mono ${
                            row.model === m ? 'bg-violet-50 text-violet-700 font-bold' : 'text-gray-700'
                          }`}
                        >
                          {m}
                          {row.model === m && <span className="ml-2 text-[10px] text-violet-400">current</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Test result banner ── */}
            {tState !== 'idle' && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3 ${
                tState === 'testing' ? 'bg-gray-50 text-gray-500' :
                tState === 'ok'     ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {tState === 'testing' && <FiLoader size={12} className="animate-spin shrink-0" />}
                {tState === 'ok'      && <FiCheckCircle size={12} className="shrink-0" />}
                {tState === 'fail'    && <FiAlertCircle size={12} className="shrink-0" />}
                {tState === 'testing' ? 'Testing connection…' : tMsg}
              </div>
            )}

            {/* ── Action buttons ── */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => save(p.value)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {isSaving
                  ? <><FiLoader size={13} className="animate-spin" /> Saving…</>
                  : isSaved
                    ? <><FiCheckCircle size={13} /> Saved!</>
                    : row.configured
                      ? <><FiSave size={13} /> Update</>
                      : <><FiPlus size={13} /> Configure</>
                }
              </button>

              <button
                type="button"
                onClick={() => test(p.value)}
                disabled={tState === 'testing'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60 text-gray-700 text-sm font-semibold transition-colors"
              >
                {tState === 'testing'
                  ? <><FiLoader size={13} className="animate-spin text-violet-500" /> Testing…</>
                  : <><FiZap size={13} className="text-violet-500" /> Test Connection</>
                }
              </button>

              {row.configured && (
                <button
                  type="button"
                  onClick={() => remove(p.value)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-60 text-red-600 text-sm font-semibold transition-colors ml-auto"
                >
                  {isDeleting
                    ? <><FiLoader size={13} className="animate-spin" /> Removing…</>
                    : <><FiTrash2 size={13} /> Remove</>
                  }
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* ── Info box ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500 space-y-1.5">
        <p className="font-semibold text-gray-700">How it works</p>
        <p>• Mark one provider as <strong>Primary</strong> — it will be the default for all AI generation.</p>
        <p>• <strong>Test Connection</strong> sends a lightweight ping to verify your API key and model are valid.</p>
        <p>• API keys are stored encrypted in your database and never shown in full after saving.</p>
        <p>• All active providers can be selected per-field in the AI assist modals.</p>
      </div>
    </div>
  )
}
