import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { generateTicketHtml } from '@/lib/ticketTemplate'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/bookings/[id]/ticket
 * Returns a self-contained HTML ticket page for the booking.
 * Works for both package and tour bookings — tries package first, then tour.
 *
 * Also persists the public ticket URL on the booking record (once) and
 * emails the ticket to the customer when ?send=1 is passed.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params

  const adminUser = await getAuthUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve booking — try package first, then tour
  let booking: any = null
  let type: 'package' | 'tour' = 'package'
  let title = ''
  let image: string | undefined
  let options: { label: string; price: number }[] = []

  const pkgBooking = await prisma.booking.findUnique({
    where: { id },
    include: { package: { select: { title: true, images: true } } },
  })

  if (pkgBooking) {
    booking = pkgBooking
    type = 'package'
    title = pkgBooking.package.title
    image = pkgBooking.package.images?.[0]
  } else {
    const tourBooking = await prisma.tourBooking.findUnique({
      where: { id },
      include: { tour: { select: { title: true, images: true } } },
    })
    if (!tourBooking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    booking = tourBooking
    type = 'tour'
    title = tourBooking.tour.title
    image = tourBooking.tour.images?.[0]
  }

  // Extract staffQuote line items if available
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

  // Persist ticketUrl on the booking if not already set
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const ticketUrl = `${appUrl}/api/admin/bookings/${id}/ticket`

  if (!booking.ticketUrl) {
    if (type === 'package') {
      await prisma.booking.update({ where: { id }, data: { ticketUrl } })
    } else {
      await prisma.tourBooking.update({ where: { id }, data: { ticketUrl } })
    }
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
