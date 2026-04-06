import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'
import { CustomerLoginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CustomerLoginSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })

    const { email, password } = parsed.data

    const customer = await prisma.customer.findUnique({ where: { email } })
    if (!customer || !customer.isActive)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const valid = await verifyPassword(password, customer.password)
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const token = signToken({ userId: customer.id, email: customer.email, role: 'CUSTOMER' })

    const res = NextResponse.json({
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
      token,
    })
    res.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
