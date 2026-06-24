
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, verifyToken } from '@/lib/auth'
import { BookingSchema } from '@/lib/validations'
import { randomUUID } from 'crypto'
import { onNewBooking } from '@/lib/notifications'
import { sendSupplierBookingWhatsApp } from '@/lib/twilio-whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed: any = BookingSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const d = parsed.data
    if (!d.tourId) return NextResponse.json({ error: 'tourId required' }, { status: 400 })

    const tour = await prisma.tour.findUnique({
      where: { id: d.tourId },
      include: { supplier: { select: { name: true, phone: true, whatsappNumber: true } } },
    })
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })

    const snapshot = {
      rooms: d.rooms ?? [],
      roomType: d.roomType,
      paxAdult: d.paxAdult,
      paxChild: d.paxChild,
      paxInfant: d.paxInfant,
      travelDate: d.travelDate,
      returnDate: d.returnDate,
      pricePerPerson: d.pricePerPerson,
      priceTwin: d.priceTwin,
      extraNights: d.extraNights,
      extraNightPrice: d.extraNightPrice,
      selectedOptions: d.selectedOptions,
      totalPrice: d.totalPrice,
      notes: d.notes,
    }

    const supplierConfirmToken = randomUUID()
    const booking = await prisma.tourBooking.create({
      data: {
        tourId: d.tourId,
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
        rooms: d.rooms as any,
        isAirfareIncluded: d.isAirfareIncluded ?? false,
        pricePerPerson: d.pricePerPerson,
        priceTwin: d.priceTwin,
        extraNights: d.extraNights,
        extraNightPrice: d.extraNightPrice,
        selectedOptions: d.selectedOptions as any,
        totalPrice: d.totalPrice,
        discount: d.discount,
        notes: d.notes,
        originalSnapshot: snapshot as any,
        status: 'REQUESTED',
        supplierConfirmToken,
      },
      include: { tour: { select: { title: true } } },
    })

    onNewBooking({
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      customerName: booking.customerName,
      customerId: booking.customerId,
      packageTitle: booking.tour.title,
    }).catch(console.error)

    if (tour.supplier) {
      const result = await sendSupplierBookingWhatsApp({
        supplier: tour.supplier,
        booking: {
          bookingRef: booking.bookingRef,
          itemTitle: booking.tour.title,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          travelDate: booking.travelDate,
          returnDate: booking.returnDate,
          paxAdult: booking.paxAdult,
          paxChild: booking.paxChild,
          paxInfant: booking.paxInfant,
          totalPrice: booking.totalPrice,
          currency: booking.currency,
          notes: booking.notes,
          confirmUrl: `${req.nextUrl.origin}/supplier-confirm/${supplierConfirmToken}`,
        },
      }).catch((error) => {
        console.error('[twilio-whatsapp] tour booking send failed', error)
        return { sent: false }
      })

      if (result.sent) {
        await prisma.tourBooking.update({ where: { id: booking.id }, data: { supplierNotifiedAt: new Date() } })
      }
    }

    return NextResponse.json({ bookingRef: booking.bookingRef, id: booking.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const adminUser = await getAuthUser(req)
  if (adminUser) {
    // Admin: list all
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const where = status ? { status: status as any } : {}
    const [bookings, total] = await Promise.all([
      prisma.tourBooking.findMany({
        where,
        include: { tour: { select: { title: true, slug: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tourBooking.count({ where }),
    ])
    return NextResponse.json({ bookings, total, page, limit })
  }

  // Customer: list own bookings
  const token = req.cookies.get('customer_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only return bookings explicitly linked to this customer ID
  // (do NOT use email fallback in GET — that can leak other customers' data if emails collide)
  const bookings = await prisma.tourBooking.findMany({
    where: { customerId: payload.userId },
    include: { tour: { select: { title: true, slug: true, images: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ bookings })
}
