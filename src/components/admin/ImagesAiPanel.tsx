'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FiImage, FiX, FiZap, FiLoader, FiCheck, FiTrash2,
  FiEdit2, FiExternalLink, FiCopy, FiRefreshCw, FiStar,
  FiSave, FiType,
} from 'react-icons/fi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Provider {
  id:        string
  provider:  string
  model:     string
  isActive:  boolean
  isPrimary: boolean
}

interface ImageMeta {
  url:           string
  filename:      string
  altText:       string
  title:         string
  seoAlt:        string
  seoTitle:      string
  seoDesc:       string
  caption:       string
  seoOpen:       boolean
  renaming:      boolean
  renameValue:   string
  aiAltLoading:  boolean
  fixingName:    boolean
}

interface Props {
  images:   string[]
  title?:   string
  onRemove: (url: string) => void
}

type Tab = 'images' | 'prompts' | 'sites'

// ─── Stock image sites ────────────────────────────────────────────────────────

const SITES = [
  { name: 'Unsplash',     url: 'https://unsplash.com',          desc: 'Free high-res photos',         color: 'bg-black text-white' },
  { name: 'Pexels',       url: 'https://pexels.com',            desc: 'Free stock photos & videos',   color: 'bg-teal-600 text-white' },
  { name: 'Pixabay',      url: 'https://pixabay.com',           desc: 'Free images & royalty-free',   color: 'bg-green-600 text-white' },
  { name: 'Freepik',      url: 'https://freepik.com',           desc: 'Vectors, photos & PSD files',  color: 'bg-red-500 text-white' },
  { name: 'Getty Images', url: 'https://gettyimages.com',       desc: 'Premium stock photography',    color: 'bg-blue-700 text-white' },
  { name: 'Shutterstock', url: 'https://shutterstock.com',      desc: 'Millions of stock images',     color: 'bg-red-700 text-white' },
  { name: 'Adobe Stock',  url: 'https://stock.adobe.com',       desc: 'High-quality licensed assets', color: 'bg-red-600 text-white' },
  { name: 'Wikimedia',    url: 'https://commons.wikimedia.org', desc: 'Free media repository',        color: 'bg-gray-700 text-white' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlToFilename(url: string) {
  return decodeURIComponent(url.split('/').pop() ?? url).split('?')[0]
}

function emptyMeta(url: string): ImageMeta {
  return {
    url, filename: urlToFilename(url),
    altText: '', title: '', seoAlt: '', seoTitle: '', seoDesc: '', caption: '',
    seoOpen: false, renaming: false, renameValue: '',
    aiAltLoading: false, fixingName: false,
  }
}

// ─── SeoPanel (top-level to avoid remounting) ─────────────────────────────────

interface SeoPanelProps {
  meta:      ImageMeta
  onUpdate:  (patch: Partial<ImageMeta>) => void
  onAiAlt:   () => void
}

function SeoPanel({ meta, onUpdate, onAiAlt }: SeoPanelProps) {
  return (
    <div className="border border-indigo-300 rounded-2xl bg-indigo-50/20 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">
          SEO Fields — {meta.filename}
        </p>
        <button type="button" onClick={() => onUpdate({ seoOpen: false })}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-indigo-100 text-gray-400 transition-colors">
          <FiX size={13} />
        </button>
      </div>

      {/* Row 1: Alt Text | Title */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Alt Text</label>
          <input type="text" value={meta.altText}
            onChange={e => onUpdate({ altText: e.target.value })}
            placeholder="AC Collection Acne Patch 26 Patches"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
          <input type="text" value={meta.title}
            onChange={e => onUpdate({ title: e.target.value })}
            placeholder="Hover title"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white" />
        </div>
      </div>

      {/* Row 2: SEO Alt | SEO Title */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">SEO Alt</label>
          <input type="text" value={meta.seoAlt}
            onChange={e => onUpdate({ seoAlt: e.target.value })}
            placeholder="SEO alt text"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">SEO Title</label>
          <input type="text" value={meta.seoTitle}
            onChange={e => onUpdate({ seoTitle: e.target.value })}
            placeholder="SEO title tag"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white" />
        </div>
      </div>

      {/* Row 3: SEO Desc | Caption */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">SEO Desc</label>
          <textarea value={meta.seoDesc}
            onChange={e => onUpdate({ seoDesc: e.target.value })}
            placeholder="Structured data description"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 resize-none bg-white" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Caption</label>
          <textarea value={meta.caption}
            onChange={e => onUpdate({ caption: e.target.value })}
            placeholder="Image caption"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 resize-none bg-white" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAiAlt}
          disabled={meta.aiAltLoading}
          className="flex items-center gap-1.5 text-xs font-bold bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white px-3 py-2 rounded-xl transition-colors">
          {meta.aiAltLoading ? <FiLoader size={11} className="animate-spin" /> : <FiZap size={11} />}
          {meta.aiAltLoading ? 'Generating…' : 'AI Fill Alt'}
        </button>
        <button type="button" onClick={() => onUpdate({ seoOpen: false })}
          className="flex items-center gap-1.5 text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl transition-colors">
          <FiSave size={13} /> Save
        </button>
      </div>
    </div>
  )
}

// ─── ImageCard (top-level to avoid remounting) ────────────────────────────────

interface ImageCardProps {
  meta:        ImageMeta
  isFirst:     boolean
  onUpdate:    (patch: Partial<ImageMeta>) => void
  onRemove:    () => void
  onFixName:   () => void
  onAiAlt:     () => void
  noProviders: boolean
}

function ImageCard({ meta, isFirst, onUpdate, onRemove, onFixName, onAiAlt, noProviders }: ImageCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">

      {/* ── Top row: thumbnail LEFT + info RIGHT ── */}
      <div className="flex gap-4 p-3">

        {/* Thumbnail */}
        <div className="relative shrink-0 w-40 rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
          <img src={meta.url} alt={meta.altText || meta.filename} className="w-full h-full object-cover" />
          {isFirst && (
            <div className="absolute top-1.5 left-1.5 bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <FiStar size={7} /> Featured
            </div>
          )}
        </div>

        {/* Info + actions */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">

          {/* Filename */}
          {meta.renaming ? (
            <div className="flex gap-1.5 items-center mb-2">
              <input autoFocus type="text" value={meta.renameValue}
                onChange={e => onUpdate({ renameValue: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter') onUpdate({ filename: meta.renameValue, renaming: false })
                  if (e.key === 'Escape') onUpdate({ renaming: false })
                }}
                className="flex-1 text-xs border border-indigo-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 font-mono" />
              <button type="button" onClick={() => onUpdate({ filename: meta.renameValue, renaming: false })}
                className="text-xs bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 flex items-center gap-1">
                <FiCheck size={10} />
              </button>
              <button type="button" onClick={() => onUpdate({ renaming: false })}
                className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-300">
                <FiX size={10} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-xs font-mono text-gray-600 truncate flex-1">{meta.filename}</p>
              {isFirst && <FiStar size={11} className="text-indigo-400 shrink-0" />}
            </div>
          )}

          {/* Alt text preview */}
          {meta.altText && (
            <p className="text-[11px] text-gray-400 italic truncate mb-2">{meta.altText}</p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button"
              onClick={() => onUpdate({ seoOpen: !meta.seoOpen })}
              className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors ${
                meta.seoOpen ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}>
              🎯 SEO
            </button>

            <button type="button"
              onClick={() => onUpdate({ renaming: true, renameValue: meta.filename })}
              className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
              <FiEdit2 size={9} /> Edit
            </button>

            <button type="button" onClick={onFixName}
              disabled={meta.fixingName || noProviders}
              title="AI: fix filename to SEO-friendly"
              className="flex items-center gap-1 text-[10px] font-bold bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors">
              {meta.fixingName ? <FiLoader size={9} className="animate-spin" /> : <FiType size={9} />}
              {meta.fixingName ? '…' : 'Fix Name'}
            </button>

            <button type="button" onClick={onAiAlt}
              disabled={meta.aiAltLoading || noProviders}
              title="AI: generate alt text"
              className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors">
              {meta.aiAltLoading ? <FiLoader size={9} className="animate-spin" /> : <FiZap size={9} />}
              {meta.aiAltLoading ? '…' : 'Alt AI'}
            </button>

            <a href={meta.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <FiExternalLink size={9} />
            </a>

            <button type="button" onClick={onRemove}
              className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-500 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <FiTrash2 size={9} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SEO panel — inline below, inside card, full width ── */}
      {meta.seoOpen && (
        <div className="border-t border-indigo-200 bg-indigo-50/30 p-4">
          <SeoPanel meta={meta} onUpdate={onUpdate} onAiAlt={onAiAlt} />
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ImagesAiPanel({ images, title = '', onRemove }: Props) {
  const [open, setOpen]           = useState(false)
  const [tab, setTab]             = useState<Tab>('images')
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [metas, setMetas]         = useState<ImageMeta[]>([])
  const [promptLoading, setPromptLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied]       = useState(false)
  const [customPromptCtx, setCustomPromptCtx] = useState('')

  // Load providers when modal opens
  useEffect(() => {
    if (!open) return
    fetch('/api/ai/providers', { credentials: 'include' })
      .then(r => r.json())
      .then((data: Provider[]) => {
        if (!Array.isArray(data)) return
        const active = data.filter(p => p.isActive)
        setProviders(active)
        const primary = active.find(p => p.isPrimary) ?? active[0]
        if (primary) setSelectedProvider(primary.provider)
      })
      .catch(() => {})
  }, [open])

  // Sync metas with images prop (preserve existing metadata)
  useEffect(() => {
    setMetas(prev => images.map(url => prev.find(m => m.url === url) ?? emptyMeta(url)))
  }, [images])

  const updateMeta = useCallback((index: number, patch: Partial<ImageMeta>) => {
    setMetas(prev => prev.map((m, i) => i === index ? { ...m, ...patch } : m))
  }, [])

  // AI: generate alt text
  const generateAlt = useCallback(async (index: number) => {
    const provider = providers.find(p => p.provider === selectedProvider)
    if (!provider) return
    updateMeta(index, { aiAltLoading: true })
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          mode: 'raw', provider: selectedProvider, model: provider.model,
          systemPrompt: 'You are an SEO specialist for a travel company. Generate descriptive, keyword-rich alt text for a travel image. Return plain text only, max 125 characters, no quotes.',
          userMessage: `Generate alt text for image ${index + 1} of a travel page${title ? ` titled "${title}"` : ''}. Image URL: ${metas[index]?.url}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const text = data.text?.trim() ?? ''
      updateMeta(index, { altText: text, seoAlt: text })
    } catch { /* ignore */ }
    finally { updateMeta(index, { aiAltLoading: false }) }
  }, [providers, selectedProvider, title, metas, updateMeta])

  // AI: fix filename
  const fixFilename = useCallback(async (index: number) => {
    const provider = providers.find(p => p.provider === selectedProvider)
    if (!provider) return
    updateMeta(index, { fixingName: true })
    try {
      const current = metas[index]?.filename ?? ''
      const res = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          mode: 'raw', provider: selectedProvider, model: provider.model,
          systemPrompt: 'You are an SEO specialist. Return a clean SEO-friendly image filename: lowercase, hyphens, descriptive keywords, keep the file extension. Return the filename only.',
          userMessage: `Current filename: "${current}". Page title: "${title || 'travel page'}". Return only the new filename.`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const fixed = data.text?.trim().replace(/[^a-z0-9.\-]/gi, '-').toLowerCase() ?? current
      updateMeta(index, { renaming: true, renameValue: fixed })
    } catch { /* ignore */ }
    finally { updateMeta(index, { fixingName: false }) }
  }, [providers, selectedProvider, title, metas, updateMeta])

  // Generate all alt texts sequentially
  async function generateAllAlts() {
    for (let i = 0; i < metas.length; i++) await generateAlt(i)
  }

  // AI: image search prompts
  async function generateImagePrompt() {
    const provider = providers.find(p => p.provider === selectedProvider)
    if (!provider) return
    setPromptLoading(true)
    setGeneratedPrompt('')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          mode: 'raw', provider: selectedProvider, model: provider.model,
          systemPrompt: 'You are a visual content strategist for a travel company. Generate 3 specific, vivid image search prompts for stock photo sites. Each on a new line, starting with a dash.',
          userMessage: `Generate image search prompts for: ${customPromptCtx || title || 'a travel destination'}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGeneratedPrompt(data.text?.trim() ?? '')
    } catch {
      setGeneratedPrompt('Failed to generate — check your AI provider settings.')
    } finally {
      setPromptLoading(false)
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const providerLabel = (p: string) =>
    ({ openai: 'OpenAI', groq: 'Groq', gemini: 'Gemini', openrouter: 'OpenRouter' }[p] ?? p)

  const noProviders = providers.length === 0

  // Which SEO panel is open

  return (
    <>
      {/* ── Floating button ── */}
      <button type="button" onClick={() => setOpen(true)} title="Images & AI Generation"
        className="fixed bottom-32 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl transition-colors">
        <FiImage size={18} />
        {images.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-indigo-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-indigo-500">
            {images.length}
          </span>
        )}
      </button>

      {/* ── Modal ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-500 shrink-0">
              <h2 className="font-black text-white text-base flex items-center gap-2">
                🎨 Images &amp; AI Generation
              </h2>
              <button type="button" onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
                <FiX size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0">
              {([
                { id: 'images',  label: '🖼 Images' },
                { id: 'prompts', label: '✏️ Prompts' },
                { id: 'sites',   label: '🌐 Sites' },
              ] as const).map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`flex-1 px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
                    tab === t.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* AI Model selector */}
            {(tab === 'images' || tab === 'prompts') && (
              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide shrink-0">AI Model</label>
                {providers.length > 0 ? (
                  <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-400 bg-white">
                    {providers.map(p => (
                      <option key={p.provider} value={p.provider}>
                        {providerLabel(p.provider)} — {p.model}{p.isPrimary ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-gray-400 italic">No active AI providers — configure at Settings → AI Provider Config</span>
                )}
              </div>
            )}

            {/* ── Tab: Images ── */}
            {tab === 'images' && (
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Product Images ({images.length})
                  </p>
                  {images.length > 1 && (
                    <button type="button" onClick={generateAllAlts} disabled={noProviders}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors">
                      <FiZap size={11} /> Generate All Alt Texts
                    </button>
                  )}
                </div>

                {images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
                    <FiImage size={40} className="opacity-20" />
                    <p className="text-sm">No images yet — add them in the form above</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {metas.map((meta, i) => (
                      <ImageCard
                        key={meta.url}
                        meta={meta}
                        isFirst={i === 0}
                        noProviders={noProviders}
                        onUpdate={patch => updateMeta(i, patch)}
                        onRemove={() => onRemove(meta.url)}
                        onFixName={() => fixFilename(i)}
                        onAiAlt={() => generateAlt(i)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Prompts ── */}
            {tab === 'prompts' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">Context (optional)</label>
                  <input type="text" value={customPromptCtx} onChange={e => setCustomPromptCtx(e.target.value)}
                    placeholder={title || 'e.g. Bali beach resort, sunset, luxury…'}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400" />
                  <p className="text-[11px] text-gray-400 mt-1">Leave blank to use the page title.</p>
                </div>
                <button type="button" onClick={generateImagePrompt} disabled={promptLoading || noProviders}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                  {promptLoading ? <FiLoader size={14} className="animate-spin" /> : <FiZap size={14} />}
                  {promptLoading ? 'Generating…' : 'Generate Image Prompts'}
                </button>
                {generatedPrompt && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{generatedPrompt}</pre>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={copyPrompt}
                        className="flex items-center gap-2 text-xs font-semibold bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl transition-colors">
                        {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
                      </button>
                      <button type="button" onClick={generateImagePrompt} disabled={promptLoading}
                        className="flex items-center gap-2 text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl transition-colors">
                        <FiRefreshCw size={12} /> Regenerate
                      </button>
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">What are image prompts?</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Specific search queries for stock image sites like Unsplash and Pexels.
                    Also usable with AI image generators like Midjourney or DALL·E.
                  </p>
                </div>
              </div>
            )}

            {/* ── Tab: Sites ── */}
            {tab === 'sites' && (
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-xs text-gray-500 mb-4">
                  Curated stock image sites — open in new tab, then use prompts from the Prompts tab.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SITES.map(site => (
                    <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition-all group">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${site.color}`}>
                        {site.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{site.name}</p>
                        <p className="text-[11px] text-gray-400">{site.desc}</p>
                      </div>
                      <FiExternalLink size={13} className="ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
