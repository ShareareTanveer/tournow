'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FiPlus, FiX, FiInfo } from 'react-icons/fi'
import MultiImageUploader, { GalleryLayout } from '@/components/admin/MultiImageUploader'
import SeoScorePanel from '@/components/admin/SeoScorePanel'
import AiFieldAssist from '@/components/admin/AiFieldAssist'
import InternalLinkPanel from '@/components/admin/InternalLinkPanel'
import JsonEditorPanel from '@/components/admin/JsonEditorPanel'
import ImagesAiPanel from '@/components/admin/ImagesAiPanel'
import ItineraryEditor, { ItineraryFormDay, normalizeItineraryDays } from '@/components/admin/ItineraryEditor'
import MediaUploader from '@/components/admin/MediaUploader'
import SearchableCreatableSelect from '@/components/admin/SearchableCreatableSelect'
import {
  ADD_ON_OPTIONS,
  CANCELLATION_DAY_OPTIONS,
  CANCELLATION_LABEL_OPTIONS,
  CANCELLATION_POLICY_OPTIONS,
  EXCLUSION_OPTIONS,
  HIGHLIGHT_OPTIONS,
  INCLUSION_OPTIONS,
  LANGUAGE_OPTIONS,
  mustCarryOptions,
  notAllowedOptions,
  notSuitableOptions,
} from '@/lib/admin-select-options'
import { SeoInput } from '@/lib/seo-score'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface Destination { id: string; name: string; region: string }
interface Supplier { id: string; name: string; phone: string; whatsappNumber?: string | null }
interface Props { destinations: Destination[]; suppliers: Supplier[]; pkg?: any }

interface OptionItem { label: string; price: number; isDefault?: boolean }
interface CancellationTier { daysBeforeDep: number; refundPercent: number; label: string }

const CATEGORIES = ['FAMILY', 'HONEYMOON', 'SOLO', 'SQUAD', 'CORPORATE', 'SPECIAL', 'HOLIDAY']
const STARS = ['THREE', 'FOUR', 'FIVE']
const DIFFICULTIES = ['EASY', 'MODERATE', 'CHALLENGING', 'EXTREME']

function toArr(s: string) { return s?.split('\n').map((l) => l.trim()).filter(Boolean) }
function fromArr(a: string[] | undefined | null) { return (a ?? []).join('\n') }

function ChipList({ label, items, presets, onChange }: {
  label: string; items: string[]; presets: string[]; onChange: (v: string[]) => void
}) {
  return (
    <SearchableCreatableSelect
      label={label}
      value={items}
      options={presets}
      onChange={onChange}
      placeholder={`Select ${label.toLowerCase()}`}
    />
  )
}

