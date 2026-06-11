'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  FiExternalLink, FiFileText, FiEdit2, FiAlertCircle, FiCalendar, FiX,
  FiUser, FiUsers, FiMapPin, FiDollarSign, FiFilter, FiPhone,
} from 'react-icons/fi'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { useRouter } from 'next/navigation'

const PIPELINE = [
  { status: 'REQUESTED',        label: 'Requested',        color: 'text-blue-600',   bg: 'bg-blue-50' },
  { status: 'CALL_REQUIRED',    label: 'Call Required',    color: 'text-purple-600', bg: 'bg-purple-50' },
  { status: 'EDIT_RESEND',      label: 'Edit & Resend',    color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { status: 'AWAITING_CONFIRM', label: 'Awaiting Confirm', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { status: 'CONFIRMED',        label: 'Confirmed',        color: 'text-teal-600',   bg: 'bg-teal-50' },
  { status: 'RECEIPT_UPLOADED', label: 'Receipt Uploaded', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { status: 'ADMIN_CONFIRMING', label: 'Admin Confirming', color: 'text-pink-600',   bg: 'bg-pink-50' },
  { status: 'ALL_CONFIRMED',    label: 'All Confirmed',    color: 'text-green-600',  bg: 'bg-green-50' },
  { status: 'MAIL_SENT',        label: 'Mail Sent ✓',      color: 'text-green-700',  bg: 'bg-green-100' },
  { status: 'CANCELLED',        label: 'Cancelled',        color: 'text-red-600',    bg: 'bg-red-50' },
  { status: 'COMPLETED',        label: 'Completed',        color: 'text-gray-600',   bg: 'bg-gray-100' },
]

const PAY_STATUS = [
  { value: 'UNPAID',   label: 'Unpaid',   color: 'text-red-600',    bg: 'bg-red-50' },
  { value: 'PARTIAL',  label: 'Partial',  color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'PAID',     label: 'Paid',     color: 'text-green-600',  bg: 'bg-green-50' },
  { value: 'REFUNDED', label: 'Refunded', color: 'text-gray-500',   bg: 'bg-gray-50' },
]

export interface Booking {
  id: string
  bookingRef: string
  _type: 'package' | 'tour'
  title: string
  image?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  travelDate: string
  paxAdult: number
  paxChild: number
  totalPrice: number
  discount: number
  status: string
  paymentStatus: string
  adminNotes?: string | null
  receiptUrl?: string | null
  ticketUrl?: string | null
  staffQuote?: { totalPrice?: number } | null
  customerNote?: string | null
  createdAt: string
}

const PRESETS = [
  { label: 'All time',     from: '',    to: '' },
  { label: 'Today',        from: 'd0',  to: 'd0' },
  { label: 'Last 7 days',  from: 'd7',  to: 'd0' },
  { label: 'Last 30 days', from: 'd30', to: 'd0' },
  { label: 'This month',   from: 'mS',  to: 'd0' },
  { label: 'Last month',   from: 'lmS', to: 'lmE' },
]

function resolveDate(val: string): string {
  if (!val) return ''
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  if (val === 'd0') return iso(now)
  if (val.startsWith('d')) { const d = new Date(now); d.setDate(d.getDate() - parseInt(val.slice(1))); return iso(d) }
  if (val === 'mS')  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`
  if (val === 'lmS') { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return iso(d) }
  if (val === 'lmE') { const d = new Date(now.getFullYear(), now.getMonth(), 0);   return iso(d) }
  return val
}

export default function BookingsTable({ bookings: initial }: { bookings: Booking[] }) {
  const router = useRouter()
  const esRef  = useRef<EventSource | null>(null)
  const [bookings, setBookings] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [activePreset, setActivePreset] = useState('All time')

  // Auto-refresh on new booking SSE event
  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/admin/notifications/stream')
      esRef.current = es
      es.onmessage = (e) => {
        try {
          const notif = JSON.parse(e.data)
          if (notif.type === 'NEW_BOOKING') router.refresh()
        } catch {}
      }
      es.onerror = () => { es.close(); setTimeout(connect, 5000) }
    }
    connect()
    return () => esRef.current?.close()
  }, [router])

  const filteredBookings = useMemo(() => {
    const from = resolveDate(dateFrom)
    const to   = resolveDate(dateTo)
    if (!from && !to) return bookings
    return bookings.filter(b => {
      const d = b.createdAt.slice(0, 10)
      if (from && d < from) return false
      if (to   && d > to)   return false
      return true
    })
  }, [bookings, dateFrom, dateTo])

  function applyPreset(p: typeof PRESETS[0]) {
    setActivePreset(p.label)
    setDateFrom(p.from)
    setDateTo(p.to)
  }

  const hasFilter = !!(dateFrom || dateTo)

  async function update(id: string, type: string, data: object) {
    setUpdating(id)
    const url = type === 'tour' ? `/api/tour-bookings/${id}` : `/api/bookings/${id}`
    try {
      const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) {
        const updated = await res.json()
        setBookings(bs => bs.map(b => b.id === id ? { ...b, ...updated } : b))
      }
    } finally { setUpdating(null) }
  }

  const si = (s: string) => PIPELINE.find(p => p.status === s) ?? PIPELINE[0]
  const pi = (s: string) => PAY_STATUS.find(p => p.value === s) ?? PAY_STATUS[0]

  // Date filter bar
  const dateFilterBar = (
    <div className="booking-filter-panel w-full space-y-3">
      {/* Preset pills */}
      <div className="booking-filter-row">
        <span className="booking-filter-heading">
          <FiFilter size={13} /> Booking period
        </span>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className={`booking-preset ${
              activePreset === p.label && !( (p.from===''&&dateFrom!=='') || (p.to===''&&dateTo!=='') )
                ? 'is-active'
                : ''
            }`}>
            {p.label}
          </button>
        ))}
        {/* Custom inputs */}
        <div className="booking-date-range">
          <input type="date" value={resolveDate(dateFrom)}
            onChange={e => { setDateFrom(e.target.value); setActivePreset('Custom') }}
            className="booking-date-input" />
          <span className="text-gray-400 text-xs">→</span>
          <input type="date" value={resolveDate(dateTo)}
            onChange={e => { setDateTo(e.target.value); setActivePreset('Custom') }}
            className="booking-date-input" />
          {hasFilter && (
            <button onClick={() => applyPreset(PRESETS[0])}
              className="booking-filter-clear" title="Clear">
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>
      {/* Pipeline strip */}
      <div className="booking-pipeline-strip">
        {PIPELINE.slice(0, 9).map(p => {
          const n = filteredBookings.filter(b => b.status === p.status).length
          if (n === 0) return null
          return (
            <span key={p.status} className={`booking-pipeline-chip ${p.bg} ${p.color}`}>
              <i /> {p.label} <strong>{n}</strong>
            </span>
          )
        })}
        {hasFilter && (
          <span className="booking-filter-result">
            {filteredBookings.length} of {bookings.length} shown
          </span>
        )}
      </div>
    </div>
  )

  const columns: Column<Booking>[] = [
    {
      key: 'title', label: 'Booking', sortable: true,
      render: b => (
        <div className="booking-item-cell">
          <div className="booking-item-image">
            {b.image ? <img src={b.image} alt="" /> : <FiMapPin size={17} />}
          </div>
          <div className="min-w-0">
            <div className="booking-item-meta">
              <span className={`booking-type-badge is-${b._type}`}>{b._type}</span>
              <span>#{b.bookingRef.slice(-8).toUpperCase()}</span>
            </div>
            <p className="booking-item-title">{b.title}</p>
            <p className="booking-created">Booked {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: b => (
        <div className="booking-customer-cell">
          <div className="booking-customer-avatar">{b.customerName?.charAt(0).toUpperCase() || <FiUser />}</div>
          <div className="min-w-0">
            <p>{b.customerName}</p>
            <span><FiPhone size={10} /> {b.customerPhone}</span>
          </div>
          {b.customerNote && (
            <span className="booking-note-badge" title={b.customerNote}>
              <FiAlertCircle size={11} /> Note
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'travelDate', label: 'Travel', sortable: true,
      render: b => (
        <div className="booking-travel-cell">
          <p><FiCalendar size={12} /> {new Date(b.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <span><FiUsers size={11} /> {b.paxAdult} adult{b.paxAdult !== 1 ? 's' : ''}{b.paxChild > 0 ? `, ${b.paxChild} child` : ''}</span>
        </div>
      ),
    },
    {
      key: 'totalPrice', label: 'Original', sortable: true, align: 'right',
      render: b => <p className="booking-price"><FiDollarSign size={11} /> LKR {b.totalPrice.toLocaleString()}</p>,
    },
    {
      key: 'staffQuote', label: 'Quote', sortable: false, align: 'right',
      render: b => {
        const hasQuote = !!b.staffQuote?.totalPrice
        const quotedTotal = b.staffQuote?.totalPrice
        return hasQuote && quotedTotal != null ? (
          <div className="booking-quote">
            <p>LKR {quotedTotal.toLocaleString()}</p>
            {quotedTotal !== b.totalPrice && (
              <p className={`text-[10px] font-semibold ${quotedTotal < b.totalPrice ? 'text-green-600' : 'text-red-500'}`}>
                {quotedTotal < b.totalPrice ? '↓' : '↑'} {Math.abs(quotedTotal - b.totalPrice).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <span className="booking-no-quote">Not prepared</span>
        )
      },
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: b => {
        const s = si(b.status)
        return (
          <select
            value={b.status}
            disabled={updating === b.id}
            onChange={e => update(b.id, b._type, { status: e.target.value })}
            className={`booking-status-select ${s.bg} ${s.color} disabled:opacity-50`}
          >
            {PIPELINE.map(pp => <option key={pp.status} value={pp.status}>{pp.label}</option>)}
          </select>
        )
      },
    },
    {
      key: 'paymentStatus', label: 'Payment', sortable: true,
      render: b => {
        const p = pi(b.paymentStatus)
        return (
          <select
            value={b.paymentStatus}
            disabled={updating === b.id}
            onChange={e => update(b.id, b._type, { paymentStatus: e.target.value })}
            className={`booking-status-select booking-payment-select ${p.bg} ${p.color} disabled:opacity-50`}
          >
            {PAY_STATUS.map(pp => <option key={pp.value} value={pp.value}>{pp.label}</option>)}
          </select>
        )
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: b => {
        const hasQuote = !!b.staffQuote?.totalPrice
        return (
          <div className="booking-row-actions">
            <Link href={`/admin/bookings/${b.id}`}
              className="is-view" title="View booking">
              <FiExternalLink size={14} /><span>View</span>
            </Link>
            <Link href={`/admin/bookings/${b.id}/edit`}
              className="is-quote"
              title={hasQuote ? 'Edit Quote' : 'Build Quote'}>
              <FiEdit2 size={14} /><span>{hasQuote ? 'Edit' : 'Quote'}</span>
            </Link>
            {b.receiptUrl && (
              <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                className="is-receipt" title="Receipt">
                <FiFileText size={14} /><span>Receipt</span>
              </a>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="booking-table-shell">
      <AdminTable
        data={filteredBookings}
        columns={columns}
        filterKey="status"
        filterOptions={['ALL', ...PIPELINE.map(p => p.status)]}
        filterLabels={Object.fromEntries([['ALL', 'All'], ...PIPELINE.map(p => [p.status, p.label])])}
        searchKeys={['customerName', 'customerEmail', 'customerPhone', 'bookingRef', 'title']}
        defaultSort={{ key: 'createdAt', dir: 'desc' }}
        emptyMessage="No bookings found"
        toolbarRight={dateFilterBar}
      />
    </div>
  )
}
