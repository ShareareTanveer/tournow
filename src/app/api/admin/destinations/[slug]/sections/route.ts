import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  buildSectionFromDefinition,
  DESTINATION_SECTION_LIBRARY,
  DESTINATION_SECTION_TYPES,
} from '@/lib/destination-page-builder'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    const destination = await prisma.destination.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        region: true,
        country: true,
        language: true,
        bestSeason: true,
        costLevel: true,
        description: true,
        imageUrl: true,
        images: true,
      },
    })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const sections = await prisma.destinationSection.findMany({
      where: { destinationId: destination.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({
      destination,
      sections,
      sectionLibrary: DESTINATION_SECTION_LIBRARY,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    const destination = await prisma.destination.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        region: true,
        country: true,
        language: true,
        bestSeason: true,
        costLevel: true,
        description: true,
        imageUrl: true,
        images: true,
      },
    })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    const body = await req.json()
    const sectionType = typeof body?.sectionType === 'string' ? body.sectionType : ''
    const presetKey = typeof body?.presetKey === 'string' ? body.presetKey : null
    if (!DESTINATION_SECTION_TYPES.some((type) => type === sectionType)) {
      return NextResponse.json({ error: 'Invalid section type' }, { status: 400 })
    }

    const maxOrder = await prisma.destinationSection.aggregate({
      where: { destinationId: destination.id },
      _max: { order: true },
    })

    const sectionConfig = buildSectionFromDefinition(
      destination,
      sectionType as (typeof DESTINATION_SECTION_TYPES)[number],
      presetKey,
      (maxOrder._max.order ?? -1) + 1
    )
    const section = await prisma.destinationSection.create({
      data: {
        destinationId: destination.id,
        sectionType: sectionConfig.sectionType,
        title: sectionConfig.title,
        presetKey: sectionConfig.presetKey,
        order: sectionConfig.order,
        isVisible: sectionConfig.isVisible,
        mode: sectionConfig.mode,
        style: sectionConfig.style as Prisma.InputJsonValue,
        content: sectionConfig.content as Prisma.InputJsonValue,
        canvas: sectionConfig.canvas as Prisma.InputJsonValue | undefined,
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
