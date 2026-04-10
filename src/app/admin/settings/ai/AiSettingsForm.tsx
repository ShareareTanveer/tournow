'use client'

import { useState } from 'react'
import { FiSave, FiCheckCircle, FiAlertCircle, FiLoader, FiStar } from 'react-icons/fi'

const PROVIDERS = [
  { value: 'openai',     label: 'OpenAI',     placeholder: 'sk-...',              defaultModel: 'gpt-4o-mini' },
  { value: 'groq',       label: 'Groq',        placeholder: 'gsk_...',             defaultModel: 'llama-3.3-70b-versatile' },
  { value: 'gemini',     label: 'Google Gemini', placeholder: 'AIzaSy...',         defaultModel: 'gemini-1.5-flash' },
  { value: 'openrouter', label: 'OpenRouter',  placeholder: 'sk-or-v1-...',        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free' },
]

interface ProviderRow {
  id?:       string
  provider:  string
  apiKey:    string
  model:     string
  isActive:  boolean
  isPrimary: boolean
}

interface Props {
  initial: ProviderRow[]
}

export default function AiSettingsForm({ initial }: Props) {
  const [rows, setRows]     = useState<ProviderRow[]>(() => {
    const map = new Map(initial.map(r => [r.provider, r]))
    return PROVIDERS.map(p => map.get(p.value) ?? {
      provider:  p.value,
      apiKey:    '',
      model:     p.defaultModel,
      isActive:  false,
      isPrimary: false,
    })
  })
  const [saving, setSaving]   = useState<string | null>(null)
  const [saved,  setSaved]    = useState<string | null>(null)
  const [error,  setError]    = useState<string | null>(null)

  function update(provider: string, field: keyof ProviderRow, value: unknown) {
    setRows(prev => prev.map(r => {
      if (r.provider !== provider) {
        // If setting isPrimary on one, clear others
        if (field === 'isPrimary' && value === true) return { ...r, isPrimary: false }
        return r
      }
      return { ...r, [field]: value }
    }))
  }

  async function save(provider: string) {
    const row = rows.find(r => r.provider === provider)
    if (!row) return
    if (!row.apiKey.trim() || row.apiKey.startsWith('•')) {
      setError(`Enter a valid API key for ${provider}`)
      return
    }
    setSaving(provider)
    setError(null)
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
      // Update row with returned (masked) data
      setRows(prev => prev.map(r => r.provider === provider ? { ...r, ...data } : r))
      setSaved(provider)
      setTimeout(() => setSaved(null), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <FiAlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {PROVIDERS.map((p) => {
        const row = rows.find(r => r.provider === p.value)!
        const isSaving = saving === p.value
        const isSaved  = saved  === p.value

        return (
          <div key={p.value} className={`border rounded-2xl p-5 transition-colors ${row.isActive ? 'border-violet-200 bg-violet-50/30' : 'border-gray-200 bg-white'}`}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="font-bold text-gray-800">{p.label}</span>
                {row.isPrimary && (
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    <FiStar size={10} /> Primary
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    onChange={e => update(p.value, 'isActive', e.target.checked)}
                    className="accent-violet-500"
                  />
                  Active
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.isPrimary}
                    onChange={e => update(p.value, 'isPrimary', e.target.checked)}
                    className="accent-violet-500"
                  />
                  Set as Primary
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">API Key</label>
                <input
                  type="password"
                  value={row.apiKey}
                  placeholder={p.placeholder}
                  onChange={e => update(p.value, 'apiKey', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Model</label>
                <input
                  type="text"
                  value={row.model}
                  onChange={e => update(p.value, 'model', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 bg-white"
                />
              </div>
            </div>

            {/* Save button */}
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
                  : <><FiSave size={13} /> Save</>
              }
            </button>
          </div>
        )
      })}

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700">How it works:</p>
        <p>• Mark one provider as <strong>Primary</strong> — it will be used for all AI generation.</p>
        <p>• API keys are stored encrypted in your database and never shown in full after saving.</p>
        <p>• All providers support JSON-output mode required for structured content generation.</p>
      </div>
    </div>
  )
}
