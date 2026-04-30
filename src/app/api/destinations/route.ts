import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { DestinationSchema } from '@/lib/validations'
import { buildDefaultDestinationSections } from '@/lib/destination-page-builder'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured')
    const region = searchParams.get('region')

    const where: Record<string, unknown> = { isActive: true }
    if (featured === 'true') where.isFeatured = true
    if (region) where.region = region

    const destinations = await prisma.destination.findMany({
      where,
      include: { _count: { select: { packages: true } } },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json(destinations)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = DestinationSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const dest = await prisma.destination.create({ data: parsed.data })
    const defaults = buildDefaultDestinationSections(dest)
    await prisma.destinationSection.createMany({
      data: defaults.map((section) => ({
        destinationId: dest.id,
        sectionType: section.sectionType,
        title: section.title,
        presetKey: section.presetKey,
        order: section.order,
        isVisible: section.isVisible,
        mode: section.mode,
        style: section.style as Prisma.InputJsonValue,
        content: section.content as Prisma.InputJsonValue,
        canvas: section.canvas as Prisma.InputJsonValue | undefined,
      })),
    })
    return NextResponse.json(dest, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
