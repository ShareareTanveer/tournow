import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import InquiriesTable from './InquiriesTable'

async function getData() {
  try {
    const [inquiries, staff, packages, tours] = await Promise.all([
      prisma.inquiry.findMany({
        include: { package: { select: { title: true } }, assignedTo: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({ select: { id: true, name: true } }),
      prisma.package.findMany({ where: { isActive: true }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      prisma.tour.findMany({ where: { isActive: true }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    ])
    return { inquiries, staff, packages, tours }
  } catch { return { inquiries: [], staff: [], packages: [], tours: [] } }
}

export default async function InquiriesPage() {
  const { inquiries, staff, packages, tours } = await getData()
  return (
    <AdminShell title="Inquiries">
      <div className="mb-4 flex gap-3 text-sm">
        {['ALL','NEW','CONTACTED','CONVERTED','CLOSED'].map((s) => (
          <span key={s} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium cursor-pointer hover:bg-orange-100 hover:text-orange-600 transition-colors">
            {s} {s !== 'ALL' ? `(${inquiries.filter((i: any) => i.status === s).length})` : `(${inquiries.length})`}
          </span>
        ))}
      </div>
      <InquiriesTable inquiries={inquiries} staff={staff} packages={packages} tours={tours} />
    </AdminShell>
  )
}
