'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default function ConsultationsTable({ consultations, staff }: { consultations: any[]; staff: any[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const update = async (id: string, data: any) => {
    setUpdating(id)
    await fetch(`/api/consultations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Name', 'Email', 'Phone', 'Method', 'Notes', 'Status', 'Assigned Consultant', 'Date'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {consultations.length === 0 && (
            <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No consultation requests yet</td></tr>
          )}
          {consultations.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 font-semibold text-gray-800">{c.name}</td>
              <td className="px-5 py-3"><a href={`mailto:${c.email}`} className="text-orange-500 hover:underline">{c.email}</a></td>
              <td className="px-5 py-3 text-gray-500">{c.phone ?? '—'}</td>
              <td className="px-5 py-3">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  {c.method === 'VIDEO_CALL' ? '🎥 Video' : '📞 Phone'}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">{c.additionalInfo ?? '—'}</td>
              <td className="px-5 py-3">
                <select value={c.status} disabled={updating === c.id}
                  onChange={(e) => update(c.id, { status: e.target.value })}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[c.status]}`}>
                  {['PENDING','SCHEDULED','COMPLETED','CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-5 py-3">
                <select value={c.assignedConsultant?.id ?? ''} disabled={updating === c.id}
                  onChange={(e) => update(c.id, { assignedConsultantId: e.target.value || null })}
                  className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                  <option value="">Unassigned</option>
                  {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </td>
              <td className="px-5 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
