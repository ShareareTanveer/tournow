import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { DestinationSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const dest = await prisma.destination.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
          take: 12,
        },
      },
    })
    if (!dest) return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    return NextResponse.json(dest)
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
    const parsed = DestinationSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const dest = await prisma.destination.update({ where: { slug }, data: parsed.data })
    return NextResponse.json(dest)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    await prisma.destination.update({ where: { slug }, data: { isActive: false } })
    return NextResponse.json({ message: 'Destination deactivated' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
