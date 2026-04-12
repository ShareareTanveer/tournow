'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiEdit2 } from 'react-icons/fi'

interface Staff {
  id: string; name: string; role: string; bio?: string | null
  imageUrl?: string | null; isActive: boolean
}

export default function StaffClient({ staff }: { staff: Staff[] }) {
  const columns: Column<Staff>[] = [
    {
      key: 'name', label: 'Staff Member', sortable: true,
      render: s => (
        <div className="flex items-center gap-3">
          {s.imageUrl ? (
            <img src={s.imageUrl} alt={s.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {s.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 leading-tight">{s.name}</p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">{s.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'bio', label: 'Bio',
      render: s => s.bio
        ? <p className="text-xs text-gray-500 max-w-64 line-clamp-2">{s.bio}</p>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: s => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          s.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {s.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: s => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/staff/${s.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors">
            <FiEdit2 size={11} /> Edit
          </Link>
          <DeleteBtn url={`/api/staff/${s.id}`} label="Delete" />
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={staff}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Active', false: 'Hidden' }}
      searchKeys={['name', 'role', 'bio']}
      defaultSort={{ key: 'name', dir: 'asc' }}
      emptyMessage="No staff members yet"
    />
  )
}
