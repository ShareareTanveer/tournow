import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cards = await prisma.loyaltyCard.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const card = await prisma.loyaltyCard.upsert({
    where: { customerEmail: body.customerEmail },
    update: body,
    create: body,
  })
  return NextResponse.json(card, { status: 201 })
}
