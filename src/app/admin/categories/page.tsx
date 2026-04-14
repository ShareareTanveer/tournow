'use client'

import { useEffect, useRef, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import MediaUploader from '@/components/admin/MediaUploader'
import { FiEdit2, FiCheck, FiX, FiHash, FiAlignLeft, FiLayers, FiImage } from 'react-icons/fi'

const DEFAULT_CATEGORIES = [
  { slug: 'family',    label: 'Family',    description: 'Family-friendly tours for all ages',   emoji: '👨‍👩‍👧‍👦' },
  { slug: 'honeymoon', label: 'Honeymoon', description: 'Romantic getaways for couples',         emoji: '💑' },
  { slug: 'solo',      label: 'Solo',      description: 'Adventures for solo travelers',         emoji: '🧳' },
  { slug: 'squad',     label: 'Squad',     description: 'Group adventures with friends',         emoji: '👯' },
  { slug: 'corporate', label: 'Corporate', description: 'Business travel and team outings',      emoji: '💼' },
  { slug: 'special',   label: 'Special',   description: 'Special occasion packages',             emoji: '🎉' },
  { slug: 'holiday',   label: 'Holiday',   description: 'Seasonal holiday packages',             emoji: '🌴' },
]

const SLUG_COLORS: Record<string, { from: string; to: string; accent: string; light: string }> = {
  family:    { from: 'from-orange-400', to: 'to-amber-500',   accent: 'bg-orange-500',  light: 'bg-orange-50 text-orange-700 border-orange-200' },
  honeymoon: { from: 'from-pink-400',   to: 'to-rose-500',    accent: 'bg-pink-500',    light: 'bg-pink-50 text-pink-700 border-pink-200' },
  solo:      { from: 'from-violet-400', to: 'to-purple-500',  accent: 'bg-violet-500',  light: 'bg-violet-50 text-violet-700 border-violet-200' },
  squad:     { from: 'from-blue-400',   to: 'to-indigo-500',  accent: 'bg-blue-500',    light: 'bg-blue-50 text-blue-700 border-blue-200' },
  corporate: { from: 'from-slate-400',  to: 'to-gray-600',    accent: 'bg-slate-600',   light: 'bg-slate-50 text-slate-700 border-slate-200' },
  special:   { from: 'from-emerald-400',to: 'to-teal-500',    accent: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  holiday:   { from: 'from-cyan-400',   to: 'to-sky-500',     accent: 'bg-cyan-500',    light: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
}

interface Cat {
  id?: string
  slug: string
  label: string
  description?: string
  imageUrl?: string
  iconName?: string
  sortOrder?: number
  isActive?: boolean
  emoji?: string
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ cat, onSave, onClose }: {
  cat: Cat
  onSave: (data: Partial<Cat>) => Promise<void>
  onClose: () => void
}) {
  const [data, setData] = useState<Partial<Cat>>({ ...cat })
  const [saving, setSaving] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const colors = SLUG_COLORS[cat.slug] ?? { from: 'from-gray-400', to: 'to-gray-500', accent: 'bg-gray-500', light: '' }
  const def = DEFAULT_CATEGORIES.find(d => d.slug === cat.slug)
  const emoji = def?.emoji ?? '📦'

  async function handleSave() {
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Modal header — colored cover */}
        <div className={`relative h-20 bg-linear-to-br ${colors.from} ${colors.to} flex items-end px-6 pb-4`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow">{emoji}</span>
            <div>
              <p className="text-white font-black text-xl leading-tight drop-shadow">{cat.label}</p>
              <p className="text-white/70 text-xs font-mono">{cat.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <FiX size={15} />
          </button>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-5">

          {/* Cover Image */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <FiImage size={10} /> Cover Image
            </label>
            <MediaUploader
              label=""
              value={data.imageUrl || ''}
              onChange={(url) => setData(d => ({ ...d, imageUrl: url }))}
              folder="categories"
              className="space-y-1!"
            />
          </div>

          {/* Label */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <FiHash size={10} /> Label
            </label>
            <input
              value={data.label || ''}
              onChange={e => setData(d => ({ ...d, label: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <FiAlignLeft size={10} /> Description
            </label>
            <textarea
              rows={3}
              value={data.description || ''}
              onChange={e => setData(d => ({ ...d, description: e.target.value }))}
              placeholder="Short description shown on homepage category card…"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <FiLayers size={10} /> Sort Order
            </label>
            <input
              type="number" min={0}
              value={data.sortOrder ?? 0}
              onChange={e => setData(d => ({ ...d, sortOrder: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm"
          >
            <FiCheck size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([])
  const [editing, setEditing] = useState<Cat | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((data: Cat[]) => {
        const merged = DEFAULT_CATEGORIES.map(def => {
          const existing = data.find(d => d.slug === def.slug)
          return existing ? { ...def, ...existing } : { ...def, isActive: true, sortOrder: 0 }
        })
        setCats(merged)
      })
      .catch(() => setCats(DEFAULT_CATEGORIES.map(d => ({ ...d, isActive: true, sortOrder: 0 }))))
  }, [])

  async function saveEdit(data: Partial<Cat>) {
    if (!editing) return
    const payload = { ...data, slug: editing.slug, label: data.label || editing.label }
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setCats(prev => prev.map(c => c.slug === editing.slug ? { ...c, ...payload } : c))
    setSaved(editing.slug)
    setTimeout(() => setSaved(null), 2500)
    setEditing(null)
  }

  const configured = cats.filter(c => c.imageUrl).length

  return (
    <AdminShell title="Tour Categories" subtitle="Manage category images and descriptions shown on the homepage">

      {/* Modal */}
      {editing && (
        <EditModal
          cat={editing}
          onSave={saveEdit}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <FiLayers size={15} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 leading-none">Total</p>
            <p className="text-sm font-black text-gray-800 leading-tight">{cats.length} categories</p>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <FiImage size={15} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 leading-none">With image</p>
            <p className="text-sm font-black text-gray-800 leading-tight">{configured} / {cats.length}</p>
          </div>
        </div>
        {configured < cats.length && (
          <>
            <div className="w-px h-8 bg-gray-200" />
            <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              {cats.length - configured} missing image{cats.length - configured !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cats.map((cat) => {
          const colors = SLUG_COLORS[cat.slug] ?? { from: 'from-gray-400', to: 'to-gray-500', accent: 'bg-gray-500', light: '' }
          const def = DEFAULT_CATEGORIES.find(d => d.slug === cat.slug)
          const emoji = def?.emoji ?? '📦'

          return (
            <div key={cat.slug} className={`group bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${
              saved === cat.slug
                ? 'border-emerald-300 ring-2 ring-emerald-100'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}>

              {/* Cover */}
              {cat.imageUrl ? (
                <div className="relative h-28 overflow-hidden">
                  <img src={cat.imageUrl} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-xl drop-shadow">{emoji}</span>
                    <span className="text-white font-black text-base drop-shadow">{cat.label}</span>
                  </div>
                  {cat.sortOrder != null && cat.sortOrder > 0 && (
                    <div className="absolute top-2 right-2 text-[10px] font-bold bg-black/40 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                      #{cat.sortOrder}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`h-28 bg-linear-to-br ${colors.from} ${colors.to} flex flex-col items-center justify-center gap-1.5 relative`}>
                  <span className="text-4xl drop-shadow">{emoji}</span>
                  <span className="text-white font-black text-base">{cat.label}</span>
                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    No image
                  </span>
                </div>
              )}

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.light}`}>
                    {cat.slug}
                  </span>
                  {cat.sortOrder != null && cat.sortOrder > 0 && (
                    <span className="text-[10px] text-gray-400 font-mono">order {cat.sortOrder}</span>
                  )}
                </div>

                {cat.description
                  ? <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{cat.description}</p>
                  : <p className="text-xs text-gray-300 italic">No description set</p>
                }

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${cat.imageUrl ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-[11px] text-gray-400">{cat.imageUrl ? 'Image set' : 'Needs image'}</span>
                  </div>
                  <button
                    onClick={() => setEditing(cat)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={11} /> Edit
                  </button>
                </div>

                {saved === cat.slug && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                    <FiCheck size={12} /> Saved successfully
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AdminShell>
  )
}
