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
 *   travelDate: string   (ISO date)
 *   paxAdult: number
 *   paxChild?: number
 *   paxInfant?: number
 *   staffQuote: {
 *     lineItems: { label: string; price: number }[]
 *     totalPrice: number
 *     notes?: string
 *     validUntil?: string
 *   }
 *   adminNotes?: string
 *   phone?: string       (override phone if not on inquiry)
 */
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await getAuthUser(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const { type, packageId, tourId, travelDate, paxAdult = 1, paxChild = 0, paxInfant = 0, staffQuote, adminNotes, phone } = body

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
  if (!staffQuote?.lineItems || typeof staffQuote?.totalPrice !== 'number') {
    return NextResponse.json({ error: 'staffQuote with lineItems and totalPrice required' }, { status: 400 })
  }

  // ── Fetch the inquiry ────────────────────────────────────────────────────────
  const inquiry = type === 'tour'
    ? await prisma.tourInquiry.findUnique({ where: { id } })
    : await prisma.inquiry.findUnique({ where: { id } })

  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  if (inquiry.status === 'CONVERTED') {
    return NextResponse.json({ error: 'Inquiry already converted' }, { status: 400 })
  }

  const customerEmail = inquiry.email
  const customerName = inquiry.name
  const customerPhone = phone || inquiry.phone || ''

  // ── Find or create Customer account ─────────────────────────────────────────
  let isNewAccount = false
  let tempPassword: string | null = null

  let customer = await prisma.customer.findUnique({ where: { email: customerEmail } })

  if (!customer) {
    isNewAccount = true
    tempPassword = generatePassword()
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
        paxAdult,
        paxChild,
        paxInfant,
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
        paxAdult,
        paxChild,
        paxInfant,
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
