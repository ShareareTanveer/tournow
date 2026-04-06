import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiPlus } from 'react-icons/fi'

async function getBlogs() {
  try { return await prisma.blog.findMany({ orderBy: { publishedAt: 'desc' }, select: { id: true, title: true, slug: true, category: true, author: true, readingTime: true, isActive: true, publishedAt: true } }) }
  catch { return [] }
}

export default async function BlogsAdminPage() {
  const blogs = await getBlogs()
  return (
    <AdminShell title="Blog Posts">
      <div className="flex justify-end mb-5">
        <Link href="/admin/blogs/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"><FiPlus size={15} /> Add Post</Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Category', 'Author', 'Read Time', 'Status', 'Published', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {blogs.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No blog posts yet</td></tr>}
            {blogs.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800 max-w-[250px] truncate">{b.title}</td>
                <td className="px-5 py-3"><span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{b.category}</span></td>
                <td className="px-5 py-3 text-gray-500">{b.author}</td>
                <td className="px-5 py-3 text-gray-500">{b.readingTime} min</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isActive ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(b.publishedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 flex gap-3">
                  <Link href={`/admin/blogs/${b.slug}`} className="text-orange-500 hover:underline text-xs font-medium">Edit</Link>
                  <DeleteBtn url={`/api/blogs/${b.slug}`} label="Delete" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
