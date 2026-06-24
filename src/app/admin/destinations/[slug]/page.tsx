import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DestinationForm from '../DestinationForm'

type Props = { params: Promise<{ slug: string }> }

export default async function EditDestinationPage({ params }: Props) {
  const { slug } = await params
  const destination = await prisma.destination.findUnique({ where: { slug } }).catch(() => null)
  if (!destination) notFound()
  return (
    <AdminShell title="Edit Destination">
      <DestinationForm destination={destination} />
    </AdminShell>
  )
}
