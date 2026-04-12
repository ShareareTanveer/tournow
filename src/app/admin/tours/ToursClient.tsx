'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { FiEdit2, FiExternalLink, FiGlobe, FiMapPin, FiEye, FiEyeOff, FiStar } from 'react-icons/fi'

interface Tour {
  id: string; slug: string; title: string; region: string
  price: number; duration: number; nights: number
  isFeatured: boolean; isActive: boolean
  multiDestinations: string[]
  primaryDestination: { name: string }
}

export default function ToursClient({ tours }: { tours: Tour[] }) {
  const columns: Column<Tour>[] = [
    {
      key: 'title', label: 'Tour', sortable: true,
      render: t => (
        <div>
          <p className="font-semibold text-gray-800 leading-tight line-clamp-1 max-w-48">{t.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{t.primaryDestination.name}</p>
        </div>
      ),
    },
    {
      key: 'region', label: 'Region', sortable: true,
      render: t => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full">
          <FiGlobe size={10} /> {t.region}
        </span>
      ),
    },
    {
      key: 'multiDestinations', label: 'Destinations',
      render: t => t.multiDestinations.length > 0 ? (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <FiMapPin size={10} className="text-gray-400 shrink-0" />
          {t.multiDestinations.slice(0, 2).join(', ')}
          {t.multiDestinations.length > 2 && <span className="text-gray-400">+{t.multiDestinations.length - 2}</span>}
        </span>
      ) : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'duration', label: 'Duration', sortable: true,
      render: t => (
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium">
          {t.duration}D/{t.nights}N
        </span>
      ),
    },
    {
      key: 'price', label: 'Price', sortable: true, align: 'right',
      render: t => <span className="font-semibold text-gray-800 text-sm">LKR {t.price.toLocaleString()}</span>,
    },
    {
      key: 'isFeatured', label: 'Featured', align: 'center',
      render: t => t.isFeatured
        ? <FiStar size={14} className="text-amber-400 mx-auto fill-current" />
        : <span className="text-gray-200 text-xs block text-center">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: t => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          t.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {t.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {t.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: t => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/tours/${t.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-sky-600 px-3 py-1.5 rounded-lg transition-colors">
            <FiEdit2 size={12} /> Edit
          </Link>
          <Link href={`/tours/${t.slug}`} target="_blank"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiExternalLink size={13} />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={tours}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Active', false: 'Hidden' }}
      searchKeys={['title', 'slug', 'region', 'primaryDestination.name']}
      defaultSort={{ key: 'isFeatured', dir: 'desc' }}
      emptyMessage="No tours found"
    />
  )
}
