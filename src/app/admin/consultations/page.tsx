export const dynamic = 'force-dynamic'

import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import ConsultationsTable from './ConsultationsTable'

async function getData() {
  try {
    const [consultations, staff] = await Promise.all([
      prisma.consultation.findMany({
        include: { assignedConsultant: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({ select: { id: true, name: true } }),
    ])
    return { consultations, staff }
  } catch { return { consultations: [], staff: [] } }
}

export default async function ConsultationsPage() {
  const { consultations, staff } = await getData()
  const pending   = consultations.filter(c => c.status === 'PENDING').length
  const scheduled = consultations.filter(c => c.status === 'SCHEDULED').length

  return (
    <AdminShell
      title="Consultations"
      subtitle={`${consultations.length} total · ${pending} pending · ${scheduled} scheduled`}
    >
      <ConsultationsTable consultations={consultations} staff={staff} />
    </AdminShell>
  )
}
