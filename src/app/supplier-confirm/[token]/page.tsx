import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ token: string }> }

export default async function SupplierConfirmPage({ params }: Props) {
  const { token } = await params
  let title = ''
  let bookingRef = ''

  const pkgBooking = await prisma.booking.findFirst({
    where: { supplierConfirmToken: token },
    include: { package: { select: { title: true } } },
  })

  if (pkgBooking) {
    const updated = await prisma.booking.update({
      where: { id: pkgBooking.id },
      data: { status: 'SUPPLIER_CONFIRMED' },
      include: { package: { select: { title: true } } },
    })
    title = updated.package.title
    bookingRef = updated.bookingRef
  } else {
    const tourBooking = await prisma.tourBooking.findFirst({
      where: { supplierConfirmToken: token },
      include: { tour: { select: { title: true } } },
    })

    if (tourBooking) {
      const updated = await prisma.tourBooking.update({
        where: { id: tourBooking.id },
        data: { status: 'SUPPLIER_CONFIRMED' },
        include: { tour: { select: { title: true } } },
      })
      title = updated.tour.title
      bookingRef = updated.bookingRef
    }
  }

  const found = Boolean(bookingRef)

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${found ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {found ? 'OK' : '!'}
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {found ? 'Supplier Confirmed' : 'Invalid Confirmation Link'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          {found
            ? `Availability has been confirmed for ${title} booking #${bookingRef.slice(-10).toUpperCase()}.`
            : 'This confirmation link is invalid or no longer available.'}
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Close
        </Link>
      </div>
    </main>
  )
}
