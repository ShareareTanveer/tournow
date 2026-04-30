import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { onPaymentReceived } from '@/lib/notifications'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

// Called after Stripe payment completes on the client, to sync DB
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paymentIntentId, bookingId, bookingType } = await req.json()
    if (!paymentIntentId || !bookingId) {
      return NextResponse.json({ error: 'paymentIntentId and bookingId required' }, { status: 400 })
    }

    // Verify payment intent with Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Verify booking belongs to this customer
    if (bookingType === 'tour') {
      const booking = await prisma.tourBooking.findFirst({ where: { id: bookingId, customerId: payload.userId } })
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      await prisma.tourBooking.update({ where: { id: bookingId }, data: { paymentStatus: 'PAID', status: 'ALL_CONFIRMED' } })
    } else {
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, customerId: payload.userId },
        include: { package: { select: { title: true } } },
      })
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

      await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: 'PAID', status: 'ALL_CONFIRMED' } })

      // Upsert payment record
      const existing = await prisma.payment.findFirst({ where: { stripeId: pi.id } })
      if (!existing) {
        await prisma.payment.create({
          data: {
            bookingId,
            amount: booking.totalPrice,
            method: 'STRIPE',
            stripeId: pi.id,
            status: 'PAID',
            paidAt: new Date(),
          },
        })
      } else {
        await prisma.payment.update({ where: { id: existing.id }, data: { status: 'PAID', paidAt: new Date() } })
      }

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