function OptionsEditor({ options, onChange }: { options: OptionItem[]; onChange: (v: OptionItem[]) => void }) {
  const [newLabel, setNewLabel] = useState('')
  const [newPrice, setNewPrice] = useState('')

  function add() {
    if (!newLabel.trim()) return
    onChange([...options, { label: newLabel.trim(), price: Number(newPrice) || 0 }])
    setNewLabel(''); setNewPrice('')
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Add-on Options / Extras</label>
      <p className="text-xs text-gray-400 mb-2">Customers can select these during booking (e.g. airport pickup, travel insurance, single supplement)</p>
      <div className="border border-gray-200 rounded-xl p-3 space-y-2 focus-within:border-indigo-400">
        {options.length > 0 && (
          <div className="space-y-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="flex-1 text-xs text-gray-700 font-medium">{opt.label}</span>
                <span className="text-xs text-green-600 font-semibold">LKR {opt.price.toLocaleString()}</span>
                <label className="flex items-center gap-1 text-[10px] text-gray-400">
                  <input type="checkbox" checked={!!opt.isDefault}
                    onChange={e => { const updated = [...options]; updated[i] = { ...opt, isDefault: e.target.checked }; onChange(updated) }}
                    className="w-3 h-3 accent-indigo-500" /> Default
                </label>
                <button type="button" onClick={() => onChange(options.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-400"><FiX size={13} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
          <SearchableCreatableSelect
            label="Option"
            value={newLabel ? [newLabel] : []}
            options={ADD_ON_OPTIONS}
            onChange={items => setNewLabel(items[0] ?? '')}
            multiple={false}
            placeholder="Select or add option"
          />
          <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" min="0"
            placeholder="Price"
            className="self-end text-xs border border-gray-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-indigo-400" />
          <button type="button" onClick={add}
            className="self-end text-xs bg-indigo-500 text-white px-3 py-2.5 rounded-lg hover:bg-indigo-600 flex items-center gap-1">
            <FiPlus size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

function CancellationTiersEditor({ tiers, onChange }: { tiers: CancellationTier[]; onChange: (v: CancellationTier[]) => void }) {
  const [days, setDays] = useState('')
  const [refund, setRefund] = useState('')
  const [tierLabel, setTierLabel] = useState('')

  function add() {
    if (!days || !refund) return
    const d = Number(days), r = Number(refund)
    const lbl = tierLabel.trim() || (r === 100 ? 'Full refund' : r === 0 ? 'No refund' : `${r}% refund`)
    const sorted = [...tiers, { daysBeforeDep: d, refundPercent: r, label: lbl }]
      .sort((a, b) => b.daysBeforeDep - a.daysBeforeDep)
    onChange(sorted)
    setDays(''); setRefund(''); setTierLabel('')
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cancellation Tiers</label>
      <p className="text-xs text-gray-400 mb-2">Define refund rules based on days before departure (sorted automatically)</p>
      <div className="border border-gray-200 rounded-xl p-3 space-y-2">
        {tiers.length > 0 && (
          <div className="space-y-1">
            {tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-gray-600 w-20 shrink-0">≥ {t.daysBeforeDep}d</span>
                <span className={`text-xs font-bold ${t.refundPercent >= 75 ? 'text-green-600' : t.refundPercent >= 25 ? 'text-indigo-500' : 'text-red-500'}`}>
                  {t.refundPercent}% refund
                </span>
                <span className="flex-1 text-xs text-gray-400 italic">{t.label}</span>
                <button type="button" onClick={() => onChange(tiers.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-400"><FiX size={13} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1.5fr)_auto]">
          <SearchableCreatableSelect
            label="Days before"
            value={days ? [days] : []}
            options={CANCELLATION_DAY_OPTIONS}
            onChange={items => setDays(items[0] ?? '')}
            multiple={false}
            placeholder="Select days"
          />
          <select value={refund} onChange={e => setRefund(e.target.value)}
            className="self-end text-xs border border-gray-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-indigo-400 bg-white">
            <option value="">% Refund</option>
            {[100, 75, 50, 25, 0].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
          <SearchableCreatableSelect
            label="Label"
            value={tierLabel ? [tierLabel] : []}
            options={CANCELLATION_LABEL_OPTIONS}
            onChange={items => setTierLabel(items[0] ?? '')}
            multiple={false}
            placeholder="Select or add label"
          />
          <button type="button" onClick={add}
            className="self-end text-xs bg-indigo-500 text-white px-3 py-2.5 rounded-lg hover:bg-indigo-600 flex items-center gap-1">
            <FiPlus size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PackageForm({ destinations, suppliers, pkg }: Props) {
  const router = useRouter()
  const isEdit = !!pkg
  const [tab, setTab] = useState<'basic' | 'content' | 'itinerary' | 'details' | 'pricing' | 'media' | 'flags' | 'seo'>('basic')

  const [form, setForm] = useState({
    title: pkg?.title ?? '',
    slug: pkg?.slug ?? '',
    category: pkg?.category ?? 'FAMILY',
    destinationId: pkg?.destinationId ?? (destinations[0]?.id ?? ''),
    supplierId: pkg?.supplierId ?? '',
    price: pkg?.price ?? '',
    oldPrice: pkg?.oldPrice ?? '',
    priceTwin: pkg?.priceTwin ?? '',
    priceChild: pkg?.priceChild ?? '',
    extraNightPrice: pkg?.extraNightPrice ?? '',
    duration: pkg?.duration ?? '',
    nights: pkg?.nights ?? '',
    starRating: pkg?.starRating ?? 'FOUR',
    paxType: pkg?.paxType ?? 'per person',
    description: pkg?.description ?? '',
    highlights: fromArr(pkg?.highlights),
    inclusions: (pkg?.inclusions ?? []) as string[],
    exclusions: (pkg?.exclusions ?? []) as string[],
    cancellationPolicy: pkg?.cancellationPolicy ?? '',
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
    importantInfo: pkg?.importantInfo ?? '',
    summary: pkg?.summary ?? '',
    isCustomizable: pkg?.isCustomizable ?? false,
    customizationNotes: pkg?.customizationNotes ?? '',
    images: (pkg?.images ?? []) as string[],
    galleryLayout: (pkg?.galleryLayout ?? 'grid-2x2') as GalleryLayout,
    isFeatured: pkg?.isFeatured ?? false,
    isActive: pkg?.isActive ?? true,
    // SEO
    metaTitle:          pkg?.metaTitle          ?? '',
    metaDescription:    pkg?.metaDescription    ?? '',
    focusKeyword:       pkg?.focusKeyword       ?? '',
    secondaryKeywords:  pkg?.secondaryKeywords  ?? '',
    canonicalUrl:       pkg?.canonicalUrl       ?? '',
    ogTitle:            pkg?.ogTitle            ?? '',
    ogDescription:      pkg?.ogDescription      ?? '',
    ogImage:            pkg?.ogImage            ?? '',
    twitterTitle:       pkg?.twitterTitle       ?? '',
    twitterDescription: pkg?.twitterDescription ?? '',
    metaRobots:         pkg?.metaRobots         ?? 'index, follow',
    schemaMarkup:       pkg?.schemaMarkup       ?? '',
  })

  const [options, setOptions] = useState<OptionItem[]>(() => {
    try { return Array.isArray(pkg?.options) ? pkg.options : (pkg?.options ? JSON.parse(pkg.options) : []) }
    catch { return [] }
  })
  const [cancellationTiers, setCancellationTiers] = useState<CancellationTier[]>(() => {
    try { return Array.isArray(pkg?.cancellationTiers) ? pkg.cancellationTiers : (pkg?.cancellationTiers ? JSON.parse(pkg.cancellationTiers) : []) }
    catch { return [] }
  })
  const [itinerary, setItinerary] = useState<ItineraryFormDay[]>(() =>
    (pkg?.itinerary ?? []).map((day: any, index: number) => ({
      id: day.id,
      dayNumber: day.dayNumber ?? index + 1,
      title: day.title ?? '',
      description: day.description ?? '',
      activities: (day.activities ?? []) as string[],
      meals: (day.meals ?? []) as string[],
      accommodation: day.accommodation ?? '',
      imageUrl: day.imageUrl ?? '',
    }))
  )

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
        priceTwin: form.priceTwin ? Number(form.priceTwin) : undefined,
        priceChild: form.priceChild ? Number(form.priceChild) : undefined,
        extraNightPrice: form.extraNightPrice ? Number(form.extraNightPrice) : undefined,
        duration: Number(form.duration),
        nights: Number(form.nights),
        minAge: form.minAge ? Number(form.minAge) : undefined,
        maxGroupSize: form.maxGroupSize ? Number(form.maxGroupSize) : undefined,
        highlights: toArr(form.highlights),
        hostLanguage: toArr(form.hostLanguage),
        audioGuideLanguage: toArr(form.audioGuideLanguage),
        bookletLanguage: toArr(form.bookletLanguage),
        inclusionService: toArr(form.inclusionService),
        exclusionService: toArr(form.exclusionService),
        notSuitable: toArr(form.notSuitable),
        notAllowed: toArr(form.notAllowed),
        mustCarryItem: toArr(form.mustCarryItem),
        options,
        cancellationTiers,
        itinerary: normalizeItineraryDays(itinerary),
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
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
    </div>
  )

  const area = (key: keyof typeof form, label: string, rows = 3, hint = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea rows={rows} value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
    </div>
  )

  const chk = (key: keyof typeof form, label: string) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
        className="w-4 h-4 accent-indigo-500" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )

  const TABS = [
    { id: 'basic',    label: 'Basic Info' },
    { id: 'pricing',  label: 'Pricing' },
    { id: 'content',  label: 'Description' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'details',  label: 'Tour Details' },
    { id: 'media',    label: 'Media' },
    { id: 'flags',    label: 'Visibility' },
    { id: 'seo',      label: 'SEO' },
  ] as const

  // Build SeoInput from current form state (memoised for perf)
  const seoInput = useMemo<SeoInput>(() => ({
    title:              form.title,
    slug:               form.slug,
    description:        form.description,
    summary:            form.summary,
    images:             form.images,
    metaTitle:          form.metaTitle,
    metaDescription:    form.metaDescription,
    focusKeyword:       form.focusKeyword,
    secondaryKeywords:  form.secondaryKeywords,
    canonicalUrl:       form.canonicalUrl,
    ogTitle:            form.ogTitle,
    ogDescription:      form.ogDescription,
    ogImage:            form.ogImage,
    metaRobots:         form.metaRobots,
    schemaMarkup:       form.schemaMarkup,
  }), [form])

  // Auto-fix: strip <h1> tags from description
  const handleAutoFixH1 = () => {
    setForm(f => ({ ...f, description: f.description.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '') }))
  }

  // AI context for per-field generation
  const aiContext = useMemo(() => ({
    title:       form.title,
    category:    form.category,
    destination: destinations.find(d => d.id === form.destinationId)?.name ?? '',
    duration:    form.duration ? `${form.duration} days` : '',
    summary:     form.summary.slice(0, 200),
    focusKeyword: form.focusKeyword,
  }), [form.title, form.category, form.destinationId, form.duration, form.summary, form.focusKeyword, destinations])

  return (
    <>
    <SeoScorePanel input={seoInput} onAutoFixH1={handleAutoFixH1} />
    <InternalLinkPanel
      title={form.title}
      content={form.description}
      currentSlug={form.slug}
      onAutoLink={(newDesc) => setForm(f => ({ ...f, description: newDesc }))}
    />
    <JsonEditorPanel
      formData={form as unknown as Record<string, unknown>}
      onApply={(patch) => setForm(f => ({ ...f, ...patch }))}
      entityLabel="Package"
    />
    <ImagesAiPanel
      images={form.images}
      title={form.title}
      onRemove={(url) => setForm(f => ({ ...f, images: f.images.filter((i: string) => i !== url) }))}
    />
    <form onSubmit={handleSubmit} className="admin-editor-form space-y-5">
      {/* Tab nav */}
      <div className="admin-form-tabs flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id as any)}
            className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors min-w-20 ${tab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-form-panel bg-white rounded-2xl p-6 border border-gray-200">
        {/* ── BASIC INFO ── */}
        {tab === 'basic' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
                <div className="flex gap-2">
                  <input required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Dubai City Escape" />
                  <AiFieldAssist fieldLabel="Title" fieldName="title" currentValue={form.title} formContext={aiContext} onApply={v => setForm(f => ({ ...f, title: v, slug: autoSlug(v) }))} />
                </div>
              </div>
              {inp('slug', 'Slug *', 'text', 'dubai-city-escape', true)}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Destination *</label>
                <select required value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.region})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Supplier <span className="font-normal text-gray-400">(optional)</span></label>
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  <option value="">No supplier assigned</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.whatsappNumber || supplier.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Star Rating *</label>
                <select required value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {STARS.map((s) => <option key={s} value={s}>{s === 'THREE' ? '3 Star' : s === 'FOUR' ? '4 Star' : '5 Star'}</option>)}
                </select>
              </div>
              {inp('duration', 'Duration (Days) *', 'number', '5', true)}
              {inp('nights', 'Nights *', 'number', '4', true)}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pax Type</label>
                <select value={form.paxType} onChange={(e) => setForm({ ...form, paxType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {['per person', 'per couple', 'per group'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {inp('minAge', 'Minimum Age', 'number', '0')}
              {inp('maxGroupSize', 'Max Group Size', 'number', '20')}
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab === 'pricing' && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-800 mb-2">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inp('price', 'Base Price / Single (LKR) *', 'number', '120000', true)}
              {inp('oldPrice', 'Old Price / Strikethrough (LKR)', 'number', '150000')}
              {inp('priceTwin', 'Twin Sharing Price (LKR)', 'number', '95000')}
              {inp('priceChild', 'Child Price (LKR)', 'number', '60000')}
              {inp('extraNightPrice', 'Extra Night Price (LKR)', 'number', '8000')}
            </div>

            <hr className="border-gray-100" />
            <OptionsEditor options={options} onChange={setOptions} />

            <hr className="border-gray-100" />
            <CancellationTiersEditor tiers={cancellationTiers} onChange={setCancellationTiers} />

            <SearchableCreatableSelect
              label="Cancellation Policy Text"
              hint="Shown on the booking panel - a brief human-readable summary"
              value={form.cancellationPolicy ? [form.cancellationPolicy] : []}
              options={CANCELLATION_POLICY_OPTIONS}
              onChange={items => setForm({ ...form, cancellationPolicy: items[0] ?? '' })}
              multiple={false}
              placeholder="Select or add policy text"
            />
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === 'content' && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-800 mb-2">Description & Content</h3>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-500">Short Summary</label>
                <AiFieldAssist fieldLabel="Summary" fieldName="summary" currentValue={form.summary} formContext={aiContext} onApply={v => setForm(f => ({ ...f, summary: v }))} />
              </div>
              <textarea rows={2} value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="One-paragraph overview shown in package cards…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500">Full Description *</label>
                <AiFieldAssist fieldLabel="Description" fieldName="description" currentValue={form.description.replace(/<[^>]+>/g, ' ').slice(0, 200)} formContext={aiContext} onApply={v => setForm(f => ({ ...f, description: v }))} />
              </div>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                placeholder="Describe the tour in detail…"
              />
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableCreatableSelect
                label="Highlights"
                hint="Select common highlights or add custom highlights"
                value={toArr(form.highlights)}
                options={HIGHLIGHT_OPTIONS}
                onChange={items => setForm({ ...form, highlights: fromArr(items) })}
                placeholder="Select highlights"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChipList
                label="Inclusions"
                items={form.inclusions}
                presets={INCLUSION_OPTIONS}
                onChange={v => setForm({ ...form, inclusions: v })}
              />
              <ChipList
                label="Exclusions"
                items={form.exclusions}
                presets={EXCLUSION_OPTIONS}
                onChange={v => setForm({ ...form, exclusions: v })}
              />
            </div>
          </div>
        )}

        {/* ── TOUR DETAILS (GYG-style) ── */}
        {tab === 'itinerary' && (
          <ItineraryEditor
            days={itinerary}
            onChange={setItinerary}
          />
        )}

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
              <SearchableCreatableSelect
                label="Host Language(s)"
                hint="Select languages or add custom"
                value={toArr(form.hostLanguage)}
                options={LANGUAGE_OPTIONS}
                onChange={items => setForm({ ...form, hostLanguage: fromArr(items) })}
              />
              <SearchableCreatableSelect
                label="Audio Guide Language(s)"
                hint="Select languages or add custom"
                value={toArr(form.audioGuideLanguage)}
                options={LANGUAGE_OPTIONS}
                onChange={items => setForm({ ...form, audioGuideLanguage: fromArr(items) })}
              />
              <SearchableCreatableSelect
                label="Booklet Language(s)"
                hint="Select languages or add custom"
                value={toArr(form.bookletLanguage)}
                options={LANGUAGE_OPTIONS}
                onChange={items => setForm({ ...form, bookletLanguage: fromArr(items) })}
              />
              {inp('emergencyContact', 'Emergency Contact')}
            </div>

            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableCreatableSelect
                label="Included Services"
                value={toArr(form.inclusionService)}
                options={INCLUSION_OPTIONS}
                onChange={items => setForm({ ...form, inclusionService: fromArr(items) })}
              />
              <SearchableCreatableSelect
                label="Excluded Services"
                value={toArr(form.exclusionService)}
                options={EXCLUSION_OPTIONS}
                onChange={items => setForm({ ...form, exclusionService: fromArr(items) })}
              />
              <SearchableCreatableSelect
                label="Not Suitable For"
                value={toArr(form.notSuitable)}
                options={notSuitableOptions}
                onChange={items => setForm({ ...form, notSuitable: fromArr(items) })}
              />
              <SearchableCreatableSelect
                label="Not Allowed"
                value={toArr(form.notAllowed)}
                options={notAllowedOptions}
                onChange={items => setForm({ ...form, notAllowed: fromArr(items) })}
              />
              <SearchableCreatableSelect
                label="Must Carry Items"
                value={toArr(form.mustCarryItem)}
                options={mustCarryOptions}
                onChange={items => setForm({ ...form, mustCarryItem: fromArr(items) })}
              />
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
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

        {/* ── SEO ── */}
        {tab === 'seo' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Search Engine Optimisation</h3>
                <p className="text-xs text-gray-400 mt-0.5">Fill these fields to improve visibility in Google search results.</p>
              </div>
            </div>

            {/* ─── SEO Basic ─────────────────────────────────────────────── */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Basic</p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Focus Keyword</label>
                  <AiFieldAssist fieldLabel="Focus Keyword" fieldName="focusKeyword" currentValue={form.focusKeyword} formContext={aiContext} onApply={v => setForm(f => ({ ...f, focusKeyword: v }))} />
                </div>
                <input value={form.focusKeyword}
                  onChange={e => setForm({ ...form, focusKeyword: e.target.value })}
                  placeholder="e.g. family holiday package Sri Lanka"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Secondary Keywords <span className="font-normal text-gray-400">comma-separated</span></label>
                  <AiFieldAssist fieldLabel="Secondary Keywords" fieldName="secondaryKeywords" currentValue={form.secondaryKeywords} formContext={aiContext} onApply={v => setForm(f => ({ ...f, secondaryKeywords: v }))} />
                </div>
                <input value={form.secondaryKeywords}
                  onChange={e => setForm({ ...form, secondaryKeywords: e.target.value })}
                  placeholder="e.g. family tours, kids friendly holiday, Sri Lanka packages"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Meta Title</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${
                      form.metaTitle.length === 0 ? 'text-gray-300' :
                      form.metaTitle.length < 50 ? 'text-indigo-500' :
                      form.metaTitle.length <= 65 ? 'text-emerald-500' :
                      'text-red-500'
                    }`}>{form.metaTitle.length} / 65</span>
                    <AiFieldAssist fieldLabel="Meta Title" fieldName="metaTitle" currentValue={form.metaTitle} formContext={aiContext} onApply={v => setForm(f => ({ ...f, metaTitle: v }))} />
                  </div>
                </div>
                <input value={form.metaTitle}
                  onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                  placeholder="e.g. Family Holiday Packages Sri Lanka | Metro Voyage"
                  maxLength={80}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
                <p className="text-[10px] text-gray-400 mt-1">Ideal: 50–65 characters. Shown as the blue link in Google results.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Meta Description</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${
                      form.metaDescription.length === 0 ? 'text-gray-300' :
                      form.metaDescription.length < 150 ? 'text-indigo-500' :
                      form.metaDescription.length <= 160 ? 'text-emerald-500' :
                      'text-red-500'
                    }`}>{form.metaDescription.length} / 160</span>
                    <AiFieldAssist fieldLabel="Meta Description" fieldName="metaDescription" currentValue={form.metaDescription} formContext={aiContext} onApply={v => setForm(f => ({ ...f, metaDescription: v }))} />
                  </div>
                </div>
                <textarea rows={3} value={form.metaDescription}
                  onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="e.g. Explore our award-winning family holiday packages from Sri Lanka. Hotels, flights & guided tours included. Book today."
                  maxLength={200}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                <p className="text-[10px] text-gray-400 mt-1">Ideal: 150–160 characters. Shown below the title in Google results.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Canonical URL <span className="font-normal text-gray-400">(optional)</span></label>
                <input value={form.canonicalUrl}
                  onChange={e => setForm({ ...form, canonicalUrl: e.target.value })}
                  placeholder="https://metrovoyage.com/packages/..."
                  type="url"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
                <p className="text-[10px] text-gray-400 mt-1">Leave blank unless this page is accessible at multiple URLs.</p>
              </div>
            </div>

            {/* ─── Social / Open Graph ────────────────────────────────────── */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Social / Open Graph</p>
              <p className="text-xs text-gray-400 -mt-2">Controls how this page looks when shared on Facebook, WhatsApp, etc.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">OG Title</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setForm(f => ({ ...f, ogTitle: f.metaTitle }))}
                        className="text-[10px] text-indigo-500 hover:underline">Copy from Meta</button>
                      <AiFieldAssist fieldLabel="OG Title" fieldName="ogTitle" currentValue={form.ogTitle} formContext={aiContext} onApply={v => setForm(f => ({ ...f, ogTitle: v }))} />
                    </div>
                  </div>
                  <input value={form.ogTitle}
                    onChange={e => setForm({ ...form, ogTitle: e.target.value })}
                    placeholder="Social share title"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <MediaUploader
                    label="OG Image"
                    value={form.ogImage}
                    onChange={(url) => setForm({ ...form, ogImage: url })}
                    folder="packages"
                  />
                  {form.images[0] && !form.ogImage && (
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                      <FiInfo size={10} /> Will use first package image automatically
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">OG Description</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setForm(f => ({ ...f, ogDescription: f.metaDescription }))}
                      className="text-[10px] text-indigo-500 hover:underline">Copy from Meta</button>
                    <AiFieldAssist fieldLabel="OG Description" fieldName="ogDescription" currentValue={form.ogDescription} formContext={aiContext} onApply={v => setForm(f => ({ ...f, ogDescription: v }))} />
                  </div>
                </div>
                <textarea rows={2} value={form.ogDescription}
                  onChange={e => setForm({ ...form, ogDescription: e.target.value })}
                  placeholder="Social share description"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">Twitter Title</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setForm(f => ({ ...f, twitterTitle: f.ogTitle || f.metaTitle }))}
                        className="text-[10px] text-indigo-500 hover:underline">Copy from OG</button>
                      <AiFieldAssist fieldLabel="Twitter Title" fieldName="twitterTitle" currentValue={form.twitterTitle} formContext={aiContext} onApply={v => setForm(f => ({ ...f, twitterTitle: v }))} />
                    </div>
                  </div>
                  <input value={form.twitterTitle}
                    onChange={e => setForm({ ...form, twitterTitle: e.target.value })}
                    placeholder="Twitter / X card title"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">Twitter Description</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setForm(f => ({ ...f, twitterDescription: f.ogDescription || f.metaDescription }))}
                        className="text-[10px] text-indigo-500 hover:underline">Copy from OG</button>
                      <AiFieldAssist fieldLabel="Twitter Description" fieldName="twitterDescription" currentValue={form.twitterDescription} formContext={aiContext} onApply={v => setForm(f => ({ ...f, twitterDescription: v }))} />
                    </div>
                  </div>
                  <textarea rows={2} value={form.twitterDescription}
                    onChange={e => setForm({ ...form, twitterDescription: e.target.value })}
                    placeholder="Twitter / X card description"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                </div>
              </div>
            </div>

            {/* ─── Technical ──────────────────────────────────────────────── */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Technical</p>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Robots</label>
                <select value={form.metaRobots}
                  onChange={e => setForm({ ...form, metaRobots: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  <option value="index, follow">index, follow (default — recommended)</option>
                  <option value="noindex, follow">noindex, follow — hide from Google</option>
                  <option value="index, nofollow">index, nofollow — don&apos;t follow links</option>
                  <option value="noindex, nofollow">noindex, nofollow — full block</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">JSON-LD Schema Markup</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Optional — structured data</span>
                    <AiFieldAssist fieldLabel="Schema Markup" fieldName="schemaMarkup" currentValue={form.schemaMarkup} formContext={aiContext} onApply={v => setForm(f => ({ ...f, schemaMarkup: v }))} />
                  </div>
                </div>
                <textarea rows={8} value={form.schemaMarkup}
                  onChange={e => setForm({ ...form, schemaMarkup: e.target.value })}
                  placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "TouristAttraction",\n  "name": "...",\n  "description": "..."\n}'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-indigo-400 resize-none"
                  spellCheck={false} />
                {form.schemaMarkup && (() => {
                  try { JSON.parse(form.schemaMarkup); return <p className="text-[10px] text-emerald-600 mt-1">✓ Valid JSON</p> }
                  catch { return <p className="text-[10px] text-red-500 mt-1">✗ Invalid JSON — please fix the syntax</p> }
                })()}
                <p className="text-[10px] text-gray-400 mt-1">
                  Tip: Use <code className="bg-gray-100 px-1 rounded">TouristAttraction</code> or <code className="bg-gray-100 px-1 rounded">TravelAgency</code> schema types for travel packages.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="admin-form-actions flex flex-wrap gap-2">
        <button type="submit" disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Package'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-6 py-3 rounded-xl transition-colors">
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="text-red-500 hover:bg-red-50 border border-red-200 font-medium px-5 py-3 rounded-xl transition-colors text-sm sm:ml-auto">
            Deactivate
          </button>
        )}
      </div>
    </form>
    </>
  )
}
