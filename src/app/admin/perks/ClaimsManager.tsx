'use client'

import { useEffect, useState } from 'react'
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiUser, FiTag } from 'react-icons/fi'

interface Claim {
  id: string
  status: string
  claimedAt: string
  perk: { id: string; title: string; iconColor: string; bgColor: string }
  user: { id: string; name: string; email: string }
}

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'USED', 'EXPIRED'] as const
type Status = typeof STATUS_OPTIONS[number]

const STATUS_STYLE: Record<Status, string> = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  USED:     'bg-gray-100 text-gray-500',
  EXPIRED:  'bg-red-100 text-red-500',
}

const STATUS_ICON: Record<Status, React.ReactNode> = {
  PENDING:  <FiClock size={12} />,
  APPROVED: <FiCheckCircle size={12} />,
  USED:     <FiTag size={12} />,
  EXPIRED:  <FiXCircle size={12} />,
}

export default function ClaimsManager() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/perks/claims')
      .then(r => r.ok ? r.json() : [])
      .then(setClaims)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: Status) => {
    setUpdating(id)
    const res = await fetch('/api/admin/perks/claims', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: updated.status } : c))
    }
    setUpdating(null)
  }

  const visible = filter === 'ALL' ? claims : claims.filter(c => c.status === filter)
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = claims.filter(c => c.status === s).length
    return acc
  }, {} as Record<Status, number>)

  return (
    <div className="space-y-5">
      {/* Filter bar + refresh */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {(['ALL', ...STATUS_OPTIONS] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filter === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {s === 'ALL' ? `All (${claims.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${counts[s]})`}
            </button>
          ))}
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <FiRefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Pending banner */}
      {counts.PENDING > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <FiClock size={16} className="text-yellow-500 shrink-0" />
          <p className="text-sm font-semibold text-yellow-800">
            {counts.PENDING} claim{counts.PENDING > 1 ? 's' : ''} waiting for approval
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Customer', 'Perk', 'Claimed On', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No claims found</td></tr>
            )}
            {visible.map(c => {
              const s = c.status as Status
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <FiUser size={12} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{c.user.name}</p>
                        <p className="text-xs text-gray-400">{c.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: c.perk.bgColor || '#fffbeb' }}>
                        <FiTag size={12} style={{ color: c.perk.iconColor || '#f59e0b' }} />
                      </div>
                      <span className="font-medium text-gray-800">{c.perk.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(c.claimedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[s] ?? STATUS_STYLE.PENDING}`}>
                      {STATUS_ICON[s]} {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {STATUS_OPTIONS.filter(opt => opt !== s).map(opt => (
                        <button key={opt}
                          disabled={updating === c.id}
                          onClick={() => updateStatus(c.id, opt)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                            opt === 'APPROVED'
                              ? 'border-green-300 text-green-700 hover:bg-green-50'
                              : opt === 'EXPIRED'
                              ? 'border-red-200 text-red-500 hover:bg-red-50'
                              : opt === 'USED'
                              ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                              : 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                          }`}>
                          {updating === c.id ? '…' : `Mark ${opt.charAt(0) + opt.slice(1).toLowerCase()}`}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
