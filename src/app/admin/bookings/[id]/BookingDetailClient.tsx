'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiEdit2, FiSend, FiCheck, FiX, FiExternalLink, FiDownload,
  FiPhone, FiMail, FiUser, FiCalendar, FiUsers, FiHome,
  FiAlertCircle, FiCheckCircle, FiClock, FiUpload, FiFileText,
  FiDollarSign, FiTag, FiLink, FiPlus,
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
  currency: string
  status: string
  paymentStatus: string
  adminNotes?: string | null
  staffQuote?: StaffQuote | null
  originalSnapshot?: OriginalSnapshot | null
  isAirfareIncluded?: boolean
  customerNote?: string | null
  receiptUrl?: string | null
  receiptNote?: string | null
  ticketUrl?: string | null
  documents?: { url: string; name: string; note?: string }[] | null
  documentNote?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  package?: { id: string; title: string; slug: string; images: string[] } | null
  tour?: { id: string; title: string; slug: string; images: string[] } | null
  customer?: { id: string; name: string; email: string; phone?: string | null } | null
}

// ─── Status config ────────────────────────────────────────────────────────────

const PIPELINE = [
  { status: 'REQUESTED',        label: 'Requested',        color: 'text-blue-700',   bg: 'bg-blue-100',    dot: 'bg-blue-500',    ring: 'ring-blue-200' },
  { status: 'CALL_REQUIRED',    label: 'Call Required',    color: 'text-purple-700', bg: 'bg-purple-100',  dot: 'bg-purple-500',  ring: 'ring-purple-200' },
  { status: 'EDIT_RESEND',      label: 'Edit & Resend',    color: 'text-amber-700',  bg: 'bg-amber-100',   dot: 'bg-amber-500',   ring: 'ring-amber-200' },
  { status: 'AWAITING_CONFIRM', label: 'Awaiting Confirm', color: 'text-indigo-700', bg: 'bg-indigo-100',  dot: 'bg-indigo-500',  ring: 'ring-indigo-200' },
  { status: 'CONFIRMED',        label: 'Confirmed',        color: 'text-teal-700',   bg: 'bg-teal-100',    dot: 'bg-teal-500',    ring: 'ring-teal-200' },
  { status: 'RECEIPT_UPLOADED', label: 'Receipt Uploaded', color: 'text-violet-700', bg: 'bg-violet-100',  dot: 'bg-violet-500',  ring: 'ring-violet-200' },
  { status: 'ADMIN_CONFIRMING', label: 'Admin Confirming', color: 'text-pink-700',   bg: 'bg-pink-100',    dot: 'bg-pink-500',    ring: 'ring-pink-200' },
  { status: 'ALL_CONFIRMED',    label: 'All Confirmed',    color: 'text-emerald-700',bg: 'bg-emerald-100', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { status: 'MAIL_SENT',        label: 'Complete',         color: 'text-green-700',  bg: 'bg-green-100',   dot: 'bg-green-600',   ring: 'ring-green-200' },
  { status: 'CANCELLED',        label: 'Cancelled',        color: 'text-red-700',    bg: 'bg-red-100',     dot: 'bg-red-500',     ring: 'ring-red-200' },
  { status: 'COMPLETED',        label: 'Completed',        color: 'text-gray-700',   bg: 'bg-gray-100',    dot: 'bg-gray-500',    ring: 'ring-gray-200' },
]

const PAY_STATUS = [
  { value: 'UNPAID',   label: 'Unpaid',   color: 'text-red-700',     bg: 'bg-red-100' },
  { value: 'PARTIAL',  label: 'Partial',  color: 'text-amber-700',   bg: 'bg-amber-100' },
  { value: 'PAID',     label: 'Paid',     color: 'text-emerald-700', bg: 'bg-emerald-100' },
  { value: 'REFUNDED', label: 'Refunded', color: 'text-gray-600',    bg: 'bg-gray-100' },
]

const si = (s: string) => PIPELINE.find(p => p.status === s) ?? PIPELINE[0]
const pi = (s: string) => PAY_STATUS.find(p => p.value === s) ?? PAY_STATUS[0]

const fmt = (n: number) => `LKR ${n.toLocaleString()}`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// ─── Status Timeline ──────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: 'REQUESTED',        short: 'Request' },
  { key: 'AWAITING_CONFIRM', short: 'Quote Sent' },
  { key: 'CONFIRMED',        short: 'Confirmed' },
  { key: 'RECEIPT_UPLOADED', short: 'Receipt' },
  { key: 'ALL_CONFIRMED',    short: 'All Confirmed' },
  { key: 'MAIL_SENT',        short: 'Complete' },
]

