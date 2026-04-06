'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ReviewsTable({ reviews }: { reviews: any[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

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

  return (
    <div className="space-y-4">
      {reviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center text-gray-400">No reviews yet</div>
      )}
      {reviews.map((r) => (
        <div key={r.id} className={`bg-white rounded-2xl border p-5 flex gap-5 items-start ${r.status === 'PENDING' ? 'border-yellow-200' : 'border-gray-200'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">
            {r.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <p className="font-semibold text-gray-800">{r.name}</p>
              {r.location && <p className="text-xs text-gray-400">📍 {r.location}</p>}
              <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_,i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {r.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{r.body}</p>
            {r.package && <p className="text-xs text-gray-400">Package: {r.package.title}</p>}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {r.status !== 'APPROVED' && (
              <button disabled={updating === r.id} onClick={() => update(r.id, 'APPROVED')}
                className="text-xs bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Approve
              </button>
            )}
            {r.status !== 'REJECTED' && (
              <button disabled={updating === r.id} onClick={() => update(r.id, 'REJECTED')}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Reject
              </button>
            )}
            <button onClick={() => del(r.id)}
              className="text-xs text-red-500 hover:bg-red-50 border border-red-200 font-medium px-3 py-1.5 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
