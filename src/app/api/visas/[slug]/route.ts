import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const visa = await prisma.visaService.findUnique({ where: { slug } })
  if (!visa) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(visa)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json()
  const visa = await prisma.visaService.update({ where: { slug }, data: body })
  return NextResponse.json(visa)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  await prisma.visaService.update({ where: { slug }, data: { isActive: false } })
  return NextResponse.json({ message: 'Deleted' })
}
