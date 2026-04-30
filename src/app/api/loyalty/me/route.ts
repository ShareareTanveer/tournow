import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerUser } from '@/lib/auth'

// GET /api/loyalty/me — returns the logged-in customer's loyalty card (matched by email)
export async function GET(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) return NextResponse.json({ card: null })

  const card = await prisma.loyaltyCard.findUnique({
    where: { customerEmail: customer.email },
  })

  return NextResponse.json({ card })
}
