import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getPackages() {
  try {
    return await prisma.package.findMany({
      include: { destination: { select: { name: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })
  } catch { return [] }
}

const STAR_MAP: Record<string, string> = { THREE: '3★', FOUR: '4★', FIVE: '5★' }

export default async function PackagesAdminPage() {
  const packages = await getPackages()

  return (
    <AdminShell title="Packages">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{packages.length} packages total</p>
        <Link href="/admin/packages/new"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Package
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Category', 'Destination', 'Price', 'Duration', 'Stars', 'Featured', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {packages.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-400">No packages yet. <Link href="/admin/packages/new" className="text-orange-500 underline">Add your first package →</Link></td></tr>
            )}
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800 max-w-[200px] truncate">{pkg.title}</td>
                <td className="px-5 py-3"><span className="capitalize text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{pkg.category.toLowerCase()}</span></td>
                <td className="px-5 py-3 text-gray-500">{(pkg as any).destination?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-800 font-medium">LKR {pkg.price.toLocaleString()}</td>
                <td className="px-5 py-3 text-gray-500">{pkg.duration}D/{pkg.nights}N</td>
                <td className="px-5 py-3 text-yellow-500">{STAR_MAP[pkg.starRating]}</td>
                <td className="px-5 py-3">{pkg.isFeatured ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-300">No</span>}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/admin/packages/${pkg.id}`} className="text-orange-500 hover:underline text-xs font-medium mr-3">Edit</Link>
                  <Link href={`/packages/${pkg.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600 text-xs">View↗</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
