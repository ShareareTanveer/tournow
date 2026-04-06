import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StaffForm from '../StaffForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditStaffPage({ params }: Props) {
  const { id } = await params
  const member = await prisma.staff.findUnique({ where: { id } }).catch(() => null)
  if (!member) notFound()
  return (
    <AdminShell title="Edit Staff Member">
      <StaffForm member={member} />
    </AdminShell>
  )
}
