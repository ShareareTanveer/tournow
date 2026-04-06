'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import MultiImageUploader, { GalleryLayout } from '@/components/admin/MultiImageUploader'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface Destination { id: string; name: string; region: string }
interface Props { destinations: Destination[]; pkg?: any }

const CATEGORIES = ['FAMILY', 'HONEYMOON', 'SOLO', 'SQUAD', 'CORPORATE', 'SPECIAL', 'HOLIDAY']
const STARS = ['THREE', 'FOUR', 'FIVE']
const DIFFICULTIES = ['EASY', 'MODERATE', 'CHALLENGING', 'EXTREME']

function toArr(s: string) { return s.split('\n').map((l) => l.trim()).filter(Boolean) }
function fromArr(a: string[] | undefined | null) { return (a ?? []).join('\n') }

export default function PackageForm({ destinations, pkg }: Props) {
  const router = useRouter()
  const isEdit = !!pkg
  const [tab, setTab] = useState<'basic' | 'content' | 'details' | 'media' | 'flags'>('basic')

  const [form, setForm] = useState({
    title: pkg?.title ?? '',
    slug: pkg?.slug ?? '',
    category: pkg?.category ?? 'FAMILY',
    destinationId: pkg?.destinationId ?? (destinations[0]?.id ?? ''),
    price: pkg?.price ?? '',
    oldPrice: pkg?.oldPrice ?? '',
    duration: pkg?.duration ?? '',
    nights: pkg?.nights ?? '',
    starRating: pkg?.starRating ?? 'FOUR',
    paxType: pkg?.paxType ?? 'per person',
    description: pkg?.description ?? '',
    highlights: fromArr(pkg?.highlights),
    inclusions: fromArr(pkg?.inclusions),
    exclusions: fromArr(pkg?.exclusions),
    // GYG-style detail fields
    isFoodIncluded: pkg?.isFoodIncluded ?? false,
    isTransportIncluded: pkg?.isTransportIncluded ?? false,
    meetingPoint: pkg?.meetingPoint ?? '',
    dropOff: pkg?.dropOff ?? '',
    hostLanguage: fromArr(pkg?.hostLanguage),
    audioGuideLanguage: fromArr(pkg?.audioGuideLanguage),
    bookletLanguage: fromArr(pkg?.bookletLanguage),
    inclusionService: fromArr(pkg?.inclusionService),
    exclusionService: fromArr(pkg?.exclusionService),
    emergencyContact: pkg?.emergencyContact ?? '',
    notSuitable: fromArr(pkg?.notSuitable),
    notAllowed: fromArr(pkg?.notAllowed),
    mustCarryItem: fromArr(pkg?.mustCarryItem),
    difficulty: pkg?.difficulty ?? 'EASY',
    minAge: pkg?.minAge ?? '',
    maxGroupSize: pkg?.maxGroupSize ?? '',
    cancellationPolicy: pkg?.cancellationPolicy ?? '',
    importantInfo: pkg?.importantInfo ?? '',
    summary: pkg?.summary ?? '',
    isCustomizable: pkg?.isCustomizable ?? false,
    customizationNotes: pkg?.customizationNotes ?? '',
    images: (pkg?.images ?? []) as string[],
    galleryLayout: (pkg?.galleryLayout ?? 'grid-2x2') as GalleryLayout,
    isFeatured: pkg?.isFeatured ?? false,
    isActive: pkg?.isActive ?? true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        duration: Number(form.duration),
        nights: Number(form.nights),
        minAge: form.minAge ? Number(form.minAge) : undefined,
        maxGroupSize: form.maxGroupSize ? Number(form.maxGroupSize) : undefined,
        highlights: toArr(form.highlights),
        inclusions: toArr(form.inclusions),
        exclusions: toArr(form.exclusions),
        hostLanguage: toArr(form.hostLanguage),
        audioGuideLanguage: toArr(form.audioGuideLanguage),
        bookletLanguage: toArr(form.bookletLanguage),
        inclusionService: toArr(form.inclusionService),
        exclusionService: toArr(form.exclusionService),
        notSuitable: toArr(form.notSuitable),
        notAllowed: toArr(form.notAllowed),
        mustCarryItem: toArr(form.mustCarryItem),
      }

      const url = isEdit ? `/api/packages/${pkg.slug}` : '/api/packages'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(JSON.stringify(data.error ?? 'Failed'))
      }
      router.push('/admin/packages')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Deactivate this package?')) return
    await fetch(`/api/packages/${pkg.slug}`, { method: 'DELETE' })
    router.push('/admin/packages')
    router.refresh()
  }

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const inp = (key: keyof typeof form, label: string, type = 'text', placeholder = '', required = false) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}{required && ' *'}</label>
      <input required={required} type={type} value={form[key] as string} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
    </div>
  )

  const area = (key: keyof typeof form, label: string, rows = 3, hint = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea rows={rows} value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
    </div>
  )

  const chk = (key: keyof typeof form, label: string) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
        className="w-4 h-4 accent-orange-500" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )

  const TABS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Description' },
    { id: 'details', label: 'Tour Details' },
    { id: 'media', label: 'Media' },
    { id: 'flags', label: 'Visibility' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id as any)}
            className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors min-w-[80px] ${tab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        {/* ── BASIC INFO ── */}
        {tab === 'basic' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
                <input required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                  placeholder="e.g. Dubai City Escape" />
              </div>
              {inp('slug', 'Slug *', 'text', 'dubai-city-escape', true)}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Destination *</label>
                <select required value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.region})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Star Rating *</label>
                <select required value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {STARS.map((s) => <option key={s} value={s}>{s === 'THREE' ? '3 Star' : s === 'FOUR' ? '4 Star' : '5 Star'}</option>)}
                </select>
              </div>
              {inp('price', 'Price (LKR) *', 'number', '120000', true)}
              {inp('oldPrice', 'Old Price (LKR)', 'number', '150000')}
              {inp('duration', 'Duration (Days) *', 'number', '5', true)}
              {inp('nights', 'Nights *', 'number', '4', true)}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pax Type</label>
                <select value={form.paxType} onChange={(e) => setForm({ ...form, paxType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {['per person', 'per couple', 'per group'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {inp('minAge', 'Minimum Age', 'number', '0')}
              {inp('maxGroupSize', 'Max Group Size', 'number', '20')}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === 'content' && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-800 mb-2">Description & Content</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Short Summary</label>
              <textarea rows={2} value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="One-paragraph overview shown in package cards…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Full Description *</label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                placeholder="Describe the tour in detail…"
              />
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {area('highlights', 'Highlights (one per line)', 5)}
              {area('inclusions', 'Inclusions (one per line)', 5, 'e.g. Return airfare, Hotel breakfast')}
              {area('exclusions', 'Exclusions (one per line)', 5, 'e.g. Visa fees, Travel insurance')}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cancellation Policy</label>
                <textarea rows={5} value={form.cancellationPolicy}
                  onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* ── TOUR DETAILS (GYG-style) ── */}
        {tab === 'details' && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-800 mb-2">Tour Details</h3>

            <div className="flex flex-wrap gap-5 pb-2 border-b border-gray-100">
              {chk('isFoodIncluded', 'Food / Meals Included')}
              {chk('isTransportIncluded', 'Transport Included')}
              {chk('isCustomizable', 'Allow Tour Customization')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {area('meetingPoint', 'Meeting Point', 2)}
              {area('dropOff', 'Drop-off Point', 2)}
              {area('hostLanguage', 'Host Language(s)', 2, 'One per line, e.g. English')}
              {area('audioGuideLanguage', 'Audio Guide Language(s)', 2, 'One per line')}
              {area('bookletLanguage', 'Booklet Language(s)', 2, 'One per line')}
              {inp('emergencyContact', 'Emergency Contact')}
            </div>

            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {area('inclusionService', 'Included Services', 4, 'One per line – detailed tour inclusions')}
              {area('exclusionService', 'Excluded Services', 4, 'One per line – what is NOT included')}
              {area('notSuitable', 'Not Suitable For', 3, 'One per line, e.g. Wheelchair users')}
              {area('notAllowed', 'Not Allowed', 3, 'One per line, e.g. Pets, Smoking')}
              {area('mustCarryItem', 'Must Carry Items', 3, 'One per line, e.g. Sunscreen, Passport')}
            </div>

            <hr className="border-gray-100" />
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Important Information</label>
                <RichTextEditor
                  value={form.importantInfo}
                  onChange={(html) => setForm({ ...form, importantInfo: html })}
                  placeholder="Health requirements, dress code, age restrictions…"
                />
              </div>
              {form.isCustomizable && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Customization Notes</label>
                  <textarea rows={3} value={form.customizationNotes}
                    onChange={(e) => setForm({ ...form, customizationNotes: e.target.value })}
                    placeholder="What aspects can be customized…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MEDIA ── */}
        {tab === 'media' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-2">Photos & Gallery</h3>
            <MultiImageUploader
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs })}
              layout={form.galleryLayout}
              onLayoutChange={(l) => setForm({ ...form, galleryLayout: l })}
              folder="packages"
              maxImages={10}
            />
          </div>
        )}

        {/* ── FLAGS ── */}
        {tab === 'flags' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-2">Visibility & Status</h3>
            <div className="flex flex-wrap gap-6">
              {chk('isFeatured', 'Featured on homepage')}
              {chk('isActive', 'Active (visible on website)')}
            </div>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Package'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-6 py-3 rounded-xl transition-colors">
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto text-red-500 hover:bg-red-50 border border-red-200 font-medium px-5 py-3 rounded-xl transition-colors text-sm">
            Deactivate
          </button>
        )}
      </div>
    </form>
  )
}
