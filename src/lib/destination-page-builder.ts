import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const DESTINATION_SECTION_TYPES = [
  'hero',
  'quick-facts',
  'story',
  'highlights',
  'gallery',
  'stats-strip',
  'packages',
  'tours',
  'faq',
  'testimonial',
  'cta',
  'html-block',
  'canvas',
] as const

export type DestinationSectionType = (typeof DESTINATION_SECTION_TYPES)[number]

export type CanvasWidgetType =
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'stat'
  | 'badge'
  | 'card'
  | 'faq-item'
  | 'review-card'
  | 'package-teaser'
  | 'html'

export type CanvasWidget = {
  id: string
  type: CanvasWidgetType
  props: Record<string, unknown>
}

export type CanvasColumn = {
  id: string
  width: number
  widgets: CanvasWidget[]
}

export type CanvasRow = {
  id: string
  columns: CanvasColumn[]
}

export type DestinationCanvas = {
  rows: CanvasRow[]
}

type DestinationSeedInput = {
  id: string
  name: string
  slug: string
  region: string
  country: string
  language: string
  bestSeason: string
  costLevel: string
  description: string
  imageUrl?: string | null
  images?: string[]
}

export type SectionStyle = {
  bgColor?: string
  bgImage?: string
  paddingTop?: number
  paddingBottom?: number
}

export type DestinationSectionPreset = {
  key: string
  label: string
  description: string
  content?: Record<string, unknown>
  style?: SectionStyle
  mode?: 'template' | 'html' | 'builder'
  canvas?: DestinationCanvas
}

export type DestinationSectionDefinition = {
  type: DestinationSectionType
  label: string
  description: string
  category: 'content' | 'data' | 'custom'
  defaultTitle: string
  buildDefaultContent: (destination: DestinationSeedInput) => Record<string, unknown>
  defaultStyle?: SectionStyle
  defaultMode?: 'template' | 'html' | 'builder'
  buildDefaultCanvas?: (destination: DestinationSeedInput) => DestinationCanvas
  presets?: DestinationSectionPreset[]
}