function StatusTimeline({ status }: { status: string }) {
  const isCancelled = status === 'CANCELLED'
  const idx = isCancelled ? -1 : TIMELINE_STEPS.findIndex(s => s.key === status)
  const effectiveIdx = idx === -1 && !isCancelled ? 0 : idx

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl px-5 py-3 shadow-sm">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-semibold text-red-600">
          Booking Cancelled
        </span>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start w-full">
        {TIMELINE_STEPS.map((s, i) => {
          const done = effectiveIdx >= i
          const active = effectiveIdx === i
          const isLast = i === TIMELINE_STEPS.length - 1

          return (
            <div
              key={s.key}
              className={`flex flex-col items-center ${
                isLast ? 'flex-none' : 'flex-1'
              }`}
            >
              <div className="flex items-center w-full">
                {/* DOT */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    done
                      ? active
                        ? 'bg-indigo-600 scale-110 shadow-lg ring-4 ring-indigo-100'
                        : 'bg-emerald-500 shadow-md'
                      : 'bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {done ? (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                  )}
                </div>

                {/* LINE */}
                {!isLast && (
                  <div className="flex-1 relative mx-2">
                    <div className="h-1 rounded-full bg-gray-200" />
                    <div
                      className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-500
                      ${effectiveIdx > i ? 'bg-emerald-400 w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </div>

              {/* LABEL */}
              <span
                className={`mt-2 text-xs font-semibold text-center transition-colors duration-300
                ${
                  active
                    ? 'text-indigo-600'
                    : done
                    ? 'text-emerald-600'
                    : 'text-gray-400'
                }`}
              >
                {s.short}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Price Comparison ─────────────────────────────────────────────────────────

function PriceComparison({ booking }: { booking: Booking }) {
  const snap = booking.originalSnapshot
  const quote = booking.staffQuote
  // Show quote panel if there's a staffQuote object (even with empty lineItems), or if status is past AWAITING_CONFIRM
  const CONFIRMED_STATUSES = ['CONFIRMED', 'RECEIPT_UPLOADED', 'ADMIN_CONFIRMING', 'ALL_CONFIRMED', 'MAIL_SENT', 'COMPLETED']
  const hasQuote = !!(quote && (quote.lineItems?.length > 0 || CONFIRMED_STATUSES.includes(booking.status)))

  const diff = hasQuote && quote && snap ? quote.totalPrice - snap.totalPrice : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original Request */}
      <div className="rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50 to-white overflow-hidden">
        <div className="px-5 py-3.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <FiUser size={13} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Customer Request</p>
            <p className="text-[10px] text-blue-500">Original submission</p>
          </div>
        </div>
        <div className="p-5">
          {snap ? (
            <div className="space-y-0">
              {snap.rooms && snap.rooms.length > 0 && (
                <QuoteRow label="Rooms" value={snap.rooms.map(r => `${r.label} ×${r.qty}`).join(', ')} />
              )}
              {!snap.rooms?.length && snap.roomType && (
                <QuoteRow label="Room Type" value={snap.roomType} />
              )}
              <QuoteRow label="Passengers" value={`${snap.paxAdult} Adult${snap.paxAdult !== 1 ? 's' : ''}${snap.paxChild > 0 ? `, ${snap.paxChild} Child` : ''}${snap.paxInfant > 0 ? `, ${snap.paxInfant} Infant` : ''}`} />
              <QuoteRow label="Travel Date" value={fmtDate(snap.travelDate)} />
              {snap.returnDate && <QuoteRow label="Return" value={fmtDate(snap.returnDate)} />}
              {snap.pricePerPerson != null && snap.pricePerPerson > 0 && <QuoteRow label="Price / Person" value={fmt(snap.pricePerPerson)} />}
              {snap.priceTwin != null && snap.priceTwin > 0 && <QuoteRow label="Twin Price / Person" value={fmt(snap.priceTwin)} />}
              {snap.extraNights != null && snap.extraNights > 0 && <QuoteRow label="Extra Nights" value={`${snap.extraNights} night(s)`} />}
              {snap.selectedOptions && snap.selectedOptions.length > 0 && (
                <QuoteRow label="Add-ons" value={snap.selectedOptions.map(o => o.label).join(', ')} />
              )}
              {snap.notes && <QuoteRow label="Note" value={snap.notes} />}
              <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">Estimate</span>
                <span className="text-lg font-black text-blue-700">{fmt(snap.totalPrice)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-blue-300 italic py-4 text-center">No snapshot recorded</p>
          )}
        </div>
      </div>

      {/* Staff Quote */}
      <div className={`rounded-2xl border overflow-hidden ${
        hasQuote ? 'border-indigo-200 bg-linear-to-b from-indigo-50 to-white' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-2 ${
          hasQuote ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${hasQuote ? 'bg-indigo-100' : 'bg-gray-200'}`}>
              <FiFileText size={13} className={hasQuote ? 'text-indigo-600' : 'text-gray-400'} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wide ${hasQuote ? 'text-indigo-800' : 'text-gray-400'}`}>
                {hasQuote ? 'Admin Quote' : 'No Quote Yet'}
              </p>
              <p className={`text-[10px] ${hasQuote ? 'text-indigo-500' : 'text-gray-400'}`}>
                {hasQuote ? 'Sent to customer' : 'Not built yet'}
              </p>
            </div>
          </div>
          <Link href={`/admin/bookings/${booking.id}/edit`}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              hasQuote
                ? 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
            <FiEdit2 size={11} /> {hasQuote ? 'Edit' : 'Build Quote'}
          </Link>
        </div>
        <div className="p-5">
          {hasQuote && quote ? (
            <div className="space-y-0">
              {quote.rooms && quote.rooms.length > 0 && (
                <QuoteRow label="Rooms" value={quote.rooms.map(r => `${r.label ?? r.type} ×${r.qty}`).join(', ')} />
              )}
              {quote.lineItems.map((item, i) => (
                <QuoteRow key={i} label={item.label} value={fmt(item.price)} money />
              ))}
              {quote.notes && <QuoteRow label="Note" value={quote.notes} />}
              {quote.validUntil && <QuoteRow label="Valid Until" value={fmtDate(quote.validUntil)} highlight />}
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">Quote Total</span>
                <span className="text-lg font-black text-indigo-700">{fmt(quote.totalPrice)}</span>
              </div>
              {diff !== null && diff !== 0 && (
                <div className={`mt-2 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl w-fit ${
                  diff < 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  <span>{diff < 0 ? '↓' : '↑'}</span>
                  <span>{fmt(Math.abs(diff))} ({Math.abs(Math.round((diff / snap!.totalPrice) * 100))}%) {diff < 0 ? 'below' : 'above'} estimate</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FiFileText size={20} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-400">No quote built yet</p>
                <p className="text-xs text-gray-300 mt-0.5">Build a custom quote with pricing for this customer</p>
              </div>
              <Link href={`/admin/bookings/${booking.id}/edit`}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                <FiEdit2 size={12} /> Build Quote Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuoteRow({ label, value, money, highlight }: { label: string; value: React.ReactNode; money?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right max-w-[60%] ${money ? 'text-gray-800 font-mono' : highlight ? 'text-indigo-600' : 'text-gray-700'}`}>{value}</span>
    </div>
  )
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────

function QuickActions({ booking, type, onUpdate }: {
  booking: Booking
  type: 'package' | 'tour'
  onUpdate: (updated: Partial<Booking>) => void
}) {
  const [loading, setLoading] = useState<string | null>(null)

  async function act(action: string, extra?: object) {
    setLoading(action)
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) })
    if (res.ok) onUpdate(await res.json())
    setLoading(null)
  }

  async function updateField(data: object) {
    setLoading('field')
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) onUpdate(await res.json())
    setLoading(null)
  }

  const s = booking.status

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/bookings/${booking.id}/edit`}
        className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
        <FiEdit2 size={13} /> {booking.staffQuote ? 'Edit Quote' : 'Build Quote'}
      </Link>

      {booking.staffQuote && ['REQUESTED', 'CALL_REQUIRED', 'EDIT_RESEND'].includes(s) && (
        <button onClick={() => act('send_quote', { staffQuote: booking.staffQuote, adminNotes: booking.adminNotes })}
          disabled={loading === 'send_quote'}
          className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <FiSend size={13} /> {loading === 'send_quote' ? 'Sending…' : 'Send Quote'}
        </button>
      )}

      {booking.staffQuote && s === 'AWAITING_CONFIRM' && (
        <button onClick={() => act('send_quote', { staffQuote: booking.staffQuote, adminNotes: booking.adminNotes })}
          disabled={loading === 'send_quote'}
          className="flex items-center gap-1.5 text-xs bg-blue-500 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
          <FiSend size={13} /> {loading === 'send_quote' ? 'Sending…' : 'Resend Quote'}
        </button>
      )}

      {s === 'RECEIPT_UPLOADED' && (
        <>
          <button onClick={() => updateField({ status: 'ADMIN_CONFIRMING' })} disabled={!!loading}
            className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors">
            <FiClock size={13} /> Mark Reviewing
          </button>
          <button onClick={() => updateField({ status: 'ALL_CONFIRMED', paymentStatus: 'PAID' })} disabled={!!loading}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            <FiCheck size={13} /> Confirm + Paid
          </button>
        </>
      )}

      {s === 'ADMIN_CONFIRMING' && (
        <button onClick={() => updateField({ status: 'ALL_CONFIRMED', paymentStatus: 'PAID' })} disabled={!!loading}
          className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          <FiCheck size={13} /> All Confirmed + Paid
        </button>
      )}

      {!['CANCELLED', 'COMPLETED', 'MAIL_SENT'].includes(s) && (
        <button onClick={() => { if (confirm('Cancel this booking?')) updateField({ status: 'CANCELLED' }) }} disabled={!!loading}
          className="flex items-center gap-1.5 text-xs border border-red-200 text-red-500 px-3.5 py-2 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
          <FiX size={13} /> Cancel
        </button>
      )}
    </div>
  )
}

// ─── Admin notes inline ───────────────────────────────────────────────────────

function AdminNotesEditor({ booking, type, onUpdate }: {
  booking: Booking; type: 'package' | 'tour'; onUpdate: (u: Partial<Booking>) => void
}) {
  const [notes, setNotes] = useState(booking.adminNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminNotes: notes }) })
    if (res.ok) { onUpdate(await res.json()); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <textarea rows={6} placeholder="Internal notes, payment refs, call logs, follow-up reminders…"
        value={notes} onChange={e => setNotes(e.target.value)}
        className="flex-1 w-full text-sm border border-gray-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none bg-gray-50 placeholder:text-gray-300" />
      <button onClick={save} disabled={saving || notes === (booking.adminNotes ?? '')}
        className={`self-start flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-semibold disabled:opacity-40 transition-all ${
          saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}>
        <FiCheck size={12} /> {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Notes'}
      </button>
    </div>
  )
}

// ─── Receipt & Documents section ──────────────────────────────────────────────

const NOTE_TEMPLATES = [
  { label: 'Confirmed', text: 'Your booking is confirmed. Please find your travel documents attached. Have a wonderful trip!' },
  { label: 'Visa docs', text: 'Please find your visa documents attached. Ensure you carry printed copies when travelling.' },
  { label: 'Tickets ready', text: 'Your flight tickets and hotel vouchers are attached. Please review all details carefully.' },
  { label: 'Final itinerary', text: 'Your final itinerary is attached. Please contact us if you have any questions before departure.' },
  { label: 'Payment receipt', text: 'Thank you for your payment. Your receipt and booking documents are attached for your records.' },
]

async function uploadFileToMedia(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', 'booking-docs')
  const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error('File upload failed')
  return (await res.json()).url as string
}

interface DocEntry { url: string; name: string; note?: string }

function ReceiptTicketSection({ booking, type, onUpdate }: {
  booking: Booking; type: 'package' | 'tour'; onUpdate: (u: Partial<Booking>) => void
}) {
  const [existingDocs, setExistingDocs] = useState<DocEntry[]>(booking.documents ?? [])

  useEffect(() => {
    setExistingDocs(booking.documents ?? [])
  }, [booking.documents])

  const [newFiles, setNewFiles] = useState<{ file: File; name: string }[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newUrlName, setNewUrlName] = useState('')
  const [docNote, setDocNote] = useState(booking.documentNote ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)

  const apiUrl = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`

  async function persistDocs(docsToAppend: DocEntry[], noteOverride?: string) {
    const merged = [...existingDocs, ...docsToAppend]
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_documents', documents: merged, documentNote: noteOverride ?? docNote }),
    })
    if (res.ok) {
      const updated = await res.json()
      setExistingDocs(updated.documents ?? merged)
      onUpdate(updated)
      return true
    }
    return false
  }

  async function removeDoc(idx: number) {
    const updated = existingDocs.filter((_, i) => i !== idx)
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_documents', documents: updated, documentNote: docNote }),
    })
    if (res.ok) { setExistingDocs(updated); onUpdate(await res.json()) }
  }

  async function handleUploadFiles() {
    if (newFiles.length === 0) return
    setUploading(true); setError('')
    try {
      const appended: DocEntry[] = []
      for (let i = 0; i < newFiles.length; i++) {
        setUploadProgress(`Uploading ${i + 1} / ${newFiles.length}…`)
        const url = await uploadFileToMedia(newFiles[i].file)
        appended.push({ url, name: newFiles[i].name || newFiles[i].file.name })
      }
      setUploadProgress('')
      const ok = await persistDocs(appended)
      if (ok) setNewFiles([])
      else setError('Failed to save documents.')
    } catch {
      setError('Upload failed. Please try again.')
      setUploadProgress('')
    }
    setUploading(false)
  }

  async function handleAddUrl() {
    if (!newUrl.trim()) return
    setUploading(true); setError('')
    const ok = await persistDocs([{ url: newUrl.trim(), name: newUrlName.trim() || 'Document' }])
    if (ok) { setNewUrl(''); setNewUrlName(''); setShowUrlInput(false) }
    else setError('Failed to save URL.')
    setUploading(false)
  }

  async function handleGenerateTicket() {
    setGenerating(true); setError('')
    const generatedUrl = `/api/my/bookings/${booking.id}/ticket`
    window.open(`/api/admin/bookings/${booking.id}/ticket`, '_blank')
    const ok = await persistDocs([{ url: generatedUrl, name: 'Booking Voucher' }])
    if (!ok) setError('Failed to save generated voucher.')
    setGenerating(false)
  }

  async function saveNote() {
    setSavingNote(true)
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_documents', documents: existingDocs, documentNote: docNote }),
    })
    if (res.ok) { onUpdate(await res.json()); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2500) }
    setSavingNote(false)
  }

  return (
    <div className="space-y-6">

      {/* ── Customer's uploaded receipt ── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Payment Receipt from Customer</p>
        {booking.receiptUrl ? (
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <FiFileText size={14} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold text-emerald-700 hover:underline flex items-center gap-1.5">
                View Receipt <FiExternalLink size={12} />
              </a>
              {booking.receiptNote && (
                <p className="text-xs text-emerald-600 mt-1 italic">"{booking.receiptNote}"</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <FiFileText size={12} className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 italic">No receipt uploaded by customer yet</p>
          </div>
        )}
      </div>

      {/* ── Documents list ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documents ({existingDocs.length})</p>
        </div>
        {existingDocs.length === 0 ? (
          <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <FiDownload size={12} className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 italic">No documents added yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {existingDocs.map((doc, i) => (
              <li key={i} className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <FiDownload size={12} className="text-indigo-500" />
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate">
                  {doc.name}
                </a>
                {doc.note && <span className="text-[10px] text-gray-400 italic hidden group-hover:block truncate max-w-30">{doc.note}</span>}
                <button onClick={() => removeDoc(i)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all shrink-0">
                  <FiX size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Auto-generate voucher ── */}
      <div className="p-4 bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-emerald-800">Auto-generate Booking Voucher</p>
        </div>
        <p className="text-[11px] text-emerald-600 mb-3">Opens a preview + adds it to the customer's documents list.</p>
        <button onClick={handleGenerateTicket} disabled={generating}
          className="flex items-center gap-2 text-xs bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
          <FiCheckCircle size={13} />
          {generating ? 'Generating…' : 'Generate & Add Voucher'}
        </button>
      </div>

      {/* ── Upload new files ── */}
      <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
        <p className="text-xs font-bold text-gray-700">Add Documents</p>

        {/* File picker */}
        <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${
          newFiles.length > 0 ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 bg-white hover:border-indigo-300'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <FiUpload size={14} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">
              {newFiles.length > 0 ? `${newFiles.length} file(s) selected` : 'Choose PDFs or images'}
            </p>
            <p className="text-[10px] text-gray-400">Multiple files supported</p>
          </div>
          <input type="file" accept="image/*,.pdf" multiple className="sr-only"
            onChange={e => setNewFiles(Array.from(e.target.files ?? []).map(f => ({ file: f, name: f.name.replace(/\.[^.]+$/, '') })))} />
        </label>

        {newFiles.length > 0 && (
          <ul className="space-y-1.5 mt-1">
            {newFiles.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center shrink-0">
                  <FiFileText size={10} className="text-indigo-500" />
                </div>
                <input value={item.name} onChange={e => setNewFiles(f => f.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  placeholder="Document name…"
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 bg-white" />
                <span className="text-[10px] text-gray-300 truncate max-w-20 hidden sm:block">{item.file.name}</span>
                <button onClick={() => setNewFiles(f => f.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-400 shrink-0"><FiX size={12} /></button>
              </li>
            ))}
            <button onClick={handleUploadFiles} disabled={uploading}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-1">
              <FiUpload size={11} />
              {uploading ? (uploadProgress || 'Uploading…') : `Upload ${newFiles.length > 1 ? `${newFiles.length} Files` : 'File'}`}
            </button>
          </ul>
        )}

        {/* URL input toggle */}
        {!showUrlInput ? (
          <button onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors">
            <FiLink size={12} /> Add via URL instead
          </button>
        ) : (
          <div className="space-y-1.5 pt-1 border-t border-gray-200">
            <input value={newUrlName} onChange={e => setNewUrlName(e.target.value)}
              placeholder="Document name (e.g. Hotel Voucher)"
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white" />
            <div className="flex gap-2">
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                placeholder="https://… (Cloudinary, Drive, S3…)"
                className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white" />
              <button onClick={handleAddUrl} disabled={uploading || !newUrl.trim()}
                className="text-xs bg-gray-800 text-white px-3 py-2 rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-50">
                Add
              </button>
              <button onClick={() => setShowUrlInput(false)} className="text-gray-400 hover:text-gray-600 px-1">
                <FiX size={14} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <FiAlertCircle size={12} /> {error}
          </div>
        )}
      </div>

      {/* ── Note to customer ── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Note to Customer</p>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {NOTE_TEMPLATES.map(t => (
              <button key={t.label} onClick={() => setDocNote(t.text)}
                className="text-[10px] bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-gray-500 px-2.5 py-1 rounded-full font-medium transition-colors">
                {t.label}
              </button>
            ))}
          </div>
          <textarea rows={3} value={docNote} onChange={e => setDocNote(e.target.value)}
            placeholder="Write a note shown to the customer alongside their documents…"
            className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none bg-white placeholder:text-gray-300" />
          <button onClick={saveNote} disabled={savingNote}
            className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-semibold disabled:opacity-50 transition-all ${
              noteSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
            <FiCheck size={11} /> {savingNote ? 'Saving…' : noteSaved ? 'Saved!' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status / Payment selectors ───────────────────────────────────────────────

function StatusPaymentRow({ booking, type, onUpdate }: {
  booking: Booking; type: 'package' | 'tour'; onUpdate: (u: Partial<Booking>) => void
}) {
  const [updating, setUpdating] = useState(false)

  async function change(data: object) {
    setUpdating(true)
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) onUpdate(await res.json())
    setUpdating(false)
  }

  const s = si(booking.status)
  const p = pi(booking.paymentStatus)

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
        <select value={booking.status} disabled={updating} onChange={e => change({ status: e.target.value })}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer outline-none ring-1 ring-inset ring-black/5 ${s.bg} ${s.color} disabled:opacity-50`}>
          {PIPELINE.map(pp => <option key={pp.status} value={pp.status}>{pp.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase">Payment</span>
        <select value={booking.paymentStatus} disabled={updating} onChange={e => change({ paymentStatus: e.target.value })}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer outline-none ring-1 ring-inset ring-black/5 ${p.bg} ${p.color} disabled:opacity-50`}>
          {PAY_STATUS.map(pp => <option key={pp.value} value={pp.value}>{pp.label}</option>)}
        </select>
      </div>
      {updating && <span className="text-[10px] text-gray-400 animate-pulse">Saving…</span>}
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function BookingDetailClient({ booking: initial, type }: {
  booking: Booking
  type: 'package' | 'tour'
}) {
  const [booking, setBooking] = useState(initial)

  function onUpdate(partial: Partial<Booking>) {
    setBooking(b => ({ ...b, ...partial }))
  }

  const itemTitle = type === 'package' ? booking.package?.title : booking.tour?.title
  const itemImage = type === 'package' ? booking.package?.images?.[0] : booking.tour?.images?.[0]
  const s = si(booking.status)
  const p = pi(booking.paymentStatus)

  return (
    <div className="space-y-6 w-full mx-auto">

      {/* ── Hero header card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">


        <div className="p-6">
          {/* Title + ref row */}
          <div className="flex items-start gap-4 mb-5">
            {itemImage ? (
              <img src={itemImage} alt="" className="w-20 h-16 rounded-xl object-cover shrink-0 shadow-sm" />
            ) : (
              <div className="w-20 h-16 rounded-xl bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center shrink-0">
                <FiHome size={24} className="text-indigo-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-xl leading-tight">{itemTitle}</p>
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  #{booking.bookingRef.slice(-10).toUpperCase()}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.bg} ${p.color}`}>{p.label}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Created {new Date(booking.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {' · '}Updated {new Date(booking.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {/* Total price callout */}
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Total</p>
              <p className="text-2xl font-black text-gray-900">{fmt(booking.totalPrice)}</p>
              {booking.discount > 0 && (
                <p className="text-[11px] text-emerald-600 font-semibold">- {fmt(booking.discount)} discount</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-5">
            <StatusTimeline status={booking.status} />
          </div>

          {/* Status + payment + actions row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <StatusPaymentRow booking={booking} type={type} onUpdate={onUpdate} />
            <QuickActions booking={booking} type={type} onUpdate={onUpdate} />
          </div>
        </div>

        {/* Customer alert banner */}
        {booking.customerNote && (
          <div className="mx-6 mb-6 flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <FiAlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 mb-0.5">Customer Requested Changes</p>
              <p className="text-sm text-amber-800">{booking.customerNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Price Comparison ── */}
      <div>
        <SectionLabel>Quote Comparison</SectionLabel>
        <PriceComparison booking={booking} />
      </div>

      {/* ── Customer + Trip details ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <SectionHeader icon={<FiUser size={13} />} title="Customer" />
          <div className="p-5">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white font-black text-lg">
                  {booking.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{booking.customerName}</p>
                {booking.customer && (
                  <p className="text-[10px] text-gray-400 font-mono">ID: …{booking.customer.id.slice(-8)}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <a href={`mailto:${booking.customerEmail}`}
                className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-blue-200">
                  <FiMail size={12} className="text-gray-400 group-hover:text-blue-500" />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium truncate">{booking.customerEmail}</span>
              </a>
              <a href={`tel:${booking.customerPhone}`}
                className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-blue-200">
                  <FiPhone size={12} className="text-gray-400 group-hover:text-blue-500" />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">{booking.customerPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Trip card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <SectionHeader icon={<FiCalendar size={13} />} title="Trip Details" />
          <div className="p-5">
            {/* Date highlight */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-3 text-center">
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wide mb-0.5">Travel</p>
                <p className="text-sm font-black text-indigo-700">{fmtDate(booking.travelDate)}</p>
              </div>
              {booking.returnDate && (
                <div className="flex-1 bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wide mb-0.5">Return</p>
                  <p className="text-sm font-black text-purple-700">{fmtDate(booking.returnDate)}</p>
                </div>
              )}
            </div>

            <div className="space-y-0 divide-y divide-gray-50">
              <TripRow icon={<FiUsers size={11} />} label="Passengers"
                value={`${booking.paxAdult} Adult${booking.paxAdult !== 1 ? 's' : ''}${booking.paxChild > 0 ? `, ${booking.paxChild} Child` : ''}${booking.paxInfant > 0 ? `, ${booking.paxInfant} Infant` : ''}`} />
              <TripRow icon={<FiHome size={11} />} label="Rooms"
                value={booking.rooms && booking.rooms.length > 0 ? booking.rooms.map(r => `${r.label} ×${r.qty}`).join(', ') : (booking.roomType ?? '—')} />
              {booking.extraNights > 0 && (
                <TripRow icon={<FiCalendar size={11} />} label="Extra Nights" value={`${booking.extraNights} night(s)`} />
              )}
              <TripRow icon={<span className="text-[11px]">✈</span>} label="Airfare"
                value={booking.isAirfareIncluded ? 'Requested' : 'Not included'}
                valueClass={booking.isAirfareIncluded ? 'text-indigo-600' : 'text-gray-400'} />
              {booking.selectedOptions && booking.selectedOptions.length > 0 && (
                <TripRow icon={<FiTag size={11} />} label="Add-ons"
                  value={booking.selectedOptions.map(o => o.label).join(', ')} />
              )}
              {booking.notes && (
                <TripRow icon={<FiFileText size={11} />} label="Note" value={booking.notes} />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <FiDollarSign size={11} /> Current Total
              </span>
              <span className="text-xl font-black text-gray-900">{fmt(booking.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Documents + Admin Notes ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <SectionHeader icon={<FiDownload size={13} />} title="Documents & Receipts" />
          <div className="p-5">
            <ReceiptTicketSection booking={booking} type={type} onUpdate={onUpdate} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <SectionHeader icon={<FiFileText size={13} />} title="Internal Notes" badge="Admin only" />
          <div className="p-5">
            <AdminNotesEditor booking={booking} type={type} onUpdate={onUpdate} />
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Small layout helpers ─────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{children}</p>
}

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
      <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide flex-1">{title}</p>
      {badge && (
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </div>
  )
}

function TripRow({ icon, label, value, valueClass = 'text-gray-700' }: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs text-gray-400 flex items-center gap-1.5 shrink-0">{icon} {label}</span>
      <span className={`text-xs font-semibold text-right max-w-[60%] truncate ${valueClass}`}>{value}</span>
    </div>
  )
}
