import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import CustomizationsClient from './CustomizationsClient'

async function getCustomizations() {
  try {
    return await prisma.tourCustomization.findMany({
      include: { tour: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } catch { return [] }
}

export default async function CustomizationsPage() {
  const items   = await getCustomizations()
  const pending = items.filter((i: any) => i.status === 'PENDING').length

  return (
    <AdminShell
      title="Tour Customization Requests"
      subtitle={`${items.length} requests · ${pending} pending`}
    >
      <CustomizationsClient items={items as any} />
    </AdminShell>
  )
}
