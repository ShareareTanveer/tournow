'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FiPlus, FiX } from 'react-icons/fi'
import MultiImageUploader, { GalleryLayout } from '@/components/admin/MultiImageUploader'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface Destination { id: string; name: string; region: string }
interface Props { destinations: Destination[]; tour?: any }
interface OptionItem { label: string; price: number; isDefault?: boolean }
interface CancellationTier { daysBeforeDep: number; refundPercent: number; label: string }

const STARS = ['THREE', 'FOUR', 'FIVE']
const DIFFICULTIES = ['EASY', 'MODERATE', 'CHALLENGING', 'EXTREME']
const REGIONS = ['South East Asia', 'Middle East', 'Europe', 'Far East', 'South Asia', 'Africa', 'Americas', 'Pacific']

const INCLUSION_PRESETS = [
  'Return airfare', 'Hotel accommodation', 'Hotel breakfast', 'All meals', 'Airport transfers',
  'AC transport', 'Tour guide', 'Entrance fees', 'Travel insurance', 'Visa assistance',
  'Sightseeing tours', 'Boat transfers', 'Wi-Fi on board', 'Mineral water',
]
const EXCLUSION_PRESETS = [
  'Visa fees', 'Travel insurance', 'Personal expenses', 'Tips & gratuities',
  'Optional activities', 'International flights', 'Laundry', 'Alcohol',
  'Room service', 'Camera fees at monuments', 'Medical expenses',
]

function toArr(s: string) { return s?.split('\n').map((l) => l.trim()).filter(Boolean) }
function fromArr(a: string[] | undefined | null) { return (a ?? []).join('\n') }

