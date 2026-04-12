import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingCalendar from './BookingCalendar'

async function getCalendarBookings() {
  try {
    const [pkgBookings, tourBookings] = await Promise.all([
      prisma.booking.findMany({
        select: {
          id: true,
          bookingRef: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          travelDate: true,
          status: true,
          paymentStatus: true,
          paxAdult: true,
          paxChild: true,
          totalPrice: true,
          createdAt: true,
          customerNote: true,
          package: { select: { title: true, images: true } },
        },
        orderBy: { travelDate: 'asc' },
      }),
      prisma.tourBooking.findMany({
        select: {
          id: true,
          bookingRef: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          travelDate: true,
          status: true,
          paymentStatus: true,
          paxAdult: true,
          paxChild: true,
          totalPrice: true,
          createdAt: true,
          customerNote: true,
          tour: { select: { title: true, images: true } },
        },
        orderBy: { travelDate: 'asc' },
      }),
    ])

    return [
      ...pkgBookings.map(b => ({
        id:            b.id,
        bookingRef:    b.bookingRef,
        customerName:  b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        travelDate:    b.travelDate.toISOString(),
        status:        b.status,
        paymentStatus: b.paymentStatus,
        paxAdult:      b.paxAdult,
        paxChild:      b.paxChild,
        totalPrice:    b.totalPrice,
        createdAt:     b.createdAt.toISOString(),
        customerNote:  b.customerNote ?? null,
        title:         b.package.title,
        image:         b.package.images?.[0] ?? null,
        _type:         'package' as const,
      })),
      ...tourBookings.map(b => ({
        id:            b.id,
        bookingRef:    b.bookingRef,
        customerName:  b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        travelDate:    b.travelDate.toISOString(),
        status:        b.status,
        paymentStatus: b.paymentStatus,
        paxAdult:      b.paxAdult,
        paxChild:      b.paxChild,
        totalPrice:    b.totalPrice,
        createdAt:     b.createdAt.toISOString(),
        customerNote:  b.customerNote ?? null,
        title:         (b as any).tour.title,
        image:         (b as any).tour.images?.[0] ?? null,
        _type:         'tour' as const,
      })),
    ].sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
  } catch { return [] }
}

export default async function CalendarPage() {
  const bookings = await getCalendarBookings()

  return (
    <AdminShell title="Booking Calendar" subtitle="Travel dates across all bookings">
      <BookingCalendar bookings={bookings} />
    </AdminShell>
  )
}
