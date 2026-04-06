'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const BOOKING_STATUS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  COMPLETED: 'bg-blue-100 text-blue-700',
}
const PAYMENT_STATUS: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-600',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
}

export default function BookingsTable({ bookings }: { bookings: any[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const update = async (id: string, data: any) => {
    setUpdating(id)
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[1000px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Ref', 'Customer', 'Package', 'Travel Date', 'Pax', 'Total', 'Status', 'Payment', 'Date'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bookings.length === 0 && (
            <tr><td colSpan={9} className="px-5 py-10 text-center text-gray-400">No bookings yet</td></tr>
          )}
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs text-gray-400 font-mono">{b.bookingRef?.slice(0, 8)}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-gray-800">{b.customerName}</p>
                <p className="text-xs text-gray-400">{b.customerEmail}</p>
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{b.package?.title}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.travelDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-center text-gray-600">{b.paxCount}</td>
              <td className="px-4 py-3 font-semibold text-gray-800">LKR {b.totalPrice?.toLocaleString()}</td>
              <td className="px-4 py-3">
                <select value={b.status} disabled={updating === b.id}
                  onChange={(e) => update(b.id, { status: e.target.value })}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${BOOKING_STATUS[b.status]}`}>
                  {['PENDING','CONFIRMED','CANCELLED','COMPLETED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <select value={b.paymentStatus} disabled={updating === b.id}
                  onChange={(e) => update(b.id, { paymentStatus: e.target.value })}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${PAYMENT_STATUS[b.paymentStatus]}`}>
                  {['UNPAID','PARTIAL','PAID','REFUNDED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
