import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { BookingSchema } from '@/lib/validations'
import { sendBookingConfirmation } from '@/lib/email'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          package: { select: { title: true, slug: true, images: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return NextResponse.json({ bookings, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const pkg = await prisma.package.findUnique({ where: { id: parsed.data.packageId } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const totalPrice = pkg.price * parsed.data.paxCount

    const booking = await prisma.booking.create({
      data: {
        ...parsed.data,
        travelDate: new Date(parsed.data.travelDate),
        returnDate: parsed.data.returnDate ? new Date(parsed.data.returnDate) : undefined,
        totalPrice,
      },
      include: { package: { select: { title: true } } },
    })

    sendBookingConfirmation({
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      bookingRef: booking.bookingRef,
      packageTitle: booking.package.title,
      travelDate: booking.travelDate,
      paxCount: booking.paxCount,
      totalPrice: booking.totalPrice,
    }).catch(console.error)

    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
