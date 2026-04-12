'use client'

import { useState, useRef, useCallback } from 'react'
import {
  FiUpload, FiX, FiStar, FiImage, FiLoader, FiPlus,
  FiArrowLeft, FiArrowRight, FiLink, FiZap,
} from 'react-icons/fi'

export type GalleryLayout = 'grid-2x2' | 'grid-3col' | 'featured-left' | 'featured-right' | 'strip'

const LAYOUTS: { id: GalleryLayout; label: string; preview: React.ReactNode }[] = [
  {
    id: 'grid-2x2', label: 'Classic (1 + 2×2)',
    preview: (
      <div className="flex gap-0.5 h-8 w-full">
        <div className="flex-3 bg-current rounded-sm opacity-70" />
        <div className="flex-2 grid grid-cols-2 gap-0.5">
          {[0,1,2,3].map(i => <div key={i} className="bg-current rounded-sm opacity-50" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'featured-left', label: 'Featured Left',
    preview: (
      <div className="flex gap-0.5 h-8 w-full">
        <div className="flex-2 bg-current rounded-sm opacity-70" />
        <div className="flex-1 flex flex-col gap-0.5">
          {[0,1,2].map(i => <div key={i} className="flex-1 bg-current rounded-sm opacity-50" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'featured-right', label: 'Featured Right',
    preview: (
      <div className="flex gap-0.5 h-8 w-full">
        <div className="flex-1 flex flex-col gap-0.5">
          {[0,1,2].map(i => <div key={i} className="flex-1 bg-current rounded-sm opacity-50" />)}
        </div>
        <div className="flex-2 bg-current rounded-sm opacity-70" />
      </div>
    ),
  },
  {
    id: 'grid-3col', label: '3-Column Grid',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 h-8 w-full">
        {[0,1,2,3,4,5].map(i => <div key={i} className={`bg-current rounded-sm ${i === 0 ? 'opacity-70' : 'opacity-50'}`} />)}
      </div>
    ),
  },
  {
    id: 'strip', label: 'Strip',
    preview: (
      <div className="flex flex-col gap-0.5 h-8 w-full">
        <div className="flex-2 bg-current rounded-sm opacity-70 w-full" />
        <div className="flex-1 flex gap-0.5">
          {[0,1,2,3].map(i => <div key={i} className="flex-1 bg-current rounded-sm opacity-40" />)}
        </div>
      </div>
    ),
  },
]

// ─── Client-side image compression ───────────────────────────────────────────

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX = 1600
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX }
        else                { width  = Math.round((width / height) * MAX); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      const isPng = file.type === 'image/png'
      const mime  = isPng ? 'image/png' : 'image/jpeg'
      const quality = 0.82
      canvas.toBlob((blob) => {
        if (!blob || blob.size >= file.size) { resolve(file); return }
        const ext  = isPng ? '.png' : '.jpg'
        const name = file.name.replace(/\.[^.]+$/, '') + ext
        resolve(new File([blob], name, { type: mime }))
      }, mime, quality)
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }
    img.src = objectUrl
  })
}

// ─── Generate slug from title/name fields ─────────────────────────────────────

function getPageSlug(): string {
  const titleEl = document.querySelector<HTMLInputElement>('input[name="title"], input[placeholder*="title"], input[placeholder*="Title"]')
  return titleEl?.value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image'
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImageItem {
  url:     string
  altText?: string
}

interface Props {
  images:          string[]
  onChange:        (images: string[]) => void
  layout?:         GalleryLayout
  onLayoutChange?: (layout: GalleryLayout) => void
  folder?:         string
  maxImages?:      number
}

export default function MultiImageUploader({
  images, onChange, layout = 'grid-2x2', onLayoutChange,
  folder = 'media', maxImages = 10,
}: Props) {
  const [uploading, setUploading]   = useState(false)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [error, setError]           = useState('')
  const [urlInput, setUrlInput]     = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const [aiLoading, setAiLoading]   = useState<number | null>(null) // index of image being AI-alt'd
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Upload a File object ──────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const compressed = await compressImage(file)
      const slug = getPageSlug()
      const ext  = compressed.name.replace(/.*\./, '')
      const named = new File([compressed], `${slug}-${Date.now()}.${ext}`, { type: compressed.type })

      const fd = new FormData()
      fd.append('file', named)
      fd.append('folder', folder)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd, credentials: 'include' })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const { url } = await res.json()
      onChange([...images, url])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [folder, images, onChange])

  // ── Upload multiple files sequentially ───────────────────────────────────

  function uploadFiles(files: File[]) {
    const allowed = files.filter(f => f.type.startsWith('image/')).slice(0, maxImages - images.length)
    allowed.reduce((p, f) => p.then(() => uploadFile(f)), Promise.resolve())
  }

  // ── Load from remote URL via proxy ───────────────────────────────────────

  async function loadFromUrl() {
    const url = urlInput.trim()
    if (!url || images.length >= maxImages) return
    setLoadingUrl(true)
    setError('')
    try {
      const proxy = `/api/media/fetch-image?url=${encodeURIComponent(url)}`
      const res = await fetch(proxy, { credentials: 'include' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `Fetch failed (${res.status})`)
      }
      const blob = await res.blob()
      const ext  = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'
      const file = new File([blob], `loaded-image.${ext}`, { type: blob.type })
      setUrlInput('')
      await uploadFile(file)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoadingUrl(false)
    }
  }

  // ── AI alt text generation for an image ──────────────────────────────────

  async function generateAltText(index: number) {
    setAiLoading(index)
    try {
      const imageUrl = images[index]
      const title = document.querySelector<HTMLInputElement>('input[name="title"]')?.value || ''
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'raw',
          systemPrompt: 'You are an SEO specialist. Generate a descriptive, keyword-rich alt text for a travel image. Return plain text only, max 125 characters, no quotes.',
          userMessage: `Generate alt text for image ${index + 1} of a travel package${title ? ` called "${title}"` : ''}. Image URL: ${imageUrl}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Store alt text in a data attribute on the image — parent can read via dataset
      // We fire a custom event so parent forms can capture it if needed
      const imgEl = document.querySelector<HTMLImageElement>(`[data-img-index="${index}"]`)
      if (imgEl) imgEl.alt = data.text?.trim() || imgEl.alt
    } catch {
      // silently ignore — alt text is optional
    } finally {
      setAiLoading(null)
    }
  }

  // ── Image ordering ────────────────────────────────────────────────────────

  function remove(i: number) { onChange(images.filter((_, idx) => idx !== i)) }

  function setFeatured(i: number) {
    if (i === 0) return
    const next = [...images]; const [item] = next.splice(i, 1); next.unshift(item); onChange(next)
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const next = [...images];[next[i], next[j]] = [next[j], next[i]]; onChange(next)
  }

  const canAdd = images.length < maxImages

  return (
    <div className="space-y-5">

      {/* ── Image grid ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photos</label>
          <span className="text-xs text-gray-400">{images.length}/{maxImages} · first = featured</span>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={img + i}
                className="relative group rounded-xl overflow-hidden border-2 bg-gray-100"
                style={{ aspectRatio: '16/9', borderColor: i === 0 ? '#f97316' : '#e5e7eb' }}>
                <img
                  src={img} alt={`Photo ${i + 1}`}
                  data-img-index={i}
                  className="w-full h-full object-cover"
                />

                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                    <FiStar size={8} /> Featured
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  {i !== 0 && (
                    <button type="button" onClick={() => setFeatured(i)}
                      className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg w-full justify-center">
                      <FiStar size={9} /> Set featured
                    </button>
                  )}
                  <div className="flex gap-1 w-full">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      className="flex-1 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg disabled:opacity-25">
                      <FiArrowLeft size={11} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1}
                      className="flex-1 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg disabled:opacity-25">
                      <FiArrowRight size={11} />
                    </button>
                    <button type="button" onClick={() => generateAltText(i)}
                      disabled={aiLoading === i}
                      title="Generate AI alt text"
                      className="flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white p-1.5 rounded-lg">
                      {aiLoading === i ? <FiLoader size={11} className="animate-spin" /> : <FiZap size={11} />}
                    </button>
                    <button type="button" onClick={() => remove(i)}
                      className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg">
                      <FiX size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {canAdd && (
              <div
                onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(Array.from(e.dataTransfer.files)) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                style={{ aspectRatio: '16/9' }}>
                {uploading
                  ? <FiLoader size={18} className="animate-spin text-indigo-500" />
                  : <><FiPlus size={18} className="text-gray-400" /><span className="text-[10px] text-gray-400">Add</span></>
                }
              </div>
            )}
          </div>
        ) : (
          /* ── Empty drop zone ── */
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(Array.from(e.dataTransfer.files)) }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
            {uploading
              ? <div className="flex flex-col items-center gap-2 text-indigo-500"><FiLoader size={24} className="animate-spin" /><p className="text-sm font-medium">Uploading…</p></div>
              : <div className="flex flex-col items-center gap-2 text-gray-400">
                  <FiImage size={28} />
                  <p className="text-sm font-medium text-gray-600">📁 Click to browse or drag & drop image</p>
                  <p className="text-xs">PNG, JPG, WebP · up to {maxImages} images · compressed automatically</p>
                </div>
            }
          </div>
        )}

        {/* ── Upload more button ── */}
        {images.length > 0 && canAdd && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-500 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
            {uploading ? <FiLoader size={12} className="animate-spin" /> : <FiUpload size={12} />}
            {uploading ? 'Uploading…' : 'Upload more photos'}
          </button>
        )}

        {/* ── Load from URL ── */}
        {canAdd && (
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-indigo-400 transition-colors">
              <FiLink size={13} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), loadFromUrl())}
                placeholder="Or paste image URL…"
                className="flex-1 text-sm py-2 focus:outline-none bg-transparent"
              />
            </div>
            <button type="button" onClick={loadFromUrl} disabled={loadingUrl || !urlInput.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50 px-3 py-2 rounded-xl transition-colors">
              {loadingUrl ? <FiLoader size={12} className="animate-spin" /> : <FiLink size={12} />}
              {loadingUrl ? 'Loading…' : '⬇ Load'}
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>✗</span> {error}</p>}
      </div>

      {/* ── Gallery Layout picker ── */}
      {onLayoutChange && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gallery Layout</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {LAYOUTS.map((l) => (
              <button key={l.id} type="button" onClick={() => onLayoutChange(l.id)}
                className={`flex flex-col gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                  layout === l.id
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-500'
                    : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-500'
                }`}>
                <div className="w-full">{l.preview}</div>
                <span className="text-[10px] font-semibold leading-tight">{l.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400">Choose how photos are arranged on the detail page. First photo is always featured.</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
        uploadFiles(Array.from(e.target.files ?? []))
        e.target.value = ''
      }} />
    </div>
  )
}
