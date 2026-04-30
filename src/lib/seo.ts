import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.metrovoyage.com'
const SITE_NAME = 'Metro Voyage'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`

/** Strip HTML tags and truncate */
export function plainText(html: string | null | undefined, maxLen = 160): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLen)
}

/** Build a full Metadata object from SEO fields + fallback values */
export function buildMetadata(opts: {
  title?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  description?: string | null
  focusKeyword?: string | null
  secondaryKeywords?: string | null
  canonicalUrl?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  images?: string[]
  metaRobots?: string | null
  /** URL path for this page, e.g. /packages/dubai-family-5d */
  path?: string
}): Metadata {
  const title = opts.metaTitle ?? opts.title ?? SITE_NAME
  const description = opts.metaDescription ?? plainText(opts.description, 160)
  const canonical = opts.canonicalUrl ?? (opts.path ? `${BASE_URL}${opts.path}` : undefined)
  const ogImage = opts.ogImage ?? opts.images?.[0] ?? DEFAULT_OG_IMAGE

  const keywords: string[] = []
  if (opts.focusKeyword) keywords.push(opts.focusKeyword)
  if (opts.secondaryKeywords) {
    keywords.push(...opts.secondaryKeywords.split(',').map((k) => k.trim()).filter(Boolean))
  }

  const robots = opts.metaRobots ?? 'index, follow'

  return {
    title,
    description,
    ...(keywords.length > 0 && { keywords }),
    ...(canonical && { alternates: { canonical } }),
    robots,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: canonical,
      title: opts.ogTitle ?? title,
      description: opts.ogDescription ?? description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.ogTitle ?? title,
      description: opts.ogDescription ?? description,
      images: [ogImage],
    },
  }
}

/** Inline JSON-LD script tag string for injection via dangerouslySetInnerHTML */
export function jsonLd(schema: object): string {
  return JSON.stringify(schema)
}

export { BASE_URL, SITE_NAME }
