import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { TourSchema } from '@/lib/validations'

// GET /api/tours — public, with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const region = searchParams.get('region')
    const featured = searchParams.get('featured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const duration = searchParams.get('duration')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isActive: true }

    if (region) where.region = region
    if (featured === 'true') where.isFeatured = true
    if (duration) where.duration = { lte: parseInt(duration) }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: { primaryDestination: { select: { name: true, slug: true, region: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.tour.count({ where }),
    ])

    return NextResponse.json({ tours, total, page, limit, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/tours — admin only
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed: any = TourSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const tour = await prisma.tour.create({ data: parsed.data })
    return NextResponse.json(tour, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
