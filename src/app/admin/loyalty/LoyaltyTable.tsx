'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AdminTable, { Column } from '@/components/admin/AdminTable'

const TIER_STYLES: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-700',
  SILVER: 'bg-gray-100 text-gray-600',
  GOLD:   'bg-yellow-100 text-yellow-700',
}

export default function LoyaltyTable({ cards }: { cards: any[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [newTiers, setNewTiers] = useState<Record<string, string>>({})
  const [points, setPoints] = useState<Record<string, number>>({})

  const savePoints = async (id: string) => {
    await fetch(`/api/loyalty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: points[id], tier: newTiers[id] }),
    })
    setEditing(null)
    router.refresh()
  }

  const columns: Column[] = [
    {
      key: 'name', label: 'Member', sortable: true,
      render: c => (
        <div>
          <p className="font-semibold text-gray-800">{c.name}</p>
          <p className="text-xs text-gray-400">{c.email}</p>
          {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
        </div>
      ),
    },
    {
      key: 'cardNumber', label: 'Card Number',
      render: c => <span className="font-mono text-xs text-gray-500">{c.cardNumber ?? '—'}</span>,
    },
    {
      key: 'tier', label: 'Tier', sortable: true,
      render: c => editing === c.id ? (
        <select
          defaultValue={c.tier}
          onChange={e => setNewTiers(prev => ({ ...prev, [c.id]: e.target.value }))}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-indigo-400"
        >
          {['BRONZE', 'SILVER', 'GOLD'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      ) : (
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${TIER_STYLES[c.tier] ?? 'bg-gray-100 text-gray-500'}`}>{c.tier}</span>
      ),
    },
    {
      key: 'points', label: 'Points', sortable: true, align: 'right',
      render: c => editing === c.id ? (
        <input
          type="number" min={0} defaultValue={c.points ?? 0}
          onChange={e => setPoints(prev => ({ ...prev, [c.id]: Number(e.target.value) }))}
          className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-400"
        />
      ) : (
        <span className="font-semibold text-gray-800">{(c.points ?? 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'createdAt', label: 'Joined', sortable: true,
      render: c => (
        <span className="text-xs text-gray-400">
          {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: c => editing === c.id ? (
        <div className="flex gap-2">
          <button
            onClick={() => savePoints(c.id)}
            className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(null)}
            className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setEditing(c.id)
            setPoints(prev => ({ ...prev, [c.id]: c.points ?? 0 }))
            setNewTiers(prev => ({ ...prev, [c.id]: c.tier }))
          }}
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Edit Points
        </button>
      ),
    },
  ]

  return (
    <AdminTable
      data={cards}
      columns={columns}
      filterKey="tier"
      filterOptions={['ALL', 'BRONZE', 'SILVER', 'GOLD']}
      searchKeys={['name', 'email', 'phone', 'cardNumber']}
      defaultSort={{ key: 'points', dir: 'desc' }}
      emptyMessage="No loyalty members yet"
    />
  )
}
