import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateTicketHtml } from '@/lib/ticketTemplate'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/my/bookings/[id]/ticket
 * Customer-accessible ticket — same HTML as the admin route but verifies customer_token.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params

  const token = req.cookies.get('customer_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let booking: any = null
  let title = ''
  let image: string | undefined

  const pkgBooking = await prisma.booking.findFirst({
    where: { id, customerId: payload.userId },
    include: { package: { select: { title: true, images: true } } },
  })

  if (pkgBooking) {
    booking = pkgBooking
    title = pkgBooking.package.title
    image = pkgBooking.package.images?.[0]
  } else {
    const tourBooking = await prisma.tourBooking.findFirst({
      where: { id, customerId: payload.userId },
      include: { tour: { select: { title: true, images: true } } },
    })
    if (!tourBooking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    booking = tourBooking
    title = tourBooking.tour.title
    image = tourBooking.tour.images?.[0]
  }

  const quote = booking.staffQuote as { lineItems?: { label: string; price: number }[]; totalPrice?: number } | null
  const lineItems = quote?.lineItems ?? []

  const html = generateTicketHtml({
    bookingRef: booking.bookingRef,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    title,
    image,
    travelDate: booking.travelDate,
    returnDate: booking.returnDate,
    paxAdult: booking.paxAdult,
    paxChild: booking.paxChild,
    paxInfant: booking.paxInfant,
    rooms: booking.rooms as any,
    roomType: booking.roomType,
    lineItems,
    totalPrice: booking.totalPrice,
    currency: booking.currency ?? 'LKR',
    adminNotes: booking.adminNotes,
    issuedAt: new Date(),
  })

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
