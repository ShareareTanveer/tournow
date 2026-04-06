'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiSave, FiArrowLeft, FiTag, FiImage, FiLink,
  FiToggleLeft, FiToggleRight, FiAlertCircle, FiCheckCircle,
} from 'react-icons/fi'

const ICON_OPTIONS = [
  'FiShield','FiStar','FiAward','FiCheckCircle','FiHeart','FiGlobe',
  'FiClock','FiPhone','FiUsers','FiMapPin','FiPackage','FiZap',
  'FiTrendingUp','FiCoffee','FiSmile','FiThumbsUp','FiTag','FiGift',
  'FiSun','FiUmbrella','FiCamera','FiMusic','FiNavigation',
]

interface Perk {
  id?: string
  title: string
  description: string
  iconName: string
  iconColor: string
  bgColor: string
  imageUrl: string | null
  ctaLink: string | null
  sortOrder: number
  isActive: boolean
}

interface Props {
  perk?: Perk
}

const DEFAULTS: Perk = {
  title: '',
  description: '',
  iconName: 'FiStar',
  iconColor: '#f59e0b',
  bgColor: '#fffbeb',
  imageUrl: '',
  ctaLink: '',
  sortOrder: 0,
  isActive: true,
}

export default function PerkForm({ perk }: Props) {
  const isEdit = !!perk?.id
  const router = useRouter()
  const [form, setForm] = useState<Perk>(perk ?? DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (key: keyof Perk, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      imageUrl: form.imageUrl?.trim() || null,
      ctaLink: form.ctaLink?.trim() || null,
    }

    try {
      const res = isEdit
        ? await fetch(`/api/perks/${perk!.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/perks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }

      setSaved(true)
      setTimeout(() => {
        router.push('/admin/perks')
        router.refresh()
      }, 800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/admin/perks"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
        <FiArrowLeft size={14} /> Back to Perks
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
            <FiTag size={14} /> Basic Info
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Free Airport Transfer"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe what this perk offers to customers…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">Lower numbers appear first</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Visibility</label>
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors w-full ${
                  form.isActive
                    ? 'border-green-300 text-green-700 bg-green-50'
                    : 'border-gray-200 text-gray-500 bg-gray-50'
                }`}>
                {form.isActive
                  ? <><FiToggleRight size={16} /> Active — visible to customers</>
                  : <><FiToggleLeft size={16} /> Hidden — not shown publicly</>}
              </button>
            </div>
          </div>
        </section>

        {/* ── Appearance ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
            <FiImage size={14} /> Appearance
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Banner Image URL</label>
            <input
              value={form.imageUrl ?? ''}
              onChange={e => set('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition"
            />
            {form.imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden h-36 border border-gray-200">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Icon</label>
              <select
                value={form.iconName}
                onChange={e => set('iconName', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition">
                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i.replace('Fi', '')}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Icon Color</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2">
                <input
                  type="color"
                  value={form.iconColor}
                  onChange={e => set('iconColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                />
                <span className="text-xs font-mono text-gray-500">{form.iconColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Card Background</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={e => set('bgColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                />
                <span className="text-xs font-mono text-gray-500">{form.bgColor}</span>
              </div>
            </div>
          </div>

          {/* Mini preview */}
          <div className="border border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-3 bg-gray-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: form.bgColor }}>
              <FiTag size={16} style={{ color: form.iconColor }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{form.title || 'Perk title'}</p>
              <p className="text-xs text-gray-400 line-clamp-1">{form.description || 'Description preview'}</p>
            </div>
            <p className="ml-auto text-[10px] text-gray-400">Card preview</p>
          </div>
        </section>

        {/* ── Link ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
            <FiLink size={14} /> CTA Link
          </h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Redirect URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={form.ctaLink ?? ''}
              onChange={e => set('ctaLink', e.target.value)}
              placeholder="/packages-from-sri-lanka/family"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              If set, clicking "Get it now" opens this URL instead of the claim flow.
              Leave empty to use the standard claim system.
            </p>
          </div>
        </section>

        {/* ── Footer actions ── */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <FiAlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || saved}
            className="flex items-center gap-2 text-white font-bold text-sm px-7 py-3 rounded-xl transition disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            {saved
              ? <><FiCheckCircle size={15} /> Saved!</>
              : saving
              ? 'Saving…'
              : <><FiSave size={15} /> {isEdit ? 'Save Changes' : 'Create Perk'}</>}
          </button>
          <Link href="/admin/perks"
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-100 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
