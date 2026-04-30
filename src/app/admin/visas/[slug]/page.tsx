import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VisaForm from '../VisaForm'

type Props = { params: Promise<{ slug: string }> }

export default async function EditVisaPage({ params }: Props) {
  const { slug } = await params
  const visa = await prisma.visaService.findUnique({ where: { slug } }).catch(() => null)
  if (!visa) notFound()
  return (
    <AdminShell title="Edit Visa Service">
      <VisaForm visa={visa} />
    </AdminShell>
  )
}
