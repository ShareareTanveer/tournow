import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import NewsClient from './NewsClient'

async function getNews() {
  try { return await prisma.news.findMany({ orderBy: { publishedAt: 'desc' } }) }
  catch { return [] }
}

export default async function NewsAdminPage() {
  const news      = await getNews()
  const published = news.filter(n => n.isActive).length
  const hidden    = news.filter(n => !n.isActive).length

  return (
    <AdminShell
      title="News"
      subtitle={`${news.length} articles · ${published} published · ${hidden} hidden`}
      actions={
        <Link href="/admin/news/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-sky-200">
          <FiPlus size={15} /> Add Article
        </Link>
      }
    >
      <NewsClient news={news as any} />
    </AdminShell>
  )
}
