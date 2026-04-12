'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AdminTable, { Column } from '@/components/admin/AdminTable'

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  FAILED:    'bg-red-50 text-red-600 border border-red-100',
  REFUNDED:  'bg-gray-100 text-gray-500 border border-gray-200',
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

  const columns: Column[] = [
    {
      key: 'donorName', label: 'Donor', sortable: true,
      render: d => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shrink-0">
            {(d.donorName ?? 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{d.donorName ?? 'Anonymous'}</p>
            {d.donorEmail && <p className="text-[11px] text-gray-400">{d.donorEmail}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'amount', label: 'Amount (LKR)', sortable: true, align: 'right',
      render: d => d.amount != null
        ? <span className="font-semibold text-gray-800">LKR {d.amount.toLocaleString()}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'message', label: 'Message',
      render: d => d.message
        ? <p className="text-xs text-gray-500 max-w-48 line-clamp-2">{d.message}</p>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: d => (
        <select
          value={d.status}
          disabled={updating === d.id}
          onChange={e => update(d.id, e.target.value)}
          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-500'}`}
        >
          {['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: d => (
        <span className="text-xs text-gray-400">
          {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
  ]

  return (
    <AdminTable
      data={donations}
      columns={columns}
      filterKey="status"
      filterOptions={['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']}
      searchKeys={['donorName', 'donorEmail', 'message']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No donations yet"
    />
  )
}
