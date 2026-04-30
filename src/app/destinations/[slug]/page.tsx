import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import DestinationDetailRenderer from '@/components/destinations/DestinationDetailRenderer'
import { BASE_URL, buildMetadata, jsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

async function getDestination(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/destinations/${slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
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

  const heroImage = dest.images?.[0] ?? dest.imageUrl
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.description?.slice(0, 300),
    url: `${BASE_URL}/destinations/${slug}`,
    image: heroImage,
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
    <>
      <Script
        id="schema-destination"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <DestinationDetailRenderer destination={dest} />
    </>
  )
}
