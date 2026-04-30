import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '9')
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = category

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        category: true, author: true, readingTime: true,
        imageUrl: true, publishedAt: true,
      },
    }),
    prisma.blog.count({ where }),
  ])

  return NextResponse.json({ blogs, total, page, limit })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const blog = await prisma.blog.create({ data: body })
  return NextResponse.json(blog, { status: 201 })
}
