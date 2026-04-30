import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import TourForm from '../TourForm'

export const metadata = { title: 'New Tour' }

export default async function NewTourPage() {
  const destinations = await prisma.destination.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, region: true },
  })

  return (
    <AdminShell title="Add New Tour">
      <TourForm destinations={destinations} />
    </AdminShell>
  )
}
