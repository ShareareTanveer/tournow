import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  // Add cache-busting headers
  const res = NextResponse.json({ customer: null })
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')

  const token = req.cookies.get('customer_token')?.value
  if (!token) return res

  const payload = verifyToken(token)
  if (!payload) return res

  const customer = await prisma.customer.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, phone: true, isActive: true },
  })

  if (!customer || !customer.isActive) return res

  const resWithData = NextResponse.json({ customer })
  resWithData.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  resWithData.headers.set('Pragma', 'no-cache')
  resWithData.headers.set('Expires', '0')
  return resWithData
}
