import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.metrovoyage.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Load custom rules from dashboard (SiteSetting key: "robots_disallow")
  // Value is a newline-separated list of paths to disallow
  let customDisallow: string[] = []
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'robots_disallow' } })
    if (setting?.value) {
      customDisallow = setting.value
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
    }
  } catch {}

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/my/',
          '/login',
          '/register',
          ...customDisallow,
        ],
      },
      {
        // Block AI training bots
        userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'anthropic-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
