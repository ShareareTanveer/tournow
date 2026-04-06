import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { CustomerRegisterSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CustomerRegisterSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { name, email, password, phone } = parsed.data

    const existing = await prisma.customer.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await hashPassword(password)
    const customer = await prisma.customer.create({
      data: { name, email, password: hashed, phone },
      select: { id: true, name: true, email: true, phone: true },
    })

    const token = signToken({ userId: customer.id, email: customer.email, role: 'CUSTOMER' })

    const res = NextResponse.json({ customer, token })
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
