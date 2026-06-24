import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import PackageForm from '../PackageForm'

async function getDestinations() {
  try { return await prisma.destination.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }) }
  catch { return [] }
}

export default async function NewPackagePage() {
  const [destinations, suppliers] = await Promise.all([
    getDestinations(),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, phone: true, whatsappNumber: true },
    }).catch(() => []),
  ])
  return (
    <AdminShell title="Add New Package">
      <PackageForm destinations={destinations} suppliers={suppliers} />
    </AdminShell>
  )
}
