import { prisma } from './prisma'

const PACKAGE_CATEGORIES = new Set(['FAMILY', 'HONEYMOON', 'SOLO', 'SQUAD', 'CORPORATE', 'SPECIAL', 'HOLIDAY'])
const STAR_RATINGS = new Set(['THREE', 'FOUR', 'FIVE'])

export type PackageSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function clean(value: string | string[] | undefined) {
  return firstValue(value)?.trim() ?? ''
}

function positiveInt(value: string, fallback: number) {
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function buildPackageWhere(searchParams: PackageSearchParams = {}) {
  const category = clean(searchParams.category).toUpperCase()
  const destination = clean(searchParams.destination)
  const duration = clean(searchParams.duration)
  const minPrice = clean(searchParams.minPrice)
  const maxPrice = clean(searchParams.maxPrice)
  const starRating = clean(searchParams.starRating).toUpperCase()
  const featured = clean(searchParams.featured)

  const where: Record<string, unknown> = { isActive: true }

  if (PACKAGE_CATEGORIES.has(category)) where.category = category
  if (featured === 'true') where.isFeatured = true
  if (STAR_RATINGS.has(starRating)) where.starRating = starRating
  if (destination) {
    where.destination = {
      is: {
        OR: [
          { slug: { equals: destination, mode: 'insensitive' } },
          { name: { contains: destination, mode: 'insensitive' } },
          { country: { contains: destination, mode: 'insensitive' } },
        ],
      },
    }
  }
  if (duration) {
    const maxDuration = parseInt(duration, 10)
    if (duration === '8plus') {
      where.duration = { gte: 8 }
    } else if (Number.isFinite(maxDuration)) {
      where.duration = { lte: maxDuration }
    }
  }
  if (minPrice || maxPrice) {
    const price: Record<string, number> = {}
    const min = minPrice ? parseFloat(minPrice) : NaN
    const max = maxPrice ? parseFloat(maxPrice) : NaN
    if (Number.isFinite(min)) price.gte = min
    if (Number.isFinite(max)) price.lte = max
    if (Object.keys(price).length > 0) where.price = price
  }

  return where
}

export async function getPackageSearchResults(searchParams: PackageSearchParams = {}) {
  const page = positiveInt(clean(searchParams.page), 1)
  const limit = Math.min(positiveInt(clean(searchParams.limit), 12), 48)
  const skip = (page - 1) * limit
  const where = buildPackageWhere(searchParams)

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      include: { destination: { select: { name: true, slug: true, region: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.package.count({ where }),
  ])

  return { packages, total, page, limit, pages: Math.ceil(total / limit) }
}
