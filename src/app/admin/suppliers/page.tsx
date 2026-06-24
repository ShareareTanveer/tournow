import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import SuppliersClient from './SuppliersClient'

export const metadata = { title: 'Suppliers' }

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      companyName: true,
      phone: true,
      whatsappNumber: true,
      email: true,
      imageUrl: true,
      notes: true,
      isActive: true,
    },
  }).catch(() => [])

  const active = suppliers.filter((supplier) => supplier.isActive).length

  return (
    <AdminShell title="Suppliers" subtitle={`${suppliers.length} total · ${active} active`}>
      <SuppliersClient suppliers={suppliers} />
    </AdminShell>
  )
}
