export const dynamic = 'force-dynamic'

import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import InquiriesTable from './InquiriesTable'

async function getData() {
  try {
    const [inquiries, staff] = await Promise.all([
      prisma.inquiry.findMany({
        include: { package: { select: { title: true, slug: true } }, assignedTo: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({ select: { id: true, name: true } }),
    ])
    return { inquiries, staff }
  } catch { return { inquiries: [], staff: [] } }
}

export default async function InquiriesPage() {
  const { inquiries, staff } = await getData()
  const newCount  = inquiries.filter((i: any) => i.status === 'NEW').length
  const total     = inquiries.length

  return (
    <AdminShell
      title="Inquiries"
      subtitle={`${total} total · ${newCount} new`}
    >
      <InquiriesTable inquiries={inquiries} staff={staff} />
    </AdminShell>
  )
}
