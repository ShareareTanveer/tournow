'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiExternalLink, FiFileText, FiEdit2, FiAlertCircle } from 'react-icons/fi'
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

export default function BookingsTable({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)

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

  // Pipeline strip as toolbarRight slot
  const pipelineStrip = (
    <div className="flex gap-1.5 flex-wrap text-[11px]">
      {PIPELINE.slice(0, 9).map(p => {
        const n = bookings.filter(b => b.status === p.status).length
        if (n === 0) return null
        return (
          <span key={p.status} className={`px-2.5 py-1 rounded-full font-semibold ${p.bg} ${p.color}`}>
            {p.label} <strong>{n}</strong>
          </span>
        )
      })}
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
      data={bookings}
      columns={columns}
      filterKey="status"
      filterOptions={['ALL', ...PIPELINE.map(p => p.status)]}
      filterLabels={Object.fromEntries([['ALL', 'All'], ...PIPELINE.map(p => [p.status, p.label])])}
      searchKeys={['customerName', 'customerEmail', 'customerPhone', 'bookingRef', 'title']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No bookings yet"
      toolbarRight={pipelineStrip}
    />
  )
}
