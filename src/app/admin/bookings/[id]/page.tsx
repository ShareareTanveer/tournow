import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingDetailClient from './BookingDetailClient'

type Params = { params: Promise<{ id: string }> }

async function getBooking(id: string) {
  // Try package booking first
  const pkg = await prisma.booking.findUnique({
    where: { id },
    include: {
      package: { select: { id: true, title: true, slug: true, images: true, price: true, priceTwin: true, priceChild: true, extraNightPrice: true, options: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      payments: true,
    },
  })
  if (pkg) return { booking: pkg, type: 'package' as const }

  // Try tour booking
  const tour = await prisma.tourBooking.findUnique({
    where: { id },
    include: {
      tour: { select: { id: true, title: true, slug: true, images: true, price: true, priceTwin: true, priceChild: true, extraNightPrice: true, options: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      payments: true,
    },
  })
  if (tour) return { booking: tour, type: 'tour' as const }

  return null
}

export default async function BookingDetailPage({ params }: Params) {
  const { id } = await params
  const result = await getBooking(id)
  if (!result) notFound()

  const { booking, type } = result
  const title = type === 'package'
    ? (booking as any).package.title
    : (booking as any).tour.title

  return (
    <AdminShell title={`Booking — ${(booking as any).bookingRef.slice(-8).toUpperCase()}`}>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/bookings" className="text-sm text-gray-400 hover:text-gray-600 font-medium">← All Bookings</Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600 font-semibold">{title}</span>
      </div>
      <BookingDetailClient booking={booking as any} type={type} />
    </AdminShell>
  )
}
