'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FiCalendar, FiMapPin, FiUpload, FiPhone, FiCheckCircle,
  FiClock, FiAlertCircle, FiDownload, FiSend, FiCreditCard, FiLock,
} from 'react-icons/fi'
import { FaWhatsapp, FaPaypal } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useCustomerAuth } from '@/lib/customerAuth'
import AuthModal from '@/components/auth/AuthModal'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!

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
  documents?: { url: string; name: string; note?: string }[] | null
  documentNote?: string | null
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
        onAction()
      } else {
        setError(d.error || `Server error (${res.status}). Status in response: ${d.status ?? 'unknown'}`)
      }
    } catch {
      setError('Network error — please try again.')
    }
    setLoading(false)
  }

  const lineItems = quote?.lineItems ?? []

  return (
    <div className="mx-4 mb-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl">
      <p className="text-xs font-black text-indigo-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <FiCheckCircle size={13} /> Your Quote is Ready — Action Required
      </p>

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

// ── Stripe Card Form ──────────────────────────────────────────────────────────

function StripeCardForm({ booking, onSuccess }: { booking: Booking; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initiated, setInitiated] = useState(false)

  async function initiate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/stripe-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, bookingType: booking._type }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to initialize payment'); return }
      setClientSecret(data.clientSecret)
      setInitiated(true)
    } finally {
      setLoading(false)
    }
  }

  async function handlePay() {
    if (!stripe || !elements || !clientSecret) return
    setLoading(true)
    setError('')
    const card = elements.getElement(CardElement)
    if (!card) return

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      // Confirm in DB
      await fetch('/api/payments/stripe-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id, bookingId: booking.id, bookingType: booking._type }),
        credentials: 'include',
      })
      onSuccess()
    }
    setLoading(false)
  }

  if (!initiated) {
    return (
      <button onClick={initiate} disabled={loading}
        className="flex items-center gap-2 w-full justify-center text-sm bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        <FiCreditCard size={14} /> {loading ? 'Loading…' : 'Pay with Card'}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="border border-gray-200 rounded-xl px-3 py-3 bg-white">
        <CardElement options={{
          style: {
            base: { fontSize: '14px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
          },
        }} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button onClick={handlePay} disabled={loading || !stripe}
        className="flex items-center gap-2 w-full justify-center text-sm bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        <FiLock size={13} /> {loading ? 'Processing…' : `Pay LKR ${booking.totalPrice.toLocaleString()}`}
      </button>
    </div>
  )
}

// ── Payment Panel ─────────────────────────────────────────────────────────────

type PayTab = 'stripe' | 'paypal' | 'receipt'

function PaymentPanel({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const [tab, setTab] = useState<PayTab>('stripe')
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Only show when CONFIRMED and not yet paid
  const canPay = booking.status === 'CONFIRMED' && booking.paymentStatus !== 'PAID' && !booking.receiptUrl
  if (!canPay) return null

  async function handleReceiptUpload() {
    if (!file) return
    setUploading(true)
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      const url = booking._type === 'tour' ? `/api/tour-bookings/${booking.id}` : `/api/bookings/${booking.id}`
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload_receipt', receiptUrl: base64, receiptNote: note }),
        credentials: 'include',
      })
      if (res.ok) { onDone() } else { setUploadError('Upload failed. Please try again.') }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const tabs: { id: PayTab; label: string; icon: React.ReactNode }[] = [
    { id: 'stripe',  label: 'Card',    icon: <FiCreditCard size={13} /> },
    { id: 'paypal',  label: 'PayPal',  icon: <FaPaypal size={13} /> },
    { id: 'receipt', label: 'Receipt', icon: <FiUpload size={13} /> },
  ]

  return (
    <div className="mx-4 mb-4 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
      <p className="text-xs font-black text-teal-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <FiCreditCard size={12} /> Complete Payment — LKR {booking.totalPrice.toLocaleString()}
      </p>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-teal-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg transition-all ${
              tab === t.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Stripe */}
      {tab === 'stripe' && (
        <Elements stripe={stripePromise}>
          <StripeCardForm booking={booking} onSuccess={onDone} />
        </Elements>
      )}

      {/* PayPal */}
      {tab === 'paypal' && (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
          <PayPalButtons
            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
            createOrder={async () => {
              const res = await fetch('/api/payments/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, bookingType: booking._type }),
                credentials: 'include',
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error ?? 'Failed to create PayPal order')
              return data.orderId
            }}
            onApprove={async (data) => {
              const res = await fetch('/api/payments/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID, bookingId: booking.id, bookingType: booking._type }),
                credentials: 'include',
              })
              if (res.ok) { onDone() }
            }}
          />
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Amount charged in USD (equivalent to LKR {booking.totalPrice.toLocaleString()})
          </p>
        </PayPalScriptProvider>
      )}

      {/* Receipt Upload */}
      {tab === 'receipt' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Upload a bank transfer slip or payment receipt and our team will confirm it.</p>
          <input type="file" accept="image/*,.pdf"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-gray-600 w-full" />
          <input type="text" placeholder="Optional note (bank name, reference no, etc.)"
            value={note} onChange={e => setNote(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-400 bg-white" />
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          <button onClick={handleReceiptUpload} disabled={!file || uploading}
            className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 w-full justify-center">
            <FiUpload size={12} /> {uploading ? 'Uploading…' : 'Submit Receipt'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Documents Section (tickets + receipt shown after payment) ─────────────────

function DocumentsSection({ booking }: { booking: Booking }) {
  const isPaid = booking.paymentStatus === 'PAID'
  const docs = booking.documents ?? []
  // Fall back to legacy ticketUrl if no new documents yet
  const legacyDocs = (!docs.length && booking.ticketUrl)
    ? booking.ticketUrl.split('\n').filter(Boolean).map((url, i) => ({
        url: url.replace(/\/api\/admin\/bookings\/([^/]+)\/ticket/, '/api/my/bookings/$1/ticket'),
        name: url.includes('/ticket') ? 'Booking Voucher' : `Document ${i + 1}`,
      }))
    : []
  const allDocs = [...docs, ...legacyDocs]
  const hasAnything = isPaid || allDocs.length > 0 || !!booking.documentNote

  if (!hasAnything) return null

  return (
    <div className="mx-4 mb-4 space-y-2">
      {/* Payment confirmed banner */}
      {isPaid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <FiCheckCircle size={14} className="text-green-600 shrink-0" />
          <p className="text-xs font-semibold text-green-700">Payment confirmed — your booking is fully paid.</p>
        </div>
      )}

      {/* Note from team */}
      {booking.documentNote && (
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Message from our team</p>
          <p className="text-xs text-indigo-800 leading-relaxed">{booking.documentNote}</p>
        </div>
      )}

      {/* Documents card */}
      <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
        <p className="text-xs font-black text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          <FiDownload size={12} /> Your Documents
        </p>

        {/* Payment receipt — always when paid */}
        {isPaid && (
          <a href={`/api/my/bookings/${booking.id}/receipt`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors w-fit">
            <FiDownload size={12} /> Payment Receipt
          </a>
        )}

        {/* Admin documents */}
        {allDocs.map((doc, i) => (
          <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors w-fit">
            <FiDownload size={12} /> {doc.name}
          </a>
        ))}

        {/* Customer's uploaded receipt */}
        {booking.receiptUrl && (
          <a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors w-fit">
            <FiDownload size={12} /> My Payment Receipt
          </a>
        )}

        {allDocs.length === 0 && !isPaid && (
          <p className="text-[11px] text-gray-400 italic">Documents will appear here once our team sends them.</p>
        )}
        {allDocs.length === 0 && isPaid && (
          <p className="text-[11px] text-gray-400 italic">Tickets & vouchers will appear here once our team sends them.</p>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const { customer, loading } = useCustomerAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [fetching, setFetching] = useState(false)

  const loadBookings = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (customer) loadBookings()
  }, [customer, loadBookings])

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
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.paymentStatus === 'PAID' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Paid
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </div>
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

            {/* Quote review */}
            <QuoteReview booking={b} onAction={loadBookings} />

            {/* Tickets, vouchers & receipt */}
            <DocumentsSection booking={b} />

            {/* Admin message */}
            {b.adminNotes && b.status !== 'AWAITING_CONFIRM' && (
              <div className="mx-4 mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1">
                  <FiCheckCircle size={10} /> Message from our team
                </p>
                <p className="text-xs text-indigo-700 leading-relaxed">{b.adminNotes}</p>
              </div>
            )}

            {/* Payment panel (Stripe + PayPal + Receipt) */}
            <PaymentPanel booking={b} onDone={loadBookings} />

            {/* Receipt uploaded — awaiting admin confirmation */}
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
