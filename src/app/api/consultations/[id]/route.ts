import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const c = await prisma.consultation.findUnique({
    where: { id },
    include: { assignedConsultant: { select: { id: true, name: true, email: true } } },
  })
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(c)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const c = await prisma.consultation.update({ where: { id }, data: body })
  return NextResponse.json(c)
}
