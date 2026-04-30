import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ReviewSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const packageId = searchParams.get('packageId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Admin can see all; public only sees approved
    const where: Record<string, unknown> = {}
    if (!isAdmin) where.status = 'APPROVED'
    if (packageId) where.packageId = packageId

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { package: { select: { title: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({ reviews, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed: any = ReviewSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const review = await prisma.review.create({ data: parsed.data })
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
