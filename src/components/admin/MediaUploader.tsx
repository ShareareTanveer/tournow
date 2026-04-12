'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiLoader, FiLink, FiZap } from 'react-icons/fi'

// ─── Client-side image compression ─────────────────────────────────────────────

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
      canvas.toBlob((blob) => {
        if (!blob || blob.size >= file.size) { resolve(file); return }
        const ext  = isPng ? '.png' : '.jpg'
        const name = file.name.replace(/\.[^.]+$/, '') + ext
        resolve(new File([blob], name, { type: mime }))
      }, mime, 0.82)
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }
    img.src = objectUrl
  })
}

function getPageSlug(): string {
  const titleEl = document.querySelector<HTMLInputElement>('input[name="title"], input[placeholder*="title"], input[placeholder*="Title"]')
  return titleEl?.value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image'
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  className?: string
  showAltText?: boolean
}

export default function MediaUploader({
  value, onChange, folder = 'media', label = 'Image', className = '', showAltText = false,
}: Props) {
  const [uploading, setUploading]   = useState(false)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [aiLoading, setAiLoading]   = useState(false)
  const [error, setError]           = useState('')
  const [urlInput, setUrlInput]     = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Upload a File ──────────────────────────────────────────────────────────

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only images and videos are supported')
      return
    }
    setUploading(true)
    setError('')
    try {
      const isImage = file.type.startsWith('image/')
      const processed = isImage ? await compressImage(file) : file

      const slug = getPageSlug()
      const ext  = processed.name.replace(/.*\./, '')
      const named = new File([processed], `${slug}-${Date.now()}.${ext}`, { type: processed.type })

      const fd = new FormData()
      fd.append('file', named)
      fd.append('folder', folder)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd, credentials: 'include' })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const { url } = await res.json()
      onChange(url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Load from remote URL via proxy ─────────────────────────────────────────

  async function loadFromUrl() {
    const url = urlInput.trim()
    if (!url) return
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
      await handleFile(file)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoadingUrl(false)
    }
  }

  // ── AI alt text ────────────────────────────────────────────────────────────

  async function generateAltText() {
    if (!value) return
    setAiLoading(true)
    try {
      const title = document.querySelector<HTMLInputElement>('input[name="title"]')?.value || ''
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'raw',
          systemPrompt: 'You are an SEO specialist. Generate a descriptive, keyword-rich alt text for a travel image. Return plain text only, max 125 characters, no quotes.',
          userMessage: `Generate alt text for a cover image of a travel page${title ? ` called "${title}"` : ''}. Image URL: ${value}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Update the img alt attribute if visible
      const imgEl = document.querySelector<HTMLImageElement>('[data-media-preview]')
      if (imgEl) imgEl.alt = data.text?.trim() || imgEl.alt
    } catch {
      // silently ignore — alt text is optional
    } finally {
      setAiLoading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Preview" data-media-preview className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <FiUpload size={12} /> Replace
            </button>
            {showAltText && (
              <button
                type="button"
                onClick={generateAltText}
                disabled={aiLoading}
                title="Generate AI alt text"
                className="bg-violet-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-violet-600 disabled:opacity-60 transition-colors flex items-center gap-1.5"
              >
                {aiLoading ? <FiLoader size={12} className="animate-spin" /> : <FiZap size={12} />}
                Alt Text
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5"
            >
              <FiX size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/30'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-orange-500">
              <FiLoader size={24} className="animate-spin" />
              <p className="text-sm font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <FiImage size={28} />
              <p className="text-sm font-medium text-gray-600">Drop image here or click to browse</p>
              <p className="text-xs">PNG, JPG, WebP · compressed automatically</p>
            </div>
          )}
        </div>
      )}

      {/* Load from URL row */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-orange-400 transition-colors bg-white">
          <FiLink size={13} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), loadFromUrl())}
            placeholder="Or paste image URL to fetch…"
            className="flex-1 text-sm py-2 focus:outline-none bg-transparent"
          />
        </div>
        <button
          type="button"
          onClick={loadFromUrl}
          disabled={loadingUrl || !urlInput.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50 px-3 py-2 rounded-xl transition-colors"
        >
          {loadingUrl ? <FiLoader size={12} className="animate-spin" /> : <FiLink size={12} />}
          {loadingUrl ? 'Loading…' : '⬇ Load'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>✗</span> {error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
