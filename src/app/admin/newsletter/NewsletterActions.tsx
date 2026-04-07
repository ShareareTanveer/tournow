'use client'

import { useState } from 'react'

export default function NewsletterActions({ subscribers }: { subscribers: any[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = subscribers.filter((s) => {
    if (filter === 'active') return s.isActive
    if (filter === 'inactive') return !s.isActive
    return true
  })

  const exportCSV = () => {
    const rows = [['Email', 'WhatsApp', 'Status', 'Subscribed At']]
    filtered.forEach((s) => rows.push([
      s.email,
      s.whatsapp ?? '',
      s.isActive ? 'Active' : 'Unsubscribed',
      new Date(s.createdAt).toLocaleDateString(),
    ]))
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString()?.split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="text-xs bg-white border border-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          ⬇ Export CSV ({filtered.length})
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Email', 'WhatsApp', 'Status', 'Subscribed'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No subscribers</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-800">{s.email}</td>
                <td className="px-5 py-3 text-gray-500">{s.whatsapp ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {s.isActive ? 'Active' : 'Unsubscribed'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
