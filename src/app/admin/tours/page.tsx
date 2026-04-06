import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiGlobe, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi'

export const metadata = { title: 'Tours' }

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    include: { primaryDestination: { select: { name: true } } },
  })

  return (
    <AdminShell title="Tours">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{tours.length} tour{tours.length !== 1 ? 's' : ''}</p>
          <Link href="/admin/tours/new"
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <FiPlus size={14} /> Add Tour
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tour', 'Region', 'Destinations', 'Duration', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tours.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    No tours yet.{' '}
                    <Link href="/admin/tours/new" className="text-sky-500 hover:underline font-medium">Add the first one</Link>
                  </td>
                </tr>
              )}
              {tours.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.primaryDestination.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 px-2 py-1 rounded-full">
                      <FiGlobe size={10} /> {t.region}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {t.multiDestinations.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <FiMapPin size={10} />
                        {t.multiDestinations.slice(0, 3).join(', ')}
                        {t.multiDestinations.length > 3 ? ` +${t.multiDestinations.length - 3}` : ''}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{t.duration}D / {t.nights}N</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800">
                    LKR {t.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {t.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
                      {t.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/tours/${t.slug}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-500 hover:text-sky-600 hover:underline">
                      <FiEdit2 size={13} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
