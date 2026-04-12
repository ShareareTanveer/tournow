'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FiExternalLink, FiFileText, FiEdit2, FiAlertCircle, FiCalendar, FiX } from 'react-icons/fi'
import AdminTable, { Column } from '@/components/admin/AdminTable'

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

interface Booking {
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
  const [bookings, setBookings] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [activePreset, setActivePreset] = useState('All time')

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
    <div className="w-full border-t border-gray-100 pt-3 mt-1 space-y-2">
      {/* Preset pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
          <FiCalendar size={11} className="text-indigo-400" /> Date
        </span>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
              activePreset === p.label && !( (p.from===''&&dateFrom!=='') || (p.to===''&&dateTo!=='') )
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {p.label}
          </button>
        ))}
        {/* Custom inputs */}
        <div className="flex items-center gap-1.5 ml-auto">
          <input type="date" value={resolveDate(dateFrom)}
            onChange={e => { setDateFrom(e.target.value); setActivePreset('Custom') }}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-300 bg-white w-32" />
          <span className="text-gray-400 text-xs">→</span>
          <input type="date" value={resolveDate(dateTo)}
            onChange={e => { setDateTo(e.target.value); setActivePreset('Custom') }}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-300 bg-white w-32" />
          {hasFilter && (
            <button onClick={() => applyPreset(PRESETS[0])}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors" title="Clear">
              <FiX size={12} />
            </button>
          )}
        </div>
      </div>
      {/* Pipeline strip */}
      <div className="flex gap-1.5 flex-wrap text-[11px]">
        {PIPELINE.slice(0, 9).map(p => {
          const n = filteredBookings.filter(b => b.status === p.status).length
          if (n === 0) return null
          return (
            <span key={p.status} className={`px-2.5 py-1 rounded-full font-semibold ${p.bg} ${p.color}`}>
              {p.label} <strong>{n}</strong>
            </span>
          )
        })}
        {hasFilter && (
          <span className="px-2.5 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-600 ml-auto">
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
        <div className="flex items-center gap-2.5">
          {b.image && <img src={b.image} className="w-10 h-8 rounded-lg object-cover shrink-0" alt="" />}
          <div>
            <p className="font-semibold text-xs text-gray-800 line-clamp-1 max-w-38">{b.title}</p>
            <p className="text-[10px] font-mono text-gray-400">{b.bookingRef.slice(-8).toUpperCase()}</p>
            <span className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${b._type === 'tour' ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'}`}>{b._type}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: b => (
        <div>
          <p className="font-medium text-gray-800 text-xs">{b.customerName}</p>
          <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
          {b.customerNote && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold mt-0.5">
              <FiAlertCircle size={8} /> Note
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'travelDate', label: 'Travel', sortable: true,
      render: b => (
        <div className="text-xs text-gray-600 whitespace-nowrap">
          <p>{new Date(b.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
          <p className="text-gray-400">{b.paxAdult}A{b.paxChild > 0 ? ` ${b.paxChild}C` : ''}</p>
        </div>
      ),
    },
    {
      key: 'totalPrice', label: 'Original', sortable: true, align: 'right',
      render: b => <p className="text-xs font-semibold text-gray-500">LKR {b.totalPrice.toLocaleString()}</p>,
    },
    {
      key: 'staffQuote', label: 'Quote', sortable: false, align: 'right',
      render: b => {
        const hasQuote = !!b.staffQuote?.totalPrice
        const quotedTotal = b.staffQuote?.totalPrice
        return hasQuote && quotedTotal != null ? (
          <div>
            <p className="text-xs font-bold text-indigo-600">LKR {quotedTotal.toLocaleString()}</p>
            {quotedTotal !== b.totalPrice && (
              <p className={`text-[10px] font-semibold ${quotedTotal < b.totalPrice ? 'text-green-600' : 'text-red-500'}`}>
                {quotedTotal < b.totalPrice ? '↓' : '↑'} {Math.abs(quotedTotal - b.totalPrice).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-gray-300 italic">no quote</span>
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
            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${s.bg} ${s.color} disabled:opacity-50`}
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
            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${p.bg} ${p.color} disabled:opacity-50`}
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
          <div className="flex items-center gap-1.5">
            <Link href={`/admin/bookings/${b.id}`}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors" title="View Detail">
              <FiExternalLink size={13} />
            </Link>
            <Link href={`/admin/bookings/${b.id}/edit`}
              className={`p-1.5 rounded-lg transition-colors ${hasQuote ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-500'}`}
              title={hasQuote ? 'Edit Quote' : 'Build Quote'}>
              <FiEdit2 size={13} />
            </Link>
            {b.receiptUrl && (
              <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Receipt">
                <FiFileText size={13} />
              </a>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <AdminTable
      data={filteredBookings}
      columns={columns}
      filterKey="status"
      filterOptions={['ALL', ...PIPELINE.map(p => p.status)]}
      filterLabels={Object.fromEntries([['ALL', 'All'], ...PIPELINE.map(p => [p.status, p.label])])}
      searchKeys={['customerName', 'customerEmail', 'customerPhone', 'bookingRef', 'title']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No bookings yet"
      toolbarRight={dateFilterBar}
    />
  )
}
