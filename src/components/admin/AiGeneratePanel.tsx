'use client'

/**
 * AiGeneratePanel
 *
 * Floating "✦ AI" button that opens a modal for generating content.
 * Supports two modes:
 *   1. SEO Only  — fills in SEO/meta fields
 *   2. Full Content — fills in description + SEO fields
 *
 * Usage:
 *   <AiGeneratePanel
 *     entityType="package"
 *     entityId={id}
 *     seoTemplateKey="package-seo-generate"
 *     fullTemplateKey="package-full-generate"
 *     vars={{ title, category, summary, destination, duration, keywords }}
 *     onApply={(data) => { setField('metaTitle', data.metaTitle); ... }}
 *   />
 */

import { useState } from 'react'
import { FiX, FiZap, FiLoader, FiCheckCircle, FiAlertCircle, FiChevronDown } from 'react-icons/fi'

export interface AiApplyData {
  // SEO fields
  metaTitle?:          string
  metaDescription?:    string
  focusKeyword?:       string
  secondaryKeywords?:  string
  ogTitle?:            string
  ogDescription?:      string
  schemaMarkup?:       string
  // Full content fields
  description?:        string
  summary?:            string
  highlights?:         string[]
  inclusions?:         string[]
  exclusions?:         string[]
  // Blog fields
  title?:              string
  slug?:               string
  excerpt?:            string
  content?:            string
}

interface Props {
  entityType:       string
  entityId?:        string
  seoTemplateKey:   string
  fullTemplateKey?: string
  vars:             Record<string, string>
  onApply:          (data: AiApplyData) => void
}

type Mode = 'seo' | 'full'

export default function AiGeneratePanel({
  entityType, entityId, seoTemplateKey, fullTemplateKey, vars, onApply,
}: Props) {
  const [open, setOpen]     = useState(false)
  const [mode, setMode]     = useState<Mode>('seo')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiApplyData | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null)
  const [applied, setApplied] = useState(false)

  const templateKey = mode === 'seo' ? seoTemplateKey : (fullTemplateKey ?? seoTemplateKey)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setResult(null)
    setPreview(null)
    setApplied(false)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey, entityType, entityId, vars }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')

      const output = data.output as Record<string, unknown>
      setPreview(output)
      setResult(output as AiApplyData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!result) return
    onApply(result)
    setApplied(true)
    setTimeout(() => setOpen(false), 800)
  }

  function handleClose() {
    setOpen(false)
    setResult(null)
    setPreview(null)
    setError(null)
    setApplied(false)
  }

  return (
    <>
      {/* Floating badge */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-xl transition-colors"
        title="AI Content Generator"
      >
        <FiZap size={16} />
        <span>AI Generate</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FiZap size={16} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base leading-none">AI Content Generator</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Powered by your configured AI provider</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">

              {/* Mode selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('seo')}
                  className={`rounded-xl border-2 p-3 text-left transition-colors ${
                    mode === 'seo'
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-800">SEO Only</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">meta title, description, keywords, OG tags</p>
                </button>
                {fullTemplateKey && (
                  <button
                    type="button"
                    onClick={() => setMode('full')}
                    className={`rounded-xl border-2 p-3 text-left transition-colors ${
                      mode === 'full'
                        ? 'border-violet-400 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-bold text-gray-800">Full Content</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">description, highlights, inclusions + SEO</p>
                  </button>
                )}
              </div>

              {/* Vars preview */}
              <VarsPreview vars={vars} />

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <FiAlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Result preview */}
              {preview && !error && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-gray-200 bg-gray-100">
                    Generated Output
                  </p>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(preview).map(([k, v]) => (
                      <PreviewField key={k} label={k} value={v} />
                    ))}
                  </div>
                </div>
              )}

              {/* Applied state */}
              {applied && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <FiCheckCircle size={15} className="text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">Applied to form successfully!</p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
              >
                {loading
                  ? <><FiLoader size={15} className="animate-spin" /> Generating…</>
                  : <><FiZap size={15} /> Generate</>
                }
              </button>
              {result && !applied && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
                >
                  <FiCheckCircle size={15} /> Apply to Form
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VarsPreview({ vars }: { vars: Record<string, string> }) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(vars).filter(([, v]) => v?.trim())
  if (!entries.length) return null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 transition-colors"
      >
        <span className="font-medium">Input context ({entries.length} fields)</span>
        <FiChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 py-3 space-y-1.5 bg-white">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-gray-400 font-mono w-28 shrink-0">{k}</span>
              <span className="text-gray-700 truncate">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PreviewField({ label, value }: { label: string; value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <div className="text-xs">
        <span className="font-mono text-gray-400">{label}: </span>
        <span className="text-gray-700">[{value.length} items]</span>
      </div>
    )
  }
  if (typeof value === 'string' && value.length > 120) {
    return (
      <div className="text-xs">
        <span className="font-mono text-gray-400">{label}: </span>
        <span className="text-gray-700">{value.slice(0, 120)}…</span>
      </div>
    )
  }
  return (
    <div className="text-xs">
      <span className="font-mono text-gray-400">{label}: </span>
      <span className="text-gray-700">{String(value)}</span>
    </div>
  )
}
