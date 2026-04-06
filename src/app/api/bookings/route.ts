import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, verifyToken } from '@/lib/auth'
import { BookingSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const adminUser = await getAuthUser(req)
  if (adminUser) {
    // Admin: list all bookings
    try {
      const { searchParams } = new URL(req.url)
      const status = searchParams.get('status')
      const paymentStatus = searchParams.get('paymentStatus')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')

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
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.booking.count({ where }),
      ])
      return NextResponse.json({ bookings, total, page, limit })
    } catch {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Customer: list own bookings
  const token = req.cookies.get('customer_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { customerId: payload.userId },
    include: { package: { select: { title: true, slug: true, images: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const d = parsed.data
    if (!d.packageId) return NextResponse.json({ error: 'packageId required' }, { status: 400 })

    const pkg = await prisma.package.findUnique({ where: { id: d.packageId } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const booking = await prisma.booking.create({
      data: {
        packageId: d.packageId,
        customerId: d.customerId,
        customerName: d.customerName,
        customerEmail: d.customerEmail,
        customerPhone: d.customerPhone,
        travelDate: new Date(d.travelDate),
        returnDate: d.returnDate ? new Date(d.returnDate) : null,
        paxAdult: d.paxAdult,
        paxChild: d.paxChild,
        paxInfant: d.paxInfant,
        roomType: d.roomType,
        pricePerPerson: d.pricePerPerson,
        priceTwin: d.priceTwin,
        extraNights: d.extraNights,
        extraNightPrice: d.extraNightPrice,
        selectedOptions: d.selectedOptions as any,
        totalPrice: d.totalPrice,
        discount: d.discount,
        notes: d.notes,
        status: 'REQUESTED',
      },
      include: { package: { select: { title: true } } },
    })

    return NextResponse.json({ bookingRef: booking.bookingRef, id: booking.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
