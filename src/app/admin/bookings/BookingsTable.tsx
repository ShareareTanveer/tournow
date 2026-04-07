'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiExternalLink, FiFileText, FiEdit2, FiAlertCircle } from 'react-icons/fi'

const PIPELINE = [
  { status: 'REQUESTED',        label: 'Requested',        color: 'text-blue-600',   bg: 'bg-blue-50' },
  { status: 'CALL_REQUIRED',    label: 'Call Required',    color: 'text-purple-600', bg: 'bg-purple-50' },
  { status: 'EDIT_RESEND',      label: 'Edit & Resend',    color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { status: 'AWAITING_CONFIRM', label: 'Awaiting Confirm', color: 'text-orange-600', bg: 'bg-orange-50' },
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
  { value: 'PARTIAL',  label: 'Partial',  color: 'text-orange-600', bg: 'bg-orange-50' },
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Pipeline strip */}
      <div className="px-5 py-3 border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max text-[11px]">
          {PIPELINE.slice(0, 9).map(p => {
            const n = bookings.filter(b => b.status === p.status).length
            return (
              <span key={p.status} className={`px-2.5 py-1 rounded-full font-semibold ${p.bg} ${p.color}`}>
                {p.label}{n > 0 && <strong className="ml-1">{n}</strong>}
              </span>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Booking</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Travel</th>
              <th className="px-4 py-3 text-right">Original</th>
              <th className="px-4 py-3 text-right">Quote</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => {
              const s = si(b.status)
              const p = pi(b.paymentStatus)
              const hasQuote = !!b.staffQuote?.totalPrice
              const quotedTotal = b.staffQuote?.totalPrice
              const isNew = b.status === 'REQUESTED'

              return (
                <tr key={b.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${isNew ? 'bg-blue-50/40' : ''}`}>
                  {/* Booking */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {b.image && <img src={b.image} className="w-10 h-8 rounded-lg object-cover shrink-0" alt="" />}
                      <div>
                        <p className="font-semibold text-xs text-gray-800 line-clamp-1 max-w-[150px]">{b.title}</p>
                        <p className="text-[10px] font-mono text-gray-400">{b.bookingRef.slice(-8).toUpperCase()}</p>
                        <span className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${b._type === 'tour' ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'}`}>{b._type}</span>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-xs">{b.customerName}</p>
                    <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                    {b.customerNote && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold mt-0.5">
                        <FiAlertCircle size={8} /> Note
                      </span>
                    )}
                  </td>

                  {/* Travel */}
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    <p>{new Date(b.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                    <p className="text-gray-400">{b.paxAdult}A{b.paxChild > 0 ? ` ${b.paxChild}C` : ''}</p>
                  </td>

                  {/* Original total */}
                  <td className="px-4 py-3 text-right">
                    <p className="text-xs font-semibold text-gray-500">LKR {b.totalPrice.toLocaleString()}</p>
                  </td>

                  {/* Quoted total */}
                  <td className="px-4 py-3 text-right">
                    {hasQuote && quotedTotal != null ? (
                      <div>
                        <p className="text-xs font-bold text-orange-600">LKR {quotedTotal.toLocaleString()}</p>
                        {quotedTotal !== b.totalPrice && (
                          <p className={`text-[10px] font-semibold ${quotedTotal < b.totalPrice ? 'text-green-600' : 'text-red-500'}`}>
                            {quotedTotal < b.totalPrice ? '↓' : '↑'} {Math.abs(quotedTotal - b.totalPrice).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 italic">no quote</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <select value={b.status} disabled={updating === b.id}
                      onChange={e => update(b.id, b._type, { status: e.target.value })}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${s.bg} ${s.color} disabled:opacity-50`}>
                      {PIPELINE.map(pp => <option key={pp.status} value={pp.status}>{pp.label}</option>)}
                    </select>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <select value={b.paymentStatus} disabled={updating === b.id}
                      onChange={e => update(b.id, b._type, { paymentStatus: e.target.value })}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${p.bg} ${p.color} disabled:opacity-50`}>
                      {PAY_STATUS.map(pp => <option key={pp.value} value={pp.value}>{pp.label}</option>)}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* View detail */}
                      <Link href={`/admin/bookings/${b.id}`}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors" title="View Detail">
                        <FiExternalLink size={13} />
                      </Link>
                      {/* Edit quote */}
                      <Link href={`/admin/bookings/${b.id}/edit`}
                        className={`p-1.5 rounded-lg transition-colors ${hasQuote ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500'}`}
                        title={hasQuote ? 'Edit Quote' : 'Build Quote'}>
                        <FiEdit2 size={13} />
                      </Link>
                      {/* Receipt link */}
                      {b.receiptUrl && (
                        <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Receipt">
                          <FiFileText size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <p className="text-center py-12 text-sm text-gray-400">No bookings yet</p>
        )}
      </div>
    </div>
  )
}
