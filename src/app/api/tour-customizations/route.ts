import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { packageId, customerName, customerEmail, customerPhone, travelDate, paxCount, requests, budget } = body

  if (!packageId || !customerName || !customerEmail || !requests || !paxCount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const customization = await prisma.tourCustomization.create({
    data: {
      tourId:packageId,
      customerName,
      customerEmail,
      customerPhone,
      travelDate: travelDate ? new Date(travelDate) : null,
      paxCount: parseInt(paxCount),
      requests,
      budget: budget ? parseFloat(budget) : null,
    },
  })

  return NextResponse.json(customization, { status: 201 })
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const take = Math.min(parseInt(searchParams.get('take') || '50'), 100)
  const skip = parseInt(searchParams.get('skip') || '0')

  const [items, total] = await Promise.all([
    prisma.tourCustomization.findMany({
      where: status ? { status } : undefined,
      include: { tour: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take, skip,
    }),
    prisma.tourCustomization.count({ where: status ? { status } : undefined }),
  ])

  return NextResponse.json({ items, total })
}
