'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { FiStar, FiCheck, FiX, FiTrash2, FiMapPin, FiSearch } from 'react-icons/fi'

const STATUS_STYLE: Record<string, string> = {
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  REJECTED: 'bg-red-50 text-red-600 border border-red-100',
}

const FILTER_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const
type Filter = typeof FILTER_OPTIONS[number]

export default function ReviewsTable({ reviews }: { reviews: any[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' })

  const update = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setUpdating(null)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this review?')) return
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const filtered = useMemo(() => {
    let result = reviews
    if (activeFilter !== 'ALL') result = result.filter(r => r.status === activeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.body?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.package?.title?.toLowerCase().includes(q)
      )
    }
    result = [...result].sort((a, b) => {
      const av = sort.key === 'rating' ? (a.rating ?? 0) : new Date(a.createdAt).getTime()
      const bv = sort.key === 'rating' ? (b.rating ?? 0) : new Date(b.createdAt).getTime()
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return result
  }, [reviews, activeFilter, search, sort])

  const counts: Record<string, number> = {
    ALL: reviews.length,
    PENDING:  reviews.filter(r => r.status === 'PENDING').length,
    APPROVED: reviews.filter(r => r.status === 'APPROVED').length,
    REJECTED: reviews.filter(r => r.status === 'REJECTED').length,
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center">
          <FiStar size={24} className="text-yellow-400" />
        </div>
        <p className="font-semibold text-gray-700">No reviews yet</p>
        <p className="text-sm text-gray-400">Customer reviews will appear here for moderation</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                activeFilter === f
                  ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeFilter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-300 bg-white w-48"
            />
          </div>
          <select
            value={`${sort.key}-${sort.dir}`}
            onChange={e => {
              const [key, dir] = e.target.value.split('-')
              setSort({ key, dir: dir as 'asc' | 'desc' })
            }}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-300 bg-white text-gray-600"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="rating-desc">Highest rating</option>
            <option value="rating-asc">Lowest rating</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 gap-2">
          <p className="font-semibold text-gray-500">No reviews match your filter</p>
          <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id}
              className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-sm ${
                r.status === 'PENDING' ? 'border-amber-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-gray-800">{r.name}</p>
                      {r.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <FiMapPin size={10} /> {r.location}
                        </span>
                      )}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} size={13} className={i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-200'} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1 font-medium">{r.rating}/5</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[r.status] ?? STATUS_STYLE.PENDING}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">{r.body}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {r.package && (
                        <span className="text-xs text-gray-400">
                          Package: <span className="text-gray-600 font-medium">{r.package.title}</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-300">
                        {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status !== 'APPROVED' && (
                        <button disabled={updating === r.id} onClick={() => update(r.id, 'APPROVED')}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors">
                          <FiCheck size={12} /> Approve
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button disabled={updating === r.id} onClick={() => update(r.id, 'REJECTED')}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                          <FiX size={12} /> Reject
                        </button>
                      )}
                      <button onClick={() => del(r.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
