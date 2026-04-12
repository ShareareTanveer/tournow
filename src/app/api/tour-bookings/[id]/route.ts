import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, verifyToken } from '@/lib/auth'
import {
  sendQuoteToCustomer,
  sendCustomerConfirmedAdmin,
  sendBookingConfirmedToCustomer,
  sendReceiptUploadedAdmin,
  sendTicketToCustomer,
} from '@/lib/email'
import { onBookingStatusChange, onPaymentReceived } from '@/lib/notifications'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const adminUser = await getAuthUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.tourBooking.findUnique({
    where: { id },
    include: {
      tour: { select: { title: true, slug: true, images: true } },
      payments: true,
    },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(booking)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { action } = body

  // ── Customer actions — check customer_token FIRST before admin ───────────
  const customerToken = req.cookies.get('customer_token')?.value
  if (customerToken) {
    const payload = verifyToken(customerToken)
    if (payload) {
      const customer = await prisma.customer.findUnique({ where: { id: payload.userId }, select: { email: true, id: true } })
      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 401 })

      const booking = await prisma.tourBooking.findFirst({
        where: {
          id,
          OR: [
            { customerId: payload.userId },
            { customerId: customer.id },
            { customerEmail: customer.email },
          ],
        },
        include: { tour: { select: { title: true } } },
      })
      if (!booking) return NextResponse.json({ error: 'Booking not found for this customer' }, { status: 404 })

      if (!booking.customerId) {
        await prisma.tourBooking.update({ where: { id }, data: { customerId: payload.userId } })
      }

      // Resolved customer ID — use payload.userId since booking.customerId may be stale null
      const resolvedCustomerId = booking.customerId ?? payload.userId

      if (action === 'upload_receipt' || body.receiptUrl) {
        const updated = await prisma.tourBooking.update({
          where: { id },
          data: { receiptUrl: body.receiptUrl, receiptNote: body.receiptNote, status: 'RECEIPT_UPLOADED' },
        })
        try {
          await sendReceiptUploadedAdmin({
            bookingRef: booking.bookingRef,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            receiptNote: body.receiptNote,
          })
        } catch {}
        onBookingStatusChange({
          bookingId: id,
          customerId: resolvedCustomerId,
          packageTitle: booking.tour.title,
          newStatus: 'RECEIPT_UPLOADED',
          triggeredBy: 'customer',
        }).catch(console.error)
        return NextResponse.json(updated)
      }

      if (action === 'accept_quote') {
        if (booking.status !== 'AWAITING_CONFIRM') {
          return NextResponse.json({ error: `Cannot accept at status: ${booking.status}` }, { status: 400 })
        }
        const quote = booking.staffQuote as { totalPrice?: number } | null
        const updated = await prisma.tourBooking.update({
          where: { id },
          data: { status: 'CONFIRMED', totalPrice: quote?.totalPrice ?? booking.totalPrice },
        })
        try {
          await sendBookingConfirmedToCustomer({
            customerEmail: booking.customerEmail,
            customerName: booking.customerName,
            bookingRef: booking.bookingRef,
            title: booking.tour.title,
            travelDate: booking.travelDate,
            totalPrice: updated.totalPrice,
          })
          await sendCustomerConfirmedAdmin({
            bookingRef: booking.bookingRef,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            totalPrice: updated.totalPrice,
          })
        } catch {}
        onBookingStatusChange({
          bookingId: id,
          customerId: resolvedCustomerId,
          packageTitle: booking.tour.title,
          newStatus: 'CONFIRMED',
          triggeredBy: 'customer',
        }).catch(console.error)
        return NextResponse.json(updated)
      }

      if (action === 'request_changes') {
        const updated = await prisma.tourBooking.update({
          where: { id },
          data: { status: 'REQUESTED', customerNote: body.customerNote ?? null },
        })
        return NextResponse.json(updated)
      }

      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  }

  const adminUser = await getAuthUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Admin actions ─────────────────────────────────────────────────────────
  const booking = await prisma.tourBooking.findUnique({
    where: { id },
    include: { tour: { select: { title: true } } },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'send_quote') {
    const { staffQuote, adminNotes } = body
    if (!staffQuote) return NextResponse.json({ error: 'staffQuote required' }, { status: 400 })

    const updated = await prisma.tourBooking.update({
      where: { id },
      data: {
        staffQuote,
        adminNotes: adminNotes ?? booking.adminNotes,
        status: 'AWAITING_CONFIRM',
        totalPrice: staffQuote.totalPrice ?? booking.totalPrice,
      },
    })
    try {
      await sendQuoteToCustomer({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        bookingRef: booking.bookingRef,
        title: booking.tour.title,
        travelDate: booking.travelDate,
        lineItems: staffQuote.lineItems ?? [],
        totalPrice: staffQuote.totalPrice,
        notes: staffQuote.notes,
        validUntil: staffQuote.validUntil,
      })
    } catch {}
    return NextResponse.json(updated)
  }

  if (action === 'upload_ticket') {
    const { ticketUrl } = body
    if (!ticketUrl) return NextResponse.json({ error: 'ticketUrl required' }, { status: 400 })

    const updated = await prisma.tourBooking.update({
      where: { id },
      data: { ticketUrl, status: 'MAIL_SENT' },
    })
    try {
      await sendTicketToCustomer({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        bookingRef: booking.bookingRef,
        title: booking.tour.title,
        travelDate: booking.travelDate,
        ticketUrl,
      })
    } catch {}
    return NextResponse.json(updated)
  }

  const updated = await prisma.tourBooking.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
      ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
      ...(body.staffQuote !== undefined && { staffQuote: body.staffQuote }),
      ...(body.discount !== undefined && { discount: body.discount }),
      ...(body.totalPrice !== undefined && { totalPrice: body.totalPrice }),
      ...(body.ticketUrl !== undefined && { ticketUrl: body.ticketUrl }),
    },
  })

  if (body.status && body.status !== booking.status) {
    onBookingStatusChange({
      bookingId: id,
      customerId: booking.customerId,
      packageTitle: booking.tour.title,
      newStatus: body.status,
      triggeredBy: 'admin',
    }).catch(console.error)
  }

  if (body.paymentStatus === 'PAID' && booking.paymentStatus !== 'PAID') {
    onPaymentReceived({
      bookingId: id,
      customerId: booking.customerId,
      amount: updated.totalPrice,
      packageTitle: booking.tour.title,
    }).catch(console.error)
  }

  return NextResponse.json(updated)
}
