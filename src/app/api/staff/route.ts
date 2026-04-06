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

function mapOut(s: any) {
  return { ...s, imageUrl: s.photoUrl }
}

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(staff.map(mapOut))
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const staff = await prisma.staff.create({ data: mapIn(body) })
  return NextResponse.json(mapOut(staff), { status: 201 })
}
