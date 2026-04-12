'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VisaForm({ visa }: { visa?: any }) {
  const router = useRouter()
  const isEdit = !!visa
  const [form, setForm] = useState({
    country: visa?.country ?? '',
    slug: visa?.slug ?? '',
    visaType: visa?.visaType ?? '',
    description: visa?.description ?? '',
    processingTime: visa?.processingTime ?? '',
    fee: visa?.fee ?? '',
    requirements: visa?.requirements ?? '',
    imageUrl: visa?.imageUrl ?? '',
    isActive: visa?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, fee: form.fee ? Number(form.fee) : null }
    const url = isEdit ? `/api/visas/${visa.slug}` : '/api/visas'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    router.push('/admin/visas')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Country *</label>
            <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, slug: autoSlug(e.target.value) })}
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
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Visa Type *</label>
            <input required value={form.visaType} onChange={(e) => setForm({ ...form, visaType: e.target.value })}
              placeholder="Tourist, Business, Transit…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Processing Time</label>
            <input value={form.processingTime} onChange={(e) => setForm({ ...form, processingTime: e.target.value })}
              placeholder="3–5 working days" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Fee (LKR)</label>
          <input type="number" min={0} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Requirements (one per line)</label>
          <textarea rows={5} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            placeholder="Valid passport&#10;2 passport photos&#10;Bank statement…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URL</label>
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
          <span className="text-sm text-gray-700">Active</span>
        </label>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Visa Service'}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl transition-colors hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  )
}
