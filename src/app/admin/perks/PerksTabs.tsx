'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiGrid, FiTag, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import ClaimsManager from './ClaimsManager'

interface Perk {
  id: string
  title: string
  description: string
  iconName: string
  iconColor: string
  bgColor: string
  imageUrl: string | null
  ctaLink: string | null
  sortOrder: number
  isActive: boolean
}

interface Props {
  perks: Perk[]
  pendingCount: number
}

export default function PerksTabs({ perks: initial, pendingCount }: Props) {
  const [tab, setTab] = useState<'perks' | 'claims'>('perks')
  const [perks, setPerks] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete perk "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/perks/${id}`, { method: 'DELETE' })
    setPerks(p => p.filter(x => x.id !== id))
    setDeleting(null)
    router.refresh()
  }

  const addPerkBtn = tab === 'perks' ? (
    <Link href="/admin/perks/new"
      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
      <FiPlus size={14} /> Add Perk
    </Link>
  ) : null

  const columns: Column<Perk>[] = [
    {
      key: 'title', label: 'Perk', sortable: true,
      render: p => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: p.bgColor || '#fffbeb' }}>
                <FiTag size={14} style={{ color: p.iconColor || '#0a83f5' }} />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{p.title}</p>
            {p.ctaLink && <p className="text-[11px] text-gray-400 truncate max-w-45">{p.ctaLink}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'description', label: 'Description',
      render: p => <p className="line-clamp-2 text-xs text-gray-500 max-w-64">{p.description}</p>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: p => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          p.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {p.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {p.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'sortOrder', label: 'Order', sortable: true, align: 'center',
      render: p => <span className="text-sm text-gray-400 font-mono">{p.sortOrder}</span>,
    },
    {
      key: 'actions', label: 'Actions',
      render: p => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/perks/${p.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors">
            <FiEdit2 size={11} /> Edit
          </Link>
          <button
            onClick={() => handleDelete(p.id, p.title)}
            disabled={deleting === p.id}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiTrash2 size={11} /> {deleting === p.id ? '…' : 'Delete'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setTab('perks')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${tab === 'perks' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FiGrid size={14} /> Perks ({perks.length})
          </button>
          <button onClick={() => setTab('claims')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${tab === 'claims' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FiTag size={14} /> Claimed Perks
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
        {addPerkBtn}
      </div>

      {tab === 'perks' && (
        <AdminTable
          data={perks}
          columns={columns}
          filterKey="isActive"
          filterOptions={['ALL', 'true', 'false']}
          filterLabels={{ ALL: 'All', true: 'Active', false: 'Hidden' }}
          searchKeys={['title', 'description']}
          defaultSort={{ key: 'sortOrder', dir: 'asc' }}
          emptyMessage="No perks yet"
        />
      )}

      {tab === 'claims' && <ClaimsManager />}
    </div>
  )
}
