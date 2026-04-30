import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import DestinationsClient from './DestinationsClient'

async function getDestinations() {
  try { return await prisma.destination.findMany({ orderBy: { name: 'asc' } }) }
  catch { return [] }
}

export default async function DestinationsAdminPage() {
  const destinations = await getDestinations()
  const active   = destinations.filter(d => d.isActive).length
  const featured = destinations.filter(d => d.isFeatured).length

  return (
    <AdminShell
      title="Destinations"
      subtitle={`${destinations.length} total · ${active} active · ${featured} featured`}
      actions={
        <Link href="/admin/destinations/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
          <FiPlus size={15} /> Add Destination
        </Link>
      }
    >
      <DestinationsClient destinations={destinations as any} />
    </AdminShell>
  )
}
