import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await params
    const pkg = await prisma.package.findUnique({ where: { slug } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const body = await req.json()
    const days = Array.isArray(body) ? body : [body]

    // Upsert itinerary days
    await prisma.itineraryDay.deleteMany({ where: { packageId: pkg.id } })
    const created = await prisma.itineraryDay.createMany({
      data: days.map((d) => ({ ...d, packageId: pkg.id })),
    })

    return NextResponse.json({ created: created.count }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
