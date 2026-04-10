'use client'

/**
 * InternalLinkPanel
 *
 * Floating button that opens a modal showing ranked internal link suggestions.
 * Features:
 *   - Scans current title + content for keyword matches
 *   - Groups suggestions by Package / Tour / Blog
 *   - One-click "Copy Link" copies the <a> tag HTML
 *   - One-click "Auto-Link All" inserts up to N links into the content
 *   - Already-linked items shown dimmed with a badge
 *
 * Usage:
 *   <InternalLinkPanel
 *     title={form.title}
 *     content={form.body}
 *     currentSlug={form.slug}
 *     onAutoLink={(newContent) => setForm(f => ({ ...f, body: newContent }))}
 *   />
 */

import { useState, useCallback } from 'react'
import {
  FiLink, FiX, FiLoader, FiCopy, FiCheck, FiZap,
  FiPackage, FiCompass, FiBookOpen, FiRefreshCw,
} from 'react-icons/fi'
import { autoInsertLinks } from '@/lib/link-suggester'

interface Suggestion {
  id:           string
  type:         'package' | 'tour' | 'blog' | 'news'
  title:        string
  slug:         string
  url:          string
  excerpt?:     string
  focusKeyword?: string
  score:        number
  matchedTerms: string[]
  alreadyLinked: boolean
  anchorHtml:   string
}

interface Props {
  title:        string
  content:      string
  currentSlug?: string
  onAutoLink:   (newContent: string) => void
}

const TYPE_ICONS = {
  package: FiPackage,
  tour:    FiCompass,
  blog:    FiBookOpen,
  news:    FiBookOpen,
}

const TYPE_COLORS = {
  package: 'bg-blue-100 text-blue-700',
  tour:    'bg-teal-100 text-teal-700',
  blog:    'bg-orange-100 text-orange-700',
  news:    'bg-gray-100 text-gray-600',
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70 ? 'bg-emerald-100 text-emerald-700' :
    score >= 45 ? 'bg-yellow-100 text-yellow-700' :
    'bg-gray-100 text-gray-500'
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {score}%
    </span>
  )
}

export default function InternalLinkPanel({ title, content, currentSlug, onAutoLink }: Props) {
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [total, setTotal]             = useState(0)
  const [error, setError]             = useState<string | null>(null)
  const [copied, setCopied]           = useState<string | null>(null)
  const [autoLinked, setAutoLinked]   = useState(false)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAutoLinked(false)
    try {
      const res = await fetch('/api/seo/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, currentSlug, limit: 20, minScore: 8 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch suggestions')
      setSuggestions(data.suggestions)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [title, content, currentSlug])

  function handleOpen() {
    setOpen(true)
    fetchSuggestions()
  }

  function handleClose() {
    setOpen(false)
  }

  async function copyAnchor(s: Suggestion) {
    await navigator.clipboard.writeText(s.anchorHtml)
    setCopied(s.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleAutoLink() {
    const newContent = autoInsertLinks(content, suggestions, 5)
    onAutoLink(newContent)
    setAutoLinked(true)
    // Re-fetch to update already-linked states
    setTimeout(fetchSuggestions, 300)
  }

  // Group by type
  const grouped = suggestions.reduce<Record<string, Suggestion[]>>((acc, s) => {
    acc[s.type] = acc[s.type] ?? []
    acc[s.type].push(s)
    return acc
  }, {})

  const typeOrder = ['package', 'tour', 'blog', 'news'] as const
  const hasUnlinked = suggestions.some(s => !s.alreadyLinked)

  return (
    <>
      {/* Floating badge */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-20 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl transition-colors"
        title="Internal Link Suggestions"
      >
        <FiLink size={15} />
        <span>Internal Links</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                  <FiLink size={15} className="text-teal-700" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base leading-none">Internal Link Suggestions</h2>
                  {!loading && total > 0 && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Scanned {total} pages · {suggestions.length} relevant matches
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchSuggestions}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

              {loading && (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                  <FiLoader size={18} className="animate-spin" />
                  <span className="text-sm">Analysing content…</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && suggestions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiLink size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No relevant pages found.</p>
                  <p className="text-xs mt-1">Add more content or focus keywords to improve matching.</p>
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <>
                  {/* Auto-link action */}
                  {hasUnlinked && (
                    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-teal-800">Auto-link top matches</p>
                        <p className="text-xs text-teal-600 mt-0.5">
                          Inserts up to 5 anchor tags for the highest-scoring unlinked pages.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoLink}
                        disabled={autoLinked}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold transition-colors"
                      >
                        {autoLinked
                          ? <><FiCheck size={13} /> Done</>
                          : <><FiZap size={13} /> Auto-Link</>
                        }
                      </button>
                    </div>
                  )}

                  {/* Grouped suggestions */}
                  {typeOrder.map(type => {
                    const items = grouped[type]
                    if (!items?.length) return null
                    const TypeIcon = TYPE_ICONS[type]
                    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's'

                    return (
                      <div key={type}>
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon size={13} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{typeLabel}</span>
                          <span className="text-[10px] text-gray-300 font-medium">({items.length})</span>
                        </div>
                        <div className="space-y-2">
                          {items.map(s => (
                            <SuggestionRow
                              key={s.id}
                              s={s}
                              copied={copied === s.id}
                              onCopy={() => copyAnchor(s)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 shrink-0">
              <p className="text-[11px] text-gray-400">
                Click <strong>Copy</strong> to get the anchor HTML, then paste it into your content editor.
                Or use <strong>Auto-Link</strong> to insert links automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Suggestion row ───────────────────────────────────────────────────────────

function SuggestionRow({
  s, copied, onCopy,
}: {
  s: Suggestion
  copied: boolean
  onCopy: () => void
}) {
  const TypeIcon = TYPE_ICONS[s.type]

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
      s.alreadyLinked
        ? 'bg-gray-50 border-gray-100 opacity-60'
        : 'bg-white border-gray-200 hover:border-teal-200'
    }`}>
      {/* Icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLORS[s.type]}`}>
        <TypeIcon size={13} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800 truncate">{s.title}</p>
          <ScoreBadge score={s.score} />
          {s.alreadyLinked && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              Linked
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{s.url}</p>
        {s.matchedTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {s.matchedTerms.slice(0, 5).map(term => (
              <span key={term} className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">
                {term}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Copy button */}
      {!s.alreadyLinked && (
        <button
          type="button"
          onClick={onCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            copied
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600'
          }`}
        >
          {copied ? <><FiCheck size={11} /> Copied</> : <><FiCopy size={11} /> Copy</>}
        </button>
      )}
    </div>
  )
}
