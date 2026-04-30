import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { PackageSchema } from '@/lib/validations'

// GET /api/packages — public, with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const destination = searchParams.get('destination')
    const duration = searchParams.get('duration')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const starRating = searchParams.get('starRating')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isActive: true }

    if (category) where.category = category.toUpperCase()
    if (featured === 'true') where.isFeatured = true
    if (starRating) where.starRating = starRating.toUpperCase()
    if (destination) where.destination = { slug: destination }
    if (duration) where.duration = { lte: parseInt(duration) }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        include: { destination: { select: { name: true, slug: true, region: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.package.count({ where }),
    ])

    return NextResponse.json({ packages, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/packages — admin only
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed:any = PackageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const pkg = await prisma.package.create({ data: parsed.data })
    return NextResponse.json(pkg, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
