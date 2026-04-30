import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { onPaymentReceived } from '@/lib/notifications'

async function getPayPalAccessToken(): Promise<string> {
  const base = process.env.PAYPAL_BASE_URL!
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, bookingId, bookingType } = await req.json()
    if (!orderId || !bookingId) return NextResponse.json({ error: 'orderId and bookingId required' }, { status: 400 })

    const accessToken = await getPayPalAccessToken()
    const base = process.env.PAYPAL_BASE_URL!

    const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const capture = await res.json()
    if (!res.ok || capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: capture.message ?? 'Capture failed' }, { status: 500 })
    }

    // Mark booking as paid — online payment skips manual receipt review
    if (bookingType === 'tour') {
      const booking = await prisma.tourBooking.findFirst({ where: { id: bookingId, customerId: payload.userId } })
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      await prisma.tourBooking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'PAID', status: 'ALL_CONFIRMED' },
      })
    } else {
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, customerId: payload.userId },
        include: { package: { select: { title: true } } },
      })
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'PAID', status: 'ALL_CONFIRMED' },
      })

      // Create payment record
      const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0]
      await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalPrice,
          method: 'PAYPAL',
          reference: captureUnit?.id ?? orderId,
          status: 'PAID',
          paidAt: new Date(),
        },
      })

      onPaymentReceived({
        bookingId,
        customerId: booking.customerId,
        amount: booking.totalPrice,
        packageTitle: (booking as any).package?.title ?? '',
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
