'use client'

import Link from 'next/link'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiEdit2, FiExternalLink, FiClock, FiEye, FiEyeOff } from 'react-icons/fi'

interface Blog {
  id: string; slug: string; title: string; category: string
  author: string; readingTime: number; isActive: boolean; publishedAt: string | Date
}

export default function BlogsClient({ blogs }: { blogs: Blog[] }) {
  const columns: Column<Blog>[] = [
    {
      key: 'title', label: 'Title', sortable: true,
      render: b => (
        <div>
          <p className="font-semibold text-gray-800 leading-tight line-clamp-1 max-w-64">{b.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">/{b.slug}</p>
        </div>
      ),
    },
    {
      key: 'category', label: 'Category', sortable: true,
      render: b => (
        <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
          {b.category}
        </span>
      ),
    },
    {
      key: 'author', label: 'Author', sortable: true,
      render: b => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-black shrink-0">
            {b.author?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm text-gray-600">{b.author}</span>
        </div>
      ),
    },
    {
      key: 'readingTime', label: 'Read Time', sortable: true,
      render: b => (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <FiClock size={11} /> {b.readingTime} min
        </span>
      ),
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: b => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          b.isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-amber-50 text-amber-600 border border-amber-100'
        }`}>
          {b.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {b.isActive ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'publishedAt', label: 'Published', sortable: true,
      render: b => (
        <span className="text-xs text-gray-400">
          {new Date(b.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: b => (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/blogs/${b.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
            <FiEdit2 size={12} /> Edit
          </Link>
          <Link href={`/blog/${b.slug}`} target="_blank"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiExternalLink size={13} />
          </Link>
          <DeleteBtn url={`/api/blogs/${b.slug}`} label="Delete" />
        </div>
      ),
    },
  ]

  return (
    <AdminTable
      data={blogs}
      columns={columns}
      filterKey="isActive"
      filterOptions={['ALL', 'true', 'false']}
      filterLabels={{ ALL: 'All', true: 'Published', false: 'Drafts' }}
      searchKeys={['title', 'slug', 'category', 'author']}
      defaultSort={{ key: 'publishedAt', dir: 'desc' }}
      emptyMessage="No blog posts yet"
    />
  )
}
