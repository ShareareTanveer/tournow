'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiVideo, FiPhone, FiMail } from 'react-icons/fi'
import AdminTable, { Column } from '@/components/admin/AdminTable'

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-100',
  SCHEDULED: 'bg-blue-50 text-blue-700 border border-blue-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-600 border border-red-100',
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

  const columns: Column[] = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: c => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-black shrink-0">
            {c.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{c.name}</p>
            <a href={`mailto:${c.email}`} className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1 mt-0.5">
              <FiMail size={9} /> {c.email}
            </a>
            {c.phone && <p className="text-[11px] text-gray-400">{c.phone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'method', label: 'Method', sortable: true,
      render: c => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
          c.method === 'VIDEO_CALL'
            ? 'bg-violet-50 text-violet-700 border-violet-100'
            : 'bg-sky-50 text-sky-700 border-sky-100'
        }`}>
          {c.method === 'VIDEO_CALL' ? <FiVideo size={11} /> : <FiPhone size={11} />}
          {c.method === 'VIDEO_CALL' ? 'Video Call' : 'Phone Call'}
        </span>
      ),
    },
    {
      key: 'additionalInfo', label: 'Notes',
      render: c => c.additionalInfo
        ? <p className="text-xs text-gray-500 max-w-48 line-clamp-2">{c.additionalInfo}</p>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: c => (
        <select
          value={c.status}
          disabled={updating === c.id}
          onChange={e => update(c.id, { status: e.target.value })}
          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_STYLE[c.status]}`}
        >
          {['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'assignedTo', label: 'Assigned To',
      render: c => (
        <select
          value={c.assignedConsultant?.id ?? ''}
          disabled={updating === c.id}
          onChange={e => update(c.id, { assignedConsultantId: e.target.value || null })}
          className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-300 bg-white disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      ),
    },
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: c => (
        <span className="text-xs text-gray-400">
          {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
  ]

  return (
    <AdminTable
      data={consultations}
      columns={columns}
      filterKey="status"
      filterOptions={['ALL', 'PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED']}
      searchKeys={['name', 'email', 'phone', 'additionalInfo']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No consultation requests yet"
    />
  )
}
