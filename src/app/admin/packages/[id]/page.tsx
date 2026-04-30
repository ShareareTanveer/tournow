import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PackageForm from '../PackageForm'

type Props = { params: Promise<{ id: string }> }

async function getData(id: string) {
  try {
    const [pkg, destinations] = await Promise.all([
      prisma.package.findUnique({ where: { id }, include: { itinerary: { orderBy: { dayNumber: 'asc' } } } }),
      prisma.destination.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ])
    return { pkg, destinations }
  } catch { return { pkg: null, destinations: [] } }
}

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params
  const { pkg, destinations } = await getData(id)
  if (!pkg) notFound()
  return (
    <AdminShell title={`Edit: ${pkg.title}`}>
      <PackageForm destinations={destinations} pkg={pkg} />
    </AdminShell>
  )
}
