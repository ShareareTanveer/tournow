import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getCustomizations() {
  try {
    return await prisma.tourCustomization.findMany({
      include: { tour: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  } catch { return [] }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEWED: 'bg-blue-100 text-blue-700',
  QUOTED: 'bg-purple-100 text-purple-700',
  CONFIRMED: 'bg-green-100 text-green-700',
}

export default async function CustomizationsPage() {
  const items = await getCustomizations()
  return (
    <AdminShell title="Tour Customization Requests">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Customer', 'Package', 'Travel Date', 'Pax', 'Budget', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No customization requests yet</td></tr>
            )}
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{item.customerName}</p>
                  <p className="text-xs text-gray-400">{item.customerEmail}</p>
                </td>
                <td className="px-5 py-3 text-gray-600">{item.package?.title ?? '—'}</td>
                <td className="px-5 py-3 text-gray-500">
                  {item.travelDate ? new Date(item.travelDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3 text-gray-600">{item.paxCount}</td>
                <td className="px-5 py-3 text-gray-600">
                  {item.budget ? `LKR ${item.budget.toLocaleString()}` : '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
