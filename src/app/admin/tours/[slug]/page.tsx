import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TourForm from '../TourForm'

type Props = { params: Promise<{ slug: string }> }

export const metadata = { title: 'Edit Tour' }

export default async function EditTourPage({ params }: Props) {
  const { slug } = await params

  const [tour, destinations] = await Promise.all([
    prisma.tour.findUnique({ where: { slug } }).catch(() => null),
    prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, region: true },
    }),
  ])

  if (!tour) notFound()

  return (
    <AdminShell title="Edit Tour">
      <TourForm tour={tour} destinations={destinations} />
    </AdminShell>
  )
}
