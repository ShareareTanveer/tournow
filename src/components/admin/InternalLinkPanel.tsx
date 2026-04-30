'use client'

/**
 * InternalLinkPanel — floating FAB + modal.
 *
 * Shows ranked internal link suggestions grouped by type.
 * Per suggestion:
 *   - Title, type badge, score, already-linked badge
 *   - Match reason chips (keywords / category)
 *   - Anchor phrase chips — click to copy <a> HTML
 *   - ⚡ Auto-Link button — injects link directly into content
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
import { FiLink, FiX, FiLoader, FiCopy, FiCheck, FiZap, FiRefreshCw } from 'react-icons/fi'
import { autoInsertLinks } from '@/lib/link-suggester'

interface Suggestion {
  id:            string
  type:          'package' | 'tour' | 'blog' | 'news'
  title:         string
  slug:          string
  url:           string
  excerpt?:      string
  focusKeyword?: string
  score:         number
  matchedTerms:  string[]
  alreadyLinked: boolean
  anchorHtml:    string
}

interface Props {
  title:        string
  content:      string
  currentSlug?: string
  onAutoLink:   (newContent: string) => void
}

const TYPE_LABEL: Record<string, string> = {
  package: '📦 Package',
  tour:    '🧭 Tour',
  blog:    '📝 Blog',
  news:    '📰 News',
}

const TYPE_COLOR: Record<string, string> = {
  package: 'bg-blue-100 text-blue-700',
  tour:    'bg-teal-100 text-teal-700',
  blog:    'bg-indigo-100 text-indigo-700',
  news:    'bg-gray-100 text-gray-600',
}

function ScoreDot({ score }: { score: number }) {
  const cls = score >= 60 ? 'bg-emerald-500' : score >= 35 ? 'bg-yellow-400' : 'bg-gray-300'
  return <span className={`inline-block w-2 h-2 rounded-full ${cls} mr-1.5`} />
}

export default function InternalLinkPanel({ title, content, currentSlug, onAutoLink }: Props) {
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [total, setTotal]             = useState(0)
  const [error, setError]             = useState<string | null>(null)
  // track per-suggestion linking state: id → 'linking' | 'done' | 'error:msg'
  const [linkState, setLinkState]     = useState<Record<string, string>>({})
  // track per-anchor copy state: `${id}-${phrase}` → true
  const [copied, setCopied]           = useState<Record<string, boolean>>({})
  const [reloadNote, setReloadNote]   = useState(false)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLinkState({})
    setReloadNote(false)
    try {
      const res = await fetch('/api/seo/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, currentSlug, limit: 20, minScore: 8 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setSuggestions(data.suggestions)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching suggestions')
    } finally {
      setLoading(false)
    }
  }, [title, content, currentSlug])

  function handleOpen() {
    setOpen(true)
    fetchSuggestions()
  }

  // Copy <a> HTML for a specific phrase
  async function handleCopy(s: Suggestion, phrase: string) {
    const html = `<a href="${s.url}" title="${s.title.replace(/"/g, '&quot;')}">${phrase}</a>`
    await navigator.clipboard.writeText(html)
    const key = `${s.id}-${phrase}`
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 1800)
  }

  // Auto-link a single suggestion's phrase into content
  function handleAutoLink(s: Suggestion) {
    setLinkState(prev => ({ ...prev, [s.id]: 'linking' }))
    try {
      const phrase = s.focusKeyword || s.title
      // Check phrase is in content
      if (!content.toLowerCase().includes(phrase.toLowerCase())) {
        setLinkState(prev => ({ ...prev, [s.id]: 'error:Phrase not found in content' }))
        return
      }
      const newContent = autoInsertLinks(content, [s], 1)
      if (newContent === content) {
        setLinkState(prev => ({ ...prev, [s.id]: 'error:Already linked or phrase inside anchor' }))
        return
      }
      onAutoLink(newContent)
      setLinkState(prev => ({ ...prev, [s.id]: 'done' }))
      setReloadNote(true)
      // Update this suggestion as linked locally
      setSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, alreadyLinked: true } : x))
    } catch {
      setLinkState(prev => ({ ...prev, [s.id]: 'error:Failed' }))
    }
  }

  // Group suggestions by type
  const groups = (['package', 'tour', 'blog', 'news'] as const).map(type => ({
    type,
    items: suggestions.filter(s => s.type === type),
  })).filter(g => g.items.length > 0)

  const unlinkedCount = suggestions.filter(s => !s.alreadyLinked).length

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-48 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl transition-colors"
        title="Internal Link Suggestions"
      >
        <FiLink size={18} />
        {unlinkedCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-indigo-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-indigo-600">
            {unlinkedCount}
          </span>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-black text-gray-900 text-base">
                  🔗 Internal Link Suggestions
                  {!loading && suggestions.length > 0 && (
                    <span className="ml-2 text-sm font-semibold text-indigo-600">{suggestions.length} found</span>
                  )}
                </h2>
                {reloadNote && (
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    ✓ Link inserted — save the form to persist changes
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={fetchSuggestions} disabled={loading}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-50"
                  title="Refresh">
                  <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

              {/* Intro */}
              {!loading && suggestions.length > 0 && (
                <p className="text-xs text-gray-500">
                  Suggested posts to link from your content. <strong>Auto-Link</strong> inserts the link directly into the content editor.
                  <strong> Copy</strong> gives you the HTML to paste manually.
                </p>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                  <FiLoader size={18} className="animate-spin" />
                  <span className="text-sm">Analysing content…</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
              )}

              {!loading && !error && suggestions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiLink size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No relevant pages found.</p>
                  <p className="text-xs mt-1">Add more content or focus keywords to improve matching.</p>
                </div>
              )}

              {/* Groups */}
              {groups.map(({ type, items }) => (
                <div key={type}>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{TYPE_LABEL[type]}</p>
                  <div className="space-y-3">
                    {items.map(s => (
                      <SuggestionCard
                        key={s.id}
                        s={s}
                        typeColor={TYPE_COLOR[type]}
                        typeLabel={TYPE_LABEL[type]}
                        linkStatus={linkState[s.id] ?? ''}
                        copied={copied}
                        onCopy={handleCopy}
                        onAutoLink={handleAutoLink}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            {suggestions.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 shrink-0">
                <p className="text-[11px] text-gray-400">
                  ⚡ Auto-Link inserts directly into the content · 📋 Copy gives you the HTML anchor tag
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Suggestion card ──────────────────────────────────────────────────────────

function SuggestionCard({
  s, typeColor, typeLabel, linkStatus, copied, onCopy, onAutoLink,
}: {
  s:           Suggestion
  typeColor:   string
  typeLabel:   string
  linkStatus:  string
  copied:      Record<string, boolean>
  onCopy:      (s: Suggestion, phrase: string) => void
  onAutoLink:  (s: Suggestion) => void
}) {
  const isLinking = linkStatus === 'linking'
  const isDone    = linkStatus === 'done'
  const isError   = linkStatus.startsWith('error:')
  const errorMsg  = isError ? linkStatus.slice(6) : ''

  // Anchor phrases: focusKeyword + up to 2 matched terms as phrases
  const phrases: string[] = []
  if (s.focusKeyword) phrases.push(s.focusKeyword)
  s.matchedTerms.filter(t => t !== s.focusKeyword).slice(0, 2).forEach(t => phrases.push(t))
  if (phrases.length === 0) phrases.push(s.title)

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      s.alreadyLinked ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200 hover:border-indigo-200'
    }`}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a href={s.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate">
              {s.title}
            </a>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor}`}>{typeLabel}</span>
            {s.alreadyLinked && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                ✓ already linked
              </span>
            )}
          </div>
          {/* Match reason */}
          {s.matchedTerms.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              keyword overlap: {s.matchedTerms.slice(0, 4).join(', ')}
            </p>
          )}
        </div>
        {/* Score */}
        <div className="flex items-center shrink-0">
          <ScoreDot score={s.score} />
          <span className="text-xs font-bold text-gray-500">{s.score}%</span>
        </div>
      </div>

      {/* Anchor phrase chips */}
      {!s.alreadyLinked && (
        <div className="flex flex-wrap gap-2 mt-2">
          {phrases.map(phrase => {
            const copyKey = `${s.id}-${phrase}`
            const isCopied = copied[copyKey]
            return (
              <div key={phrase} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
                <span className="text-xs text-indigo-800 font-medium">{phrase}</span>
                <button
                  type="button"
                  onClick={() => onCopy(s, phrase)}
                  className="ml-1 text-[10px] flex items-center gap-0.5 text-indigo-500 hover:text-indigo-700 transition-colors"
                  title="Copy HTML"
                >
                  {isCopied ? <><FiCheck size={10} /> Copied!</> : <><FiCopy size={10} /> Copy</>}
                </button>
              </div>
            )
          })}

          {/* Auto-Link button */}
          <button
            type="button"
            onClick={() => onAutoLink(s)}
            disabled={isLinking || isDone}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
              isDone
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : isError
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-gray-600'
            }`}
          >
            {isLinking && <FiLoader size={10} className="animate-spin" />}
            {isDone    && <><FiCheck size={10} /> Linked!</>}
            {isError   && `✗ ${errorMsg}`}
            {!isLinking && !isDone && !isError && <><FiZap size={10} /> Auto-Link</>}
          </button>
        </div>
      )}
    </div>
  )
}
