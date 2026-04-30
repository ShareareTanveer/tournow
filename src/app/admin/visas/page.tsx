import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import VisasClient from './VisasClient'

async function getVisas() {
  try { return await prisma.visaService.findMany({ orderBy: { country: 'asc' } }) }
  catch { return [] }
}

export default async function VisasAdminPage() {
  const visas  = await getVisas()
  const active = visas.filter((v: any) => v.isActive).length

  return (
    <AdminShell
      title="Visa Services"
      subtitle={`${visas.length} services · ${active} active`}
      actions={
        <Link href="/admin/visas/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
          <FiPlus size={15} /> Add Visa Service
        </Link>
      }
    >
      <VisasClient visas={visas as any} />
    </AdminShell>
  )
}
