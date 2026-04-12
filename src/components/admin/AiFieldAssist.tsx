'use client'

/**
 * AiFieldAssist — per-field AI generation button + modal.
 *
 * Usage:
 *   <AiFieldAssist
 *     fieldLabel="Title"
 *     fieldName="title"
 *     currentValue={form.title}
 *     formContext={formContextObj}
 *     onApply={(text) => setForm(f => ({ ...f, title: text }))}
 *   />
 *
 * Renders a small sparkle (✦) button inline next to the field.
 * Click → opens modal with:
 *   - Page context (auto from formContext)
 *   - Current value (read-only reference)
 *   - Provider selector + optional model override
 *   - Instruction textarea (pre-filled with smart default)
 *   - Generate → shows output → Apply / Regenerate
 */

import { useState, useEffect, useCallback } from 'react'
import { FiZap, FiX, FiLoader, FiCheck, FiRefreshCw, FiChevronDown } from 'react-icons/fi'

// ─── Smart default prompts per field ─────────────────────────────────────────

const DEFAULT_INSTRUCTIONS: Record<string, string> = {
  title:               'Write a compelling, SEO-optimised title (max 70 chars). Return plain text only, no quotes.',
  slug:                'Generate a clean URL-friendly slug from the title. Return plain text only, lowercase, hyphens, no special chars.',
  summary:             'Write a concise 2-3 sentence summary that highlights the key benefits. Return plain text only.',
  description:         'Write a detailed, engaging HTML description (300-500 words) using <p>, <h2>, <ul>, <li>, <strong>. NO <h1> tags.',
  excerpt:             'Write a short 1-2 sentence excerpt for list pages (max 200 chars). Return plain text only.',
  metaTitle:           'Write an SEO-optimised meta title (50-65 characters). Include the main keyword. Return plain text only.',
  metaDescription:     'Write a compelling meta description (150-160 characters) that includes the focus keyword and a call to action. Return plain text only.',
  focusKeyword:        'Suggest the single best focus keyword phrase for this content. Return plain text only.',
  secondaryKeywords:   'Suggest 4-6 secondary keywords, comma-separated. Return plain text only.',
  ogTitle:             'Write an engaging Open Graph title for social sharing (max 70 chars). Return plain text only.',
  ogDescription:       'Write an engaging Open Graph description for social sharing (max 200 chars). Return plain text only.',
  twitterTitle:        'Write a Twitter/X card title (max 70 chars). Return plain text only.',
  twitterDescription:  'Write a Twitter/X card description (max 200 chars). Return plain text only.',
  schemaMarkup:        'Generate valid JSON-LD schema markup (TouristTrip or TouristAttraction type) for this content. Return valid JSON only.',
  body:                'Write a detailed, engaging HTML article (600-1000 words) using <h2>, <h3>, <p>, <ul>. NO <h1> tags. Include 2-3 relevant internal link placeholders as [[LINK:topic]].',
  importantInfo:       'Write clear important information for travellers including health requirements, what to bring, dress code. Use <ul><li> tags.',
  highlights:          'Write 4-6 highlight bullet points (one per line, plain text). Return as plain text, one per line.',
  cancellationPolicy:  'Write a clear, fair cancellation policy. Return plain text.',
}

