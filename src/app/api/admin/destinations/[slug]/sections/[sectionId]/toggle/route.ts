import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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

    const section = await prisma.destinationSection.findFirst({
      where: { id: sectionId, destinationId: destination.id },
    })
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const updated = await prisma.destinationSection.update({
      where: { id: section.id },
      data: { isVisible: !section.isVisible },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
