import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import PackageGallery from '@/components/packages/PackageGallery'
import PackageTabs from '@/components/packages/PackageTabs'
import PackageInquirySection from '@/components/packages/PackageInquirySection'
import BookNowButton from '@/components/booking/BookNowButton'
import {
  FiMapPin, FiClock, FiStar, FiUsers, FiPhone, FiCheckCircle, FiXCircle,
  FiShield, FiGlobe, FiArrowRight, FiFlag,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { buildMetadata, jsonLd, BASE_URL } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

async function getTour(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tours/${slug}`, {
      next: { revalidate: 1800 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTour(slug)
  if (!tour) return { title: 'Tour Not Found' }
  return buildMetadata({
    title: tour.title,
    metaTitle: tour.metaTitle,
    metaDescription: tour.metaDescription,
    description: tour.description,
    focusKeyword: tour.focusKeyword,
    secondaryKeywords: tour.secondaryKeywords,
    canonicalUrl: tour.canonicalUrl,
    ogTitle: tour.ogTitle,
    ogDescription: tour.ogDescription,
    ogImage: tour.ogImage,
    images: tour.images,
    metaRobots: tour.metaRobots,
    path: `/tours/${slug}`,
  })
}

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const tour = await getTour(slug)
  if (!tour) notFound()

  const stars = STAR_MAP[tour.starRating] ?? 4
  const avgRating = tour.reviews?.length
    ? (tour.reviews.reduce((s: number, r: any) => s + r.rating, 0) / tour.reviews.length).toFixed(1)
    : null
  const reviewCount = tour.reviews?.length ?? 0

  const regionSlug = tour.region?.toLowerCase().replace(/\s+/g, '-')
  const schema = tour.schemaMarkup
    ? JSON.parse(tour.schemaMarkup)
    : {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: tour.title,
        description: tour.description?.replace(/<[^>]*>/g, '').slice(0, 300),
        url: `${BASE_URL}/tours/${tour.slug}`,
        image: tour.images?.[0] ?? tour.ogImage,
        offers: {
          '@type': 'Offer',
          price: tour.price,
          priceCurrency: 'LKR',
          availability: 'https://schema.org/InStock',
          url: `${BASE_URL}/tours/${tour.slug}`,
        },
        provider: {
          '@type': 'TravelAgency',
          name: 'Metro Voyage',
          url: BASE_URL,
        },
        aggregateRating: reviewCount > 0
          ? { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount }
          : undefined,
      }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tours', item: `${BASE_URL}/tours-from-sri-lanka` },
      ...(tour.region ? [{ '@type': 'ListItem', position: 3, name: tour.region, item: `${BASE_URL}/tours-from-sri-lanka/${regionSlug}` }] : []),
      { '@type': 'ListItem', position: tour.region ? 4 : 3, name: tour.title, item: `${BASE_URL}/tours/${tour.slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <Script id="schema-tour" type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <Script id="schema-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-2">
        <nav className="flex items-center gap-1 text-xs text-[#8a9691] flex-wrap">
          <Link href="/" className="hover:text-[#101817]">Home</Link>
          <FiArrowRight size={10} />
          <Link href="/tours-from-sri-lanka" className="hover:text-[#101817]">Tours</Link>
          <FiArrowRight size={10} />
          {tour.region && (
            <>
              <Link href={`/tours-from-sri-lanka/${tour.region.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#101817]">{tour.region}</Link>
              <FiArrowRight size={10} />
            </>
          )}
          <span className="text-[#52615d] truncate max-w-[200px]">{tour.title}</span>
        </nav>
      </div>

      {/* ── Hero title ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {tour.isFeatured && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Top rated</span>
          )}
          {tour.region && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #007f89, #3f8f64)' }}>
              {tour.region}
            </span>
          )}
          {tour.multiDestinations?.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              {tour.multiDestinations.length} Countries
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#101817] mb-3 leading-tight">{tour.title}</h1>

        {/* Rating + meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#52615d]">
          {avgRating && (
            <span className="flex items-center gap-1 font-semibold text-[#101817]">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} size={13} className={i < Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
              ))}
              <span className="ml-1">{avgRating}</span>
              <span className="text-[#8a9691] font-normal text-xs">({reviewCount} reviews)</span>
            </span>
          )}
          {/* Multi-destination pills */}
          {tour.multiDestinations?.length > 0 ? (
            <span className="flex items-center gap-1 flex-wrap">
              <FiMapPin size={13} className="text-[#007f89]" />
              {tour.multiDestinations.join(' · ')}
            </span>
          ) : tour.primaryDestination && (
            <span className="flex items-center gap-1">
              <FiMapPin size={13} className="text-[#007f89]" />
              {tour.primaryDestination.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiClock size={13} style={{ color: 'var(--brand)' }} />
            {tour.duration} Days / {tour.nights} Nights
          </span>
          {tour.maxGroupSize && (
            <span className="flex items-center gap-1">
              <FiUsers size={13} />
              Max {tour.maxGroupSize} pax
            </span>
          )}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT — Gallery + Tabs stacked */}
          <div className="space-y-6">
            <PackageGallery images={tour.images ?? []} title={tour.title} layout={tour.galleryLayout ?? 'grid-2x2'} />
            <PackageTabs pkg={tour} stars={stars} />
          </div>

          {/* RIGHT — Sticky booking panel */}
          <div className="lg:sticky lg:top-20 space-y-4">

            {/* Price + Book card */}
            <div className="bg-white rounded-lg shadow-[0_12px_40px_rgba(16,24,23,0.10)] border border-[#e5e8e4] overflow-hidden">

              <div className="p-5 border-b border-[#edf0ed]">
                <p className="text-xs text-[#8a9691] mb-0.5">From</p>
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-3xl font-black leading-none text-[#007f89]">
                    LKR {tour.price?.toLocaleString()}
                  </span>
                  {tour.oldPrice && (
                    <span className="text-sm text-[#8a9691] line-through mb-0.5">LKR {tour.oldPrice?.toLocaleString()}</span>
                  )}
                </div>
                {tour.paxType && <p className="text-xs text-[#8a9691] mt-0.5">{tour.paxType}</p>}

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Days', val: tour.duration },
                    { label: 'Nights', val: tour.nights },
                    { label: 'Stars', val: `${stars}★` },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-[#f4f1ea] rounded-lg py-2">
                      <p className="font-bold text-[#101817]">{s.val}</p>
                      <p className="text-[10px] text-[#8a9691]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food / Transport */}
              <div className="px-5 py-3 border-b border-[#edf0ed] flex gap-4">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${tour.isFoodIncluded ? 'text-green-600' : 'text-gray-300'}`}>
                  {tour.isFoodIncluded ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />} Food
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${tour.isTransportIncluded ? 'text-green-600' : 'text-gray-300'}`}>
                  {tour.isTransportIncluded ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />} Transport
                </span>
              </div>

              {/* Visa notes callout */}
              {tour.visaNotes && (
                <div className="mx-5 my-3 p-3 bg-[#edf8f6] border border-[#d8eee9] rounded-lg">
                  <p className="text-xs font-bold text-[#007f89] mb-0.5 flex items-center gap-1">
                    <FiFlag size={11} /> Visa Info
                  </p>
                  <p className="text-xs text-[#52615d] leading-relaxed">{tour.visaNotes}</p>
                </div>
              )}

              {/* Cancellation policy from DB */}
              {tour.cancellationPolicy && (
                <div className="px-5 py-3 border-b border-[#edf0ed]">
                  <div className="flex items-start gap-2 text-xs text-[#52615d]">
                    <FiCheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{tour.cancellationPolicy}</span>
                  </div>
                </div>
              )}

              {/* Book Now CTA */}
              <div className="px-5 pt-4 pb-2">
                <BookNowButton target={{
                  id: tour.id,
                  type: 'tour',
                  title: tour.title,
                  price: tour.price,
                  priceTwin: tour.priceTwin,
                  priceChild: tour.priceChild,
                  extraNightPrice: tour.extraNightPrice,
                  duration: tour.duration,
                  nights: tour.nights,
                  paxType: tour.paxType,
                  options: tour.options,
                  cancellationTiers: tour.cancellationTiers,
                  cancellationPolicy: tour.cancellationPolicy,
                }} />
              </div>

              {/* Inquiry CTA */}
              <PackageInquirySection packageId={tour.id} packageTitle={tour.title} />
            </div>

            {/* Contact card */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-[#e5e8e4]">
              <p className="text-sm font-bold text-[#101817] mb-1 flex items-center gap-2">
                <FiShield size={14} style={{ color: 'var(--teal)' }} /> Need Help?
              </p>
              <p className="text-xs text-[#52615d] mb-3">Travel experts available 8 AM - 10 PM daily.</p>
              <div className="space-y-2">
                <a href="tel:+94704545455"
                  className="flex items-center justify-center gap-2 text-white text-sm font-black py-2.5 rounded-lg transition-all bg-[#007f89] hover:bg-[#063c43]">
                  <FiPhone size={14} /> +94 70 454 5455
                </a>
                <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-white text-sm font-black py-2.5 rounded-lg bg-[#25d366] hover:bg-[#1fb85a] transition-colors">
                  <FaWhatsapp size={15} /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Languages */}
            {tour.hostLanguage?.length > 0 && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-[#e5e8e4]">
                <p className="text-sm font-bold text-[#101817] flex items-center gap-2 mb-3">
                  <FiGlobe size={14} style={{ color: 'var(--teal)' }} /> Languages
                </p>
                <div className="flex flex-wrap gap-1">
                  {tour.hostLanguage.map((l: string) => (
                    <span key={l} className="text-xs bg-[#f4f1ea] text-[#52615d] px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
