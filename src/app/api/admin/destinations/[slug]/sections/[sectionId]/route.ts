import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; sectionId: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug, sectionId } = await params
    const destination = await prisma.destination.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const body = await req.json()
    const payload: Record<string, unknown> = {}

    if (typeof body?.title === 'string') payload.title = body.title
    if (typeof body?.mode === 'string') payload.mode = body.mode
    if (typeof body?.presetKey === 'string' || body?.presetKey === null) payload.presetKey = body.presetKey
    if (body?.content && typeof body.content === 'object') payload.content = body.content as Prisma.InputJsonValue
    if (body?.style && typeof body.style === 'object') payload.style = body.style as Prisma.InputJsonValue
    if (body?.canvas && typeof body.canvas === 'object') payload.canvas = body.canvas as Prisma.InputJsonValue
    if (body?.canvas === null) payload.canvas = null

    const updated = await prisma.destinationSection.updateMany({
      where: { id: sectionId, destinationId: destination.id },
      data: payload,
    })

    if (!updated.count) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const section = await prisma.destinationSection.findUnique({ where: { id: sectionId } })
    return NextResponse.json(section)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; sectionId: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug, sectionId } = await params
    const destination = await prisma.destination.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const deleted = await prisma.destinationSection.deleteMany({
      where: { id: sectionId, destinationId: destination.id },
    })
    if (!deleted.count) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const sections = await prisma.destinationSection.findMany({
      where: { destinationId: destination.id },
      orderBy: { order: 'asc' },
      select: { id: true },
    })

    await prisma.$transaction(
      sections.map((section, index) =>
        prisma.destinationSection.update({
          where: { id: section.id },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
