import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.metrovoyage.com'

const PACKAGE_CATEGORIES = ['family', 'honeymoon', 'solo', 'squad', 'corporate', 'special', 'holiday']
const TOUR_REGIONS = ['south-east-asia', 'middle-east', 'europe', 'far-east', 'south-asia', 'africa', 'americas', 'pacific']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                        lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/packages-from-sri-lanka/family`,  lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/tours-from-sri-lanka`,    lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/destinations`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/visas`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/blogs`,                   lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/news`,                    lastModified: now, changeFrequency: 'daily',   priority: 0.6 },
    { url: `${BASE}/reviews`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/about`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/consultation`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/perks`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privilege-card`,          lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy-policy`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/cookie-policy`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    ...PACKAGE_CATEGORIES.map((cat) => ({
      url: `${BASE}/packages-from-sri-lanka/${cat}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...TOUR_REGIONS.map((region) => ({
      url: `${BASE}/tours-from-sri-lanka/${region}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
  ]

  // ── Dynamic pages ─────────────────────────────────────────────────────────
  const [packages, tours, destinations, blogs, news, visas] = await Promise.all([
    prisma.package.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
    prisma.tour.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
    prisma.destination.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
    prisma.blog.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
    prisma.news.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
    prisma.visaService.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
  ])

  const packagePages: MetadataRoute.Sitemap = packages.map((p) => ({
    url: `${BASE}/packages/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const tourPages: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${BASE}/tours/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const destinationPages: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${BASE}/destinations/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${BASE}/blogs/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${BASE}/news/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.55,
  }))

  const visaPages: MetadataRoute.Sitemap = visas.map((v) => ({
    url: `${BASE}/visas/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  return [
    ...staticPages,
    ...packagePages,
    ...tourPages,
    ...destinationPages,
    ...blogPages,
    ...newsPages,
    ...visaPages,
  ]
}
