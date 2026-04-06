import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, verifyToken } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const adminUser = await getAuthUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.tourBooking.findUnique({
    where: { id },
    include: {
      tour: { select: { title: true, slug: true, images: true } },
      payments: true,
    },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(booking)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const adminUser = await getAuthUser(req)

  if (!adminUser) {
    const token = req.cookies.get('customer_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body.receiptUrl) return NextResponse.json({ error: 'receiptUrl required' }, { status: 400 })

    const booking = await prisma.tourBooking.findFirst({ where: { id, customerId: payload.userId } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.tourBooking.update({
      where: { id },
      data: { receiptUrl: body.receiptUrl, receiptNote: body.receiptNote, status: 'RECEIPT_UPLOADED' },
    })
    return NextResponse.json(updated)
  }

  const body = await req.json()
  const updated = await prisma.tourBooking.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
      ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
      ...(body.discount !== undefined && { discount: body.discount }),
      ...(body.totalPrice !== undefined && { totalPrice: body.totalPrice }),
    },
  })
  return NextResponse.json(updated)
}
