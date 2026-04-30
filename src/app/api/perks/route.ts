import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const perks = await prisma.perk.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(perks)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const perk = await prisma.perk.create({ data: body })
  return NextResponse.json(perk, { status: 201 })
}
