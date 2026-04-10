/**
 * Run with:  npx ts-node prisma/seed-ai-templates.ts
 * Or:        npx tsx prisma/seed-ai-templates.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEMPLATES = [
  // ── Package SEO only ──────────────────────────────────────────────────────
  {
    key: 'package-seo-generate',
    name: 'Package — SEO Fields',
    description: 'Generates metaTitle, metaDescription, focusKeyword, secondaryKeywords, ogTitle, ogDescription for a package.',
    systemPrompt: `You are an expert travel SEO copywriter for a Sri Lanka-based travel agency called Halo Holidays.
Your job is to generate high-quality, keyword-rich SEO metadata for travel packages.
Always respond with valid JSON only — no markdown, no explanations.`,
    userPrompt: `Generate SEO metadata for the following travel package:

Title: {{title}}
Category: {{category}}
Summary: {{summary}}
Destination: {{destination}}
Duration: {{duration}}
Focus Keywords: {{keywords}}

Return a JSON object with these exact keys:
{
  "metaTitle": "...",         // max 65 chars, keyword-rich
  "metaDescription": "...",   // max 160 chars, compelling, includes keyword
  "focusKeyword": "...",      // single primary keyword phrase
  "secondaryKeywords": "...", // comma-separated 3-5 secondary keywords
  "ogTitle": "...",           // slightly more compelling than metaTitle, max 70 chars
  "ogDescription": "...",     // 1-2 sentences, emotionally engaging, max 200 chars
  "schemaMarkup": "..."       // valid JSON-LD TravelAction/TouristTrip schema as a JSON string
}`,
    outputFormat: 'json',
  },

  // ── Package full content ───────────────────────────────────────────────────
  {
    key: 'package-full-generate',
    name: 'Package — Full Content',
    description: 'Generates complete package content: description, highlights, itinerary, inclusions, plus SEO fields.',
    systemPrompt: `You are an expert travel content writer and SEO specialist for Halo Holidays, a premium Sri Lanka travel agency.
Write engaging, detailed, conversion-optimised content for travel packages.
Always respond with valid JSON only — no markdown, no explanations.`,
    userPrompt: `Generate complete content for the following travel package:

Title: {{title}}
Category: {{category}}
Destination: {{destination}}
Duration: {{duration}}
Summary: {{summary}}
Focus Keywords: {{keywords}}

Return a JSON object with these exact keys:
{
  "description": "...",       // 300-500 word HTML content using <p>, <ul>, <li>, <strong>. NO <h1>. Use <h2> for subheadings. Include focus keyword naturally.
  "highlights": ["..."],      // array of 4-6 bullet point highlights
  "inclusions": ["..."],      // array of what is included (6-10 items)
  "exclusions": ["..."],      // array of what is NOT included (4-6 items)
  "metaTitle": "...",
  "metaDescription": "...",
  "focusKeyword": "...",
  "secondaryKeywords": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "schemaMarkup": "..."       // valid JSON-LD TouristTrip schema as a JSON string
}`,
    outputFormat: 'json',
  },

  // ── Tour SEO only ─────────────────────────────────────────────────────────
  {
    key: 'tour-seo-generate',
    name: 'Tour — SEO Fields',
    description: 'Generates SEO metadata for a tour.',
    systemPrompt: `You are an expert travel SEO copywriter for Halo Holidays, a Sri Lanka-based travel agency.
Always respond with valid JSON only — no markdown, no explanations.`,
    userPrompt: `Generate SEO metadata for the following tour:

Title: {{title}}
Summary: {{summary}}
Duration: {{duration}}
Focus Keywords: {{keywords}}

Return a JSON object with these exact keys:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "focusKeyword": "...",
  "secondaryKeywords": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "schemaMarkup": "..."
}`,
    outputFormat: 'json',
  },

  // ── Tour full content ─────────────────────────────────────────────────────
  {
    key: 'tour-full-generate',
    name: 'Tour — Full Content',
    description: 'Generates complete tour content plus SEO fields.',
    systemPrompt: `You are an expert travel content writer and SEO specialist for Halo Holidays.
Write engaging, detailed, conversion-optimised content for day tours and excursions.
Always respond with valid JSON only — no markdown, no explanations.`,
    userPrompt: `Generate complete content for the following tour:

Title: {{title}}
Duration: {{duration}}
Summary: {{summary}}
Focus Keywords: {{keywords}}

Return a JSON object with these exact keys:
{
  "description": "...",       // 250-400 word HTML content. NO <h1>. Include focus keyword naturally.
  "highlights": ["..."],      // array of 4-5 tour highlights
  "inclusions": ["..."],
  "exclusions": ["..."],
  "metaTitle": "...",
  "metaDescription": "...",
  "focusKeyword": "...",
  "secondaryKeywords": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "schemaMarkup": "..."
}`,
    outputFormat: 'json',
  },

  // ── Blog post generation ──────────────────────────────────────────────────
  {
    key: 'blog-full-generate',
    name: 'Blog Post — Full Content',
    description: 'Generates a complete SEO-optimised blog post.',
    systemPrompt: `You are an expert travel blogger and SEO content strategist for Halo Holidays.
Write informative, engaging blog posts that rank well and convert readers into customers.
Always respond with valid JSON only — no markdown, no explanations.`,
    userPrompt: `Write a blog post about:

Topic: {{topic}}
Target Keyword: {{keyword}}
Related Packages/Tours: {{relatedContent}}
Tone: {{tone}}

Return a JSON object with these exact keys:
{
  "title": "...",             // SEO-optimised H1 title (max 70 chars)
  "slug": "...",              // URL-friendly slug
  "excerpt": "...",           // 2-3 sentence teaser (max 200 chars)
  "content": "...",           // 600-1000 word HTML blog post. Use <h2>, <h3>, <p>, <ul>. NO <h1>. Include 2-3 internal link placeholders as [[LINK:package-slug]] where relevant.
  "metaTitle": "...",
  "metaDescription": "...",
  "focusKeyword": "...",
  "secondaryKeywords": "...",
  "ogTitle": "...",
  "ogDescription": "..."
}`,
    outputFormat: 'json',
  },
]

async function main() {
  console.log('Seeding AI prompt templates...')
  for (const tpl of TEMPLATES) {
    await prisma.aiPromptTemplate.upsert({
      where:  { key: tpl.key },
      create: tpl,
      update: { ...tpl },
    })
    console.log(`  ✓ ${tpl.key}`)
  }
  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
