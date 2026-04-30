import { NextRequest, NextResponse } from 'next/server'
import { getCustomerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomerUser(req)
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.notification.update({ where: { id, customerId: customer.id }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
