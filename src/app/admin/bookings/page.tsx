export const dynamic = 'force-dynamic'

import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingsTable from './BookingsTable'
import { FiBookOpen, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi'

async function getBookings() {
  try {
    const [pkgBookings, tourBookings] = await Promise.all([
      prisma.booking.findMany({
        include: { package: { select: { title: true, slug: true, images: true } }, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourBooking.findMany({
        include: { tour: { select: { title: true, slug: true, images: true } }, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    const normalised = [
      ...pkgBookings.map((b) => ({ ...b, _type: 'package' as const, title: b.package.title, image: b.package.images?.[0] })),
      ...tourBookings.map((b) => ({ ...b, _type: 'tour' as const, title: (b as any).tour.title, image: (b as any).tour.images?.[0] })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return normalised
  } catch { return [] }
}

export default async function BookingsPage() {
  const bookings     = await getBookings()
  const paid         = bookings.filter((b) => b.paymentStatus === 'PAID')
  const totalRevenue = paid.reduce((sum, b) => sum + b.totalPrice, 0)
  const confirmed    = bookings.filter((b) => ['CONFIRMED', 'ALL_CONFIRMED', 'MAIL_SENT'].includes(b.status)).length
  const requested    = bookings.filter((b) => b.status === 'REQUESTED').length

  const STATS = [
    { label: 'Total Bookings', value: bookings.length,           Icon: FiBookOpen,    color: 'bg-blue-50 text-blue-600',    border: 'border-blue-100' },
    { label: 'Requested',      value: requested,                 Icon: FiClock,       color: 'bg-amber-50 text-amber-600',  border: 'border-amber-100' },
    { label: 'Confirmed',      value: confirmed,                 Icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Total Revenue',  value: `LKR ${(totalRevenue / 1000).toFixed(0)}k`, Icon: FiDollarSign, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
  ]

  return (
    <AdminShell
      title="Bookings"
      subtitle={`${bookings.length} total · LKR ${(totalRevenue / 1000).toFixed(0)}k revenue`}
    >
      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{s.value}</p>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <BookingsTable bookings={bookings as any} />
    </AdminShell>
  )
}
