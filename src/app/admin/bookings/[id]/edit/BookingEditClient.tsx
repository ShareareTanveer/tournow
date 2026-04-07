'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus, FiTrash2, FiSend, FiSave, FiArrowLeft,
  FiAlertCircle, FiCheckCircle, FiInfo,
} from 'react-icons/fi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OriginalSnapshot {
  rooms?: { type: string; qty: number; label: string }[]
  roomType?: string
  paxAdult: number
  paxChild: number
  paxInfant: number
  travelDate: string
  returnDate?: string
  pricePerPerson?: number
  priceTwin?: number
  extraNights?: number
  extraNightPrice?: number
  selectedOptions?: { label: string; price: number }[]
  totalPrice: number
  notes?: string
}

interface StaffQuote {
  rooms?: { type: string; qty: number; label: string; unitPrice?: number }[]
  lineItems: { label: string; price: number }[]
  totalPrice: number
  notes?: string
  validUntil?: string
}

interface Booking {
  id: string
  bookingRef: string
  customerName: string
  customerEmail: string
  customerPhone: string
  travelDate: string
  returnDate?: string | null
  paxAdult: number
  paxChild: number
  paxInfant: number
  rooms?: { type: string; qty: number; label: string }[] | null
  roomType?: string | null
  pricePerPerson?: number | null
  priceTwin?: number | null
  extraNights: number
  extraNightPrice?: number | null
  selectedOptions?: { label: string; price: number }[] | null
  totalPrice: number
  discount: number
  status: string
  adminNotes?: string | null
  staffQuote?: StaffQuote | null
  originalSnapshot?: OriginalSnapshot | null
  customerNote?: string | null
  notes?: string | null
  package?: { title: string; images: string[]; price: number; priceTwin?: number | null; priceChild?: number | null; extraNightPrice?: number | null; options?: { label: string; price: number; isDefault?: boolean }[] | null } | null
  tour?: { title: string; images: string[]; price: number; priceTwin?: number | null; priceChild?: number | null; extraNightPrice?: number | null; options?: { label: string; price: number; isDefault?: boolean }[] | null } | null
}

interface LineItem { label: string; price: number }
interface RoomLine  { type: string; qty: number; label: string; unitPrice: number }

// ─── helpers ──────────────────────────────────────────────────────────────────

const ROOM_TYPES = [
  { type: 'SINGLE', label: 'Single Room' },
  { type: 'TWIN',   label: 'Twin Sharing' },
  { type: 'DOUBLE', label: 'Double Room' },
  { type: 'TRIPLE', label: 'Triple Room' },
]

function fmt(n: number) { return `LKR ${n.toLocaleString()}` }

function diffClass(a: number, b: number) {
  if (b < a) return 'text-green-600'
  if (b > a) return 'text-red-500'
  return 'text-gray-500'
}

// ─── Original snapshot panel ──────────────────────────────────────────────────

