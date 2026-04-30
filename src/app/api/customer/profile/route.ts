import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerUser, hashPassword, verifyPassword } from '@/lib/auth'

// PATCH /api/customer/profile — update name and/or password for logged-in customer
export async function PATCH(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, currentPassword, newPassword } = await req.json()

  const updates: { name?: string; password?: string } = {}

  if (name && name.trim()) {
    updates.name = name.trim()
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const dbCustomer = await prisma.customer.findUnique({ where: { id: customer.id } })
    if (!dbCustomer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, dbCustomer.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    updates.password = await hashPassword(newPassword)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: updates,
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json({ customer: updated })
}