export function normalizeDestinationSeed(input: Partial<DestinationSeedInput> & { id: string; name: string; slug: string }): DestinationSeedInput {
  return {
    id: input.id,
    name: input.name,
    slug: input.slug,
    region: input.region ?? '',
    country: input.country ?? '',
    language: input.language ?? '',
    bestSeason: input.bestSeason ?? '',
    costLevel: input.costLevel ?? '',
    description: input.description ?? '',
    imageUrl: input.imageUrl ?? null,
    images: input.images ?? [],
  }
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function defaultStyle(style?: SectionStyle): SectionStyle {
  return {
    bgColor: style?.bgColor ?? '',
    bgImage: style?.bgImage ?? '',
    paddingTop: style?.paddingTop ?? 72,
    paddingBottom: style?.paddingBottom ?? 72,
  }
}

function createCanvasRow(columns: Array<{ width: number; widgets: CanvasWidget[] }>): CanvasRow {
  return {
    id: uid('row'),
    columns: columns.map((column) => ({
      id: uid('col'),
      width: column.width,
      widgets: column.widgets.map((widget) => ({ ...widget, id: widget.id || uid('widget') })),
    })),
  }
}

export const DESTINATION_SECTION_LIBRARY: DestinationSectionDefinition[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Large header with image, summary and CTA.',
    category: 'content',
    defaultTitle: 'Hero',
    defaultStyle: defaultStyle({ paddingTop: 0, paddingBottom: 0 }),
    buildDefaultContent: (destination) => ({
      eyebrow: destination.region || destination.country,
      title: destination.name,
      subtitle: destination.description,
      image: destination.images?.[0] ?? destination.imageUrl ?? '',
      showPackagesCount: true,
      primaryCtaText: 'Book Free Consultation',
      primaryCtaLink: '/consultation',
    }),
    presets: [
      {
        key: 'cinematic',
        label: 'Cinematic',
        description: 'Large visual hero with short, punchy summary.',
      },
      {
        key: 'split-intro',
        label: 'Split Intro',
        description: 'Works well with a clean image and tighter text.',
        style: defaultStyle({ paddingTop: 40, paddingBottom: 40 }),
      },
    ],
  },
  {
    type: 'quick-facts',
    label: 'Quick Facts',
    description: 'Compact destination facts with consultation card.',
    category: 'content',
    defaultTitle: 'Quick Facts',
    defaultStyle: defaultStyle({ paddingTop: 0, paddingBottom: 0 }),
    buildDefaultContent: (destination) => ({
      title: `Why Visit ${destination.name}`,
      facts: [
        { label: 'Region', value: destination.region, icon: 'map-pin' },
        { label: 'Country', value: destination.country, icon: 'globe' },
        { label: 'Language', value: destination.language, icon: 'message-square' },
        { label: 'Best Season', value: destination.bestSeason, icon: 'sun' },
        { label: 'Cost Level', value: destination.costLevel, icon: 'dollar-sign' },
      ].filter((item) => item.value),
      ctaTitle: `Plan a trip to ${destination.name}`,
      ctaText: 'Get a personalised package from our travel experts tailored to your dates and budget.',
      ctaButtonText: 'Book Free Consultation',
      ctaButtonLink: '/consultation',
    }),
  },
  {
    type: 'story',
    label: 'Story',
    description: 'Rich text content block for destination overview.',
    category: 'content',
    defaultTitle: 'About Destination',
    buildDefaultContent: (destination) => ({
      heading: `About ${destination.name}`,
      body: destination.description,
    }),
    presets: [
      {
        key: 'magazine',
        label: 'Magazine',
        description: 'Long-form storytelling layout for premium pages.',
      },
      {
        key: 'practical',
        label: 'Practical Guide',
        description: 'Good for concise travel advice and planning notes.',
      },
    ],
  },
  {
    type: 'highlights',
    label: 'Highlights',
    description: 'Grid of editable destination highlights.',
    category: 'content',
    defaultTitle: 'Highlights',
    defaultStyle: defaultStyle({ bgColor: '#f9fafb' }),
    buildDefaultContent: (destination) => ({
      heading: `Highlights of ${destination.name}`,
      subheading: 'Edit these cards for each destination and use them to surface the most compelling reasons to travel there.',
      items: [
        {
          title: 'Best Time To Go',
          description: destination.bestSeason || 'Add the ideal travel season for this destination.',
          image: destination.images?.[0] ?? destination.imageUrl ?? '',
        },
        {
          title: 'Travel Style',
          description: destination.costLevel
            ? `${destination.costLevel} destination with flexible package options.`
            : 'Describe whether this destination suits budget, comfort or premium travellers.',
          image: destination.images?.[0] ?? destination.imageUrl ?? '',
        },
        {
          title: 'Culture & Experience',
          description: `Customise this card with the experiences that make ${destination.name} stand out.`,
          image: destination.images?.[0] ?? destination.imageUrl ?? '',
        },
      ],
    }),
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Destination image collage with editable caption.',
    category: 'content',
    defaultTitle: 'Gallery',
    buildDefaultContent: (destination) => ({
      heading: `${destination.name} Gallery`,
      subheading: 'Use this section for visual storytelling, itinerary teasers, or hotel and attraction highlights.',
      images: (destination.images ?? []).slice(0, 6),
    }),
  },
  {
    type: 'stats-strip',
    label: 'Stats Strip',
    description: 'Compact row of travel stats or selling points.',
    category: 'content',
    defaultTitle: 'Stats Strip',
    defaultStyle: defaultStyle({ bgColor: '#0f172a', paddingTop: 28, paddingBottom: 28 }),
    buildDefaultContent: (destination) => ({
      items: [
        { value: destination.bestSeason || 'Year-round', label: 'Best Season' },
        { value: destination.language || 'English friendly', label: 'Language' },
        { value: destination.costLevel || 'Flexible', label: 'Budget Style' },
      ],
    }),
  },
  {
    type: 'packages',
    label: 'Packages',
    description: 'Auto-pulls active packages for this destination.',
    category: 'data',
    defaultTitle: 'Packages',
    buildDefaultContent: (destination) => ({
      heading: `Packages to ${destination.name}`,
      subheading: 'Handpicked packages connected to this destination.',
      emptyTitle: 'Packages coming soon',
      emptyText: `We are preparing tailored packages for ${destination.name}. Book a consultation and we can build one for you now.`,
      ctaText: 'View all packages',
    }),
  },
  {
    type: 'tours',
    label: 'Tours',
    description: 'Auto-pulls active tours connected to this destination.',
    category: 'data',
    defaultTitle: 'Tours',
    buildDefaultContent: (destination) => ({
      heading: `Tours featuring ${destination.name}`,
      subheading: `Multi-destination tours that include ${destination.name}.`,
    }),
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Manual FAQ accordion for destination concerns.',
    category: 'content',
    defaultTitle: 'FAQ',
    buildDefaultContent: (destination) => ({
      heading: `Frequently Asked Questions about ${destination.name}`,
      items: [
        {
          question: `When is the best time to visit ${destination.name}?`,
          answer: destination.bestSeason || 'Add a seasonal answer for this destination.',
        },
        {
          question: `What kind of budget should I plan for in ${destination.name}?`,
          answer: destination.costLevel
            ? `${destination.name} is generally suited for ${destination.costLevel.toLowerCase()} travellers, but we can customise packages to match your budget.`
            : 'Add destination budget guidance here.',
        },
      ],
    }),
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    description: 'Single standout quote or social proof block.',
    category: 'content',
    defaultTitle: 'Testimonial',
    defaultStyle: defaultStyle({ bgColor: '#f8fafc' }),
    buildDefaultContent: (destination) => ({
      heading: `Why travellers love ${destination.name}`,
      quote: `“Customise this quote with a traveller story or your own positioning for ${destination.name}.”`,
      author: 'Metro Voyage Traveller',
      role: 'Happy Customer',
      image: destination.images?.[0] ?? destination.imageUrl ?? '',
    }),
  },
  {
    type: 'cta',
    label: 'Bottom CTA',
    description: 'Full-width call-to-action banner.',
    category: 'content',
    defaultTitle: 'Bottom CTA',
    defaultStyle: defaultStyle({ bgImage: '' }),
    buildDefaultContent: (destination) => ({
      eyebrow: `${destination.name} • ${destination.region}`,
      heading: `Start Your ${destination.name} Journey`,
      body: 'Let our experts craft the perfect itinerary for you with flexible planning and personalised recommendations.',
      primaryCtaText: 'Book Free Consultation',
      primaryCtaLink: '/consultation',
      secondaryCtaText: 'Browse Packages',
      secondaryCtaLink: `/packages?destination=${destination.slug}`,
    }),
    presets: [
      {
        key: 'lead-capture',
        label: 'Lead Capture',
        description: 'Sales-focused CTA with stronger urgency.',
      },
      {
        key: 'soft-sell',
        label: 'Soft Sell',
        description: 'Gentler CTA for inspirational pages.',
      },
    ],
  },
  {
    type: 'html-block',
    label: 'Custom HTML',
    description: 'Freeform HTML embed block.',
    category: 'custom',
    defaultTitle: 'Custom HTML',
    buildDefaultContent: () => ({
      htmlContent: '<div class="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">Custom destination content goes here.</div>',
    }),
    defaultMode: 'html',
  },
  {
    type: 'canvas',
    label: 'Canvas Builder',
    description: 'Freeform row/column canvas inspired by the ccbd builder.',
    category: 'custom',
    defaultTitle: 'Canvas Section',
    defaultMode: 'builder',
    buildDefaultContent: () => ({
      heading: 'Custom Canvas Section',
    }),
    buildDefaultCanvas: (destination) => ({
      rows: [
        createCanvasRow([
          {
            width: 100,
            widgets: [
              {
                id: uid('widget'),
                type: 'heading',
                props: { text: `Design a custom section for ${destination.name}`, level: 'h2', align: 'left' },
              },
              {
                id: uid('widget'),
                type: 'text',
                props: {
                  text: 'This freeform canvas lets you combine headings, text, images, buttons, stats, spacers, and HTML inside custom rows and columns.',
                  align: 'left',
                },
              },
            ],
          },
        ]),
      ],
    }),
    presets: [
      {
        key: 'two-column-promo',
        label: 'Two Column Promo',
        description: 'Text on one side and image CTA on the other.',
        mode: 'builder',
      },
      {
        key: 'three-stat-band',
        label: 'Three Stat Band',
        description: 'Great for quick destination selling points.',
        mode: 'builder',
      },
    ],
  },
] satisfies DestinationSectionDefinition[]

