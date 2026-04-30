'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiEdit2, FiExternalLink, FiEye, FiEyeOff } from 'react-icons/fi'

interface News {
  id: string; slug: string; title: string; source?: string | null
  isActive: boolean; publishedAt: string | Date
}

export default function NewsClient({ news }: { news: News[] }) {
  const columns: Column<News>[] = [
    {
      key: 'title', label: 'Title', sortable: true,
      render: n => (
        <div>
          <p className="font-semibold text-gray-800 leading-tight line-clamp-1 max-w-96">{n.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">/{n.slug}</p>
        </div>
      ),
    },
    {
      key: 'source', label: 'Source', sortable: true,
      render: n => n.source
        ? <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">{n.source}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: n => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          n.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {n.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {n.isActive ? 'Published' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'publishedAt', label: 'Published', sortable: true,
      render: n => (
        <span className="text-xs text-gray-400">
          {new Date(n.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: n => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/news/${n.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-sky-600 px-3 py-1.5 rounded-lg transition-colors">
            <FiEdit2 size={12} /> Edit
          </Link>
          <Link href={`/news/${n.slug}`} target="_blank"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiExternalLink size={13} />
          </Link>
          <DeleteBtn url={`/api/news/${n.slug}`} label="Delete" />
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={news}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Published', false: 'Hidden' }}
      searchKeys={['title', 'slug', 'source']}
      defaultSort={{ key: 'publishedAt', dir: 'desc' }}
      emptyMessage="No news articles yet"
    />
  )
}
