import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.news.count({ where: { isActive: true } }),
  ])

  return NextResponse.json({ news, total, page, limit })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const news = await prisma.news.create({ data: body })
  return NextResponse.json(news, { status: 201 })
}
