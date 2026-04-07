import { prisma } from '@/lib/prisma'

export async function getFeaturedPackages() {
  try {
    return await prisma.package.findMany({
      where: { isActive: true, isFeatured: true },
      include: { destination: { select: { name: true, slug: true, region: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    })
  } catch { return [] }
}

export async function getFeaturedDestinations() {
  try {
    return await prisma.destination.findMany({
      where: { isActive: true, isFeatured: true },
      include: { _count: { select: { packages: true } } },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    })
  } catch { return [] }
}

export async function getReviews(limit = 3) {
  try {
    return await prisma.review.findMany({
      where: { status: 'APPROVED' },
      include: { package: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch { return [] }
}

export async function getHeroImage(): Promise<string | undefined> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'hero_image' } })
    return setting?.value || undefined
  } catch { return undefined }
}

export async function getPerks() {
  try {
    return await prisma.perk.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  } catch { return [] }
}

export async function getBlogs(limit = 9, category?: string) {
  try {
    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category
    return await prisma.blog.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        category: true, author: true, readingTime: true,
        imageUrl: true, publishedAt: true,
      },
    })
  } catch { return [] }
}

export async function getNews(limit = 10) {
  try {
    return await prisma.news.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })
  } catch { return [] }
}
