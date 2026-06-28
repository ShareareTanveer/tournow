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
  COMMON_DESTINATION_OPTIONS,
  EXCLUSION_OPTIONS,
  HIGHLIGHT_OPTIONS,
  INCLUSION_OPTIONS,
  LANGUAGE_OPTIONS,
  VISA_NOTE_OPTIONS,
  mustCarryOptions,
  notAllowedOptions,
  notSuitableOptions,
} from '@/lib/admin-select-options'
import { SeoInput } from '@/lib/seo-score'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface Destination { id: string; name: string; region: string }
interface Supplier { id: string; name: string; phone: string; whatsappNumber?: string | null }
interface Props { destinations: Destination[]; suppliers: Supplier[]; tour?: any }
interface OptionItem { label: string; price: number; isDefault?: boolean }
interface CancellationTier { daysBeforeDep: number; refundPercent: number; label: string }

const STARS = ['THREE', 'FOUR', 'FIVE']
const DIFFICULTIES = ['EASY', 'MODERATE', 'CHALLENGING', 'EXTREME']
const REGIONS = ['South East Asia', 'Middle East', 'Europe', 'Far East', 'South Asia', 'Africa', 'Americas', 'Pacific']

function toArr(s: string) { return s?.split('\n').map((l) => l.trim()).filter(Boolean) }
function fromArr(a: string[] | undefined | null) { return (a ?? []).join('\n') }

