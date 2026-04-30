import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import ToursClient from './ToursClient'

export const metadata = { title: 'Tours' }

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    include: { primaryDestination: { select: { name: true } } },
  })

  const active   = tours.filter(t => t.isActive).length
  const featured = tours.filter(t => t.isFeatured).length

  return (
    <AdminShell
      title="Tours"
      subtitle={`${tours.length} total · ${active} active · ${featured} featured`}
      actions={
        <Link href="/admin/tours/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-sky-200">
          <FiPlus size={15} /> Add Tour
        </Link>
      }
    >
      <ToursClient tours={tours as any} />
    </AdminShell>
  )
}
