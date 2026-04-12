'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiCalendar, FiMapPin, FiUpload, FiPhone, FiCheckCircle, FiClock, FiAlertCircle, FiDownload, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCustomerAuth } from '@/lib/customerAuth'
import AuthModal from '@/components/auth/AuthModal'

const PIPELINE_STEPS = [
  { status: 'REQUESTED',        label: 'Requested' },
  { status: 'AWAITING_CONFIRM', label: 'Quote Ready' },
  { status: 'CONFIRMED',        label: 'Confirmed' },
  { status: 'RECEIPT_UPLOADED', label: 'Receipt Sent' },
  { status: 'ALL_CONFIRMED',    label: 'All Confirmed' },
  { status: 'MAIL_SENT',        label: 'Complete' },
]

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Requested',
  CALL_REQUIRED: 'Call Required',
  EDIT_RESEND: 'Being Updated',
  AWAITING_CONFIRM: 'Quote Ready — Review Now',
  CONFIRMED: 'Confirmed',
  RECEIPT_UPLOADED: 'Receipt Uploaded',
  ADMIN_CONFIRMING: 'Admin Confirming',
  ALL_CONFIRMED: 'All Confirmed',
  MAIL_SENT: 'Complete ✓',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

const STATUS_COLOR: Record<string, string> = {
  REQUESTED: 'text-blue-600 bg-blue-50',
  CALL_REQUIRED: 'text-purple-600 bg-purple-50',
  EDIT_RESEND: 'text-yellow-600 bg-yellow-50',
  AWAITING_CONFIRM: 'text-indigo-600 bg-indigo-100 ring-1 ring-indigo-300',
  CONFIRMED: 'text-teal-600 bg-teal-50',
  RECEIPT_UPLOADED: 'text-indigo-600 bg-indigo-50',
  ADMIN_CONFIRMING: 'text-pink-600 bg-pink-50',
  ALL_CONFIRMED: 'text-green-600 bg-green-50',
  MAIL_SENT: 'text-green-700 bg-green-100',
  CANCELLED: 'text-red-600 bg-red-50',
  COMPLETED: 'text-gray-600 bg-gray-100',
}

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = PIPELINE_STEPS.findIndex(s => s.status === status)
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <FiAlertCircle size={12} /> Booking Cancelled
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 w-full overflow-x-auto">
      {PIPELINE_STEPS.map((step, i) => {
        const done = currentIdx !== -1 && i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step.status} className="flex items-center gap-0.5 min-w-0">
            <div className={`h-1.5 rounded-full transition-all ${done ? 'w-6' : 'bg-gray-200 w-4'}`}
              style={done ? { background: 'var(--brand)', width: active ? '1.75rem' : '1.5rem' } : undefined}
            />
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="h-px w-2"
                style={i < currentIdx ? { background: 'var(--brand)' } : { background: '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
      <span className="ml-2 text-[10px] font-semibold text-gray-500 whitespace-nowrap">
        {STATUS_LABELS[status] ?? status}
      </span>
    </div>
  )
}

interface StaffQuote {
  rooms?: { type: string; qty: number; label: string; unitPrice?: number }[]
  lineItems: { label: string; price: number }[]
  totalPrice: number
  notes?: string
  validUntil?: string
}

interface Booking {
  id: string; bookingRef: string; _type: 'package' | 'tour'; title: string; image?: string
  travelDate: string; paxAdult: number; paxChild: number
  totalPrice: number; status: string; paymentStatus: string
  adminNotes?: string | null; receiptUrl?: string | null; receiptNote?: string | null
  notes?: string | null; customerNote?: string | null
  staffQuote?: StaffQuote | null
  ticketUrl?: string | null
  createdAt: string
}

// ── Quote Review ──────────────────────────────────────────────────────────────

function QuoteReview({ booking, onAction }: { booking: Booking; onAction: () => void }) {
  const [requestNote, setRequestNote] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const quote = booking.staffQuote

  if (booking.status !== 'AWAITING_CONFIRM') return null

  async function respond(action: 'accept_quote' | 'request_changes') {
    setLoading(true)
    setError('')
    try {
      const url = booking._type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, customerNote: requestNote || undefined }),
      })
      const d = await res.json()
      if (res.ok) {
        // Always reload from server to get fresh status
        await onAction()
      } else {
        setError(d.error || `Server error (${res.status}). Status in response: ${d.status ?? 'unknown'}`)
      }
    } catch (e: any) {
      setError('Network error — please try again.')
    }
    setLoading(false)
  }

  // Safe line items — may be absent if admin only set a total price
  const lineItems = quote?.lineItems ?? []

  return (
    <div className="mx-4 mb-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl">
      <p className="text-xs font-black text-indigo-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <FiCheckCircle size={13} /> Your Quote is Ready — Action Required
      </p>

      {/* Price breakdown — only if quote has line items or a total */}
      <div className="bg-white rounded-xl overflow-hidden mb-3">
        <table className="w-full text-xs">
          <tbody>
            {lineItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-2 text-gray-700">{item.label}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-800">LKR {item.price.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="bg-indigo-50">
              <td className="px-3 py-2.5 font-black text-indigo-700">
                {lineItems.length === 0 ? 'Confirmed Total' : 'Total'}
              </td>
              <td className="px-3 py-2.5 text-right font-black text-indigo-700 text-sm">
                LKR {(quote?.totalPrice ?? booking.totalPrice).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {quote?.notes && (
        <div className="mb-3 p-2.5 bg-white rounded-xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Team Note</p>
          <p className="text-xs text-gray-600">{quote.notes}</p>
        </div>
      )}

      {quote?.validUntil && (
        <p className="text-[11px] text-red-500 font-semibold mb-3">
          Quote valid until: {new Date(quote.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {/* Request changes form */}
      {showRequestForm && (
        <div className="mb-3 space-y-2">
          <textarea rows={3} placeholder="Describe what you'd like changed (rooms, price, dates, extras…)"
            value={requestNote} onChange={e => setRequestNote(e.target.value)}
            className="w-full text-xs border border-indigo-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 resize-none bg-white" />
          <div className="flex gap-2">
            <button onClick={() => respond('request_changes')} disabled={loading || !requestNote.trim()}
              className="flex items-center gap-1.5 text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
              <FiSend size={11} /> {loading ? 'Sending…' : 'Send Request'}
            </button>
            <button onClick={() => { setShowRequestForm(false); setRequestNote('') }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showRequestForm && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => respond('accept_quote')} disabled={loading}
            className="flex items-center gap-1.5 text-sm bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors">
            <FiCheckCircle size={14} /> {loading ? 'Confirming…' : 'Accept & Confirm'}
          </button>
          <button onClick={() => setShowRequestForm(true)} disabled={loading}
            className="flex items-center gap-1.5 text-sm bg-white border border-indigo-300 text-indigo-600 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-50 disabled:opacity-50 transition-colors">
            Request Changes
          </button>
        </div>
      )}
    </div>
  )
}

// ── Receipt Upload ────────────────────────────────────────────────────────────

function ReceiptUpload({ booking, onUploaded }: { booking: Booking; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const canUpload = booking.status === 'CONFIRMED' && !booking.receiptUrl
  if (!canUpload) return null

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      const url = booking._type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload_receipt', receiptUrl: base64, receiptNote: note }),
      })
      if (res.ok) {
        onUploaded()
      } else {
        setError('Upload failed. Please try again.')
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="mx-4 mb-4 p-3 bg-teal-50 border border-teal-100 rounded-xl">
      <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1">
        <FiUpload size={11} /> Upload Payment Receipt
      </p>
      <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] ?? null)}
        className="text-xs text-gray-600 w-full mb-2" />
      <input type="text" placeholder="Optional note (bank name, reference no, etc.)"
        value={note} onChange={e => setNote(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 mb-2 focus:outline-none focus:border-teal-400" />
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <button onClick={handleUpload} disabled={!file || uploading}
        className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50">
        {uploading ? 'Uploading…' : 'Submit Receipt'}
      </button>
    </div>
  )
}

// ── Ticket Download ───────────────────────────────────────────────────────────

function TicketDownload({ booking }: { booking: Booking }) {
  if (!booking.ticketUrl) return null
  return (
    <div className="mx-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
      <p className="text-xs font-black text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <FiCheckCircle size={12} /> Your Ticket is Ready!
      </p>
      <a href={booking.ticketUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors w-fit">
        <FiDownload size={14} /> Download Ticket / Voucher
      </a>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const { customer, loading } = useCustomerAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [fetching, setFetching] = useState(false)

  async function loadBookings() {
    setFetching(true)
    try {
      const [pkgRes, tourRes] = await Promise.all([
        fetch('/api/bookings',      { credentials: 'include', cache: 'no-store' }),
        fetch('/api/tour-bookings', { credentials: 'include', cache: 'no-store' }),
      ])
      const pkgJson = pkgRes.ok ? await pkgRes.json() : { bookings: [] }
      const tourJson = tourRes.ok ? await tourRes.json() : { bookings: [] }
      const pkgData = Array.isArray(pkgJson) ? pkgJson : (pkgJson.bookings ?? [])
      const tourData = Array.isArray(tourJson) ? tourJson : (tourJson.bookings ?? [])

      const normalised: Booking[] = [
        ...pkgData.map((b: any) => ({ ...b, _type: 'package' as const, title: b.package?.title ?? 'Package', image: b.package?.images?.[0] })),
        ...tourData.map((b: any) => ({ ...b, _type: 'tour' as const, title: b.tour?.title ?? 'Tour', image: b.tour?.images?.[0] })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setBookings(normalised)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (customer) loadBookings()
  }, [customer])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin"
          style={{ borderTopColor: 'var(--brand)' }} />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiCalendar size={28} className="text-blue-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-sm text-gray-500 mb-6">Please log in to view your bookings.</p>
        <button onClick={() => setAuthOpen(true)}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
          Log In / Sign Up
        </button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}
          onSuccess={() => { setAuthOpen(false); loadBookings() }} initialTab="login" />
      </div>
    )
  }

  const pendingQuotes = bookings.filter(b => b.status === 'AWAITING_CONFIRM').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {customer.name}.</p>
        </div>
        {pendingQuotes > 0 && (
          <div className="flex items-center gap-2 bg-indigo-100 border border-indigo-300 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <FiAlertCircle size={15} />
            {pendingQuotes} quote{pendingQuotes > 1 ? 's' : ''} awaiting your confirmation
          </div>
        )}
      </div>

      {fetching && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-2 border-gray-200 rounded-full animate-spin"
            style={{ borderTopColor: 'var(--brand)' }} />
        </div>
      )}

      {!fetching && bookings.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiCalendar size={28} className="text-blue-400" />
          </div>
          <h2 className="font-bold text-gray-700 text-base">No bookings yet</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
            Once you book a holiday package or tour, your trips will appear here.
          </p>
          <Link href="/packages-from-sri-lanka/family"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            <FiMapPin size={14} /> Browse Packages
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
            b.status === 'AWAITING_CONFIRM' ? 'border-indigo-300' : 'border-gray-100'
          }`}>
            {/* Card header */}
            <div className="flex gap-4 p-4">
              {b.image && (
                <img src={b.image} alt={b.title}
                  className="w-20 h-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{b.title}</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">{b.bookingRef.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[b.status] ?? b.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiCalendar size={11} />
                    {new Date(b.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={11} />
                    {b.paxAdult}A{b.paxChild > 0 ? ` ${b.paxChild}C` : ''}
                  </span>
                  <span className="font-semibold text-gray-700">LKR {b.totalPrice.toLocaleString()}</span>
                </div>

                <div className="mt-3">
                  <StatusTimeline status={b.status} />
                </div>
              </div>
            </div>

            {/* Quote review (shown when AWAITING_CONFIRM) */}
            <QuoteReview booking={b} onAction={loadBookings} />

            {/* Ticket download */}
            <TicketDownload booking={b} />

            {/* Admin message */}
            {b.adminNotes && b.status !== 'AWAITING_CONFIRM' && (
              <div className="mx-4 mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1">
                  <FiCheckCircle size={10} /> Message from our team
                </p>
                <p className="text-xs text-indigo-700 leading-relaxed">{b.adminNotes}</p>
              </div>
            )}

            {/* Receipt upload */}
            <ReceiptUpload booking={b} onUploaded={loadBookings} />

            {/* Receipt uploaded confirmation */}
            {b.receiptUrl && b.status === 'RECEIPT_UPLOADED' && (
              <div className="mx-4 mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                  <FiCheckCircle size={12} /> Receipt received — our team will confirm shortly.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-3">Need help with your booking?</p>
        <div className="flex gap-2">
          <a href="tel:+94704545455"
            className="flex-1 flex items-center justify-center gap-2 text-white text-xs font-semibold py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <FiPhone size={13} /> Call Us
          </a>
          <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 text-white text-xs font-semibold py-2.5 rounded-xl bg-green-500 hover:bg-green-600 transition-colors">
            <FaWhatsapp size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
