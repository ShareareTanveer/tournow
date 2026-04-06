import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value
  if (!token) return NextResponse.json({ customer: null })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ customer: null })

  const customer = await prisma.customer.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, phone: true, isActive: true },
  })

  if (!customer || !customer.isActive) return NextResponse.json({ customer: null })
  return NextResponse.json({ customer })
}
