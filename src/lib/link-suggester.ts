/**
 * link-suggester.ts
 *
 * Internal link suggestion engine.
 * Given a piece of content (title + body/description), scores all
 * packages, tours, and blog posts by keyword relevance and returns
 * ranked suggestions with ready-to-insert anchor tags.
 *
 * Algorithm (per candidate):
 *   1. Tokenise both the source content and candidate's title/keywords
 *   2. Count exact token matches and partial (stem) matches
 *   3. Boost candidates whose focusKeyword appears in the source
 *   4. Penalise if the candidate's URL is already linked in the content
 *   5. Return top-N by score, grouped by entity type
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LinkCandidate {
  id:           string
  type:         'package' | 'tour' | 'blog' | 'news'
  title:        string
  slug:         string
  url:          string           // absolute path e.g. /packages/bali-honeymoon
  excerpt?:     string
  focusKeyword?: string
  keywords?:    string           // comma-separated secondary keywords
}

export interface LinkSuggestion extends LinkCandidate {
  score:        number           // 0–100
  matchedTerms: string[]         // which terms triggered the match
  alreadyLinked: boolean         // true if the url is already in the content
  anchorHtml:   string           // ready-to-insert <a> tag
}

// ─── Tokeniser ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','shall',
  'this','that','these','those','it','its','i','you','we','they','he','she',
  'our','your','their','my','his','her','from','by','as','up','into','out',
  'about','than','more','also','so','if','not','no','just','all','any',
])

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')        // strip HTML
    .replace(/[^a-z0-9\s]/g, ' ')   // remove punctuation
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t))
}

function stem(word: string): string {
  // Lightweight English suffix stripping (Porter-lite)
  return word
    .replace(/ies$/, 'y')
    .replace(/ied$/, 'y')
    .replace(/(s|es|ed|ing|ly|er|est)$/, '')
    .replace(/([aeiou])([^aeiou])\2$/, '$1$2')  // double consonant
}

// ─── Already-linked detector ──────────────────────────────────────────────────

function isAlreadyLinked(content: string, url: string): boolean {
  // Check if href="url" or href='url' exists in the content
  return content.includes(`href="${url}"`) || content.includes(`href='${url}'`)
}

// ─── Phrase match (multi-word) ────────────────────────────────────────────────

function phraseMatch(source: string, phrase: string): boolean {
  if (!phrase) return false
  return source.toLowerCase().includes(phrase.toLowerCase())
}

// ─── Score a single candidate ─────────────────────────────────────────────────

function scoreCandidate(
  sourceTokens: string[],
  sourceStems: string[],
  sourceRaw: string,
  candidate: LinkCandidate,
): { score: number; matchedTerms: string[] } {
  const matched = new Set<string>()
  let score = 0

  // Candidate tokens from title + focusKeyword + secondaryKeywords
  const candidateText = [
    candidate.title,
    candidate.focusKeyword ?? '',
    candidate.keywords ?? '',
    candidate.excerpt ?? '',
  ].join(' ')

  const candidateTokens = tokenise(candidateText)
  const candidateStems  = candidateTokens.map(stem)

  // 1. Exact token overlap (source ∩ candidate)
  const sourceSet = new Set(sourceTokens)
  for (const ct of candidateTokens) {
    if (sourceSet.has(ct)) {
      matched.add(ct)
      score += 8
    }
  }

  // 2. Stem overlap (source ∩ candidate, stemmed)
  const sourceStemSet = new Set(sourceStems)
  for (const cs of candidateStems) {
    const stemmed = stem(cs)
    if (sourceStemSet.has(stemmed)) {
      score += 3
    }
  }

  // 3. Focus keyword phrase match (highest value — 20pts)
  if (candidate.focusKeyword && phraseMatch(sourceRaw, candidate.focusKeyword)) {
    matched.add(candidate.focusKeyword)
    score += 20
  }

  // 4. Secondary keyword phrase matches (5pts each)
  if (candidate.keywords) {
    for (const kw of candidate.keywords.split(',').map(k => k.trim()).filter(Boolean)) {
      if (phraseMatch(sourceRaw, kw)) {
        matched.add(kw)
        score += 5
      }
    }
  }

  // 5. Title word match (2pts per word found in source)
  for (const t of tokenise(candidate.title)) {
    if (sourceSet.has(t)) {
      score += 2
    }
  }

  // 6. Normalise to 0–100
  const normalised = Math.min(100, Math.round(score))

  return { score: normalised, matchedTerms: Array.from(matched) }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface SuggestLinksOptions {
  title:        string
  content:      string       // raw HTML content
  currentSlug?: string       // to exclude self
  limit?:       number       // default 10
  minScore?:    number       // default 10
}

export function suggestLinks(
  candidates: LinkCandidate[],
  opts: SuggestLinksOptions,
): LinkSuggestion[] {
  const { title, content, currentSlug, limit = 10, minScore = 10 } = opts

  const sourceRaw    = `${title} ${content}`
  const sourceTokens = tokenise(sourceRaw)
  const sourceStems  = sourceTokens.map(stem)

  const results: LinkSuggestion[] = []

  for (const candidate of candidates) {
    // Skip self
    if (currentSlug && candidate.slug === currentSlug) continue

    const { score, matchedTerms } = scoreCandidate(
      sourceTokens, sourceStems, sourceRaw, candidate,
    )

    if (score < minScore) continue

    const alreadyLinked = isAlreadyLinked(content, candidate.url)

    // Build anchor HTML
    const anchorText = candidate.focusKeyword
      ? candidate.focusKeyword
      : candidate.title
    const anchorHtml = `<a href="${candidate.url}" title="${candidate.title.replace(/"/g, '&quot;')}">${anchorText}</a>`

    results.push({
      ...candidate,
      score,
      matchedTerms,
      alreadyLinked,
      anchorHtml,
    })
  }

  // Sort by score descending, already-linked last
  results.sort((a, b) => {
    if (a.alreadyLinked !== b.alreadyLinked) return a.alreadyLinked ? 1 : -1
    return b.score - a.score
  })

  return results.slice(0, limit)
}

// ─── Auto-link: inject links into HTML content ────────────────────────────────

/**
 * Automatically inserts anchor tags into content for the top suggestions.
 * Only links the FIRST occurrence of each matched phrase.
 * Never links text already inside an <a> tag.
 * Returns the modified HTML string.
 */
export function autoInsertLinks(
  content: string,
  suggestions: LinkSuggestion[],
  maxLinks = 5,
): string {
  let result = content
  let inserted = 0

  for (const s of suggestions) {
    if (s.alreadyLinked) continue
    if (inserted >= maxLinks) break

    const phrase = s.focusKeyword || s.title
    if (!phrase) continue

    // Escape for regex
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<!<[^>]*)\\b(${escaped})\\b`, 'i')

    // Only insert if not already inside an anchor
    const newContent = result.replace(regex, (match) => {
      // Check if we're inside an <a> tag by a simple heuristic
      // Find position of match in result
      const idx = result.search(regex)
      if (idx === -1) return match

      const before = result.slice(0, idx)
      const openA  = (before.match(/<a[\s>]/gi) ?? []).length
      const closeA = (before.match(/<\/a>/gi) ?? []).length
      if (openA > closeA) return match   // inside an <a>, skip

      return `<a href="${s.url}" title="${s.title.replace(/"/g, '&quot;')}">${match}</a>`
    })

    if (newContent !== result) {
      result = newContent
      inserted++
    }
  }

  return result
}
