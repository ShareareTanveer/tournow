import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PackageForm from '../PackageForm'

type Props = { params: Promise<{ id: string }> }

async function getData(id: string) {
  try {
    const [pkg, destinations, suppliers] = await Promise.all([
      prisma.package.findUnique({ where: { id }, include: { itinerary: { orderBy: { dayNumber: 'asc' } } } }),
      prisma.destination.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, phone: true, whatsappNumber: true },
      }),
    ])
    return { pkg, destinations, suppliers }
  } catch { return { pkg: null, destinations: [], suppliers: [] } }
}

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params
  const { pkg, destinations, suppliers } = await getData(id)
  if (!pkg) notFound()
  return (
    <AdminShell title={`Edit: ${pkg.title}`}>
      <PackageForm destinations={destinations} suppliers={suppliers} pkg={pkg} />
    </AdminShell>
  )
}
