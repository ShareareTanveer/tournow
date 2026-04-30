import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerUser } from '@/lib/auth'

// POST /api/perks/claim — claim a perk for the logged-in customer
export async function POST(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) {
    return NextResponse.json({ error: 'Login required to claim perks' }, { status: 401 })
  }

  const { perkId } = await req.json()
  if (!perkId) return NextResponse.json({ error: 'perkId required' }, { status: 400 })

  const perk = await prisma.perk.findUnique({ where: { id: perkId } })
  if (!perk || !perk.isActive) return NextResponse.json({ error: 'Perk not found' }, { status: 404 })

  // Upsert — if already claimed, return existing
  const claimed = await prisma.claimedPerk.upsert({
    where: { customerId_perkId: { customerId: customer.id, perkId } },
    update: {},
    create: { customerId: customer.id, perkId, status: 'PENDING' },
    include: { perk: true },
  })

  return NextResponse.json(claimed, { status: 201 })
}

// GET /api/perks/claim — get all perks claimed by logged-in customer
export async function GET(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const claimed = await prisma.claimedPerk.findMany({
    where: { customerId: customer.id },
    include: { perk: true },
    orderBy: { claimedAt: 'desc' },
  })

  return NextResponse.json(claimed)
}
