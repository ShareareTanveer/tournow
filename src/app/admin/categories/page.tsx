'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import MediaUploader from '@/components/admin/MediaUploader'
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi'

const DEFAULT_CATEGORIES = [
  { slug: 'family',    label: 'Family',     description: 'Family-friendly tours for all ages' },
  { slug: 'honeymoon', label: 'Honeymoon',  description: 'Romantic getaways for couples' },
  { slug: 'solo',      label: 'Solo',       description: 'Adventures for solo travelers' },
  { slug: 'squad',     label: 'Squad',      description: 'Group adventures with friends' },
  { slug: 'corporate', label: 'Corporate',  description: 'Business travel and team outings' },
  { slug: 'special',   label: 'Special',    description: 'Special occasion packages' },
  { slug: 'holiday',   label: 'Holiday',    description: 'Seasonal holiday packages' },
]

interface Cat {
  id?: string
  slug: string
  label: string
  description?: string
  imageUrl?: string
  iconName?: string
  sortOrder?: number
  isActive?: boolean
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Cat>>({})
  const [saving, setSaving] = useState(false)

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

  function startEdit(cat: Cat) {
    setEditing(cat.slug)
    setEditData({ ...cat })
  }

  async function saveEdit(cat: Cat) {
    setSaving(true)
    try {
      const payload = { ...editData, slug: cat.slug, label: editData.label || cat.label }
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setCats(prev => prev.map(c => c.slug === cat.slug ? { ...c, ...payload } : c))
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell title="Tour Categories">
      <p className="text-sm text-gray-500 mb-6">Manage category images and descriptions. These appear on the homepage and packages page.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cats.map((cat) => {
          const isEditing = editing === cat.slug
          return (
            <div key={cat.slug} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Image */}
              <div className="relative">
                {isEditing ? (
                  <div className="p-3">
                    <MediaUploader
                      label=""
                      value={editData.imageUrl || ''}
                      onChange={(url) => setEditData(d => ({ ...d, imageUrl: url }))}
                      folder="categories"
                      className="!space-y-1"
                    />
                  </div>
                ) : cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.label} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <span className="text-3xl font-black text-orange-400 opacity-60">{cat.label[0]}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Label</label>
                      <input value={editData.label || ''} onChange={e => setEditData(d => ({ ...d, label: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                      <textarea rows={2} value={editData.description || ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Sort Order</label>
                      <input type="number" min={0} value={editData.sortOrder ?? 0} onChange={e => setEditData(d => ({ ...d, sortOrder: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(cat)} disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                        <FiCheck size={12} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(null)}
                        className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <FiX size={12} /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 capitalize">{cat.label}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-mono">{cat.slug}</span>
                    </div>
                    {cat.description && <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>}
                    <button onClick={() => startEdit(cat)}
                      className="w-full flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiEdit2 size={12} /> Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AdminShell>
  )
}
