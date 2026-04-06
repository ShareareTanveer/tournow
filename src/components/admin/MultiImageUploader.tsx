'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiStar, FiImage, FiLoader, FiPlus, FiArrowLeft, FiArrowRight } from 'react-icons/fi'

export type GalleryLayout = 'grid-2x2' | 'grid-3col' | 'featured-left' | 'featured-right' | 'strip'

const LAYOUTS: { id: GalleryLayout; label: string; preview: React.ReactNode }[] = [
  {
    id: 'grid-2x2',
    label: 'Classic (1 + 2×2)',
    preview: (
      <div className="flex gap-0.5 h-8 w-full">
        <div className="flex-[3] bg-current rounded-sm opacity-70" />
        <div className="flex-[2] grid grid-cols-2 gap-0.5">
          {[0,1,2,3].map(i => <div key={i} className="bg-current rounded-sm opacity-50" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'featured-left',
    label: 'Featured Left',
    preview: (
      <div className="flex gap-0.5 h-8 w-full">
        <div className="flex-[2] bg-current rounded-sm opacity-70" />
        <div className="flex-1 flex flex-col gap-0.5">
          {[0,1,2].map(i => <div key={i} className="flex-1 bg-current rounded-sm opacity-50" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'featured-right',
    label: 'Featured Right',
    preview: (
      <div className="flex gap-0.5 h-8 w-full">
        <div className="flex-1 flex flex-col gap-0.5">
          {[0,1,2].map(i => <div key={i} className="flex-1 bg-current rounded-sm opacity-50" />)}
        </div>
        <div className="flex-[2] bg-current rounded-sm opacity-70" />
      </div>
    ),
  },
  {
    id: 'grid-3col',
    label: '3-Column Grid',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 h-8 w-full">
        {[0,1,2,3,4,5].map(i => <div key={i} className={`bg-current rounded-sm ${i === 0 ? 'opacity-70' : 'opacity-50'}`} />)}
      </div>
    ),
  },
  {
    id: 'strip',
    label: 'Strip',
    preview: (
      <div className="flex flex-col gap-0.5 h-8 w-full">
        <div className="flex-[2] bg-current rounded-sm opacity-70 w-full" />
        <div className="flex-1 flex gap-0.5">
          {[0,1,2,3].map(i => <div key={i} className="flex-1 bg-current rounded-sm opacity-40" />)}
        </div>
      </div>
    ),
  },
]

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  layout?: GalleryLayout
  onLayoutChange?: (layout: GalleryLayout) => void
  folder?: string
  maxImages?: number
}

export default function MultiImageUploader({
  images, onChange, layout = 'grid-2x2', onLayoutChange,
  folder = 'media', maxImages = 10,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const { url } = await res.json()
      onChange([...images, url])
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, maxImages - images.length)
    files.reduce((p, f) => p.then(() => uploadFile(f)), Promise.resolve())
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).slice(0, maxImages - images.length)
    files.reduce((p, f) => p.then(() => uploadFile(f)), Promise.resolve())
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url || images.length >= maxImages) return
    onChange([...images, url])
    setUrlInput('')
  }

  function remove(i: number) { onChange(images.filter((_, idx) => idx !== i)) }

  function setFeatured(i: number) {
    if (i === 0) return
    const next = [...images]
    const [item] = next.splice(i, 1)
    next.unshift(item)
    onChange(next)
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const canAdd = images.length < maxImages

  return (
    <div className="space-y-5">

      {/* ── Images section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photos</label>
          <span className="text-xs text-gray-400">{images.length}/{maxImages} · first = featured</span>
        </div>

        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={img + i}
                  className="relative group rounded-xl overflow-hidden border-2 bg-gray-100"
                  style={{ aspectRatio: '16/9', borderColor: i === 0 ? 'var(--brand)' : '#e5e7eb' }}>
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                  {i === 0 && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      <FiStar size={8} /> Featured
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {i !== 0 && (
                      <button type="button" onClick={() => setFeatured(i)}
                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg w-full justify-center">
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
                      <button type="button" onClick={() => remove(i)}
                        className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg">
                        <FiX size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {canAdd && (
                <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                  onClick={() => inputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all"
                  style={{ aspectRatio: '16/9' }}>
                  {uploading
                    ? <FiLoader size={18} className="animate-spin text-orange-500" />
                    : <><FiPlus size={18} className="text-gray-400" /><span className="text-[10px] text-gray-400">Add</span></>
                  }
                </div>
              )}
            </div>

            {canAdd && (
              <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 text-xs font-semibold text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                {uploading ? <FiLoader size={12} className="animate-spin" /> : <FiUpload size={12} />}
                {uploading ? 'Uploading…' : 'Upload more'}
              </button>
            )}
          </>
        ) : (
          <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all">
            {uploading
              ? <div className="flex flex-col items-center gap-2 text-orange-500"><FiLoader size={24} className="animate-spin" /><p className="text-sm font-medium">Uploading…</p></div>
              : <div className="flex flex-col items-center gap-2 text-gray-400"><FiImage size={28} /><p className="text-sm font-medium text-gray-600">Drop images here or click to browse</p><p className="text-xs">PNG, JPG, WebP · up to {maxImages} images · first = featured</p></div>
            }
          </div>
        )}

        {canAdd && (
          <div className="flex gap-2">
            <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="Or paste image URL and press Enter…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400" />
            <button type="button" onClick={addUrl}
              className="text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg">Add</button>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
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
                    ? 'border-orange-400 bg-orange-50 text-orange-500'
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

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onInputChange} />
    </div>
  )
}
