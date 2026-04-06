'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiLoader } from 'react-icons/fi'

interface Props {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  className?: string
}

export default function MediaUploader({ value, onChange, folder = 'media', label = 'Image', className = '' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only images and videos are supported')
      return
    }
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Upload failed')
      }
      const { url } = await res.json()
      onChange(url)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <FiUpload size={12} /> Replace
            </button>
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
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all"
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
              <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF up to 10MB</p>
            </div>
          )}
        </div>
      )}

      {/* Also allow pasting a URL directly */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste image URL…"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
        />
        {uploading && <div className="flex items-center px-2"><FiLoader size={16} className="animate-spin text-orange-500" /></div>}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

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
