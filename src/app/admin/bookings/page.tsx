import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingsTable from './BookingsTable'

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

    // Normalise to unified shape
    const normalised = [
      ...pkgBookings.map((b) => ({ ...b, _type: 'package' as const, title: b.package.title, image: b.package.images?.[0] })),
      ...tourBookings.map((b) => ({ ...b, _type: 'tour' as const, title: (b as any).tour.title, image: (b as any).tour.images?.[0] })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return normalised
  } catch { return [] }
}

export default async function BookingsPage() {
  const bookings = await getBookings()
  const paid = bookings.filter((b) => b.paymentStatus === 'PAID')
  const totalRevenue = paid.reduce((sum, b) => sum + b.totalPrice, 0)

  const stats = [
    { label: 'Total', value: bookings.length, color: 'text-gray-800' },
    { label: 'Requested', value: bookings.filter((b) => b.status === 'REQUESTED').length, color: 'text-blue-600' },
    { label: 'Confirmed', value: bookings.filter((b) => ['CONFIRMED','ALL_CONFIRMED','MAIL_SENT'].includes(b.status)).length, color: 'text-green-600' },
    { label: 'Revenue', value: `LKR ${(totalRevenue / 1000).toFixed(0)}k`, color: 'text-orange-600' },
  ]

  return (
    <AdminShell title="Bookings">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <BookingsTable bookings={bookings as any} />
    </AdminShell>
  )
}
