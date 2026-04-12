import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hashPassword } from '@/lib/auth'
import { sendInquiryConverted } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * POST /api/inquiries/[id]/convert
 *
 * Body:
 *   type: 'package' | 'tour'
 *   packageId?: string   (required if type === 'package')
 *   tourId?: string      (required if type === 'tour')
 *   customerName: string (admin can edit)
 *   customerEmail: string (admin can edit)
 *   phone?: string
 *   travelDate: string   (ISO date)
 *   returnDate?: string
 *   paxAdult: number
 *   paxChild?: number
 *   paxInfant?: number
 *   rooms?: { type: string; qty: number; label: string }[]
 *   pricePerPerson?: number
 *   priceTwin?: number
 *   extraNights?: number
 *   extraNightPrice?: number
 *   selectedOptions?: { label: string; price: number }[]
 *   staffQuote: {
 *     lineItems: { label: string; price: number }[]
 *     totalPrice: number
 *     notes?: string
 *   }
 *   adminNotes?: string
 */
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await getAuthUser(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const {
    type,
    packageId,
    tourId,
    customerName,
    customerEmail,
    phone,
    travelDate,
    returnDate,
    paxAdult = 1,
    paxChild = 0,
    paxInfant = 0,
    rooms,
    pricePerPerson,
    priceTwin,
    extraNights,
    extraNightPrice,
    selectedOptions,
    staffQuote,
    adminNotes,
  } = body

  if (!type || !['package', 'tour'].includes(type)) {
    return NextResponse.json({ error: 'type must be "package" or "tour"' }, { status: 400 })
  }
  if (type === 'package' && !packageId) {
    return NextResponse.json({ error: 'packageId required for package booking' }, { status: 400 })
  }
  if (type === 'tour' && !tourId) {
    return NextResponse.json({ error: 'tourId required for tour booking' }, { status: 400 })
  }
  if (!travelDate) return NextResponse.json({ error: 'travelDate required' }, { status: 400 })
  if (!customerName || !customerEmail) return NextResponse.json({ error: 'customerName and customerEmail required' }, { status: 400 })
  if (!staffQuote?.lineItems || typeof staffQuote?.totalPrice !== 'number') {
    return NextResponse.json({ error: 'staffQuote with lineItems and totalPrice required' }, { status: 400 })
  }

  // ── Fetch the inquiry ────────────────────────────────────────────────────────
  const inquiry = await prisma.inquiry.findUnique({ where: { id } })

  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  if (inquiry.status === 'CONVERTED') {
    return NextResponse.json({ error: 'Inquiry already converted' }, { status: 400 })
  }

  const customerPhone = phone || inquiry.phone || ''

  // ── Find or create Customer account ─────────────────────────────────────────
  let isNewAccount = false
  let tempPassword: string | null = null

  let customer = await prisma.customer.findUnique({ where: { email: customerEmail } })

  if (!customer) {
    isNewAccount = true
    tempPassword = generatePassword()
    console.log(tempPassword,'tempPassword====')
    console.log(tempPassword,'tempPassword====')
    console.log(tempPassword,'tempPassword====')
    console.log(tempPassword,'tempPassword====')
    console.log(tempPassword,'tempPassword====')
    console.log(tempPassword,'tempPassword====')
    const hashedPassword = await hashPassword(tempPassword)
    customer = await prisma.customer.create({
      data: {
        name: customerName,
        email: customerEmail,
        password: hashedPassword,
        phone: customerPhone || null,
      },
    })
  }

  // ── Resolve the linked entity ────────────────────────────────────────────────
  let title = ''

  if (type === 'package') {
    const pkg = await prisma.package.findUnique({ where: { id: packageId }, select: { title: true } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    title = pkg.title
  } else {
    const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { title: true } })
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    title = tour.title
  }

  const snapshot = {
    paxAdult,
    paxChild,
    paxInfant,
    travelDate,
    returnDate,
    rooms,
    totalPrice: staffQuote.totalPrice,
    inquiryMessage: inquiry.message,
  }

  // ── Create booking ───────────────────────────────────────────────────────────
  let bookingRef: string

  if (type === 'package') {
    const booking = await prisma.booking.create({
      data: {
        packageId,
        customerId: customer.id,
        customerName,
        customerEmail,
        customerPhone,
        travelDate: new Date(travelDate),
        returnDate: returnDate ? new Date(returnDate) : undefined,
        paxAdult,
        paxChild,
        paxInfant,
        rooms: rooms ?? null,
        pricePerPerson: pricePerPerson ?? undefined,
        priceTwin: priceTwin ?? undefined,
        extraNights: extraNights ?? 0,
        extraNightPrice: extraNightPrice ?? undefined,
        selectedOptions: selectedOptions ?? null,
        totalPrice: staffQuote.totalPrice,
        staffQuote,
        adminNotes: adminNotes ?? null,
        originalSnapshot: snapshot,
        status: 'AWAITING_CONFIRM',
      },
    })
    bookingRef = booking.bookingRef

    // Mark inquiry as converted
    await prisma.inquiry.update({ where: { id }, data: { status: 'CONVERTED' } })
  } else {
    const booking = await prisma.tourBooking.create({
      data: {
        tourId,
        customerId: customer.id,
        customerName,
        customerEmail,
        customerPhone,
        travelDate: new Date(travelDate),
        returnDate: returnDate ? new Date(returnDate) : undefined,
        paxAdult,
        paxChild,
        paxInfant,
        rooms: rooms ?? null,
        pricePerPerson: pricePerPerson ?? undefined,
        priceTwin: priceTwin ?? undefined,
        extraNights: extraNights ?? 0,
        extraNightPrice: extraNightPrice ?? undefined,
        selectedOptions: selectedOptions ?? null,
        totalPrice: staffQuote.totalPrice,
        staffQuote,
        adminNotes: adminNotes ?? null,
        originalSnapshot: snapshot,
        status: 'AWAITING_CONFIRM',
      },
    })
    bookingRef = booking.bookingRef

    await prisma.tourInquiry.update({ where: { id }, data: { status: 'CONVERTED' } })
  }

  // ── Send email ───────────────────────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  try {
    await sendInquiryConverted({
      customerEmail,
      customerName,
      bookingRef,
      title,
      travelDate: new Date(travelDate),
      lineItems: staffQuote.lineItems,
      totalPrice: staffQuote.totalPrice,
      notes: staffQuote.notes ?? null,
      isNewAccount,
      tempPassword,
      loginUrl: appUrl,
    })
  } catch (e) {
    console.error('Failed to send inquiry converted email', e)
  }

  return NextResponse.json({
    bookingRef,
    customerId: customer.id,
    isNewAccount,
    message: `Booking created and email sent to ${customerEmail}`,
  }, { status: 201 })
}
