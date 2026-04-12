'use client'

import { useEffect, useState } from 'react'
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiUser, FiTag } from 'react-icons/fi'
import AdminTable, { Column } from '@/components/admin/AdminTable'

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
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  USED:     'bg-gray-100 text-gray-500 border border-gray-200',
  EXPIRED:  'bg-red-50 text-red-500 border border-red-100',
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

  const pendingCount = claims.filter(c => c.status === 'PENDING').length

  const refreshBtn = (
    <button onClick={load}
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
      <FiRefreshCw size={12} /> Refresh
    </button>
  )

  const columns: Column<Claim>[] = [
    {
      key: 'user', label: 'Customer', sortable: false,
      render: c => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <FiUser size={12} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{c.user.name}</p>
            <p className="text-xs text-gray-400">{c.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'perk', label: 'Perk', sortable: false,
      render: c => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: c.perk.bgColor || '#fffbeb' }}>
            <FiTag size={12} style={{ color: c.perk.iconColor || '#0a83f5' }} />
          </div>
          <span className="font-medium text-gray-800">{c.perk.title}</span>
        </div>
      ),
    },
    {
      key: 'claimedAt', label: 'Claimed On', sortable: true,
      render: c => (
        <span className="text-xs text-gray-400">
          {new Date(c.claimedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: c => {
        const s = c.status as Status
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[s] ?? STATUS_STYLE.PENDING}`}>
            {STATUS_ICON[s]} {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        )
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: c => {
        const s = c.status as Status
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_OPTIONS.filter(opt => opt !== s).map(opt => (
              <button key={opt}
                disabled={updating === c.id}
                onClick={() => updateStatus(c.id, opt)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                  opt === 'APPROVED' ? 'border-green-300 text-green-700 hover:bg-green-50'
                  : opt === 'EXPIRED' ? 'border-red-200 text-red-500 hover:bg-red-50'
                  : opt === 'USED'    ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                }`}>
                {updating === c.id ? '…' : `Mark ${opt.charAt(0) + opt.slice(1).toLowerCase()}`}
              </button>
            ))}
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center py-16">
        <p className="text-sm text-gray-400">Loading claims…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <FiClock size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            {pendingCount} claim{pendingCount > 1 ? 's' : ''} waiting for approval
          </p>
        </div>
      )}
      <AdminTable
        data={claims}
        columns={columns}
        filterKey="status"
        filterOptions={['ALL', ...STATUS_OPTIONS]}
        filterLabels={Object.fromEntries([['ALL', 'All'], ...STATUS_OPTIONS.map(s => [s, s.charAt(0) + s.slice(1).toLowerCase()])])}
        searchKeys={['user.name', 'user.email', 'perk.title']}
        defaultSort={{ key: 'claimedAt', dir: 'desc' }}
        emptyMessage="No claims found"
        toolbarRight={refreshBtn}
      />
    </div>
  )
}
