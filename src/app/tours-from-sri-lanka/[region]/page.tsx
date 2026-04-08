import { Metadata } from 'next'
import TourCard from '@/components/ui/TourCard'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { FiGlobe } from 'react-icons/fi'

const REGION_META: Record<string, { label: string; desc: string }> = {
  'south-east-asia':  { label: 'South East Asia Tours',  desc: 'Explore Singapore, Thailand, Malaysia, Bali & more from Sri Lanka.' },
  'middle-east':      { label: 'Middle East Tours',      desc: 'Dubai, Abu Dhabi, Qatar, Oman — luxury escapes from Sri Lanka.' },
  'europe':           { label: 'Europe Tours',           desc: 'Grand European tours covering multiple countries in one unforgettable journey.' },
  'far-east':         { label: 'Far East Tours',         desc: 'Japan, South Korea, China & Hong Kong adventures from Sri Lanka.' },
  'south-asia':       { label: 'South Asia Tours',       desc: 'Discover the beauty of India, Nepal, Bhutan & the Maldives.' },
  'africa':           { label: 'Africa Tours',           desc: 'Safari adventures, Egypt & beyond — Africa from Sri Lanka.' },
  'americas':         { label: 'Americas Tours',         desc: 'USA, Canada, South America — the best of the New World.' },
  'pacific':          { label: 'Pacific Tours',          desc: 'Australia, New Zealand & Pacific Island escapes from Sri Lanka.' },
}

// Map slug to actual region name stored in DB
const SLUG_TO_REGION: Record<string, string> = {
  'south-east-asia': 'South East Asia',
  'middle-east':     'Middle East',
  'europe':          'Europe',
  'far-east':        'Far East',
  'south-asia':      'South Asia',
  'africa':          'Africa',
  'americas':        'Americas',
  'pacific':         'Pacific',
}

type Props = { params: Promise<{ region: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params
  const meta = REGION_META[region] ?? { label: 'Tours', desc: 'Browse our international tours' }
  return { title: meta.label, description: meta.desc }
}

export default async function TourListingPage({
  params,
  searchParams,
}: Props & { searchParams: Promise<Record<string, string>> }) {
  const { region } = await params
  const sp = await searchParams
  const meta = REGION_META[region] ?? { label: 'Tours', desc: '' }
  const dbRegion = SLUG_TO_REGION[region]
  const country = sp.country || null

  const page = parseInt(sp.page ?? '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    isActive: true,
    ...(dbRegion ? { region: dbRegion } : {}),
    ...(country ? { multiDestinations: { has: country } } : {}),
  }

  const [tours, total] = await prisma.$transaction([
    prisma.tour.findMany({
      where,
      include: { primaryDestination: { select: { name: true, slug: true, region: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ])

  const displayTitle = country ? `${meta.label} in ${country}` : meta.label
  const breadcrumbTrail = [
    { label: 'Tours', href: '/tours-from-sri-lanka/south-east-asia' },
    { label: meta.label, href: `/tours-from-sri-lanka/${region}` },
    ...(country ? [{ label: country }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title={displayTitle}
        subtitle={country ? `Curated tours in ${country}` : meta.desc}
        imageUrl={getPageHeroImage('tours')}
        breadcrumbs={breadcrumbTrail}
      >
        {total > 0 && (
          <p className="flex items-center gap-1.5 text-white/60 text-sm mt-2">
            <FiGlobe size={12} /> {total} tour{total !== 1 ? 's' : ''} available
          </p>
        )}
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tours.map((tour: any) => (
              <TourCard key={tour.id} {...tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiGlobe size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tours found</h3>
            <p className="text-gray-500">
              Tours for this region are coming soon.{' '}
              <a href="/contact" className="underline" style={{ color: 'var(--brand)' }}>Contact us</a> for a custom quote.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
