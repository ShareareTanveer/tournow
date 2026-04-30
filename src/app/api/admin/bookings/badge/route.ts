import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const adminUser = await getAuthUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [pkgCount, tourCount] = await Promise.all([
    prisma.booking.count({ where: { status: 'REQUESTED' } }),
    prisma.tourBooking.count({ where: { status: 'REQUESTED' } }),
  ])

  return NextResponse.json({ count: pkgCount + tourCount })
}
