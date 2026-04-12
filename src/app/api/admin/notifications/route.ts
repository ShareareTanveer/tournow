import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/notifications — list latest 50
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: {
      audience: 'ADMIN',
      OR: [{ userId: null }, { userId: user.id }],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: {
      audience: 'ADMIN',
      isRead: false,
      OR: [{ userId: null }, { userId: user.id }],
    },
  })

  return NextResponse.json({ notifications, unreadCount })
}

// PATCH /api/admin/notifications — mark all read
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: {
      audience: 'ADMIN',
      isRead: false,
      OR: [{ userId: null }, { userId: user.id }],
    },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
