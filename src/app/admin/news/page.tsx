import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiPlus } from 'react-icons/fi'

async function getNews() {
  try { return await prisma.news.findMany({ orderBy: { publishedAt: 'desc' } }) }
  catch { return [] }
}

export default async function NewsAdminPage() {
  const news = await getNews()
  return (
    <AdminShell title="News">
      <div className="flex justify-end mb-5">
        <Link href="/admin/news/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"><FiPlus size={15} /> Add News</Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Source', 'Status', 'Published', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {news.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No news articles yet</td></tr>}
            {news.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800 max-w-[300px] truncate">{n.title}</td>
                <td className="px-5 py-3 text-gray-500">{n.source ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${n.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {n.isActive ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(n.publishedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 flex gap-3">
                  <Link href={`/admin/news/${n.slug}`} className="text-orange-500 hover:underline text-xs font-medium">Edit</Link>
                  <DeleteBtn url={`/api/news/${n.slug}`} label="Delete" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
