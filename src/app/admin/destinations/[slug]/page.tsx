import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DestinationForm from '../DestinationForm'
import Link from 'next/link'
import { FiLayout } from 'react-icons/fi'

type Props = { params: Promise<{ slug: string }> }

export default async function EditDestinationPage({ params }: Props) {
  const { slug } = await params
  const destination = await prisma.destination.findUnique({ where: { slug } }).catch(() => null)
  if (!destination) notFound()
  return (
    <AdminShell
      title="Edit Destination"
      actions={
        <Link
          href={`/admin/destinations/${destination.slug}/builder`}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <FiLayout size={14} /> Open Page Builder
        </Link>
      }
    >
      <DestinationForm destination={destination} />
    </AdminShell>
  )
}
