import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { InquirySchema } from '@/lib/validations'
import { sendInquiryConfirmation, sendInquiryNotification } from '@/lib/email'
import { onNewInquiry } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          package: { select: { title: true, slug: true } },
          assignedTo: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ])

    return NextResponse.json({ inquiries, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed: any = InquirySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const inquiry = await prisma.inquiry.create({
      data: {
        ...parsed.data,
        travelDate: parsed.data.travelDate ? new Date(parsed.data.travelDate) : undefined,
      },
      include: { package: { select: { title: true } } },
    })

    // Send emails (non-blocking)
    sendInquiryConfirmation(inquiry.email, inquiry.name, inquiry.package?.title).catch(console.error)
    sendInquiryNotification({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      packageTitle: inquiry.package?.title,
    }).catch(console.error)

    // Push real-time notification
    onNewInquiry({ inquiryId: inquiry.id, name: inquiry.name, destination: inquiry.destination }).catch(console.error)

    return NextResponse.json(inquiry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
