import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth'

// PATCH /api/auth/profile — update name and/or password
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, dbUser.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    updates.password = await hashPassword(newPassword)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ user: updated })
}
