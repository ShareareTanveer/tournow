'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TIER_STYLES: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-gray-100 text-gray-600',
  GOLD: 'bg-amber-100 text-amber-700',
}

export default function LoyaltyTable({ cards }: { cards: any[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [points, setPoints] = useState<Record<string, number>>({})

  const savePoints = async (id: string, tier: string) => {
    await fetch(`/api/loyalty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: points[id], tier }),
    })
    setEditing(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Member', 'Card Number', 'Tier', 'Points', 'Joined', 'Actions'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {cards.length === 0 && (
            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No loyalty members yet</td></tr>
          )}
          {cards.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-5 py-3">
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
                {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
              </td>
              <td className="px-5 py-3 font-mono text-xs text-gray-500">{c.cardNumber ?? '—'}</td>
              <td className="px-5 py-3">
                {editing === c.id ? (
                  <select defaultValue={c.tier}
                    onChange={(e) => {
                      const row = cards.find((x) => x.id === c.id)
                      if (row) row._newTier = e.target.value
                    }}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-orange-400">
                    {['BRONZE', 'SILVER', 'GOLD'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${TIER_STYLES[c.tier] ?? 'bg-gray-100 text-gray-500'}`}>{c.tier}</span>
                )}
              </td>
              <td className="px-5 py-3">
                {editing === c.id ? (
                  <input type="number" min={0} defaultValue={c.points ?? 0}
                    onChange={(e) => setPoints((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))}
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400" />
                ) : (
                  <span className="font-semibold text-gray-800">{c.points ?? 0}</span>
                )}
              </td>
              <td className="px-5 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3">
                {editing === c.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => savePoints(c.id, c._newTier ?? c.tier)}
                      className="text-xs bg-orange-500 text-white font-semibold px-3 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => setEditing(null)}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(c.id); setPoints((prev) => ({ ...prev, [c.id]: c.points ?? 0 })) }}
                    className="text-xs text-orange-500 hover:underline font-medium">Edit Points</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
