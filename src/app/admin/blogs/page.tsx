import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import BlogsClient from './BlogsClient'

async function getBlogs() {
  try {
    return await prisma.blog.findMany({
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, category: true, author: true, readingTime: true, isActive: true, publishedAt: true },
    })
  } catch { return [] }
}

export default async function BlogsAdminPage() {
  const blogs     = await getBlogs()
  const published = blogs.filter(b => b.isActive).length
  const drafts    = blogs.filter(b => !b.isActive).length

  return (
    <AdminShell
      title="Blog Posts"
      subtitle={`${blogs.length} total · ${published} published · ${drafts} drafts`}
      actions={
        <Link href="/admin/blogs/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
          <FiPlus size={15} /> New Post
        </Link>
      }
    >
      <BlogsClient blogs={blogs as any} />
    </AdminShell>
  )
}
