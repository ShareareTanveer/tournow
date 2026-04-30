import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bookingId, bookingType } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    let booking: any
    let title = ''
    if (bookingType === 'tour') {
      booking = await prisma.tourBooking.findFirst({
        where: { id: bookingId, customerId: payload.userId },
        include: { tour: { select: { title: true } } },
      })
      title = booking?.tour?.title ?? 'Tour'
    } else {
      booking = await prisma.booking.findFirst({
        where: { id: bookingId, customerId: payload.userId },
        include: { package: { select: { title: true } } },
      })
      title = booking?.package?.title ?? 'Package'
    }

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'lkr',
      metadata: { bookingId: booking.id, bookingRef: booking.bookingRef, bookingType: bookingType ?? 'package' },
      description: `Metro Voyage – ${title}`,
    })

    // Create or update payment record
    if (bookingType !== 'tour') {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          method: 'STRIPE',
          stripeId: pi.id,
          status: 'UNPAID',
        },
      })
    }

    return NextResponse.json({ clientSecret: pi.client_secret })
  } catch {
    return NextResponse.json({ error: 'Payment intent creation failed' }, { status: 500 })
  }
}
