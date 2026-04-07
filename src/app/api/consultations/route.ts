import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ConsultationSchema } from '@/lib/validations'
import { sendConsultationConfirmation, sendConsultationNotification } from '@/lib/email'

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

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: { assignedConsultant: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consultation.count({ where }),
    ])

    return NextResponse.json({ consultations, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed: any = ConsultationSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const consultation = await prisma.consultation.create({ data: parsed.data })

    sendConsultationConfirmation(consultation.email, consultation.name, consultation.method).catch(console.error)
    sendConsultationNotification({
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone,
      method: consultation.method,
      additionalInfo: consultation.additionalInfo,
    }).catch(console.error)

    return NextResponse.json(consultation, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
