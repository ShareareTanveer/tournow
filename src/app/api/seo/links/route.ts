import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { suggestLinks, LinkCandidate, SuggestLinksOptions } from '@/lib/link-suggester'
import { z } from 'zod'

const BodySchema = z.object({
  title:       z.string(),
  content:     z.string(),
  currentSlug: z.string().optional(),
  limit:       z.number().int().min(1).max(30).optional(),
  minScore:    z.number().int().min(0).optional(),
})

/**
 * POST /api/seo/links
 * Body: { title, content, currentSlug?, limit?, minScore? }
 *
 * Fetches all packages, tours, and blogs then scores them
 * against the provided content and returns ranked suggestions.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  const opts: SuggestLinksOptions = parsed.data

  // Fetch all linkable entities in parallel
  const [packages, tours, blogs] = await Promise.all([
    prisma.package.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, slug: true, summary: true,
        focusKeyword: true, secondaryKeywords: true,
      },
    }),
    prisma.tour.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, slug: true, summary: true,
        focusKeyword: true, secondaryKeywords: true,
      },
    }),
    prisma.blog.findMany({
      where: { isActive: true },
      select: { id: true, title: true, slug: true, excerpt: true },
    }),
  ])

  const candidates: LinkCandidate[] = [
    ...packages.map(p => ({
      id:           p.id,
      type:         'package' as const,
      title:        p.title,
      slug:         p.slug,
      url:          `/packages/${p.slug}`,
      excerpt:      p.summary ?? undefined,
      focusKeyword: p.focusKeyword ?? undefined,
      keywords:     p.secondaryKeywords ?? undefined,
    })),
    ...tours.map(t => ({
      id:           t.id,
      type:         'tour' as const,
      title:        t.title,
      slug:         t.slug,
      url:          `/tours/${t.slug}`,
      excerpt:      t.summary ?? undefined,
      focusKeyword: t.focusKeyword ?? undefined,
      keywords:     t.secondaryKeywords ?? undefined,
    })),
    ...blogs.map(b => ({
      id:      b.id,
      type:    'blog' as const,
      title:   b.title,
      slug:    b.slug,
      url:     `/blog/${b.slug}`,
      excerpt: b.excerpt ?? undefined,
    })),
  ]

  const suggestions = suggestLinks(candidates, opts)

  return NextResponse.json({
    total:       candidates.length,
    suggestions,
  })
}
