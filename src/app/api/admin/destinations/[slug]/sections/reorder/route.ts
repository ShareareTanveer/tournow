import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    const destination = await prisma.destination.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const body = await req.json()
    const items = Array.isArray(body?.items)
      ? (body.items as Array<{ id: string; order?: number }>)
      : []

    await prisma.$transaction(
      items.map((item, index) =>
        prisma.destinationSection.updateMany({
          where: {
            id: item.id,
            destinationId: destination.id,
          },
          data: { order: typeof item.order === 'number' ? item.order : index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
