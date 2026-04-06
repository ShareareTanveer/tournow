'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-500',
}

export default function CharityTable({ donations }: { donations: any[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const update = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/charity/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Donor', 'Amount', 'Message', 'Status', 'Date', 'Actions'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {donations.length === 0 && (
            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No donations yet</td></tr>
          )}
          {donations.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-5 py-3">
                <p className="font-semibold text-gray-800">{d.donorName ?? 'Anonymous'}</p>
                {d.donorEmail && <p className="text-xs text-gray-400">{d.donorEmail}</p>}
              </td>
              <td className="px-5 py-3 font-semibold text-gray-800">LKR {d.amount?.toLocaleString() ?? '—'}</td>
              <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{d.message ?? '—'}</td>
              <td className="px-5 py-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {d.status}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-400 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3">
                <select value={d.status} disabled={updating === d.id}
                  onChange={(e) => update(d.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-orange-400 cursor-pointer">
                  {['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
