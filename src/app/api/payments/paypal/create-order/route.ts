import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    const { bookingId, bookingType } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    let booking: any
    if (bookingType === 'tour') {
      booking = await prisma.tourBooking.findFirst({
        where: { id: bookingId, customerId: payload.userId },
        include: { tour: { select: { title: true } } },
      })
    } else {
      booking = await prisma.booking.findFirst({
        where: { id: bookingId, customerId: payload.userId },
        include: { package: { select: { title: true } } },
      })
    }

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const title = bookingType === 'tour' ? booking.tour?.title : booking.package?.title
    const accessToken = await getPayPalAccessToken()
    const base = process.env.PAYPAL_BASE_URL!

    // PayPal requires USD — convert LKR to USD (approximate: 1 USD ≈ 305 LKR)
    const amountUSD = (booking.totalPrice / 305).toFixed(2)

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: booking.id,
            description: `Metro Voyage – ${title}`,
            custom_id: booking.id,
            amount: {
              currency_code: 'USD',
              value: amountUSD,
            },
          },
        ],
      }),
    })

    const order = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: order.message ?? 'PayPal order failed' }, { status: 500 })
    }

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
