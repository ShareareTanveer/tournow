'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUploader from '@/components/admin/MediaUploader'
import {
  FiGlobe, FiMapPin, FiAlignLeft, FiTag, FiSun,
  FiMessageSquare, FiStar, FiEye, FiCheck, FiArrowLeft,
} from 'react-icons/fi'

const REGIONS    = ['Asia', 'Europe', 'Middle East', 'Africa', 'Australia & Oceania', 'Americas']
const COST_LEVELS = ['Budget', 'Economy', 'Comfort', 'Premium', 'Luxury']

const COST_COLOR: Record<string, string> = {
  Budget:  'bg-green-100 text-green-700 border-green-200',
  Economy: 'bg-lime-100 text-lime-700 border-lime-200',
  Comfort: 'bg-blue-100 text-blue-700 border-blue-200',
  Premium: 'bg-violet-100 text-violet-700 border-violet-200',
  Luxury:  'bg-amber-100 text-amber-700 border-amber-200',
}

function FieldLabel({ icon, children, required }: { icon: React.ReactNode; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
      {icon} {children} {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Input({ value, onChange, placeholder, required, readOnly }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; required?: boolean; readOnly?: boolean
}) {
  return (
    <input
      required={required}
      readOnly={readOnly}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-colors ${
        readOnly ? 'bg-gray-50 text-gray-400 cursor-default' : 'bg-white'
      }`}
    />
  )
}

export default function DestinationForm({ destination }: { destination?: any }) {
  const router = useRouter()
  const isEdit = !!destination

  const [form, setForm] = useState({
    name:        destination?.name        ?? '',
    slug:        destination?.slug        ?? '',
    region:      destination?.region      ?? '',
    country:     destination?.country     ?? '',
    description: destination?.description ?? '',
    imageUrl:    destination?.imageUrl    ?? '',
    costLevel:   destination?.costLevel   ?? '',
    language:    destination?.language    ?? '',
    bestSeason:  destination?.bestSeason  ?? '',
    isFeatured:  destination?.isFeatured  ?? false,
    isActive:    destination?.isActive    ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const url    = isEdit ? `/api/destinations/${destination.slug}` : '/api/destinations'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaved(true)
    setTimeout(() => {
      router.push('/admin/destinations')
      router.refresh()
    }, 800)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Cover Image ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Cover Image</p>
        </div>
        <div className="p-5">
          <MediaUploader
            label=""
            value={form.imageUrl}
            onChange={url => set('imageUrl', url)}
            folder="destinations"
          />
        </div>
      </div>

      {/* ── Basic Info ── */}
      <Section title="Basic Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel icon={<FiMapPin size={10} />} required>Name</FieldLabel>
            <Input
              required
              value={form.name}
              onChange={v => set('name', v) || (!isEdit && set('slug', autoSlug(v)))}
              placeholder="e.g. Australia"
            />
          </div>
          <div>
            <FieldLabel icon={<FiTag size={10} />} required>Slug</FieldLabel>
            <Input
              required
              value={form.slug}
              onChange={v => set('slug', v)}
              placeholder="e.g. australia"
              readOnly={isEdit}
            />
            {isEdit && <p className="text-[10px] text-gray-400 mt-1">Slug cannot be changed after creation.</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel icon={<FiGlobe size={10} />} required>Region</FieldLabel>
            <select
              required
              value={form.region}
              onChange={e => set('region', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white transition-colors"
            >
              <option value="">Select region…</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel icon={<FiMapPin size={10} />} required>Country</FieldLabel>
            <Input required value={form.country} onChange={v => set('country', v)} placeholder="e.g. Australia" />
          </div>
        </div>

        <div>
          <FieldLabel icon={<FiAlignLeft size={10} />}>Description</FieldLabel>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Brief description of this destination shown to customers…"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none placeholder:text-gray-300 transition-colors"
          />
        </div>
      </Section>

      {/* ── Travel Details ── */}
      <Section title="Travel Details">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel icon={<FiTag size={10} />}>Cost Level</FieldLabel>
            <div className="grid grid-cols-1 gap-1.5">
              {COST_LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => set('costLevel', form.costLevel === level ? '' : level)}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border text-left transition-all ${
                    form.costLevel === level
                      ? (COST_COLOR[level] ?? 'bg-indigo-100 text-indigo-700 border-indigo-200')
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <div>
              <FieldLabel icon={<FiSun size={10} />}>Best Season</FieldLabel>
              <Input value={form.bestSeason} onChange={v => set('bestSeason', v)} placeholder="e.g. Oct–Mar" />
            </div>
            <div>
              <FieldLabel icon={<FiMessageSquare size={10} />}>Language</FieldLabel>
              <Input value={form.language} onChange={v => set('language', v)} placeholder="e.g. English" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Visibility ── */}
      <Section title="Visibility">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => set('isFeatured', !form.isFeatured)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              form.isFeatured
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              form.isFeatured ? 'bg-amber-400' : 'bg-gray-100'
            }`}>
              <FiStar size={16} className={form.isFeatured ? 'text-white' : 'text-gray-400'} />
            </div>
            <div>
              <p className={`text-sm font-bold ${form.isFeatured ? 'text-amber-700' : 'text-gray-600'}`}>Featured</p>
              <p className="text-[11px] text-gray-400">Show on homepage spotlight</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              form.isFeatured ? 'bg-amber-400 border-amber-400' : 'border-gray-300'
            }`}>
              {form.isFeatured && <FiCheck size={10} className="text-white" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => set('isActive', !form.isActive)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              form.isActive
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              form.isActive ? 'bg-emerald-500' : 'bg-gray-100'
            }`}>
              <FiEye size={16} className={form.isActive ? 'text-white' : 'text-gray-400'} />
            </div>
            <div>
              <p className={`text-sm font-bold ${form.isActive ? 'text-emerald-700' : 'text-gray-600'}`}>Active</p>
              <p className="text-[11px] text-gray-400">Visible to customers</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              form.isActive ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
            }`}>
              {form.isActive && <FiCheck size={10} className="text-white" />}
            </div>
          </button>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pb-6">
        <button
          type="submit"
          disabled={loading || saved}
          className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all shadow-sm ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white'
          }`}
        >
          <FiCheck size={15} />
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Destination'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <FiArrowLeft size={14} /> Cancel
        </button>
      </div>

    </form>
  )
}
