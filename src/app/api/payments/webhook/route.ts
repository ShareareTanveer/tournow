import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const bookingId = pi.metadata.bookingId

    await prisma.payment.updateMany({
      where: { stripeId: pi.id },
      data: { status: 'PAID', paidAt: new Date() },
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    await prisma.payment.updateMany({
      where: { stripeId: pi.id },
      data: { status: 'UNPAID' },
    })
  }

  return NextResponse.json({ received: true })
}
