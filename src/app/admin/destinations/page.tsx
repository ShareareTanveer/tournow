import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiPlus } from 'react-icons/fi'

async function getDestinations() {
  try { return await prisma.destination.findMany({ orderBy: { name: 'asc' } }) }
  catch { return [] }
}

export default async function DestinationsAdminPage() {
  const destinations = await getDestinations()
  return (
    <AdminShell title="Destinations">
      <div className="flex justify-end mb-5">
        <Link href="/admin/destinations/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"><FiPlus size={15} /> Add Destination</Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Region', 'Country', 'Cost Level', 'Featured', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {destinations.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No destinations yet</td></tr>}
            {destinations.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{d.name}</td>
                <td className="px-5 py-3 text-gray-500">{d.region}</td>
                <td className="px-5 py-3 text-gray-500">{d.country}</td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{d.costLevel ?? '—'}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.isFeatured ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                    {d.isFeatured ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {d.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-3 flex gap-3">
                  <Link href={`/admin/destinations/${d.slug}`} className="text-orange-500 hover:underline text-xs font-medium">Edit</Link>
                  <DeleteBtn url={`/api/destinations/${d.slug}`} label="Delete" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
