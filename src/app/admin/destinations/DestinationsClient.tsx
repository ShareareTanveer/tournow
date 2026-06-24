'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiEdit2, FiStar, FiEye, FiEyeOff } from 'react-icons/fi'

interface Destination {
  id: string; slug: string; name: string; region: string; country: string
  costLevel?: string | null; isFeatured: boolean; isActive: boolean; createdAt: string
}

const COST_STYLE: Record<string, string> = {
  BUDGET:   'bg-emerald-50 text-emerald-700 border border-emerald-100',
  MODERATE: 'bg-sky-50 text-sky-700 border border-sky-100',
  LUXURY:   'bg-purple-50 text-purple-700 border border-purple-100',
}

export default function DestinationsClient({ destinations }: { destinations: Destination[] }) {
  const columns: Column<Destination>[] = [
    {
      key: 'name', label: 'Destination', sortable: true,
      render: d => (
        <div>
          <p className="font-semibold text-gray-800">{d.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">/{d.slug}</p>
        </div>
      ),
    },
    {
      key: 'region', label: 'Region', sortable: true,
      render: d => <span className="text-sm text-gray-600">{d.region}</span>,
    },
    {
      key: 'country', label: 'Country', sortable: true,
      render: d => <span className="text-sm text-gray-600">{d.country}</span>,
    },
    {
      key: 'costLevel', label: 'Cost Level', sortable: true,
      render: d => d.costLevel
        ? <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${COST_STYLE[d.costLevel] ?? 'bg-gray-100 text-gray-500'}`}>{d.costLevel}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'isFeatured', label: 'Featured', align: 'center',
      render: d => d.isFeatured
        ? <FiStar size={14} className="text-amber-400 mx-auto fill-current" />
        : <span className="text-gray-200 text-xs block text-center">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: d => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          d.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {d.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {d.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Added', sortable: true,
      render: d => (
        <span className="text-xs text-gray-400">
          {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: d => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/destinations/${d.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
            <FiEdit2 size={12} /> Edit
          </Link>
          <DeleteBtn url={`/api/destinations/${d.slug}`} label="Delete" />
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={destinations}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Active', false: 'Hidden' }}
      searchKeys={['name', 'slug', 'region', 'country', 'costLevel']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No destinations yet"
    />
  )
}
