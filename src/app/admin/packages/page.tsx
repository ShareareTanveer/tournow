import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FiPlus } from 'react-icons/fi'
import PackagesClient from './PackagesClient'

async function getPackages() {
  try {
    return await prisma.package.findMany({
      include: { destination: { select: { name: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })
  } catch { return [] }
}

export default async function PackagesAdminPage() {
  const packages = await getPackages()
  const active   = packages.filter(p => p.isActive).length
  const featured = packages.filter(p => p.isFeatured).length

  return (
    <AdminShell
      title="Packages"
      subtitle={`${packages.length} total · ${active} active · ${featured} featured`}
      actions={
        <Link href="/admin/packages/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
          <FiPlus size={15} /> Add Package
        </Link>
      }
    >
      <PackagesClient packages={packages as any} />
    </AdminShell>
  )
}
