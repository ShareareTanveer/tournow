import { DESTINATION_SECTION_LIBRARY } from '@/lib/destination-page-builder'

export type DestinationBuilderSectionType = {
  type: string
  label: string
  description: string
  iconName: string
  category: 'layout' | 'content' | 'data' | 'advanced'
}

const ICONS: Record<string, string> = {
  hero: 'home',
  'quick-facts': 'info',
  story: 'book',
  highlights: 'star',
  gallery: 'image',
  'stats-strip': 'bar-chart',
  packages: 'package',
  tours: 'map',
  faq: 'help-circle',
  testimonial: 'message-circle',
  cta: 'send',
  'html-block': 'code',
  canvas: 'layout',
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
    iconName: ICONS[item.type] ?? 'file-text',
    category: CATEGORIES[item.type] ?? 'content',
  }))
