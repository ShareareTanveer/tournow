'use client'

import { useState } from 'react'
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
  customerNote?: string | null
  receiptUrl?: string | null
  receiptNote?: string | null
  ticketUrl?: string | null
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
  { status: 'AWAITING_CONFIRM', label: 'Awaiting Confirm', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-400' },
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
  { value: 'PARTIAL',  label: 'Partial',  color: 'text-orange-600', bg: 'bg-orange-50' },
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
      <span className={`text-xs font-semibold text-right ${highlight ? 'text-orange-600' : 'text-gray-800'}`}>{value}</span>
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
      <div className={`rounded-2xl overflow-hidden border ${hasQuote ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${hasQuote ? 'border-orange-100' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasQuote ? 'bg-orange-400' : 'bg-gray-300'}`} />
            <p className={`text-xs font-bold uppercase tracking-wide ${hasQuote ? 'text-orange-700' : 'text-gray-500'}`}>
              {hasQuote ? 'Admin Quote (Sent to Customer)' : 'No Quote Built Yet'}
            </p>
          </div>
          <Link href={`/admin/bookings/${booking.id}/edit`}
            className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-white border border-orange-200 px-2.5 py-1 rounded-lg transition-colors">
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
              <div className="mt-3 pt-2 border-t border-orange-200 flex justify-between">
                <span className="text-xs font-bold text-orange-700">Final Quote Total</span>
                <span className="text-sm font-black text-orange-600">LKR {quote.totalPrice.toLocaleString()}</span>
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
                className="inline-flex items-center gap-1.5 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-600">
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
  const idx = TIMELINE_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-0">
      {TIMELINE_STEPS.map((s, i) => {
        const done = idx >= i
        const active = idx === i
        const info = si(s)
        return (
          <div key={s} className="flex items-center">
            <div className={`flex flex-col items-center gap-1`}>
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                done ? `${info.dot} border-transparent` : 'bg-white border-gray-300'
              } ${active ? 'ring-2 ring-offset-1 ring-orange-300 scale-125' : ''}`} />
              <span className={`text-[9px] font-semibold whitespace-nowrap ${done ? info.color : 'text-gray-300'}`}>
                {info.label.replace(' ✓', '')}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mb-4 mx-0.5 ${i < idx ? 'bg-orange-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
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
        className="flex items-center gap-1.5 text-xs bg-orange-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
        <FiEdit2 size={13} /> {booking.staffQuote ? 'Edit Quote' : 'Build Quote'}
      </Link>

      {/* Send quote (only if quote built and status is REQUESTED/CALL_REQUIRED/EDIT_RESEND) */}
      {booking.staffQuote && ['REQUESTED', 'CALL_REQUIRED', 'EDIT_RESEND'].includes(s) && (
        <button onClick={() => act('send_quote', { staffQuote: booking.staffQuote, adminNotes: booking.adminNotes })}
          disabled={loading === 'send_quote'}
          className="flex items-center gap-1.5 text-xs bg-blue-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
          <FiSend size={13} /> {loading === 'send_quote' ? 'Sending…' : 'Send Quote to Customer'}
        </button>
      )}

      {/* Resend quote if already sent */}
      {booking.staffQuote && s === 'AWAITING_CONFIRM' && (
        <button onClick={() => act('send_quote', { staffQuote: booking.staffQuote, adminNotes: booking.adminNotes })}
          disabled={loading === 'send_quote'}
          className="flex items-center gap-1.5 text-xs bg-blue-400 text-white px-3 py-2 rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
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
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 resize-none" />
      <button onClick={save} disabled={saving || notes === (booking.adminNotes ?? '')}
        className="mt-2 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
        {saving ? 'Saving…' : 'Save Notes'}
      </button>
    </div>
  )
}

// ─── Receipt & Ticket section ─────────────────────────────────────────────────

function ReceiptTicketSection({ booking, type, onUpdate }: {
  booking: Booking; type: 'package' | 'tour'; onUpdate: (u: Partial<Booking>) => void
}) {
  const [ticketUrl, setTicketUrl] = useState(booking.ticketUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Auto-generate ticket HTML served from our API
  async function generateTicket() {
    setGenerating(true)
    // Hit the ticket route — it generates HTML and saves ticketUrl on the booking
    const generatedUrl = `/api/admin/bookings/${booking.id}/ticket`
    // Open in new tab for preview
    window.open(generatedUrl, '_blank')
    // Now send it to the customer via the upload_ticket action
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload_ticket', ticketUrl: generatedUrl }),
    })
    if (res.ok) onUpdate(await res.json())
    setTicketUrl(generatedUrl)
    setGenerating(false)
  }

  async function uploadTicket() {
    if (!ticketUrl) return
    setUploading(true)
    const url = type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload_ticket', ticketUrl }),
    })
    if (res.ok) onUpdate(await res.json())
    setUploading(false)
  }

  return (
    <div className="space-y-5">
      {/* Receipt */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Receipt</p>
        {booking.receiptUrl ? (
          <div className="space-y-2">
            <a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:underline">
              <FiExternalLink size={14} /> View Receipt
            </a>
            {booking.receiptNote && (
              <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg">{booking.receiptNote}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No receipt uploaded yet</p>
        )}
      </div>

      {/* Ticket */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Ticket / Voucher</p>

        {/* Auto-generate button — always shown */}
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs font-semibold text-green-700 mb-2">Auto-generate a ticket from booking details</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={generateTicket} disabled={generating}
              className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
              <FiCheckCircle size={12} />
              {generating ? 'Generating…' : booking.ticketUrl ? 'Re-generate & Resend Ticket' : 'Generate & Send Ticket'}
            </button>
            {booking.ticketUrl && (
              <a href={booking.ticketUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-700 font-semibold hover:underline">
                <FiDownload size={12} /> View current ticket
              </a>
            )}
          </div>
          <p className="text-[10px] text-green-600 mt-1.5">Opens a preview, emails the customer, and sets status to Mail Sent.</p>
        </div>

        {booking.ticketUrl ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)}
                placeholder="Or paste a custom ticket URL (Cloudinary, S3…)"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-400" />
              <button onClick={uploadTicket} disabled={uploading || !ticketUrl || ticketUrl === booking.ticketUrl}
                className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap">
                {uploading ? '…' : 'Use Custom URL'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-gray-400 mt-1">Or use a custom URL:</p>
            <div className="flex items-center gap-2">
              <input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)}
                placeholder="Paste ticket / voucher URL…"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-400" />
              <button onClick={uploadTicket} disabled={uploading || !ticketUrl}
                className="flex items-center gap-1 text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
                <FiUpload size={11} /> {uploading ? 'Sending…' : 'Send'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">Uploading will email the ticket to the customer and mark status as Mail Sent.</p>
          </div>
        )}
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
          <div className="overflow-x-auto pb-1">
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
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <FiUser size={16} className="text-orange-500" />
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
