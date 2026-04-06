'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiCopy, FiTrash2, FiImage, FiLoader } from 'react-icons/fi'

interface MediaItem {
  id: string
  url: string
  filename: string
  mimeType?: string | null
  size?: number | null
  createdAt: Date | string
}

export default function MediaLibraryClient({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'media')
    const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { media } = await res.json()
      setItems(i => [media, ...i])
    }
    setUploading(false)
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 1500)
  }

  async function del(id: string, url: string) {
    if (!confirm('Delete this media item?')) return
    // For local storage we'd delete the file, for now just remove from DB
    await fetch(`/api/media/${id}`, { method: 'DELETE' })
    setItems(i => i.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-orange-500">
            <FiLoader size={24} className="animate-spin" />
            <p className="text-sm font-medium">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <FiUpload size={24} />
            <p className="text-sm font-medium text-gray-600">Drop files here or click to upload</p>
            <p className="text-xs">PNG, JPG, WebP, GIF — max 10MB</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map(item => (
          <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-32 bg-gray-50">
              {item.mimeType?.startsWith('image') || !item.mimeType ? (
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><FiImage size={28} className="text-gray-300" /></div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-600 truncate">{item.filename.split('/').pop()}</p>
              {item.size && <p className="text-[10px] text-gray-400">{(item.size / 1024).toFixed(0)} KB</p>}
            </div>
            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => copyUrl(item.url)}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Copy URL">
                {copied === item.url ? <span className="text-green-600 text-xs font-bold">✓</span> : <FiCopy size={13} />}
              </button>
              <button onClick={() => del(item.id, item.url)}
                className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Delete">
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !uploading && (
          <div className="col-span-full py-12 text-center text-gray-400 text-sm">No media uploaded yet</div>
        )}
      </div>
    </div>
  )
}