function getDefaultInstruction(fieldName: string): string {
  return DEFAULT_INSTRUCTIONS[fieldName] ?? `Generate appropriate content for the "${fieldName}" field. Be concise and relevant.`
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Provider {
  provider: string
  label:    string
  apiKey:   string
  model:    string
  isActive: boolean
  isPrimary: boolean
}

interface Props {
  fieldLabel:   string
  fieldName:    string
  currentValue: string
  formContext:  Record<string, string>   // other form fields for context
  onApply:      (text: string) => void
  accentColor?: 'indigo' | 'sky'        // matches the form's theme
}

// ─── Sparkle button ───────────────────────────────────────────────────────────

export default function AiFieldAssist({
  fieldLabel, fieldName, currentValue, formContext, onApply, accentColor = 'indigo',
}: Props) {
  const [open, setOpen]             = useState(false)
  const [providers, setProviders]   = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState('auto')
  const [modelOverride, setModelOverride]       = useState('')
  const [instruction, setInstruction]           = useState(() => getDefaultInstruction(fieldName))
  const [loading, setLoading]       = useState(false)
  const [generated, setGenerated]   = useState('')
  const [error, setError]           = useState('')
  const [applied, setApplied]       = useState(false)

  const btnColor = accentColor === 'sky'
    ? 'text-sky-500 hover:bg-sky-50 border-sky-200 hover:border-sky-400'
    : 'text-indigo-500 hover:bg-indigo-50 border-indigo-200 hover:border-indigo-400'

  // Load providers on open
  useEffect(() => {
    if (!open) return
    fetch('/api/ai/providers', { credentials: 'include' })
      .then(r => r.json())
      .then((data: Provider[]) => setProviders(data))
      .catch(() => {})
  }, [open])

  function handleOpen() {
    setOpen(true)
    setGenerated('')
    setError('')
    setApplied(false)
    setInstruction(getDefaultInstruction(fieldName))
  }

  function buildSystemPrompt(): string {
    const ctx = Object.entries(formContext)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v.slice(0, 300)}`)
      .join('\n')

    return `You are an expert travel content writer and SEO specialist for Halo Holidays, a premium Sri Lanka travel agency.
You are generating content for the "${fieldLabel}" field.

FORM CONTEXT (for reference):
${ctx || '(no context yet)'}

Rules:
- Be specific to travel / tourism
- Never add commentary, preamble, or explanation — return ONLY the requested content
- Never wrap output in markdown code blocks or quotes`
  }

  const doGenerate = useCallback(async () => {
    setLoading(true)
    setError('')
    setGenerated('')

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode:         'raw',
          systemPrompt: buildSystemPrompt(),
          userMessage:  instruction,
          provider:     selectedProvider === 'auto' ? undefined : selectedProvider,
          model:        modelOverride.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setGenerated(data.text?.trim() ?? '')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instruction, selectedProvider, modelOverride, formContext])

  function handleApply() {
    onApply(generated)
    setApplied(true)
    setTimeout(() => setOpen(false), 600)
  }

  return (
    <>
      {/* Inline sparkle button */}
      <button
        type="button"
        onClick={handleOpen}
        title={`AI Assist — ${fieldLabel}`}
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${btnColor}`}
      >
        <FiZap size={14} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FiZap size={15} className="text-violet-500" />
                <span className="font-bold text-gray-800 text-sm">AI Assist — {fieldLabel}</span>
              </div>
              <button type="button" onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                <FiX size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">

              {/* Page context (auto) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Page Context (auto-detected)
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 bg-gray-50 max-h-24 overflow-y-auto font-mono leading-5">
                  {Object.entries(formContext).filter(([, v]) => v?.trim()).slice(0, 8).map(([k, v]) => (
                    <div key={k}><span className="text-gray-400">{k}:</span> {v.slice(0, 80)}{v.length > 80 ? '…' : ''}</div>
                  ))}
                  {Object.values(formContext).filter(v => v?.trim()).length === 0 && (
                    <span className="text-gray-300">Fill in other fields first for better context</span>
                  )}
                </div>
              </div>

              {/* Current value */}
              {currentValue?.trim() && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Current Value (for reference)
                  </label>
                  <div className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 bg-gray-50 max-h-20 overflow-y-auto">
                    {currentValue.slice(0, 300)}{currentValue.length > 300 ? '…' : ''}
                  </div>
                </div>
              )}

              {/* Provider + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Provider</label>
                  <div className="relative">
                    <select
                      value={selectedProvider}
                      onChange={e => setSelectedProvider(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400 pr-8"
                    >
                      <option value="auto">Auto (first active)</option>
                      {providers.filter(p => p.isActive).map(p => (
                        <option key={p.provider} value={p.provider}>
                          {p.provider.charAt(0).toUpperCase() + p.provider.slice(1)}
                          {p.isPrimary ? ' ★' : ''}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Model <span className="font-normal normal-case">(optional override)</span>
                  </label>
                  <input
                    type="text"
                    value={modelOverride}
                    onChange={e => setModelOverride(e.target.value)}
                    placeholder="leave blank for default"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              {/* Instruction */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Instruction</label>
                <textarea
                  rows={3}
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Generated output */}
              {generated && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Generated Output</label>
                  <textarea
                    rows={6}
                    value={generated}
                    onChange={e => setGenerated(e.target.value)}
                    className="w-full border border-violet-200 bg-violet-50/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none font-mono"
                  />
                </div>
              )}

              {/* Applied */}
              {applied && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-sm text-emerald-700">
                  <FiCheck size={13} /> Applied to field!
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={doGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {loading
                  ? <><FiLoader size={13} className="animate-spin" /> Generating…</>
                  : <><FiZap size={13} /> Generate</>
                }
              </button>

              {generated && !applied && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
                >
                  <FiCheck size={13} /> Apply to field
                </button>
              )}

              {generated && (
                <button
                  type="button"
                  onClick={doGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors"
                >
                  <FiRefreshCw size={13} /> Regenerate
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
