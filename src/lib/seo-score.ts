/**
 * SEO Scoring Engine — pure TypeScript, no external dependencies.
 * Works identically in server (API routes) and client (live form preview).
 *
 * Total: 100 pts across 6 groups.
 * Ported and improved from the Python reference implementation.
 */

export type SeoGroup = 'Keywords' | 'Meta Tags' | 'Content' | 'Technical' | 'Social' | 'Schema'

export interface SeoCheck {
  key: string
  group: SeoGroup
  label: string
  passed: boolean
  points: number    // points earned for this check
  maxPoints: number
  fix: string       // actionable message shown when not passed
  detail?: string   // extra info (e.g. current char count)
}

export interface GroupScore {
  earned: number
  max: number
  percent: number   // 0–100
  label: string
  color: string     // tailwind bg class
}

export interface SeoScoreResult {
  total: number                         // 0–100 normalised
  earned: number                        // raw points earned
  possible: number                      // raw points possible
  label: 'Excellent' | 'Good' | 'OK' | 'Needs Work' | 'Poor'
  color: string                         // tailwind bg class for badge
  textColor: string                     // tailwind text class
  checks: SeoCheck[]
  groups: Record<SeoGroup, GroupScore>
  groupOrder: SeoGroup[]
}

export interface SeoInput {
  // Core content
  title: string
  slug: string
  description?: string | null           // rich HTML body
  summary?: string | null               // plain text excerpt
  images?: string[]                     // image URLs

  // SEO basic
  metaTitle?: string | null
  metaDescription?: string | null
  focusKeyword?: string | null
  secondaryKeywords?: string | null
  canonicalUrl?: string | null

  // Social
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null

