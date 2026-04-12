'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { FiEdit2, FiExternalLink, FiStar, FiEye, FiEyeOff } from 'react-icons/fi'

const STAR_MAP: Record<string, string> = { THREE: '3★', FOUR: '4★', FIVE: '5★' }

interface Pkg {
  id: string; slug: string; title: string; category: string
  price: number; duration: number; nights: number; starRating: string
  isFeatured: boolean; isActive: boolean; createdAt: string
  destination?: { name: string } | null
}

export default function PackagesClient({ packages }: { packages: Pkg[] }) {
  const columns: Column<Pkg>[] = [
    {
      key: 'title', label: 'Package', sortable: true,
      render: pkg => (
        <div>
          <p className="font-semibold text-gray-800 leading-tight line-clamp-1 max-w-48">{pkg.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">/{pkg.slug}</p>
        </div>
      ),
    },
    {
      key: 'category', label: 'Category', sortable: true,
      render: pkg => (
        <span className="capitalize text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium border border-indigo-100">
          {pkg.category.toLowerCase()}
        </span>
      ),
    },
    {
      key: 'destination.name', label: 'Destination', sortable: true,
      render: pkg => <span className="text-sm text-gray-600">{pkg.destination?.name ?? <span className="text-gray-300">—</span>}</span>,
    },
    {
      key: 'price', label: 'Price', sortable: true, align: 'right',
      render: pkg => <span className="font-semibold text-gray-800 text-sm">LKR {pkg.price.toLocaleString()}</span>,
    },
    {
      key: 'duration', label: 'Duration', sortable: true,
      render: pkg => (
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium">
          {pkg.duration}D/{pkg.nights}N
        </span>
      ),
    },
    {
      key: 'starRating', label: 'Stars', sortable: true,
      render: pkg => <span className="text-xs font-semibold text-amber-500">{STAR_MAP[pkg.starRating] ?? '—'}</span>,
    },
    {
      key: 'isFeatured', label: 'Featured', align: 'center',
      render: pkg => pkg.isFeatured
        ? <FiStar size={14} className="text-amber-400 mx-auto fill-current" />
        : <span className="text-gray-200 text-xs mx-auto block text-center">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: pkg => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          pkg.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {pkg.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {pkg.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Added', sortable: true,
      render: pkg => (
        <span className="text-xs text-gray-400">
          {new Date(pkg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: pkg => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/packages/${pkg.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
            <FiEdit2 size={12} /> Edit
          </Link>
          <Link href={`/packages/${pkg.slug}`} target="_blank"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View on site">
            <FiExternalLink size={13} />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={packages}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Active', false: 'Hidden' }}
      searchKeys={['title', 'slug', 'category', 'destination.name']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No packages found"
    />
  )
}
