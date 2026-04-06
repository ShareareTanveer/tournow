import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiPlus } from 'react-icons/fi'

async function getVisas() {
  try { return await prisma.visaService.findMany({ orderBy: { country: 'asc' } }) }
  catch { return [] }
}

export default async function VisasAdminPage() {
  const visas = await getVisas()
  return (
    <AdminShell title="Visa Services">
      <div className="flex justify-end mb-5">
        <Link href="/admin/visas/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"><FiPlus size={15} /> Add Visa Service</Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Country', 'Type', 'Processing', 'Fee (LKR)', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visas.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No visa services yet</td></tr>}
            {visas.map((v:any) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{v.country}</td>
                <td className="px-5 py-3"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{v.visaType}</span></td>
                <td className="px-5 py-3 text-gray-500">{v.processingTime ?? '—'}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">{v.fee ? `LKR ${v.fee.toLocaleString()}` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {v.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-3 flex gap-3">
                  <Link href={`/admin/visas/${v.slug}`} className="text-orange-500 hover:underline text-xs font-medium">Edit</Link>
                  <DeleteBtn url={`/api/visas/${v.slug}`} label="Delete" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
