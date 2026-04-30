import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

function mapIn(body: any) {
  const { imageUrl, sortOrder, email, phone, ...rest } = body
  return {
    ...rest,
    ...(imageUrl !== undefined ? { photoUrl: imageUrl } : {}),
    ...(sortOrder !== undefined ? { order: Number(sortOrder) } : {}),
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const staff = await prisma.staff.findUnique({ where: { id } })
  if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...staff, imageUrl: staff.photoUrl })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const staff = await prisma.staff.update({ where: { id }, data: mapIn(body) })
  return NextResponse.json({ ...staff, imageUrl: staff.photoUrl })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.staff.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ message: 'Removed' })
}