function findSectionDefinition(sectionType: DestinationSectionType) {
  return DESTINATION_SECTION_LIBRARY.find((item) => item.type === sectionType)
}

export function getSectionPresetOptions(sectionType: DestinationSectionType) {
  return findSectionDefinition(sectionType)?.presets ?? []
}

export function buildSectionFromDefinition(
  destination: DestinationSeedInput,
  sectionType: DestinationSectionType,
  presetKey?: string | null,
  order = 0
) {
  const definition = findSectionDefinition(sectionType)
  if (!definition) throw new Error(`Unknown destination section type: ${sectionType}`)

  const preset = definition.presets?.find((item) => item.key === presetKey)
  const defaultContent = definition.buildDefaultContent(destination)
  const defaultCanvas = definition.buildDefaultCanvas?.(destination)

  return {
    sectionType,
    title: definition.defaultTitle,
    presetKey: preset?.key ?? null,
    order,
    isVisible: true,
    mode: preset?.mode ?? definition.defaultMode ?? (sectionType === 'html-block' ? 'html' : sectionType === 'canvas' ? 'builder' : 'template'),
    style: defaultStyle({ ...definition.defaultStyle, ...preset?.style }),
    content: { ...defaultContent, ...(preset?.content ?? {}) },
    canvas: preset?.canvas ?? defaultCanvas ?? null,
  }
}

