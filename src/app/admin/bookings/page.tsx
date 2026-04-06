import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingsTable from './BookingsTable'

async function getBookings() {
  try {
    return await prisma.booking.findMany({
      include: { package: { select: { title: true } }, payments: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch { return [] }
}

export default async function BookingsPage() {
  const bookings = await getBookings()
  const totalRevenue = bookings.filter((b) => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <AdminShell title="Bookings">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bookings', value: bookings.length },
          { label: 'Confirmed', value: bookings.filter((b) => b.status === 'CONFIRMED').length },
          { label: 'Pending', value: bookings.filter((b) => b.status === 'PENDING').length },
          { label: 'Total Revenue', value: `LKR ${(totalRevenue / 1000).toFixed(0)}k` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-orange-500">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <BookingsTable bookings={bookings} />
    </AdminShell>
  )
}
