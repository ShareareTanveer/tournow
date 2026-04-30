'use client'

import { useRef } from 'react'
import { FiDownload, FiMail } from 'react-icons/fi'
import AdminTable, { Column } from '@/components/admin/AdminTable'

export default function NewsletterActions({ subscribers }: { subscribers: any[] }) {
  const filteredRef = useRef<any[]>(subscribers)

  const exportCSV = () => {
    const rows = [['Email', 'WhatsApp', 'Status', 'Subscribed At']]
    filteredRef.current.forEach(s => rows.push([
      s.email,
      s.whatsapp ?? '',
      s.isActive ? 'Active' : 'Unsubscribed',
      new Date(s.createdAt).toLocaleDateString(),
    ]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (subscribers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center">
          <FiMail size={24} className="text-pink-400" />
        </div>
        <p className="font-semibold text-gray-700">No subscribers yet</p>
        <p className="text-sm text-gray-400">Newsletter subscribers will appear here</p>
      </div>
    )
  }

  const columns: Column[] = [
    {
      key: 'email', label: 'Email', sortable: true,
      render: s => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-[11px] font-black shrink-0">
            {s.email[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-800">{s.email}</span>
        </div>
      ),
    },
    {
      key: 'whatsapp', label: 'WhatsApp',
      render: s => s.whatsapp
        ? <span className="text-sm text-gray-500">{s.whatsapp}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: s => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          s.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {s.isActive ? 'Active' : 'Unsubscribed'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Subscribed', sortable: true,
      render: s => (
        <span className="text-xs text-gray-400">
          {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ]

  const exportBtn = (
    <button
      onClick={exportCSV}
      className="flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
    >
      <FiDownload size={13} /> Export CSV
    </button>
  )

  return (
    <AdminTable
      data={subscribers}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Active', false: 'Unsubscribed' }}
      searchKeys={['email', 'whatsapp']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No subscribers yet"
      toolbarRight={exportBtn}
    />
  )
}
