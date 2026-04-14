import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import PackageCard from '@/components/ui/PackageCard'
import TourCard from '@/components/ui/TourCard'
import PageHero from '@/components/ui/PageHero'
import { buildMetadata, jsonLd, BASE_URL } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

async function getDestination(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/destinations/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) return { title: 'Destination Not Found' }
  return buildMetadata({
    title: `${dest.name} Travel Packages`,
    description: dest.description,
    ogImage: dest.images?.[0] ?? dest.imageUrl,
    path: `/destinations/${slug}`,
  })
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.description?.slice(0, 300),
    url: `${BASE_URL}/destinations/${slug}`,
    image: dest.images?.[0] ?? dest.imageUrl,
    touristType: dest.region,
    geo: { '@type': 'GeoCoordinates' },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${BASE_URL}/destinations` },
      { '@type': 'ListItem', position: 3, name: dest.name, item: `${BASE_URL}/destinations/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="schema-destination" type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <Script id="schema-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <PageHero
        title={dest.name}
        subtitle={dest.region}
        imageUrl={dest.images?.[0] ?? dest.imageUrl}
        breadcrumbs={[{ label: 'Destinations', href: '/destinations' }, { label: dest.name }]}
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About {dest.name}</h2>
              <p className="text-gray-600 leading-relaxed">{dest.description}</p>
            </div>

            {dest.packages?.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Packages to {dest.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {dest.packages.map((pkg: any) => (
                    <PackageCard key={pkg.id} {...pkg} destination={{ name: dest.name, region: dest.region }} />
                  ))}
                </div>
              </div>
            )}

            {dest.tours?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Tours including {dest.name}</h2>
                <p className="text-sm text-gray-500 mb-5">Multi-destination tours that feature {dest.name}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {dest.tours.map((tour: any) => (
                    <TourCard key={tour.id} {...tour} primaryDestination={{ name: dest.name, region: dest.region }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Region</span><span className="font-medium">{dest.region}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Language</span><span className="font-medium">{dest.language}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Best Season</span><span className="font-medium">{dest.bestSeason}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cost Level</span><span className="font-medium">{dest.costLevel}</span></div>
              </div>
            </div>

            <div className="bg-[var(--brand-light)] rounded-2xl p-5 border border-[var(--brand)]/20">
              <h3 className="font-semibold text-gray-800 mb-2">Plan a trip to {dest.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Get a personalised package from our experts.</p>
              <Link href="/consultation" className="block text-center brand-gradient text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90">
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
