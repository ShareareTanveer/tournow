import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const visas = await prisma.visaService.findMany({
    where: { isActive: true },
    orderBy: { country: 'asc' },
  })
  return NextResponse.json(visas)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const visa = await prisma.visaService.create({ data: body })
  return NextResponse.json(visa, { status: 201 })
}
