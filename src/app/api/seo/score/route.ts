import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeSeoScore, SeoInput } from '@/lib/seo-score'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/seo/score?type=package&slug=kyoto-tokyo-honeymoon
 * GET /api/seo/score?type=tour&slug=timeless-turkey-experience
 *
 * Returns the SEO score result for a single entity.
 * Used by admin list pages to render per-row score badges.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')   // 'package' | 'tour'
  const slug = searchParams.get('slug')

  if (!type || !slug) {
    return NextResponse.json({ error: 'type and slug are required' }, { status: 400 })
  }

  let input: SeoInput | null = null

  if (type === 'package') {
    const pkg = await prisma.package.findUnique({
      where: { slug },
      select: {
        title: true, slug: true, description: true, summary: true, images: true,
        metaTitle: true, metaDescription: true, focusKeyword: true,
        secondaryKeywords: true, canonicalUrl: true,
        ogTitle: true, ogDescription: true, ogImage: true,
        metaRobots: true, schemaMarkup: true,
      },
    })
    if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    input = pkg

  } else if (type === 'tour') {
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: {
        title: true, slug: true, description: true, summary: true, images: true,
        metaTitle: true, metaDescription: true, focusKeyword: true,
        secondaryKeywords: true, canonicalUrl: true,
        ogTitle: true, ogDescription: true, ogImage: true,
        metaRobots: true, schemaMarkup: true,
      },
    })
    if (!tour) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    input = tour

  } else {
    return NextResponse.json({ error: 'type must be "package" or "tour"' }, { status: 400 })
  }

  const result = computeSeoScore(input)

  return NextResponse.json({
    total: result.total,
    label: result.label,
    color: result.color,
    textColor: result.textColor,
    earned: result.earned,
    possible: result.possible,
    // lightweight group summary for badges
    groups: Object.fromEntries(
      result.groupOrder.map(g => [g, {
        earned: result.groups[g].earned,
        max:    result.groups[g].max,
        percent: result.groups[g].percent,
      }])
    ),
  })
}
