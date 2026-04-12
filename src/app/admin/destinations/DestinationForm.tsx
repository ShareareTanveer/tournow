'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const REGIONS = ['Asia', 'Europe', 'Middle East', 'Africa', 'Australia & Oceania', 'Americas']
const COST_LEVELS = ['Budget', 'Economy', 'Comfort', 'Premium', 'Luxury']

export default function DestinationForm({ destination }: { destination?: any }) {
  const router = useRouter()
  const isEdit = !!destination
  const [form, setForm] = useState({
    name: destination?.name ?? '',
    slug: destination?.slug ?? '',
    region: destination?.region ?? '',
    country: destination?.country ?? '',
    description: destination?.description ?? '',
    imageUrl: destination?.imageUrl ?? '',
    costLevel: destination?.costLevel ?? '',
    language: destination?.language ?? '',
    bestSeason: destination?.bestSeason ?? '',
    isFeatured: destination?.isFeatured ?? false,
    isActive: destination?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/destinations/${destination.slug}` : '/api/destinations'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    router.push('/admin/destinations')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug *</label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Region *</label>
            <select required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
              <option value="">Select region…</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Country *</label>
            <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URL</label>
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cost Level</label>
            <select value={form.costLevel} onChange={(e) => setForm({ ...form, costLevel: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
              <option value="">Select…</option>
              {COST_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Best Season</label>
            <input value={form.bestSeason} onChange={(e) => setForm({ ...form, bestSeason: e.target.value })}
              placeholder="e.g. Oct–Mar" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Language</label>
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Destination'}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl transition-colors hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  )
}