function ChipList({ label, items, presets, accentColor = 'sky', onChange }: {
  label: string; items: string[]; presets: string[]; accentColor?: string; onChange: (v: string[]) => void
}) {
  const [input, setInput] = useState('')
  const available = presets.filter(p => !items.includes(p))
  const focusBorder = accentColor === 'sky' ? 'focus:border-sky-400' : 'focus:border-orange-400'
  const chipBg = accentColor === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-orange-50 text-orange-700'
  const addBg = accentColor === 'sky' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-orange-500 hover:bg-orange-600'

  function add(val: string) {
    const v = val.trim()
    if (v && !items.includes(v)) onChange([...items, v])
    setInput('')
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className={`border border-gray-200 rounded-xl p-3 space-y-2 focus-within:border-sky-400 transition-colors`}>
        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {items.map(item => (
            <span key={item} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${chipBg}`}>
              {item}
              <button type="button" onClick={() => onChange(items.filter(i => i !== item))}
                className="hover:text-red-500 ml-0.5"><FiX size={10} /></button>
            </span>
          ))}
          {items.length === 0 && <span className="text-xs text-gray-300">None added yet</span>}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input) } }}
            placeholder="Type custom item or pick below…"
            className={`flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none ${focusBorder}`} />
          <button type="button" onClick={() => add(input)}
            className={`text-xs text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${addBg}`}>
            <FiPlus size={11} /> Add
          </button>
        </div>
        {available.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {available.slice(0, 10).map(p => (
              <button key={p} type="button" onClick={() => add(p)}
                className="text-[10px] bg-gray-100 hover:bg-sky-50 hover:text-sky-600 text-gray-500 px-2 py-0.5 rounded-full transition-colors">
                + {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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
        <div className="flex gap-2">
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder="Option name (e.g. Travel insurance)"
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400" />
          <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" min="0"
            placeholder="Price"
            className="w-24 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400" />
          <button type="button" onClick={add}
            className="text-xs bg-sky-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-sky-600 flex items-center gap-1">
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
                <span className={`text-xs font-bold ${t.refundPercent >= 75 ? 'text-green-600' : t.refundPercent >= 25 ? 'text-orange-500' : 'text-red-500'}`}>
                  {t.refundPercent}% refund
                </span>
                <span className="flex-1 text-xs text-gray-400 italic">{t.label}</span>
                <button type="button" onClick={() => onChange(tiers.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-400"><FiX size={13} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <input value={days} onChange={e => setDays(e.target.value)} type="number" min="0"
            placeholder="Days before"
            className="w-24 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400" />
          <select value={refund} onChange={e => setRefund(e.target.value)}
            className="w-28 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400 bg-white">
            <option value="">% Refund</option>
            {[100, 75, 50, 25, 0].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
          <input value={tierLabel} onChange={e => setTierLabel(e.target.value)}
            placeholder="Label (optional)"
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400" />
          <button type="button" onClick={add}
            className="text-xs bg-sky-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-sky-600 flex items-center gap-1">
            <FiPlus size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TourForm({ destinations, tour }: Props) {
  const router = useRouter()
  const isEdit = !!tour
  const [tab, setTab] = useState<'basic' | 'pricing' | 'content' | 'details' | 'media' | 'flags'>('basic')

  const [form, setForm] = useState({
    title: tour?.title ?? '',
    slug: tour?.slug ?? '',
    region: tour?.region ?? '',
    multiDestinations: fromArr(tour?.multiDestinations),
    primaryDestinationId: tour?.primaryDestinationId ?? (destinations[0]?.id ?? ''),
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
  })

  const [options, setOptions] = useState<OptionItem[]>(() => {
    try { return Array.isArray(tour?.options) ? tour.options : (tour?.options ? JSON.parse(tour.options) : []) }
    catch { return [] }
  })
  const [cancellationTiers, setCancellationTiers] = useState<CancellationTier[]>(() => {
    try { return Array.isArray(tour?.cancellationTiers) ? tour.cancellationTiers : (tour?.cancellationTiers ? JSON.parse(tour.cancellationTiers) : []) }
    catch { return [] }
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
    { id: 'details',  label: 'Tour Details' },
    { id: 'media',    label: 'Media' },
    { id: 'flags',    label: 'Visibility' },
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
            <h3 className="font-bold text-gray-800 mb-2">Tour Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
                <input required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400"
                  placeholder="e.g. South East Asia Explorer" />
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Countries / Destinations Covered</label>
                <p className="text-xs text-gray-400 mb-1">One per line — all countries this tour visits</p>
                <textarea rows={3} value={form.multiDestinations}
                  onChange={(e) => setForm({ ...form, multiDestinations: e.target.value })}
                  placeholder={'Singapore\nMalaysia\nThailand'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
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

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cancellation Policy Text</label>
              <p className="text-xs text-gray-400 mb-1">Brief summary shown on the booking panel</p>
              <textarea rows={2} value={form.cancellationPolicy}
                onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
                placeholder="e.g. Free cancellation up to 30 days before departure"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
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
                placeholder="One-paragraph overview shown on tour cards…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-400 resize-none" />
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
              {area('visaNotes', 'Visa Notes', 4, 'Notes about visa requirements for each country covered')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChipList
                label="Inclusions"
                items={form.inclusions}
                presets={INCLUSION_PRESETS}
                accentColor="sky"
                onChange={v => setForm({ ...form, inclusions: v })}
              />
              <ChipList
                label="Exclusions"
                items={form.exclusions}
                presets={EXCLUSION_PRESETS}
                accentColor="sky"
                onChange={v => setForm({ ...form, exclusions: v })}
              />
            </div>
          </div>
        )}

        {/* ── TOUR DETAILS ── */}
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
              {area('hostLanguage', 'Host Language(s)', 2, 'One per line')}
              {area('audioGuideLanguage', 'Audio Guide Language(s)', 2, 'One per line')}
              {area('bookletLanguage', 'Booklet Language(s)', 2, 'One per line')}
              {inp('emergencyContact', 'Emergency Contact')}
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {area('inclusionService', 'Included Services', 4, 'One per line')}
              {area('exclusionService', 'Excluded Services', 4, 'One per line')}
              {area('notSuitable', 'Not Suitable For', 3, 'One per line')}
              {area('notAllowed', 'Not Allowed', 3, 'One per line')}
              {area('mustCarryItem', 'Must Carry Items', 3, 'One per line')}
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
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tour'}
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
