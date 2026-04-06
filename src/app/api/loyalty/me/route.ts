import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/loyalty/me — returns the logged-in user's loyalty card
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ card: null })

  const card = await prisma.loyaltyCard.findUnique({
    where: { userId: user.id },
  })

  return NextResponse.json({ card })
}
