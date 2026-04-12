'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiEdit2, FiEye, FiEyeOff } from 'react-icons/fi'

interface Visa {
  id: string; slug: string; country: string; visaType: string
  processingTime?: string | null; fee?: number | null; isActive: boolean
}

export default function VisasClient({ visas }: { visas: Visa[] }) {
  const columns: Column<Visa>[] = [
    {
      key: 'country', label: 'Country', sortable: true,
      render: v => <p className="font-semibold text-gray-800">{v.country}</p>,
    },
    {
      key: 'visaType', label: 'Type', sortable: true,
      render: v => (
        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
          {v.visaType}
        </span>
      ),
    },
    {
      key: 'processingTime', label: 'Processing Time', sortable: true,
      render: v => v.processingTime
        ? <span className="text-sm text-gray-500">{v.processingTime}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'fee', label: 'Fee (LKR)', sortable: true, align: 'right',
      render: v => v.fee
        ? <span className="font-semibold text-gray-800">LKR {v.fee.toLocaleString()}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: v => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          v.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {v.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {v.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: v => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/visas/${v.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
            <FiEdit2 size={12} /> Edit
          </Link>
          <DeleteBtn url={`/api/visas/${v.slug}`} label="Delete" />
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={visas}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Active', false: 'Hidden' }}
      searchKeys={['country', 'visaType', 'processingTime']}
      defaultSort={{ key: 'country', dir: 'asc' }}
      emptyMessage="No visa services yet"
    />
  )
}
