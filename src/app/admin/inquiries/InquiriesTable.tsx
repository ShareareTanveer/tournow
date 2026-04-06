'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  CONVERTED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export default function InquiriesTable({ inquiries, staff }: { inquiries: any[]; staff: any[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const updateInquiry = async (id: string, data: Record<string, string>) => {
    setUpdating(id)
    await fetch(`/api/inquiries/${id}`, {
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
            {['Name', 'Email', 'Phone', 'Package / Destination', 'Message', 'Status', 'Assigned To', 'Date'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {inquiries.length === 0 && (
            <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No inquiries yet</td></tr>
          )}
          {inquiries.map((inq) => (
            <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 font-semibold text-gray-800">{inq.name}</td>
              <td className="px-5 py-3"><a href={`mailto:${inq.email}`} className="text-orange-500 hover:underline">{inq.email}</a></td>
              <td className="px-5 py-3 text-gray-500">{inq.phone ?? '—'}</td>
              <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{inq.package?.title ?? inq.destination ?? '—'}</td>
              <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate" title={inq.message}>{inq.message}</td>
              <td className="px-5 py-3">
                <select
                  value={inq.status}
                  disabled={updating === inq.id}
                  onChange={(e) => updateInquiry(inq.id, { status: e.target.value })}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[inq.status]}`}
                >
                  {['NEW','CONTACTED','CONVERTED','CLOSED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-5 py-3">
                <select
                  value={inq.assignedTo?.id ?? ''}
                  disabled={updating === inq.id}
                  onChange={(e) => updateInquiry(inq.id, { assignedToId: e.target.value || null as any })}
                  className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </td>
              <td className="px-5 py-3 text-gray-400 text-xs">{new Date(inq.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
