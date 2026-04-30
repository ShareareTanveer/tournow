import { NextRequest, NextResponse } from 'next/server'
import { getCustomerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { audience: 'CUSTOMER', customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const unreadCount = await prisma.notification.count({
    where: { audience: 'CUSTOMER', customerId: customer.id, isRead: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { audience: 'CUSTOMER', customerId: customer.id, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
