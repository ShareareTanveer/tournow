import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const cats = await prisma.packageCategoryConfig.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const cat = await prisma.packageCategoryConfig.upsert({
    where: { slug: body.slug },
    update: body,
    create: body,
  })
  return NextResponse.json(cat)
}
