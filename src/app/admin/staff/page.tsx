import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import StaffClient from './StaffClient'

async function getStaff() {
  try { return await prisma.staff.findMany({ orderBy: { name: 'asc' } }) }
  catch { return [] }
}

export default async function StaffAdminPage() {
  const staff  = await getStaff()
  const active = staff.filter((s: any) => s.isActive).length

  return (
    <AdminShell
      title="Staff"
      subtitle={`${staff.length} members · ${active} active`}
      actions={
        <Link href="/admin/staff/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
          <FiPlus size={15} /> Add Staff
        </Link>
      }
    >
      <StaffClient staff={staff as any} />
    </AdminShell>
  )
}