function ChipList({ label, items, presets, accentColor = 'sky', onChange }: {
  label: string; items: string[]; presets: string[]; accentColor?: string; onChange: (v: string[]) => void
}) {
  return (
    <SearchableCreatableSelect
      label={label}
      value={items}
      options={presets}
      onChange={onChange}
      accent={accentColor === 'sky' ? 'sky' : 'indigo'}
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
      <p className="text-xs text-gray-400 mb-2">Customers can select these during booking (e.g. travel insurance, single supplement, visa service)</p>
      <div className="border border-gray-200 rounded-xl p-3 space-y-2">
        {options.length > 0 && (
          <div className="space-y-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="flex-1 text-xs text-gray-700 font-medium">{opt.label}</span>
                <span className="text-xs text-green-600 font-semibold">LKR {opt.price.toLocaleString()}</span>
                <label className="flex items-center gap-1 text-[10px] text-gray-400">
                  <input type="checkbox" checked={!!opt.isDefault}
                    onChange={e => { const updated = [...options]; updated[i] = { ...opt, isDefault: e.target.checked }; onChange(updated) }}
                    className="w-3 h-3 accent-sky-500" /> Default
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
            accent="sky"
            placeholder="Select or add option"
          />
          <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" min="0"
            placeholder="Price"
            className="self-end text-xs border border-gray-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-sky-400" />
          <button type="button" onClick={add}
            className="self-end text-xs bg-indigo-500 text-white px-3 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-1">
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
      <p className="text-xs text-gray-400 mb-2">Define refund rules based on days before departure</p>
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
            accent="sky"
            placeholder="Select days"
          />
          <select value={refund} onChange={e => setRefund(e.target.value)}
            className="self-end text-xs border border-gray-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-sky-400 bg-white">
            <option value="">% Refund</option>
            {[100, 75, 50, 25, 0].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
          <SearchableCreatableSelect
            label="Label"
            value={tierLabel ? [tierLabel] : []}
            options={CANCELLATION_LABEL_OPTIONS}
            onChange={items => setTierLabel(items[0] ?? '')}
            multiple={false}
            accent="sky"
            placeholder="Select or add label"
          />
          <button type="button" onClick={add}
            className="self-end text-xs bg-indigo-500 text-white px-3 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-1">
            <FiPlus size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TourForm({ destinations, suppliers, tour }: Props) {
  const router = useRouter()
  const isEdit = !!tour
  const [tab, setTab] = useState<'basic' | 'pricing' | 'content' | 'itinerary' | 'details' | 'media' | 'flags' | 'seo'>('basic')

  const [form, setForm] = useState({
    title: tour?.title ?? '',
    slug: tour?.slug ?? '',
    region: tour?.region ?? '',
    multiDestinations: fromArr(tour?.multiDestinations),
    primaryDestinationId: tour?.primaryDestinationId ?? (destinations[0]?.id ?? ''),
    supplierId: tour?.supplierId ?? '',
    price: tour?.price ?? '',
    oldPrice: tour?.oldPrice ?? '',
    priceTwin: tour?.priceTwin ?? '',
    priceChild: tour?.priceChild ?? '',
    extraNightPrice: tour?.extraNightPrice ?? '',
    duration: tour?.duration ?? '',
    nights: tour?.nights ?? '',
    starRating: tour?.starRating ?? 'FOUR',
    paxType: tour?.paxType ?? 'per person',
    description: tour?.description ?? '',
    summary: tour?.summary ?? '',
    highlights: fromArr(tour?.highlights),
    inclusions: (tour?.inclusions ?? []) as string[],
    exclusions: (tour?.exclusions ?? []) as string[],
    visaNotes: tour?.visaNotes ?? '',
    cancellationPolicy: tour?.cancellationPolicy ?? '',
    isFoodIncluded: tour?.isFoodIncluded ?? false,
    isTransportIncluded: tour?.isTransportIncluded ?? false,
    meetingPoint: tour?.meetingPoint ?? '',
    dropOff: tour?.dropOff ?? '',
    hostLanguage: fromArr(tour?.hostLanguage),
    audioGuideLanguage: fromArr(tour?.audioGuideLanguage),
    bookletLanguage: fromArr(tour?.bookletLanguage),
    inclusionService: fromArr(tour?.inclusionService),
    exclusionService: fromArr(tour?.exclusionService),
    emergencyContact: tour?.emergencyContact ?? '',
    notSuitable: fromArr(tour?.notSuitable),
    notAllowed: fromArr(tour?.notAllowed),
    mustCarryItem: fromArr(tour?.mustCarryItem),
    difficulty: tour?.difficulty ?? 'EASY',
    minAge: tour?.minAge ?? '',
    maxGroupSize: tour?.maxGroupSize ?? '',
    importantInfo: tour?.importantInfo ?? '',
    isCustomizable: tour?.isCustomizable ?? false,
    customizationNotes: tour?.customizationNotes ?? '',
    images: (tour?.images ?? []) as string[],
    galleryLayout: (tour?.galleryLayout ?? 'grid-2x2') as GalleryLayout,
    isFeatured: tour?.isFeatured ?? false,
    isActive: tour?.isActive ?? true,
    // SEO
    metaTitle:          tour?.metaTitle          ?? '',
    metaDescription:    tour?.metaDescription    ?? '',
    focusKeyword:       tour?.focusKeyword       ?? '',
    secondaryKeywords:  tour?.secondaryKeywords  ?? '',
    canonicalUrl:       tour?.canonicalUrl       ?? '',
    ogTitle:            tour?.ogTitle            ?? '',
    ogDescription:      tour?.ogDescription      ?? '',
    ogImage:            tour?.ogImage            ?? '',
    twitterTitle:       tour?.twitterTitle       ?? '',
    twitterDescription: tour?.twitterDescription ?? '',
    metaRobots:         tour?.metaRobots         ?? 'index, follow',
    schemaMarkup:       tour?.schemaMarkup       ?? '',
  })

  const [options, setOptions] = useState<OptionItem[]>(() => {
    try { return Array.isArray(tour?.options) ? tour.options : (tour?.options ? JSON.parse(tour.options) : []) }
    catch { return [] }
  })
  const [cancellationTiers, setCancellationTiers] = useState<CancellationTier[]>(() => {
    try { return Array.isArray(tour?.cancellationTiers) ? tour.cancellationTiers : (tour?.cancellationTiers ? JSON.parse(tour.cancellationTiers) : []) }
    catch { return [] }
  })
  const [itinerary, setItinerary] = useState<ItineraryFormDay[]>(() =>
    (tour?.itinerary ?? []).map((day: any, index: number) => ({
      id: day.id,
      dayNumber: day.dayNumber ?? index + 1,
      title: day.title ?? '',
      description: day.description ?? '',
      country: day.country ?? '',
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
        multiDestinations: toArr(form.multiDestinations),
        hostLanguage: toArr(form.hostLanguage),
        audioGuideLanguage: toArr(form.audioGuideLanguage),
        bookletLanguage: toArr(form.bookletLanguage),
        inclusionService: toArr(form.inclusionService),
        exclusionService: toArr(form.exclusionService),
        notSuitable: toArr(form.notSuitable),
        notAllowed: toArr(form.notAllowed),
        mustCarryItem: toArr(form.mustCarryItem),
        visaNotes: form.visaNotes || undefined,
        options,
        cancellationTiers,
        itinerary: normalizeItineraryDays(itinerary),
      }

      const url = isEdit ? `/api/tours/${tour.slug}` : '/api/tours'
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
      router.push('/admin/tours')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Deactivate this tour?')) return
    await fetch(`/api/tours/${tour.slug}`, { method: 'DELETE' })
    router.push('/admin/tours')
    router.refresh()
  }

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const inp = (key: keyof typeof form, label: string, type = 'text', placeholder = '', required = false) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}{required && ' *'}</label>
      <input required={required} type={type} value={form[key] as string} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
    </div>
  )

  const area = (key: keyof typeof form, label: string, rows = 3, hint = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea rows={rows} value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
    </div>
  )

  const chk = (key: keyof typeof form, label: string) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
        className="w-4 h-4 accent-sky-500" />
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

  const handleAutoFixH1 = () => {
    setForm(f => ({ ...f, description: f.description.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '') }))
  }

  const aiContext = useMemo(() => ({
    title:        form.title,
    duration:     form.duration ? `${form.duration} days` : '',
    summary:      form.summary.slice(0, 200),
    focusKeyword: form.focusKeyword,
  }), [form.title, form.duration, form.summary, form.focusKeyword])

  const destinationOptions = useMemo(
    () => Array.from(new Set([...destinations.map(destination => destination.name), ...COMMON_DESTINATION_OPTIONS])),
    [destinations]
  )

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
      entityLabel="Tour"
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
            <h3 className="font-bold text-gray-800 mb-2">Tour Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
                <div className="flex gap-2">
                  <input required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400"
                    placeholder="e.g. South East Asia Explorer" />
                  <AiFieldAssist fieldLabel="Title" fieldName="title" currentValue={form.title} formContext={aiContext} onApply={v => setForm(f => ({ ...f, title: v, slug: autoSlug(v) }))} accentColor="sky" />
                </div>
              </div>
              {inp('slug', 'Slug *', 'text', 'south-east-asia-explorer', true)}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Region *</label>
                <select required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
                  <option value="">— Select region —</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Primary Destination *</label>
                <select required value={form.primaryDestinationId} onChange={(e) => setForm({ ...form, primaryDestinationId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.region})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Supplier <span className="font-normal text-gray-400">(optional)</span></label>
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
                  <option value="">No supplier assigned</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.whatsappNumber || supplier.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <SearchableCreatableSelect
                  label="Countries / Destinations Covered"
                  hint="Select all countries this tour visits or add custom"
                  value={toArr(form.multiDestinations)}
                  options={destinationOptions}
                  onChange={items => setForm({ ...form, multiDestinations: fromArr(items) })}
                  accent="sky"
                  placeholder="Select destinations"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Star Rating *</label>
                <select required value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
                  {STARS.map((s) => <option key={s} value={s}>{s === 'THREE' ? '3 Star' : s === 'FOUR' ? '4 Star' : '5 Star'}</option>)}
                </select>
              </div>
              {inp('duration', 'Duration (Days) *', 'number', '10', true)}
              {inp('nights', 'Nights *', 'number', '9', true)}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pax Type</label>
                <select value={form.paxType} onChange={(e) => setForm({ ...form, paxType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
                  {['per person', 'per couple', 'per group'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
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
              {inp('price', 'Base Price / Single (LKR) *', 'number', '250000', true)}
              {inp('oldPrice', 'Old Price / Strikethrough (LKR)', 'number', '300000')}
              {inp('priceTwin', 'Twin Sharing Price (LKR)', 'number', '210000')}
              {inp('priceChild', 'Child Price (LKR)', 'number', '130000')}
              {inp('extraNightPrice', 'Extra Night Price (LKR)', 'number', '12000')}
            </div>

            <hr className="border-gray-100" />
            <OptionsEditor options={options} onChange={setOptions} />

            <hr className="border-gray-100" />
            <CancellationTiersEditor tiers={cancellationTiers} onChange={setCancellationTiers} />

            <SearchableCreatableSelect
              label="Cancellation Policy Text"
              hint="Brief summary shown on the booking panel"
              value={form.cancellationPolicy ? [form.cancellationPolicy] : []}
              options={CANCELLATION_POLICY_OPTIONS}
              onChange={items => setForm({ ...form, cancellationPolicy: items[0] ?? '' })}
              multiple={false}
              accent="sky"
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
                <AiFieldAssist fieldLabel="Summary" fieldName="summary" currentValue={form.summary} formContext={aiContext} onApply={v => setForm(f => ({ ...f, summary: v }))} accentColor="sky" />
              </div>
              <textarea rows={2} value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="One-paragraph overview shown on tour cards…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500">Full Description *</label>
                <AiFieldAssist fieldLabel="Description" fieldName="description" currentValue={form.description.replace(/<[^>]+>/g, ' ').slice(0, 200)} formContext={aiContext} onApply={v => setForm(f => ({ ...f, description: v }))} accentColor="sky" />
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
                accent="sky"
                placeholder="Select highlights"
              />
              <SearchableCreatableSelect
                label="Visa Notes"
                hint="Notes about visa requirements for each country covered"
                value={toArr(form.visaNotes)}
                options={VISA_NOTE_OPTIONS}
                onChange={items => setForm({ ...form, visaNotes: fromArr(items) })}
                accent="sky"
                placeholder="Select visa notes"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChipList
                label="Inclusions"
                items={form.inclusions}
                presets={INCLUSION_OPTIONS}
                accentColor="sky"
                onChange={v => setForm({ ...form, inclusions: v })}
              />
              <ChipList
                label="Exclusions"
                items={form.exclusions}
                presets={EXCLUSION_OPTIONS}
                accentColor="sky"
                onChange={v => setForm({ ...form, exclusions: v })}
              />
            </div>
          </div>
        )}

        {/* ── TOUR DETAILS ── */}
        {tab === 'itinerary' && (
          <ItineraryEditor
            days={itinerary}
            onChange={setItinerary}
            showCountry
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
                accent="sky"
              />
              <SearchableCreatableSelect
                label="Audio Guide Language(s)"
                hint="Select languages or add custom"
                value={toArr(form.audioGuideLanguage)}
                options={LANGUAGE_OPTIONS}
                onChange={items => setForm({ ...form, audioGuideLanguage: fromArr(items) })}
                accent="sky"
              />
              <SearchableCreatableSelect
                label="Booklet Language(s)"
                hint="Select languages or add custom"
                value={toArr(form.bookletLanguage)}
                options={LANGUAGE_OPTIONS}
                onChange={items => setForm({ ...form, bookletLanguage: fromArr(items) })}
                accent="sky"
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
                accent="sky"
              />
              <SearchableCreatableSelect
                label="Excluded Services"
                value={toArr(form.exclusionService)}
                options={EXCLUSION_OPTIONS}
                onChange={items => setForm({ ...form, exclusionService: fromArr(items) })}
                accent="sky"
              />
              <SearchableCreatableSelect
                label="Not Suitable For"
                value={toArr(form.notSuitable)}
                options={notSuitableOptions}
                onChange={items => setForm({ ...form, notSuitable: fromArr(items) })}
                accent="sky"
              />
              <SearchableCreatableSelect
                label="Not Allowed"
                value={toArr(form.notAllowed)}
                options={notAllowedOptions}
                onChange={items => setForm({ ...form, notAllowed: fromArr(items) })}
                accent="sky"
              />
              <SearchableCreatableSelect
                label="Must Carry Items"
                value={toArr(form.mustCarryItem)}
                options={mustCarryOptions}
                onChange={items => setForm({ ...form, mustCarryItem: fromArr(items) })}
                accent="sky"
              />
            </div>
            <hr className="border-gray-100" />
            {form.isCustomizable && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Customization Notes</label>
                <textarea rows={3} value={form.customizationNotes}
                  onChange={(e) => setForm({ ...form, customizationNotes: e.target.value })}
                  placeholder="What aspects can be customized…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Important Information</label>
              <RichTextEditor
                value={form.importantInfo}
                onChange={(html) => setForm({ ...form, importantInfo: html })}
                placeholder="Health requirements, dress code, age restrictions…"
              />
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
              folder="tours"
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
            <div>
              <h3 className="font-bold text-gray-800">Search Engine Optimisation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Fill these fields to improve visibility in Google search results.</p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Basic</p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Focus Keyword</label>
                  <AiFieldAssist fieldLabel="Focus Keyword" fieldName="focusKeyword" currentValue={form.focusKeyword} formContext={aiContext} onApply={v => setForm(f => ({ ...f, focusKeyword: v }))} accentColor="sky" />
                </div>
                <input value={form.focusKeyword}
                  onChange={e => setForm({ ...form, focusKeyword: e.target.value })}
                  placeholder="e.g. Turkey tour package Sri Lanka"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Secondary Keywords <span className="font-normal text-gray-400">comma-separated</span></label>
                  <AiFieldAssist fieldLabel="Secondary Keywords" fieldName="secondaryKeywords" currentValue={form.secondaryKeywords} formContext={aiContext} onApply={v => setForm(f => ({ ...f, secondaryKeywords: v }))} accentColor="sky" />
                </div>
                <input value={form.secondaryKeywords}
                  onChange={e => setForm({ ...form, secondaryKeywords: e.target.value })}
                  placeholder="e.g. Turkey holidays, Istanbul tour, Cappadocia package"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Meta Title</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${form.metaTitle.length === 0 ? 'text-gray-300' : form.metaTitle.length < 50 ? 'text-indigo-500' : form.metaTitle.length <= 65 ? 'text-emerald-500' : 'text-red-500'}`}>{form.metaTitle.length} / 65</span>
                    <AiFieldAssist fieldLabel="Meta Title" fieldName="metaTitle" currentValue={form.metaTitle} formContext={aiContext} onApply={v => setForm(f => ({ ...f, metaTitle: v }))} accentColor="sky" />
                  </div>
                </div>
                <input value={form.metaTitle}
                  onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                  placeholder="e.g. Turkey Tour Package | 8 Days Istanbul & Cappadocia"
                  maxLength={80}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
                <p className="text-[10px] text-gray-400 mt-1">Ideal: 50–65 characters.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Meta Description</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${form.metaDescription.length === 0 ? 'text-gray-300' : form.metaDescription.length < 150 ? 'text-indigo-500' : form.metaDescription.length <= 160 ? 'text-emerald-500' : 'text-red-500'}`}>{form.metaDescription.length} / 160</span>
                    <AiFieldAssist fieldLabel="Meta Description" fieldName="metaDescription" currentValue={form.metaDescription} formContext={aiContext} onApply={v => setForm(f => ({ ...f, metaDescription: v }))} accentColor="sky" />
                  </div>
                </div>
                <textarea rows={3} value={form.metaDescription}
                  onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="e.g. Discover Turkey with our 8-day guided tour — Istanbul, Cappadocia, hot air balloons & more. Flights & hotels included."
                  maxLength={200}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
                <p className="text-[10px] text-gray-400 mt-1">Ideal: 150–160 characters.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Canonical URL <span className="font-normal text-gray-400">(optional)</span></label>
                <input value={form.canonicalUrl}
                  onChange={e => setForm({ ...form, canonicalUrl: e.target.value })}
                  type="url" placeholder="https://metrovoyage.com/tours/..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Social / Open Graph</p>
              <p className="text-xs text-gray-400 -mt-2">Controls how this page looks when shared on social media.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">OG Title</label>
                    <button type="button" onClick={() => setForm(f => ({ ...f, ogTitle: f.metaTitle }))}
                      className="text-[10px] text-sky-500 hover:underline">Copy from Meta Title</button>
                  </div>
                  <input value={form.ogTitle} onChange={e => setForm({ ...form, ogTitle: e.target.value })}
                    placeholder="Social share title"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
                </div>
                <div>
                  <MediaUploader
                    label="OG Image"
                    value={form.ogImage}
                    onChange={(url) => setForm({ ...form, ogImage: url })}
                    folder="tours"
                  />
                  {form.images[0] && !form.ogImage && (
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                      <FiInfo size={10} /> Will use first tour image automatically
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">OG Description</label>
                  <button type="button" onClick={() => setForm(f => ({ ...f, ogDescription: f.metaDescription }))}
                    className="text-[10px] text-sky-500 hover:underline">Copy from Meta Description</button>
                </div>
                <textarea rows={2} value={form.ogDescription}
                  onChange={e => setForm({ ...form, ogDescription: e.target.value })}
                  placeholder="Social share description"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">Twitter Title</label>
                    <button type="button" onClick={() => setForm(f => ({ ...f, twitterTitle: f.ogTitle || f.metaTitle }))}
                      className="text-[10px] text-sky-500 hover:underline">Copy from OG</button>
                  </div>
                  <input value={form.twitterTitle} onChange={e => setForm({ ...form, twitterTitle: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">Twitter Description</label>
                    <button type="button" onClick={() => setForm(f => ({ ...f, twitterDescription: f.ogDescription || f.metaDescription }))}
                      className="text-[10px] text-sky-500 hover:underline">Copy from OG</button>
                  </div>
                  <textarea rows={2} value={form.twitterDescription}
                    onChange={e => setForm({ ...form, twitterDescription: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Technical</p>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Robots</label>
                <select value={form.metaRobots} onChange={e => setForm({ ...form, metaRobots: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 bg-white">
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
                    <span className="text-[10px] text-gray-400">Structured data</span>
                    <AiFieldAssist fieldLabel="Schema Markup" fieldName="schemaMarkup" currentValue={form.schemaMarkup} formContext={aiContext} onApply={v => setForm(f => ({ ...f, schemaMarkup: v }))} accentColor="sky" />
                  </div>
                </div>
                <textarea rows={8} value={form.schemaMarkup}
                  onChange={e => setForm({ ...form, schemaMarkup: e.target.value })}
                  placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "TouristAttraction",\n  "name": "..."\n}'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-sky-400 resize-none"
                  spellCheck={false} />
                {form.schemaMarkup && (() => {
                  try { JSON.parse(form.schemaMarkup); return <p className="text-[10px] text-emerald-600 mt-1">✓ Valid JSON</p> }
                  catch { return <p className="text-[10px] text-red-500 mt-1">✗ Invalid JSON — please fix the syntax</p> }
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="admin-form-actions flex flex-wrap gap-2">
        <button type="submit" disabled={loading}
          className="bg-indigo-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tour'}
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
