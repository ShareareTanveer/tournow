'use client'

import { useState } from 'react'
import { FiExternalLink, FiFileText, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi'

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
  id: string; bookingRef: string; _type: 'package' | 'tour'; title: string; image?: string
  customerName: string; customerEmail: string; customerPhone: string
  travelDate: string; paxAdult: number; paxChild: number
  totalPrice: number; discount: number; status: string; paymentStatus: string
  adminNotes?: string | null; receiptUrl?: string | null; receiptNote?: string | null
  notes?: string | null; selectedOptions?: any; roomType?: string | null; createdAt: string
}

export default function BookingsTable({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

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
          {PIPELINE.slice(0, 9).map((p, i) => {
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
              {['Booking', 'Customer', 'Travel', 'Total', 'Status', 'Payment', ''].map(h => (
                <th key={h} className={`px-4 py-3 ${h === 'Total' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const s = si(b.status), p = pi(b.paymentStatus), open = expanded === b.id
              return (
                <>
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
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
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{b.customerName}</p>
                      <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      <p>{new Date(b.travelDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'2-digit' })}</p>
                      <p className="text-gray-400">{b.paxAdult}A{b.paxChild > 0 ? ` ${b.paxChild}C` : ''}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-gray-800 text-xs">LKR {b.totalPrice.toLocaleString()}</p>
                      {b.discount > 0 && <p className="text-[10px] text-green-600">-{b.discount.toLocaleString()}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <select value={b.status} disabled={updating === b.id}
                        onChange={e => update(b.id, b._type, { status: e.target.value })}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${s.bg} ${s.color} disabled:opacity-50`}>
                        {PIPELINE.map(pp => <option key={pp.status} value={pp.status}>{pp.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select value={b.paymentStatus} disabled={updating === b.id}
                        onChange={e => update(b.id, b._type, { paymentStatus: e.target.value })}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${p.bg} ${p.color} disabled:opacity-50`}>
                        {PAY_STATUS.map(pp => <option key={pp.value} value={pp.value}>{pp.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {b.receiptUrl && (
                          <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="Receipt">
                            <FiFileText size={13} />
                          </a>
                        )}
                        <button onClick={() => setExpanded(open ? null : b.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                          {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {open && (
                    <tr key={b.id + '_x'} className="bg-gray-50/60">
                      <td colSpan={7} className="px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Details</p>
                            <div className="space-y-1 text-xs text-gray-600">
                              <p><span className="text-gray-400">Email: </span>{b.customerEmail}</p>
                              {b.roomType && <p><span className="text-gray-400">Room: </span>{b.roomType}</p>}
                              {b.selectedOptions?.length > 0 && (
                                <p><span className="text-gray-400">Extras: </span>{b.selectedOptions.map((o: any) => o.label).join(', ')}</p>
                              )}
                              {b.notes && <p><span className="text-gray-400">Note: </span>{b.notes}</p>}
                              <p className="text-gray-400 mt-1">{new Date(b.createdAt).toLocaleString()}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Receipt</p>
                            {b.receiptUrl ? (
                              <div className="space-y-2">
                                <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline">
                                  <FiExternalLink size={12} /> View Receipt
                                </a>
                                {b.receiptNote && <p className="text-xs text-gray-500 italic">{b.receiptNote}</p>}
                                <button onClick={() => update(b.id, b._type, { status: 'ADMIN_CONFIRMING' })}
                                  className="flex items-center gap-1 text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-600">
                                  <FiCheck size={11} /> Mark Admin Confirming
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No receipt yet</p>
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Admin Notes</p>
                            <textarea rows={3} placeholder="Notes, quote, payment ref…"
                              value={adminNotes[b.id] ?? b.adminNotes ?? ''}
                              onChange={e => setAdminNotes(n => ({ ...n, [b.id]: e.target.value }))}
                              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 resize-none" />
                            <button onClick={() => update(b.id, b._type, { adminNotes: adminNotes[b.id] ?? b.adminNotes })}
                              disabled={updating === b.id}
                              className="mt-1.5 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50">
                              Save Note
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
