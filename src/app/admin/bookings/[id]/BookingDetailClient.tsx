'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiEdit2, FiSend, FiCheck, FiX, FiExternalLink, FiDownload,
  FiPhone, FiMail, FiUser, FiCalendar, FiUsers, FiHome,
  FiAlertCircle, FiCheckCircle, FiClock, FiUpload,
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
  { status: 'REQUESTED',        label: 'Requested',        color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-400' },
  { status: 'CALL_REQUIRED',    label: 'Call Required',    color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-400' },
  { status: 'EDIT_RESEND',      label: 'Edit & Resend',    color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-400' },
  { status: 'AWAITING_CONFIRM', label: 'Awaiting Confirm', color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
  { status: 'CONFIRMED',        label: 'Confirmed',        color: 'text-teal-600',   bg: 'bg-teal-50',   dot: 'bg-teal-400' },
  { status: 'RECEIPT_UPLOADED', label: 'Receipt Uploaded', color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
  { status: 'ADMIN_CONFIRMING', label: 'Admin Confirming', color: 'text-pink-600',   bg: 'bg-pink-50',   dot: 'bg-pink-400' },
  { status: 'ALL_CONFIRMED',    label: 'All Confirmed',    color: 'text-green-600',  bg: 'bg-green-50',  dot: 'bg-green-400' },
  { status: 'MAIL_SENT',        label: 'Complete ✓',       color: 'text-green-700',  bg: 'bg-green-100', dot: 'bg-green-500' },
  { status: 'CANCELLED',        label: 'Cancelled',        color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-400' },
  { status: 'COMPLETED',        label: 'Completed',        color: 'text-gray-600',   bg: 'bg-gray-100',  dot: 'bg-gray-400' },
]

const PAY_STATUS = [
  { value: 'UNPAID',   label: 'Unpaid',   color: 'text-red-600',    bg: 'bg-red-50' },
  { value: 'PARTIAL',  label: 'Partial',  color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'PAID',     label: 'Paid',     color: 'text-green-600',  bg: 'bg-green-50' },
  { value: 'REFUNDED', label: 'Refunded', color: 'text-gray-500',   bg: 'bg-gray-50' },
]

const si = (s: string) => PIPELINE.find(p => p.status === s) ?? PIPELINE[0]
const pi = (s: string) => PAY_STATUS.find(p => p.value === s) ?? PAY_STATUS[0]

// ─── Mini components ──────────────────────────────────────────────────────────

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {title && <div className="px-5 py-3 border-b border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{title}</p></div>}
      <div className="p-5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}

// ─── Original vs Quote comparison ─────────────────────────────────────────────

function PriceComparison({ booking }: { booking: Booking }) {
  const snap = booking.originalSnapshot
  const quote = booking.staffQuote
  const hasQuote = !!quote?.lineItems?.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original Request */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Customer's Original Request</p>
        </div>
        <div className="p-4 space-y-1">
          {snap ? (
            <>
              {snap.rooms && snap.rooms.length > 0 && (
                <InfoRow label="Rooms" value={snap.rooms.map(r => `${r.label} ×${r.qty}`).join(', ')} />
              )}
              {!snap.rooms?.length && snap.roomType && (
                <InfoRow label="Room Type" value={snap.roomType} />
              )}
              <InfoRow label="Adults / Children / Infants"
                value={`${snap.paxAdult}A / ${snap.paxChild}C / ${snap.paxInfant}I`} />
              <InfoRow label="Travel Date"
                value={new Date(snap.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              {snap.returnDate && (
                <InfoRow label="Return Date"
                  value={new Date(snap.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              )}
              {snap.pricePerPerson && <InfoRow label="Price / Person" value={`LKR ${snap.pricePerPerson.toLocaleString()}`} />}
              {snap.priceTwin && <InfoRow label="Twin Price / Person" value={`LKR ${snap.priceTwin.toLocaleString()}`} />}
              {snap.extraNights != null && snap.extraNights > 0 && (
                <InfoRow label="Extra Nights" value={`${snap.extraNights} night(s)`} />
              )}
              {snap.selectedOptions && snap.selectedOptions.length > 0 && (
                <InfoRow label="Add-ons"
                  value={snap.selectedOptions.map(o => o.label).join(', ')} />
              )}
              {snap.notes && <InfoRow label="Customer Note" value={snap.notes} />}
              <div className="mt-3 pt-2 border-t border-blue-200 flex justify-between">
                <span className="text-xs font-bold text-blue-700">Original Estimate</span>
                <span className="text-sm font-black text-blue-700">LKR {snap.totalPrice.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-blue-400 italic">No snapshot (old booking)</p>
          )}
        </div>
      </div>

      {/* Admin Quote / Final */}
      <div className={`rounded-2xl overflow-hidden border ${hasQuote ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${hasQuote ? 'border-indigo-100' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasQuote ? 'bg-indigo-400' : 'bg-gray-300'}`} />
            <p className={`text-xs font-bold uppercase tracking-wide ${hasQuote ? 'text-indigo-700' : 'text-gray-500'}`}>
              {hasQuote ? 'Admin Quote (Sent to Customer)' : 'No Quote Built Yet'}
            </p>
          </div>
          <Link href={`/admin/bookings/${booking.id}/edit`}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors">
            <FiEdit2 size={11} /> {hasQuote ? 'Edit Quote' : 'Build Quote'}
          </Link>
        </div>
        <div className="p-4 space-y-1">
          {hasQuote && quote ? (
            <>
              {quote.rooms && quote.rooms.length > 0 && (
                <InfoRow label="Rooms" value={quote.rooms.map(r => `${r.label ?? r.type} ×${r.qty}`).join(', ')} />
              )}
              {quote.lineItems.map((item, i) => (
                <InfoRow key={i} label={item.label} value={`LKR ${item.price.toLocaleString()}`} />
              ))}
              {quote.notes && <InfoRow label="Note to Customer" value={quote.notes} />}
              {quote.validUntil && (
                <InfoRow label="Valid Until"
                  value={new Date(quote.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  highlight />
              )}
              <div className="mt-3 pt-2 border-t border-indigo-200 flex justify-between">
                <span className="text-xs font-bold text-indigo-700">Final Quote Total</span>
                <span className="text-sm font-black text-indigo-600">LKR {quote.totalPrice.toLocaleString()}</span>
              </div>
              {/* Difference callout */}
              {snap && (
                <DiffBadge original={snap.totalPrice} quoted={quote.totalPrice} />
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400 mb-3">Build a quote with custom pricing for this customer</p>
              <Link href={`/admin/bookings/${booking.id}/edit`}
                className="inline-flex items-center gap-1.5 text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-600">
                <FiEdit2 size={12} /> Build Quote Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DiffBadge({ original, quoted }: { original: number; quoted: number }) {
  const diff = quoted - original
  if (diff === 0) return null
  const pct = Math.abs(Math.round((diff / original) * 100))
  const reduced = diff < 0
  return (
    <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg w-fit ${
      reduced ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
    }`}>
      {reduced ? '↓' : '↑'} LKR {Math.abs(diff).toLocaleString()} ({pct}%) {reduced ? 'reduction from original' : 'increase from original'}
    </div>
  )
}

// ─── Status Timeline ──────────────────────────────────────────────────────────

const TIMELINE_STEPS = ['REQUESTED', 'AWAITING_CONFIRM', 'CONFIRMED', 'RECEIPT_UPLOADED', 'ALL_CONFIRMED', 'MAIL_SENT']

function StatusTimeline({ status }: { status: string }) {
  const isCancelled = status === 'CANCELLED'
  const idx = isCancelled ? -1 : TIMELINE_STEPS.indexOf(status)

  return (
    <div className="w-full">
      {/* Cancelled banner */}
      {isCancelled && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-sm font-bold text-red-600">Booking Cancelled</span>
        </div>
      )}

      {!isCancelled && (
        <div className="flex items-start w-full">
          {TIMELINE_STEPS.map((s, i) => {
            const done   = idx >= i
            const active = idx === i
            const info   = si(s)
            const isLast = i === TIMELINE_STEPS.length - 1

            return (
              <div key={s} className={`flex flex-col items-center ${isLast ? 'flex-none' : 'flex-1'}`}>
                {/* Dot + line row */}
                <div className="flex items-center w-full">
                  {/* Dot */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    active
                      ? `${info.dot} border-transparent ring-4 ring-offset-2 ring-indigo-200`
                      : done
                      ? `${info.dot} border-transparent`
                      : 'bg-white border-gray-200'
                  }`}>
                    {done && !active && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < idx ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-semibold mt-1.5 text-center leading-tight px-0.5 ${
                  active ? info.color + ' font-bold' : done ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {info.label.replace(' ✓', '')}
                </span>
              </div>
            )
          })}
        </div>
      )}
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
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    if (res.ok) {
      const data = await res.json()
      onUpdate(data)
    }
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
      {/* Edit / build quote always available */}
      <Link href={`/admin/bookings/${booking.id}/edit`}
        className="flex items-center gap-1.5 text-xs bg-indigo-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
        <FiEdit2 size={13} /> {booking.staffQuote ? 'Edit Quote' : 'Build Quote'}
      </Link>

      {/* Send quote (only if quote built and status is REQUESTED/CALL_REQUIRED/EDIT_RESEND) */}
      {booking.staffQuote && ['REQUESTED', 'CALL_REQUIRED', 'EDIT_RESEND'].includes(s) && (
        <button onClick={() => act('send_quote', { staffQuote: booking.staffQuote, adminNotes: booking.adminNotes })}
          disabled={loading === 'send_quote'}
          className="flex items-center gap-1.5 text-xs bg-indigo-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
          <FiSend size={13} /> {loading === 'send_quote' ? 'Sending…' : 'Send Quote to Customer'}
        </button>
      )}

      {/* Resend quote if already sent */}
      {booking.staffQuote && s === 'AWAITING_CONFIRM' && (
        <button onClick={() => act('send_quote', { staffQuote: booking.staffQuote, adminNotes: booking.adminNotes })}
          disabled={loading === 'send_quote'}
          className="flex items-center gap-1.5 text-xs bg-blue-400 text-white px-3 py-2 rounded-xl font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-colors">
          <FiSend size={13} /> {loading === 'send_quote' ? 'Sending…' : 'Resend Quote'}
        </button>
      )}

      {/* Receipt actions */}
      {s === 'RECEIPT_UPLOADED' && (
        <>
          <button onClick={() => updateField({ status: 'ADMIN_CONFIRMING' })}
            disabled={!!loading}
            className="flex items-center gap-1.5 text-xs bg-indigo-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
            <FiClock size={13} /> Mark Reviewing
          </button>
          <button onClick={() => updateField({ status: 'ALL_CONFIRMED', paymentStatus: 'PAID' })}
            disabled={!!loading}
            className="flex items-center gap-1.5 text-xs bg-green-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors">
            <FiCheck size={13} /> All Confirmed + Paid
          </button>
        </>
      )}

      {s === 'ADMIN_CONFIRMING' && (
        <button onClick={() => updateField({ status: 'ALL_CONFIRMED', paymentStatus: 'PAID' })}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs bg-green-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors">
          <FiCheck size={13} /> All Confirmed + Paid
        </button>
      )}

      {/* Cancel */}
      {!['CANCELLED', 'COMPLETED', 'MAIL_SENT'].includes(s) && (
        <button onClick={() => { if (confirm('Cancel this booking?')) updateField({ status: 'CANCELLED' }) }}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs border border-red-200 text-red-500 px-3 py-2 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
          <FiX size={13} /> Cancel Booking
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

  async function save() {
    setSaving(true)
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminNotes: notes }) })
    if (res.ok) onUpdate(await res.json())
    setSaving(false)
  }

  return (
    <div>
      <textarea rows={4} placeholder="Internal notes, payment references, call logs…"
        value={notes} onChange={e => setNotes(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400 resize-none" />
      <button onClick={save} disabled={saving || notes === (booking.adminNotes ?? '')}
        className="mt-2 text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
        {saving ? 'Saving…' : 'Save Notes'}
      </button>
    </div>
  )
}

// ─── Receipt & Ticket / Documents section ────────────────────────────────────

const NOTE_TEMPLATES = [
  { label: 'Booking confirmed', text: 'Your booking is confirmed. Please find your travel documents attached. Have a wonderful trip!' },
  { label: 'Visa documents', text: 'Please find your visa documents attached. Ensure you carry printed copies when travelling.' },
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
  const data = await res.json()
  return data.url as string
}

interface DocEntry { url: string; name: string; note?: string }

function ReceiptTicketSection({ booking, type, onUpdate }: {
  booking: Booking; type: 'package' | 'tour'; onUpdate: (u: Partial<Booking>) => void
}) {
  const [existingDocs, setExistingDocs] = useState<DocEntry[]>(booking.documents ?? [])

  // Keep existingDocs in sync when parent booking prop updates (e.g. after onUpdate)
  useEffect(() => {
    setExistingDocs(booking.documents ?? [])
  }, [booking.documents])

  // New files to add
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

  const apiUrl = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`

  async function persistDocs(docsToAppend: DocEntry[], noteOverride?: string) {
    const merged = [...existingDocs, ...docsToAppend]
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_documents',
        documents: merged,
        documentNote: noteOverride ?? docNote,
      }),
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
    if (res.ok) onUpdate(await res.json())
  }

  async function handleUploadFiles() {
    if (newFiles.length === 0) return
    setUploading(true)
    setError('')
    try {
      const appended: DocEntry[] = []
      for (let i = 0; i < newFiles.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${newFiles.length}…`)
        const url = await uploadFileToMedia(newFiles[i].file)
        appended.push({ url, name: newFiles[i].name || newFiles[i].file.name })
      }
      setUploadProgress('')
      const ok = await persistDocs(appended)
      if (ok) setNewFiles([])
      else setError('Failed to save documents.')
    } catch {
      setError('One or more uploads failed.')
      setUploadProgress('')
    }
    setUploading(false)
  }

  async function handleAddUrl() {
    if (!newUrl.trim()) return
    setUploading(true)
    setError('')
    const ok = await persistDocs([{ url: newUrl.trim(), name: newUrlName.trim() || 'Document' }])
    if (ok) { setNewUrl(''); setNewUrlName('') }
    else setError('Failed to save URL.')
    setUploading(false)
  }

  async function handleGenerateTicket() {
    setGenerating(true)
    setError('')
    const generatedUrl = `/api/my/bookings/${booking.id}/ticket`
    window.open(`/api/admin/bookings/${booking.id}/ticket`, '_blank')
    const ok = await persistDocs([{ url: generatedUrl, name: 'Booking Voucher' }])
    if (!ok) setError('Failed to save generated ticket.')
    setGenerating(false)
  }

  async function saveNote() {
    setSavingNote(true)
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_documents', documents: existingDocs, documentNote: docNote }),
    })
    if (res.ok) { onUpdate(await res.json()); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000) }
    setSavingNote(false)
  }

  function updateFileName(idx: number, name: string) {
    setNewFiles(f => f.map((item, i) => i === idx ? { ...item, name } : item))
  }

  return (
    <div className="space-y-5">

      {/* ── Customer receipt (uploaded by customer) ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Receipt</p>
        {booking.receiptUrl ? (
          <div className="space-y-1.5">
            <a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:underline">
              <FiExternalLink size={14} /> View Receipt
            </a>
            {booking.receiptNote && (
              <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg">{booking.receiptNote}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No receipt uploaded by customer yet</p>
        )}
      </div>

      {/* ── Note to customer ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Note to Customer</p>
        <div className="space-y-2">
          {/* Template picker */}
          <div className="flex flex-wrap gap-1.5">
            {NOTE_TEMPLATES.map(t => (
              <button key={t.label} onClick={() => setDocNote(t.text)}
                className="text-[10px] bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 px-2 py-0.5 rounded-full font-medium transition-colors">
                {t.label}
              </button>
            ))}
          </div>
          <textarea rows={3} value={docNote} onChange={e => setDocNote(e.target.value)}
            placeholder="Write a note that will be shown to the customer alongside their documents…"
            className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 resize-none bg-white" />
          <button onClick={saveNote} disabled={savingNote}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <FiCheck size={11} /> {savingNote ? 'Saving…' : noteSaved ? 'Saved ✓' : 'Save Note'}
          </button>
        </div>
      </div>

      {/* ── Existing documents ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">
          Documents ({existingDocs.length})
        </p>
        {existingDocs.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No documents added yet</p>
        ) : (
          <ul className="space-y-1.5">
            {existingDocs.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <FiDownload size={11} className="text-gray-400 shrink-0" />
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-xs text-indigo-600 font-semibold hover:underline truncate">
                  {doc.name}
                </a>
                {doc.note && <span className="text-[10px] text-gray-400 italic truncate max-w-[120px]">{doc.note}</span>}
                <button onClick={() => removeDoc(i)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                  <FiX size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Auto-generate voucher ── */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
        <p className="text-xs font-semibold text-green-700 mb-2">Auto-generate booking voucher</p>
        <button onClick={handleGenerateTicket} disabled={generating}
          className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
          <FiCheckCircle size={12} />
          {generating ? 'Generating…' : 'Generate & Add Voucher'}
        </button>
        <p className="text-[10px] text-green-600 mt-1.5">Opens a preview and adds it to the customer's documents.</p>
      </div>

      {/* ── Upload new files ── */}
      <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-xs font-semibold text-gray-600">Add Documents</p>

        {/* File picker */}
        <div>
          <label className="flex items-center gap-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2.5 bg-white cursor-pointer hover:border-indigo-400 transition-colors">
            <FiUpload size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-500">
              {newFiles.length > 0 ? `${newFiles.length} file(s) selected` : 'Click to choose PDFs or images (multiple)'}
            </span>
            <input type="file" accept="image/*,.pdf" multiple className="sr-only"
              onChange={e => setNewFiles(Array.from(e.target.files ?? []).map(f => ({ file: f, name: f.name.replace(/\.[^.]+$/, '') })))} />
          </label>

          {newFiles.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {newFiles.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input value={item.name} onChange={e => updateFileName(i, e.target.value)}
                    placeholder="Document name…"
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 bg-white" />
                  <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{item.file.name}</span>
                  <button onClick={() => setNewFiles(f => f.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-500 shrink-0"><FiX size={12} /></button>
                </li>
              ))}
            </ul>
          )}

          {newFiles.length > 0 && (
            <button onClick={handleUploadFiles} disabled={uploading}
              className="mt-2 flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <FiUpload size={11} />
              {uploading ? (uploadProgress || 'Uploading…') : `Upload ${newFiles.length > 1 ? `${newFiles.length} files` : 'file'}`}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <div className="flex-1 h-px bg-gray-200" /> or add a URL <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* URL + name */}
        <div className="space-y-1.5">
          <input value={newUrlName} onChange={e => setNewUrlName(e.target.value)}
            placeholder="Document name (e.g. Hotel Voucher)"
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 bg-white" />
          <div className="flex gap-2">
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
              placeholder="https://… (Cloudinary, Drive, S3…)"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 bg-white" />
            <button onClick={handleAddUrl} disabled={uploading || !newUrl.trim()}
              className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap">
              Add
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-[10px] text-gray-400">Documents are shown to the customer in their booking panel.</p>
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
        <span className="text-xs text-gray-400 font-medium">Status:</span>
        <select value={booking.status} disabled={updating}
          onChange={e => change({ status: e.target.value })}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 cursor-pointer ${s.bg} ${s.color} disabled:opacity-50`}>
          {PIPELINE.map(pp => <option key={pp.status} value={pp.status}>{pp.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Payment:</span>
        <select value={booking.paymentStatus} disabled={updating}
          onChange={e => change({ paymentStatus: e.target.value })}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 cursor-pointer ${p.bg} ${p.color} disabled:opacity-50`}>
          {PAY_STATUS.map(pp => <option key={pp.value} value={pp.value}>{pp.label}</option>)}
        </select>
      </div>
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

  return (
    <div className="space-y-5">

      {/* Top bar — status, actions */}
      <Card>
        <div className="flex flex-col gap-4">
          {/* Title row */}
          <div className="flex items-start gap-4">
            {itemImage && (
              <img src={itemImage} alt="" className="w-16 h-12 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-base">{itemTitle}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-mono text-xs text-gray-400">{booking.bookingRef.slice(-10).toUpperCase()}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                <span className="text-[10px] text-gray-400">{new Date(booking.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-1 pb-2">
            <StatusTimeline status={booking.status} />
          </div>

          {/* Status/payment selectors */}
          <StatusPaymentRow booking={booking} type={type} onUpdate={onUpdate} />

          {/* Customer note alert */}
          {booking.customerNote && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <FiAlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-0.5">Customer Requested Changes</p>
                <p className="text-xs text-amber-800">{booking.customerNote}</p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Actions</p>
            <QuickActions booking={booking} type={type} onUpdate={onUpdate} />
          </div>
        </div>
      </Card>

      {/* Original vs Quote — the main comparison */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Price Comparison</p>
        <PriceComparison booking={booking} />
      </div>

      {/* Two column: customer info + booking details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Customer">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <FiUser size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{booking.customerName}</p>
                {booking.customer && (
                  <p className="text-[10px] text-gray-400">Account ID: {booking.customer.id.slice(-8)}</p>
                )}
              </div>
            </div>
            <div className="space-y-0">
              <InfoRow label={<span className="flex items-center gap-1"><FiMail size={10} /> Email</span> as any}
                value={<a href={`mailto:${booking.customerEmail}`} className="hover:underline text-blue-600">{booking.customerEmail}</a>} />
              <InfoRow label={<span className="flex items-center gap-1"><FiPhone size={10} /> Phone</span> as any}
                value={<a href={`tel:${booking.customerPhone}`} className="hover:underline text-blue-600">{booking.customerPhone}</a>} />
            </div>
          </div>
        </Card>

        <Card title="Trip Details">
          <div className="space-y-0">
            <InfoRow label={<span className="flex items-center gap-1"><FiCalendar size={10} /> Travel Date</span> as any}
              value={new Date(booking.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
            {booking.returnDate && (
              <InfoRow label="Return Date"
                value={new Date(booking.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
            )}
            <InfoRow label={<span className="flex items-center gap-1"><FiUsers size={10} /> Pax</span> as any}
              value={`${booking.paxAdult} Adult${booking.paxAdult > 1 ? 's' : ''}${booking.paxChild > 0 ? `, ${booking.paxChild} Child` : ''}${booking.paxInfant > 0 ? `, ${booking.paxInfant} Infant` : ''}`} />
            <InfoRow label={<span className="flex items-center gap-1"><FiHome size={10} /> Rooms</span> as any}
              value={
                booking.rooms && booking.rooms.length > 0
                  ? booking.rooms.map(r => `${r.label} ×${r.qty}`).join(', ')
                  : (booking.roomType ?? '—')
              } />
            {booking.extraNights > 0 && (
              <InfoRow label="Extra Nights" value={`${booking.extraNights} night(s)`} />
            )}
            <InfoRow label="✈ Airfare" value={booking.isAirfareIncluded ? 'Requested — include in quote' : 'Not included'} />
            {booking.notes && <InfoRow label="Customer Note" value={booking.notes} />}
            <div className="pt-2 mt-1 border-t border-gray-100 flex justify-between">
              <span className="text-xs font-bold text-gray-500">Current Total</span>
              <span className="text-sm font-black text-gray-900">LKR {booking.totalPrice.toLocaleString()}</span>
            </div>
            {booking.discount > 0 && (
              <InfoRow label="Discount" value={`- LKR ${booking.discount.toLocaleString()}`} />
            )}
          </div>
        </Card>
      </div>

      {/* Receipt & Ticket + Admin Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Receipt & Ticket">
          <ReceiptTicketSection booking={booking} type={type} onUpdate={onUpdate} />
        </Card>
        <Card title="Admin Notes (Internal)">
          <AdminNotesEditor booking={booking} type={type} onUpdate={onUpdate} />
        </Card>
      </div>

    </div>
  )
}