function OriginalPanel({ snap }: { snap: OriginalSnapshot | null | undefined }) {
  if (!snap) return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-center min-h-[120px]">
      <p className="text-xs text-blue-400 italic">No original snapshot (old booking)</p>
    </div>
  )

  const rows: { label: string; value: string }[] = []
  if (snap.rooms?.length) rows.push({ label: 'Rooms', value: snap.rooms.map(r => `${r.label} ×${r.qty}`).join(', ') })
  else if (snap.roomType) rows.push({ label: 'Room Type', value: snap.roomType })
  rows.push({ label: 'Pax', value: `${snap.paxAdult}A / ${snap.paxChild}C / ${snap.paxInfant}I` })
  rows.push({ label: 'Travel Date', value: new Date(snap.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })
  if (snap.returnDate) rows.push({ label: 'Return', value: new Date(snap.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })
  if (snap.pricePerPerson) rows.push({ label: 'Price / Person', value: fmt(snap.pricePerPerson) })
  if (snap.priceTwin) rows.push({ label: 'Twin Price', value: fmt(snap.priceTwin) })
  if (snap.extraNights) rows.push({ label: 'Extra Nights', value: `${snap.extraNights}` })
  if (snap.selectedOptions?.length) rows.push({ label: 'Add-ons', value: snap.selectedOptions.map(o => `${o.label} (${fmt(o.price)})`).join(', ') })
  if (snap.notes) rows.push({ label: 'Note', value: snap.notes })

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-blue-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Customer's Original Request</p>
      </div>
      <div className="p-4 space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between gap-3 py-1 border-b border-blue-100 last:border-0">
            <span className="text-xs text-blue-500">{r.label}</span>
            <span className="text-xs font-semibold text-blue-800 text-right max-w-[55%]">{r.value}</span>
          </div>
        ))}
        <div className="pt-3 mt-1 border-t border-blue-200 flex justify-between items-center">
          <span className="text-xs font-bold text-blue-700">Estimated Total</span>
          <span className="text-lg font-black text-blue-700">{fmt(snap.totalPrice)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main edit client ─────────────────────────────────────────────────────────

export default function BookingEditClient({ booking, type }: { booking: Booking; type: 'package' | 'tour' }) {
  const router = useRouter()
  const item = type === 'package' ? booking.package : booking.tour
  const snap = booking.originalSnapshot

  // ── Initial state from existing quote or original request ─────────────────
  const initLineItems = (): LineItem[] => {
    if (booking.staffQuote?.lineItems?.length) return booking.staffQuote.lineItems
    // Pre-populate from original request
    const items: LineItem[] = []
    if (snap) {
      if (snap.rooms?.length) {
        snap.rooms.forEach(r => {
          const unitPrice = r.type === 'TWIN' && item?.priceTwin ? item.priceTwin : (item?.price ?? 0)
          items.push({ label: `${r.label} × ${r.qty} room${r.qty > 1 ? 's' : ''} × ${snap.paxAdult} adult${snap.paxAdult > 1 ? 's' : ''}`, price: unitPrice * r.qty * snap.paxAdult })
        })
      } else {
        items.push({ label: `${snap.paxAdult} Adult${snap.paxAdult > 1 ? 's' : ''}`, price: (snap.pricePerPerson ?? item?.price ?? 0) * snap.paxAdult })
      }
      if (snap.paxChild > 0 && item?.priceChild) items.push({ label: `${snap.paxChild} Child`, price: item.priceChild * snap.paxChild })
      if (snap.extraNights && snap.extraNights > 0 && item?.extraNightPrice) items.push({ label: `Extra Nights × ${snap.extraNights}`, price: item.extraNightPrice * snap.extraNights * snap.paxAdult })
      snap.selectedOptions?.filter(o => o.price > 0).forEach(o => items.push({ label: o.label, price: o.price * snap.paxAdult }))
    }
    return items.length ? items : [{ label: '', price: 0 }]
  }

  const initRooms = (): RoomLine[] => {
    if (booking.staffQuote?.rooms?.length) {
      return booking.staffQuote.rooms.map(r => ({ ...r, unitPrice: r.unitPrice ?? (item?.price ?? 0) }))
    }
    if (booking.rooms?.length) {
      return booking.rooms.map(r => ({
        type: r.type, qty: r.qty, label: r.label,
        unitPrice: r.type === 'TWIN' && item?.priceTwin ? item.priceTwin : (item?.price ?? 0),
      }))
    }
    return []
  }

  const [lineItems, setLineItems] = useState<LineItem[]>(initLineItems)
  const [rooms, setRooms] = useState<RoomLine[]>(initRooms)
  const [notes, setNotes] = useState(booking.staffQuote?.notes ?? '')
  const [validUntil, setValidUntil] = useState(booking.staffQuote?.validUntil ?? '')
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes ?? '')
  const [discount, setDiscount] = useState(booking.discount)
  const [manualTotal, setManualTotal] = useState<number | null>(null)
  const [useManualTotal, setUseManualTotal] = useState(false)

  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // ── Calculated totals ──────────────────────────────────────────────────────
  const lineTotal = lineItems.reduce((s, i) => s + (Number(i.price) || 0), 0)
  const quoteTotal = useManualTotal && manualTotal != null ? manualTotal : Math.max(0, lineTotal - discount)
  const originalTotal = snap?.totalPrice ?? booking.totalPrice
  const diff = quoteTotal - originalTotal
  const diffPct = originalTotal > 0 ? Math.round(Math.abs(diff / originalTotal) * 100) : 0

  // ── Line item helpers ──────────────────────────────────────────────────────
  function addLine() { setLineItems(l => [...l, { label: '', price: 0 }]) }
  function removeLine(i: number) { setLineItems(l => l.filter((_, idx) => idx !== i)) }
  function updateLine(i: number, field: keyof LineItem, value: string | number) {
    setLineItems(l => l.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  // Pre-fill a room into line items
  function addRoomToLines(r: RoomLine) {
    const pax = booking.paxAdult || snap?.paxAdult || 1
    setLineItems(l => [...l, {
      label: `${r.label} × ${r.qty} room${r.qty > 1 ? 's' : ''} × ${pax} adult${pax > 1 ? 's' : ''}`,
      price: r.unitPrice * r.qty * pax,
    }])
  }

  // ── Option quick-add ───────────────────────────────────────────────────────
  function addOption(opt: { label: string; price: number }) {
    const pax = booking.paxAdult || snap?.paxAdult || 1
    setLineItems(l => [...l, { label: opt.label, price: opt.price * pax }])
  }

  // ── Save (without sending) ─────────────────────────────────────────────────
  async function save(andSend = false) {
    if (andSend) setSending(true)
    else setSaving(true)
    setError('')

    const staffQuote: StaffQuote = {
      rooms: rooms.map(r => ({ type: r.type, qty: r.qty, label: r.label, unitPrice: r.unitPrice })),
      lineItems,
      totalPrice: quoteTotal,
      notes: notes || undefined,
      validUntil: validUntil || undefined,
    }

    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: andSend ? 'send_quote' : undefined,
          staffQuote,
          adminNotes: adminNotes || undefined,
          discount,
          totalPrice: quoteTotal,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        if (andSend) router.push(`/admin/bookings/${booking.id}`)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Breadcrumb info */}
      <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl">
        {(item?.images?.[0]) && (
          <img src={item.images[0]} alt="" className="w-14 h-10 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{item?.title}</p>
          <p className="text-xs text-gray-400 font-mono">{booking.bookingRef.slice(-10).toUpperCase()} · {booking.customerName} · {booking.customerPhone}</p>
        </div>
        {booking.customerNote && (
          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 max-w-xs">
            <FiAlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{booking.customerNote}</p>
          </div>
        )}
      </div>

      {/* Main two-column layout: original left, editor right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* LEFT — original */}
        <OriginalPanel snap={snap} />

        {/* RIGHT — quote editor */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Build / Edit Quote</p>
            </div>
            {snap && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                diff < 0 ? 'bg-green-100 text-green-700' : diff > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {diff === 0 ? 'Same as original' : `${diff < 0 ? '↓' : '↑'} LKR ${Math.abs(diff).toLocaleString()} (${diffPct}%) from original`}
              </span>
            )}
          </div>

          <div className="p-5 space-y-5">

            {/* Room selector — quick reference */}
            {(booking.rooms?.length || snap?.rooms?.length) && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Rooms Requested — click to add to line items</p>
                <div className="flex flex-wrap gap-2">
                  {(booking.rooms ?? snap?.rooms ?? []).map((r, i) => {
                    const unitPrice = (r.type === 'TWIN' && item?.priceTwin) ? item.priceTwin : (item?.price ?? 0)
                    const rl: RoomLine = { ...r, unitPrice }
                    return (
                      <button key={i} type="button"
                        onClick={() => addRoomToLines(rl)}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                        <FiPlus size={11} /> {r.label} ×{r.qty} ({fmt(unitPrice)}/p)
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Line items */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Quote Line Items</p>
              <div className="space-y-2">
                {lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center group">
                    <input
                      placeholder="Description (e.g. Twin Room × 2 × 2 adults)"
                      value={item.label}
                      onChange={e => updateLine(i, 'label', e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 min-w-0" />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400">LKR</span>
                      <input
                        type="number" min="0" step="100"
                        value={item.price}
                        onChange={e => updateLine(i, 'price', Number(e.target.value))}
                        className="w-32 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-right font-semibold" />
                    </div>
                    <button onClick={() => removeLine(i)}
                      className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addLine}
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                <FiPlus size={12} /> Add line item
              </button>
            </div>

            {/* Package options quick-add */}
            {item?.options && (item.options as any[]).length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Quick-Add Package Options</p>
                <div className="flex flex-wrap gap-1.5">
                  {(item.options as { label: string; price: number }[]).map((opt, i) => (
                    <button key={i} type="button" onClick={() => addOption(opt)}
                      className="text-xs bg-gray-50 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-600 px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <FiPlus size={10} /> {opt.label} {opt.price > 0 ? `(${fmt(opt.price)}/p)` : '(Free)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Discount (LKR)</label>
                <input type="number" min="0" step="100" value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 font-semibold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Valid Until</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400" />
              </div>
            </div>

            {/* Manual total override */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="useManual" checked={useManualTotal}
                  onChange={e => setUseManualTotal(e.target.checked)}
                  className="rounded" />
                <label htmlFor="useManual" className="text-xs font-semibold text-gray-600">
                  Override with custom total (e.g. customer negotiated a fixed price)
                </label>
              </div>
              {useManualTotal && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">LKR</span>
                  <input type="number" min="0" step="100"
                    value={manualTotal ?? quoteTotal}
                    onChange={e => setManualTotal(Number(e.target.value))}
                    className="flex-1 text-sm border border-orange-300 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-bold text-orange-600" />
                  <span className="text-xs text-gray-400">Final amount customer will pay</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Note to Customer (shown in quote email)</label>
              <textarea rows={2} placeholder="e.g. Hotel upgraded to Deluxe room, price adjusted as discussed…"
                value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 resize-none" />
            </div>

            {/* Admin notes */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Internal Admin Notes (not shown to customer)</label>
              <textarea rows={2} placeholder="Call notes, agent reference, payment terms…"
                value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 resize-none" />
            </div>

            {/* Total preview */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-600 uppercase">Quote Total</span>
                <span className="text-2xl font-black text-orange-600">{fmt(quoteTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Line items</span><span>{fmt(lineTotal)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-semibold mb-1">
                  <span>Discount</span><span>− {fmt(discount)}</span>
                </div>
              )}
              {snap && (
                <div className={`flex justify-between text-xs font-bold mt-2 pt-2 border-t border-orange-200 ${diffClass(originalTotal, quoteTotal)}`}>
                  <span>vs original {fmt(originalTotal)}</span>
                  <span>{diff === 0 ? 'No change' : `${diff < 0 ? '− ' : '+ '}${fmt(Math.abs(diff))} (${diffPct}%)`}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <FiAlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                <FiCheckCircle size={14} className="text-green-500 shrink-0" />
                <p className="text-xs text-green-700 font-semibold">Quote saved successfully.</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap pt-1">
              <button onClick={() => save(false)} disabled={saving || sending}
                className="flex items-center gap-2 text-sm bg-gray-800 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors">
                <FiSave size={14} />
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button onClick={() => save(true)} disabled={saving || sending || lineItems.length === 0 || quoteTotal <= 0}
                className="flex items-center gap-2 text-sm bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
                <FiSend size={14} />
                {sending ? 'Sending…' : 'Save & Send Quote to Customer'}
              </button>
              <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <FiArrowLeft size={13} /> Cancel
              </button>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-gray-400">
              <FiInfo size={11} className="mt-0.5 shrink-0" />
              <span>"Save Draft" saves without emailing. "Save & Send" emails the quote to the customer and sets status to <strong>Awaiting Confirm</strong>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