export function buildDefaultDestinationSections(destination: DestinationSeedInput) {
  const orderedTypes: DestinationSectionType[] = [
    'hero',
    'quick-facts',
    'story',
    'highlights',
    'packages',
    'tours',
    'cta',
  ]

  return orderedTypes.map((sectionType, index) =>
    buildSectionFromDefinition(destination, sectionType, null, index)
  )
}

export async function ensureDestinationSections(destinationId: string) {
  const [existingCount, destination] = await Promise.all([
    prisma.destinationSection.count({ where: { destinationId } }),
    prisma.destination.findUnique({
      where: { id: destinationId },
      select: {
        id: true,
        name: true,
        slug: true,
        region: true,
        country: true,
        language: true,
        bestSeason: true,
        costLevel: true,
        description: true,
        imageUrl: true,
        images: true,
      },
    }),
  ])

  if (!destination) return []
  if (existingCount > 0) {
    return prisma.destinationSection.findMany({
      where: { destinationId },
      orderBy: { order: 'asc' },
    })
  }

  const defaults = buildDefaultDestinationSections(destination)
  await prisma.destinationSection.createMany({
    data: defaults.map((section) => ({
      destinationId,
      sectionType: section.sectionType,
      title: section.title,
      presetKey: section.presetKey,
      order: section.order,
      isVisible: section.isVisible,
      mode: section.mode,
      style: section.style as Prisma.InputJsonValue,
      content: section.content as Prisma.InputJsonValue,
      canvas: section.canvas as Prisma.InputJsonValue | undefined,
    })),
  })

  return prisma.destinationSection.findMany({
    where: { destinationId },
    orderBy: { order: 'asc' },
  })
}

export function getCanvasColumnPresets() {
  return [
    { key: '1', label: '1 Column', widths: [100] },
    { key: '2', label: '2 Columns', widths: [50, 50] },
    { key: '3', label: '3 Columns', widths: [33, 34, 33] },
    { key: 'sidebar-left', label: 'Sidebar Left', widths: [35, 65] },
    { key: 'sidebar-right', label: 'Sidebar Right', widths: [65, 35] },
  ]
}

export function createCanvasFromPreset(presetKey: string, destination: DestinationSeedInput): DestinationCanvas {
  const preset = getSectionPresetOptions('canvas').find((item) => item.key === presetKey)
  if (preset?.canvas) return preset.canvas

  if (presetKey === 'two-column-promo') {
    return {
      rows: [
        createCanvasRow([
          {
            width: 55,
            widgets: [
              {
                id: uid('widget'),
                type: 'heading',
                props: { text: `Discover ${destination.name}`, level: 'h2', align: 'left' },
              },
              {
                id: uid('widget'),
                type: 'text',
                props: {
                  text: 'Use this preset for editorial content, seasonal campaigns, or destination-specific promotions.',
                  align: 'left',
                },
              },
              {
                id: uid('widget'),
                type: 'button',
                props: { text: 'Book Free Consultation', href: '/consultation', variant: 'primary', align: 'left' },
              },
            ],
          },
          {
            width: 45,
            widgets: [
              {
                id: uid('widget'),
                type: 'image',
                props: { src: destination.images?.[0] ?? destination.imageUrl ?? '', alt: destination.name, rounded: true },
              },
            ],
          },
        ]),
      ],
    }
  }

  if (presetKey === 'three-stat-band') {
    return {
      rows: [
        createCanvasRow([
          {
            width: 33,
            widgets: [{ id: uid('widget'), type: 'stat', props: { value: destination.bestSeason || 'All Year', label: 'Best Season' } }],
          },
          {
            width: 34,
            widgets: [{ id: uid('widget'), type: 'stat', props: { value: destination.language || 'Friendly', label: 'Language' } }],
          },
          {
            width: 33,
            widgets: [{ id: uid('widget'), type: 'stat', props: { value: destination.costLevel || 'Flexible', label: 'Budget Style' } }],
          },
        ]),
      ],
    }
  }

  if (presetKey === 'blank') {
    return {
      rows: [
        createCanvasRow([
          {
            width: 100,
            widgets: [],
          },
        ]),
      ],
    }
  }

  return buildSectionFromDefinition(destination, 'canvas').canvas ?? { rows: [] }
}

