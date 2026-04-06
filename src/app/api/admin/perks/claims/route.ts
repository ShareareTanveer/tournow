import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']

// GET /api/admin/perks/claims — all claimed perks (admin only)
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const claims = await prisma.claimedPerk.findMany({
    include: {
      perk: { select: { id: true, title: true, iconColor: true, bgColor: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { claimedAt: 'desc' },
  })

  return NextResponse.json(claims)
}

// PATCH /api/admin/perks/claims — update status of a claim
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const valid = ['PENDING', 'APPROVED', 'USED', 'EXPIRED']
  if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const updated = await prisma.claimedPerk.update({
    where: { id },
    data: { status },
    include: {
      perk: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json(updated)
}
