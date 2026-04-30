import { DESTINATION_SECTION_LIBRARY } from '@/lib/destination-page-builder'

export type DestinationBuilderSectionType = {
  type: string
  label: string
  description: string
  icon: string
  category: 'layout' | 'content' | 'data' | 'advanced'
}

const ICONS: Record<string, string> = {
  hero: '🏠',
  'quick-facts': '📌',
  story: '📖',
  highlights: '✨',
  gallery: '🖼️',
  'stats-strip': '📊',
  packages: '🎒',
  tours: '🗺️',
  faq: '❓',
  testimonial: '💬',
  cta: '📣',
  'html-block': '🔧',
  canvas: '🧩',
}

const CATEGORIES: Record<string, DestinationBuilderSectionType['category']> = {
  hero: 'layout',
  'quick-facts': 'content',
  story: 'content',
  highlights: 'content',
  gallery: 'content',
  'stats-strip': 'content',
  packages: 'data',
  tours: 'data',
  faq: 'content',
  testimonial: 'content',
  cta: 'layout',
  'html-block': 'advanced',
  canvas: 'advanced',
}

export const DESTINATION_BUILDER_SECTION_TYPES: DestinationBuilderSectionType[] =
  DESTINATION_SECTION_LIBRARY.map((item) => ({
    type: item.type,
    label: item.label,
    description: item.description,
    icon: ICONS[item.type] ?? '📄',
    category: CATEGORIES[item.type] ?? 'content',
  }))
