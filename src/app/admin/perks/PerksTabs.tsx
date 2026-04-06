'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiGrid, FiTag, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'
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

        {tab === 'perks' && (
          <Link href="/admin/perks/new"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <FiPlus size={14} /> Add Perk
          </Link>
        )}
      </div>

      {/* Perks list */}
      {tab === 'perks' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm min-w-175">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['', 'Title', 'Description', 'Status', 'Order', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {perks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    No perks yet.{' '}
                    <Link href="/admin/perks/new" className="text-orange-500 hover:underline font-medium">Add the first one</Link>
                  </td>
                </tr>
              )}
              {perks.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  {/* Icon preview */}
                  <td className="pl-5 py-3 w-12">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: p.bgColor || '#fffbeb' }}>
                          <FiTag size={14} style={{ color: p.iconColor || '#f59e0b' }} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{p.title}</p>
                    {p.ctaLink && (
                      <p className="text-[11px] text-gray-400 truncate max-w-45">{p.ctaLink}</p>
                    )}
                  </td>

                  {/* Description */}
                  <td className="px-5 py-3 text-gray-500 max-w-xs">
                    <p className="line-clamp-2 text-xs">{p.description}</p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>

                  {/* Sort */}
                  <td className="px-5 py-3 text-gray-400 text-sm font-mono">{p.sortOrder}</td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/perks/${p.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 hover:underline">
                        <FiEdit2 size={13} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deleting === p.id}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 disabled:opacity-50">
                        <FiTrash2 size={13} /> {deleting === p.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Claims tab */}
      {tab === 'claims' && <ClaimsManager />}
    </div>
  )
}