export function createCanvasRowFromWidths(widths: number[]): CanvasRow {
  return createCanvasRow(
    widths.map((width) => ({
      width,
      widgets: [],
    }))
  )
}

export function getCanvasWidgetTemplates(): Array<{
  type: CanvasWidgetType
  label: string
  create: () => CanvasWidget
}> {
  return [
    {
      type: 'heading',
      label: 'Heading',
      create: () => ({ id: uid('widget'), type: 'heading', props: { text: 'New Heading', level: 'h2', align: 'left' } }),
    },
    {
      type: 'text',
      label: 'Text',
      create: () => ({ id: uid('widget'), type: 'text', props: { text: 'Add your text here.', align: 'left' } }),
    },
    {
      type: 'image',
      label: 'Image',
      create: () => ({ id: uid('widget'), type: 'image', props: { src: '', alt: '', rounded: true } }),
    },
    {
      type: 'button',
      label: 'Button',
      create: () => ({ id: uid('widget'), type: 'button', props: { text: 'Click here', href: '#', variant: 'primary', align: 'left' } }),
    },
    {
      type: 'divider',
      label: 'Divider',
      create: () => ({ id: uid('widget'), type: 'divider', props: {} }),
    },
    {
      type: 'spacer',
      label: 'Spacer',
      create: () => ({ id: uid('widget'), type: 'spacer', props: { height: 32 } }),
    },
    {
      type: 'stat',
      label: 'Stat',
      create: () => ({ id: uid('widget'), type: 'stat', props: { value: '100+', label: 'Stat Label' } }),
    },
    {
      type: 'badge',
      label: 'Badge',
      create: () => ({ id: uid('widget'), type: 'badge', props: { text: 'Top Pick', tone: 'indigo' } }),
    },
    {
      type: 'card',
      label: 'Card',
      create: () => ({
        id: uid('widget'),
        type: 'card',
        props: {
          eyebrow: 'Why this works',
          title: 'Flexible itinerary support',
          body: 'Use cards for small selling points, value props, or destination planning tips.',
        },
      }),
    },
    {
      type: 'faq-item',
      label: 'FAQ Item',
      create: () => ({
        id: uid('widget'),
        type: 'faq-item',
        props: {
          question: 'What should travellers know first?',
          answer: 'Add a short answer for this destination here.',
        },
      }),
    },
    {
      type: 'review-card',
      label: 'Review',
      create: () => ({
        id: uid('widget'),
        type: 'review-card',
        props: {
          quote: 'This trip was smooth, personal, and beautifully planned from start to finish.',
          author: 'Happy Traveller',
          role: 'Family Tour Guest',
          rating: 5,
        },
      }),
    },
    {
      type: 'package-teaser',
      label: 'Package Teaser',
      create: () => ({
        id: uid('widget'),
        type: 'package-teaser',
        props: {
          title: 'Best of the destination',
          subtitle: '4 nights / 5 days',
          price: 'From $799',
          ctaText: 'Explore Package',
          ctaLink: '#',
        },
      }),
    },
    {
      type: 'html',
      label: 'HTML',
      create: () => ({ id: uid('widget'), type: 'html', props: { html: '<div>Custom block</div>' } }),
    },
  ]
}

export function sectionLibraryByType() {
  return Object.fromEntries(DESTINATION_SECTION_LIBRARY.map((item) => [item.type, item]))
}