  // Technical
  metaRobots?: string | null
  schemaMarkup?: string | null
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

/** Returns true if ≥ threshold fraction of keyword words appear in text. */
function keywordInText(keyword: string, text: string, threshold = 0.8): boolean {
  if (!keyword || !text) return false
  const kw = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const tx = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const words = kw.split(/\s+/).filter(Boolean)
  if (!words.length) return false
  const matched = words.filter(w => tx.includes(w)).length
  return matched / words.length >= threshold
}

/** Stem match: handles singular/plural by comparing 4-char stems. */
function keywordStemMatch(keyword: string, text: string, threshold = 0.6): boolean {
  if (!keyword || !text) return false
  const kw = keyword.toLowerCase()
  const tx = text.toLowerCase()
  const words = kw.split(/\s+/).filter(w => w.length >= 3)
  if (!words.length) return false
  const stemmed = (w: string) => w.slice(0, Math.max(4, w.length - 2))
  const matched = words.filter(w => {
    const s = stemmed(w)
    return tx.includes(w) || tx.includes(s)
  }).length
  return matched / words.length >= threshold
}

function keywordDensity(keyword: string, text: string): number {
  if (!keyword || !text) return 0
  const kw = keyword.toLowerCase()
  const tx = text.toLowerCase()
  const total = wordCount(tx)
  if (!total) return 0
  const kwWords = kw.split(/\s+/).filter(Boolean).length
  // count non-overlapping occurrences
  let count = 0
  let idx = 0
  while (true) {
    const pos = tx.indexOf(kw, idx)
    if (pos === -1) break
    count++
    idx = pos + kw.length
  }
  return (count * kwWords) / total
}

function hasInternalLinks(html: string): boolean {
  return /href=["']\//i.test(html)
}

function hasH1(html: string): boolean {
  return /<h1[\s>]/i.test(html)
}

function keywordInHeading(keyword: string, html: string): boolean {
  if (!keyword) return false
  const headingMatches = html.match(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi) ?? []
  const headingText = headingMatches.map(h => stripHtml(h)).join(' ')
  return keywordInText(keyword, headingText, 0.7)
}

interface ImageInfo {
  total: number
  withAlt: number
  withDescriptiveFilename: number
}

const GENERIC_FILENAME_RE = /\b(image|img|photo|pic|dsc|screenshot|untitled|file|capture|download|picture)\d*\b/i

function contentImagesInfo(html: string): ImageInfo {
  const tags = html.match(/<img[^>]+>/gi) ?? []
  let withAlt = 0
  let descriptive = 0
  for (const tag of tags) {
    const altMatch = tag.match(/alt=["']([^"']*)["']/i)
    if (altMatch && altMatch[1].trim()) withAlt++
    const srcMatch = tag.match(/src=["']([^"']+)["']/i)
    if (srcMatch) {
      const filename = srcMatch[1].split('/').pop()?.split('?')[0] ?? ''
      if (!GENERIC_FILENAME_RE.test(filename) && filename.length > 5) descriptive++
    }
  }
  return { total: tags.length, withAlt, withDescriptiveFilename: descriptive }
}

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

function scoreLabel(total: number): { label: SeoScoreResult['label']; color: string; textColor: string } {
  if (total >= 90) return { label: 'Excellent', color: 'bg-emerald-500', textColor: 'text-emerald-700' }
  if (total >= 75) return { label: 'Good',      color: 'bg-green-500',   textColor: 'text-green-700' }
  if (total >= 55) return { label: 'OK',         color: 'bg-yellow-400',  textColor: 'text-yellow-700' }
  if (total >= 35) return { label: 'Needs Work', color: 'bg-orange-400',  textColor: 'text-orange-700' }
  return               { label: 'Poor',          color: 'bg-red-500',     textColor: 'text-red-700' }
}

// ─── main scorer ──────────────────────────────────────────────────────────────

export function computeSeoScore(input: SeoInput): SeoScoreResult {
  const checks: SeoCheck[] = []

  const rawHtml   = input.description ?? ''
  const plainBody = stripHtml(rawHtml)
  // combine body + summary for content checks
  const fullPlain = [plainBody, stripHtml(input.summary ?? '')].join(' ').trim()

  const fk       = (input.focusKeyword ?? '').trim()
  const title    = (input.title ?? '').trim()
  const slug     = (input.slug ?? '').trim()
  const mTitle   = (input.metaTitle ?? '').trim()
  const mDesc    = (input.metaDescription ?? '').trim()

  // ── GROUP: Keywords (35 pts) ─────────────────────────────────────────────

  const fkSet = fk.length > 0
  checks.push({
    key: 'kw_set', group: 'Keywords', label: 'Focus keyword is set', maxPoints: 5,
    passed: fkSet, points: fkSet ? 5 : 0,
    fix: 'Set a focus keyword — this is the primary term you want to rank for.',
  })

  const fkInTitle = fkSet && keywordStemMatch(fk, title)
  checks.push({
    key: 'kw_in_title', group: 'Keywords', label: 'Focus keyword appears in page title', maxPoints: 8,
    passed: fkInTitle, points: fkInTitle ? 8 : 0,
    fix: `Add "${fk}" (or a close variant) to the Title field.`,
    detail: fkSet ? `Title: "${title}"` : undefined,
  })

  const fkInMetaTitle = fkSet && keywordStemMatch(fk, mTitle)
  checks.push({
    key: 'kw_in_meta_title', group: 'Keywords', label: 'Focus keyword appears in meta title', maxPoints: 8,
    passed: fkInMetaTitle, points: fkInMetaTitle ? 8 : 0,
    fix: `Include "${fk}" in your Meta Title.`,
    detail: mTitle ? `Meta title: "${mTitle}"` : 'Meta title not set yet.',
  })

  const fkInMetaDesc = fkSet && keywordInText(fk, mDesc)
  checks.push({
    key: 'kw_in_meta_desc', group: 'Keywords', label: 'Focus keyword appears in meta description', maxPoints: 8,
    passed: fkInMetaDesc, points: fkInMetaDesc ? 8 : 0,
    fix: `Mention "${fk}" naturally in your Meta Description.`,
  })

  const fkInContent = fkSet && keywordInText(fk, fullPlain)
  checks.push({
    key: 'kw_in_content', group: 'Keywords', label: 'Focus keyword appears in body content', maxPoints: 6,
    passed: fkInContent, points: fkInContent ? 6 : 0,
    fix: `Use "${fk}" in your Description or Summary text.`,
  })

  const skSet = (input.secondaryKeywords ?? '').trim().length > 0
  checks.push({
    key: 'secondary_kw', group: 'Keywords', label: 'Secondary keywords are set', maxPoints: 5,
    passed: skSet, points: skSet ? 5 : 0,
    fix: 'Add 2–4 secondary keywords (comma-separated) to broaden your keyword coverage.',
  })

  // ── GROUP: Meta Tags (25 pts) ────────────────────────────────────────────

  const metaTitleLen = mTitle.length
  const metaTitleGood = metaTitleLen >= 50 && metaTitleLen <= 65
  checks.push({
    key: 'meta_title_length', group: 'Meta Tags', label: 'Meta title length is 50–65 characters', maxPoints: 10,
    passed: metaTitleGood, points: metaTitleGood ? 10 : 0,
    fix: metaTitleLen === 0
      ? 'Write a meta title (aim for 50–65 characters).'
      : metaTitleLen < 50
        ? `Meta title too short (${metaTitleLen} chars). Add more descriptive text.`
        : `Meta title too long (${metaTitleLen} chars). Keep it under 65.`,
    detail: metaTitleLen > 0 ? `Current: ${metaTitleLen} characters` : undefined,
  })

  const metaDescLen = mDesc.length
  const metaDescGood = metaDescLen >= 150 && metaDescLen <= 160
  checks.push({
    key: 'meta_desc_length', group: 'Meta Tags', label: 'Meta description length is 150–160 characters', maxPoints: 10,
    passed: metaDescGood, points: metaDescGood ? 10 : 0,
    fix: metaDescLen === 0
      ? 'Write a meta description (aim for 150–160 characters).'
      : metaDescLen < 150
        ? `Meta description too short (${metaDescLen} chars). Expand it.`
        : `Meta description too long (${metaDescLen} chars). Trim it to 160.`,
    detail: metaDescLen > 0 ? `Current: ${metaDescLen} characters` : undefined,
  })

  const metaDescSet = metaDescLen > 0
  checks.push({
    key: 'meta_desc_set', group: 'Meta Tags', label: 'Meta description is written', maxPoints: 5,
    passed: metaDescSet, points: metaDescSet ? 5 : 0,
    fix: 'Add a meta description — it appears in search results and improves click-through rate.',
  })

  // ── GROUP: Content (20 pts) ──────────────────────────────────────────────

  const wc = wordCount(fullPlain)
  const wcGood = wc >= 300
  checks.push({
    key: 'word_count', group: 'Content', label: 'Content has at least 300 words', maxPoints: 8,
    passed: wcGood, points: wcGood ? 8 : 0,
    fix: `Add more content. Currently ${wc} words — aim for at least 300.`,
    detail: `${wc} words`,
  })

  const noH1 = !hasH1(rawHtml)
  checks.push({
    key: 'no_h1', group: 'Content', label: 'No H1 tag inside body content', maxPoints: 4,
    passed: noH1, points: noH1 ? 4 : 0,
    fix: 'Remove <h1> tags from the description — the page title acts as H1. Use H2/H3 for sections.',
  })

  const hasImage = (input.images ?? []).length > 0
  checks.push({
    key: 'has_image', group: 'Content', label: 'Package has at least one image', maxPoints: 4,
    passed: hasImage, points: hasImage ? 4 : 0,
    fix: 'Upload at least one image in the Media tab.',
  })

  const imgInfo = contentImagesInfo(rawHtml)
  const imagesHaveAlt = imgInfo.total === 0 || (imgInfo.withAlt / imgInfo.total >= 0.8)
  checks.push({
    key: 'img_alt', group: 'Content', label: 'Content images have descriptive alt text', maxPoints: 4,
    passed: imagesHaveAlt, points: imagesHaveAlt ? 4 : 0,
    fix: imgInfo.total === 0
      ? 'No images in content detected.'
      : `${imgInfo.total - imgInfo.withAlt} of ${imgInfo.total} content images are missing alt text.`,
    detail: imgInfo.total > 0 ? `${imgInfo.withAlt}/${imgInfo.total} images have alt text` : undefined,
  })

  const fkInHeading = fkSet && keywordInHeading(fk, rawHtml)
  checks.push({
    key: 'kw_in_heading', group: 'Content', label: 'Focus keyword in an H2 or H3 heading', maxPoints: 4,
    passed: fkInHeading, points: fkInHeading ? 4 : 0,
    fix: `Add a subheading (H2 or H3) in the description that contains "${fk}".`,
  })

  // ── GROUP: Technical (10 pts) ────────────────────────────────────────────

  const hasLinks = hasInternalLinks(rawHtml)
  checks.push({
    key: 'internal_links', group: 'Technical', label: 'Description contains internal links', maxPoints: 3,
    passed: hasLinks, points: hasLinks ? 3 : 0,
    fix: 'Add at least one internal link in the description (e.g. to a related package, blog post, or destination page). Use the Link Suggestions tool.',
  })

  const robotsOk = !(input.metaRobots ?? 'index, follow').toLowerCase().includes('noindex')
  checks.push({
    key: 'indexable', group: 'Technical', label: 'Page is set to be indexed by search engines', maxPoints: 3,
    passed: robotsOk, points: robotsOk ? 3 : 0,
    fix: 'Change Meta Robots from "noindex" to "index, follow" in the SEO → Technical section.',
  })

  const canonicalSet = (input.canonicalUrl ?? '').trim().length > 0
  checks.push({
    key: 'canonical', group: 'Technical', label: 'Canonical URL is specified', maxPoints: 4,
    passed: canonicalSet, points: canonicalSet ? 4 : 0,
    fix: 'Set a canonical URL to prevent duplicate-content issues if this page can be reached via multiple URLs.',
  })

  // ── GROUP: Social (10 pts) ───────────────────────────────────────────────

  const ogTitleSet = (input.ogTitle ?? '').trim().length > 0
  checks.push({
    key: 'og_title', group: 'Social', label: 'Open Graph title is set', maxPoints: 3,
    passed: ogTitleSet, points: ogTitleSet ? 3 : 0,
    fix: 'Add an OG Title in the SEO → Social section (auto-fills from Meta Title).',
  })

  const ogDescSet = (input.ogDescription ?? '').trim().length > 0
  checks.push({
    key: 'og_desc', group: 'Social', label: 'Open Graph description is set', maxPoints: 3,
    passed: ogDescSet, points: ogDescSet ? 3 : 0,
    fix: 'Add an OG Description in the SEO → Social section.',
  })

  const ogImgSet = (input.ogImage ?? '').trim().length > 0 || (input.images ?? []).length > 0
  checks.push({
    key: 'og_image', group: 'Social', label: 'Open Graph image is available', maxPoints: 4,
    passed: ogImgSet, points: ogImgSet ? 4 : 0,
    fix: 'Set an OG Image (or upload a package image — it will be used as fallback).',
  })

  // ── GROUP: Schema (5 pts) ────────────────────────────────────────────────

  const schemaRaw = (input.schemaMarkup ?? '').trim()
  const schemaSet = schemaRaw.length > 0
  const schemaValid = schemaSet && isValidJson(schemaRaw)
  checks.push({
    key: 'schema_markup', group: 'Schema', label: 'Valid JSON-LD schema markup is present', maxPoints: 5,
    passed: schemaValid, points: schemaValid ? 5 : schemaSet ? 2 : 0,
    fix: schemaSet && !schemaValid
      ? 'Your schema markup contains invalid JSON. Fix the syntax or use the AI generator to create it.'
      : 'Add JSON-LD schema markup (e.g. TouristAttraction or TravelAgency). Use the AI generator to create it automatically.',
    detail: schemaSet && !schemaValid ? 'JSON parse error detected' : undefined,
  })

  // ── Aggregate ────────────────────────────────────────────────────────────

  const groupOrder: SeoGroup[] = ['Keywords', 'Meta Tags', 'Content', 'Technical', 'Social', 'Schema']

  const groups = {} as Record<SeoGroup, GroupScore>
  for (const g of groupOrder) {
    const gc = checks.filter(c => c.group === g)
    const earned = gc.reduce((s, c) => s + c.points, 0)
    const max    = gc.reduce((s, c) => s + c.maxPoints, 0)
    const pct    = max > 0 ? Math.round((earned / max) * 100) : 0
    const { label, color } = scoreLabel(pct)
    groups[g] = { earned, max, percent: pct, label, color }
  }

  const totalEarned   = checks.reduce((s, c) => s + c.points, 0)
  const totalPossible = checks.reduce((s, c) => s + c.maxPoints, 0)
  const total         = Math.round((totalEarned / totalPossible) * 100)
  const { label, color, textColor } = scoreLabel(total)

  return {
    total,
    earned: totalEarned,
    possible: totalPossible,
    label,
    color,
    textColor,
    checks,
    groups,
    groupOrder,
  }
}
