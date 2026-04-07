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

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const adminUser = await getAuthUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      package: { select: { title: true, slug: true, images: true } },
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
  // Always prefer customer_token for customer actions regardless of admin cookie
  const customerToken = req.cookies.get('customer_token')?.value
  if (customerToken) {
    const payload = verifyToken(customerToken)
    if (payload) {
      const customer = await prisma.customer.findUnique({ where: { id: payload.userId }, select: { email: true } })

      const booking = await prisma.booking.findFirst({
        where: {
          id,
          OR: [
            { customerId: payload.userId },
            ...(customer ? [{ customerEmail: customer.email }] : []),
          ],
        },
        include: { package: { select: { title: true } } },
      })
      if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      // Auto-link customerId if missing
      if (!booking.customerId) {
        await prisma.booking.update({ where: { id }, data: { customerId: payload.userId } })
      }

      // Upload receipt
      if (action === 'upload_receipt' || body.receiptUrl) {
        const updated = await prisma.booking.update({
          where: { id },
          data: { receiptUrl: body.receiptUrl, receiptNote: body.receiptNote, status: 'RECEIPT_UPLOADED' },
        })
        try { await sendReceiptUploadedAdmin({ bookingRef: booking.bookingRef, customerName: booking.customerName, customerEmail: booking.customerEmail, receiptNote: body.receiptNote }) } catch {}
        return NextResponse.json(updated)
      }

      // Accept quote
      if (action === 'accept_quote') {
        if (booking.status !== 'AWAITING_CONFIRM') {
          return NextResponse.json({ error: `Cannot accept at status: ${booking.status}` }, { status: 400 })
        }
        const quote = booking.staffQuote as { totalPrice?: number } | null
        const updated = await prisma.booking.update({
          where: { id },
          data: { status: 'CONFIRMED', totalPrice: quote?.totalPrice ?? booking.totalPrice },
        })
        try {
          await sendBookingConfirmedToCustomer({ customerEmail: booking.customerEmail, customerName: booking.customerName, bookingRef: booking.bookingRef, title: booking.package.title, travelDate: booking.travelDate, totalPrice: updated.totalPrice })
          await sendCustomerConfirmedAdmin({ bookingRef: booking.bookingRef, customerName: booking.customerName, customerEmail: booking.customerEmail, totalPrice: updated.totalPrice })
        } catch {}
        return NextResponse.json(updated)
      }

      // Request changes
      if (action === 'request_changes') {
        const updated = await prisma.booking.update({
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
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { package: { select: { title: true } } },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Send quote to customer
  if (action === 'send_quote') {
    const { staffQuote, adminNotes } = body
    if (!staffQuote) return NextResponse.json({ error: 'staffQuote required' }, { status: 400 })

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        staffQuote,
        adminNotes: adminNotes ?? booking.adminNotes,
        status: 'AWAITING_CONFIRM',
        totalPrice: staffQuote.totalPrice ?? booking.totalPrice,
      },
      include: { package: { select: { title: true } } },
    })
    try {
      await sendQuoteToCustomer({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        bookingRef: booking.bookingRef,
        title: booking.package.title,
        travelDate: booking.travelDate,
        lineItems: staffQuote.lineItems ?? [],
        totalPrice: staffQuote.totalPrice,
        notes: staffQuote.notes,
        validUntil: staffQuote.validUntil,
      })
    } catch {}
    return NextResponse.json(updated)
  }

  // Upload ticket URL and mark MAIL_SENT
  if (action === 'upload_ticket') {
    const { ticketUrl } = body
    if (!ticketUrl) return NextResponse.json({ error: 'ticketUrl required' }, { status: 400 })

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ticketUrl,
        status: 'MAIL_SENT',
      },
    })
    try {
      await sendTicketToCustomer({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        bookingRef: booking.bookingRef,
        title: booking.package.title,
        travelDate: booking.travelDate,
        ticketUrl,
      })
    } catch {}
    return NextResponse.json(updated)
  }

  // Generic admin update
  const updated = await prisma.booking.update({
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
    include: { package: { select: { title: true } } },
  })
  return NextResponse.json(updated)
}
