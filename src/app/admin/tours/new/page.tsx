import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import TourForm from '../TourForm'

export const metadata = { title: 'New Tour' }

export default async function NewTourPage() {
  const [destinations, suppliers] = await Promise.all([
    prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, region: true },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, phone: true, whatsappNumber: true },
    }).catch(() => []),
  ])

  return (
    <AdminShell title="Add New Tour">
      <TourForm destinations={destinations} suppliers={suppliers} />
    </AdminShell>
  )
}
