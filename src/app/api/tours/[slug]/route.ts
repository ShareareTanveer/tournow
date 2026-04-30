import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { TourSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const tour = await prisma.tour.findUnique({
      where: { slug },
      include: {
        primaryDestination: true,
        itinerary: { orderBy: { dayNumber: 'asc' } },
        accommodations: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    return NextResponse.json(tour)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    const body = await req.json()
    const parsed: any = TourSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const tour = await prisma.tour.update({ where: { slug }, data: parsed.data })
    return NextResponse.json(tour)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    await prisma.tour.update({ where: { slug }, data: { isActive: false } })
    return NextResponse.json({ message: 'Tour deactivated' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
