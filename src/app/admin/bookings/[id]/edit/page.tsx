import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingEditClient from './BookingEditClient'

type Params = { params: Promise<{ id: string }> }

async function getBooking(id: string) {
  const pkg = await prisma.booking.findUnique({
    where: { id },
    include: {
      package: { select: { id: true, title: true, slug: true, images: true, price: true, priceTwin: true, priceChild: true, extraNightPrice: true, options: true } },
    },
  })
  if (pkg) return { booking: pkg, type: 'package' as const }

  const tour = await prisma.tourBooking.findUnique({
    where: { id },
    include: {
      tour: { select: { id: true, title: true, slug: true, images: true, price: true, priceTwin: true, priceChild: true, extraNightPrice: true, options: true } },
    },
  })
  if (tour) return { booking: tour, type: 'tour' as const }

  return null
}

export default async function BookingEditPage({ params }: Params) {
  const { id } = await params
  const result = await getBooking(id)
  if (!result) notFound()

  const { booking, type } = result
  const ref = (booking as any).bookingRef.slice(-8).toUpperCase()

  return (
    <AdminShell title={`Edit Quote — ${ref}`}>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Link href="/admin/bookings" className="text-sm text-gray-400 hover:text-gray-600 font-medium">← All Bookings</Link>
        <span className="text-gray-200">/</span>
        <Link href={`/admin/bookings/${id}`} className="text-sm text-gray-400 hover:text-gray-600 font-medium">Booking {ref}</Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600 font-semibold">Edit Quote</span>
      </div>
      <BookingEditClient booking={booking as any} type={type} />
    </AdminShell>
  )
}
