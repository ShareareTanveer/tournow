import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InquiryForm from '@/components/forms/InquiryForm'
import PackageGallery from '@/components/packages/PackageGallery'
import PackageTabs from '@/components/packages/PackageTabs'
import {
  FiMapPin, FiClock, FiStar, FiUsers, FiPhone, FiCheckCircle, FiXCircle,
  FiShield, FiGlobe, FiArrowRight, FiFlag,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

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
  return {
    title: tour.title,
    description: tour.description?.replace(/<[^>]*>/g, '').slice(0, 160),
  }
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

  return (
    <div className="min-h-screen bg-white">

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <FiArrowRight size={10} />
          <Link href="/tours-from-sri-lanka" className="hover:text-gray-600">Tours</Link>
          <FiArrowRight size={10} />
          {tour.region && (
            <>
              <Link href={`/tours-from-sri-lanka/${tour.region.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-600">{tour.region}</Link>
              <FiArrowRight size={10} />
            </>
          )}
          <span className="text-gray-600 truncate max-w-[200px]">{tour.title}</span>
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
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
              {tour.region}
            </span>
          )}
          {tour.multiDestinations?.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              {tour.multiDestinations.length} Countries
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{tour.title}</h1>

        {/* Rating + meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          {avgRating && (
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} size={13} className={i < Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
              ))}
              <span className="ml-1">{avgRating}</span>
              <span className="text-gray-400 font-normal text-xs">({reviewCount} reviews)</span>
            </span>
          )}
          {/* Multi-destination pills */}
          {tour.multiDestinations?.length > 0 ? (
            <span className="flex items-center gap-1 flex-wrap">
              <FiMapPin size={13} className="text-sky-500" />
              {tour.multiDestinations.join(' · ')}
            </span>
          ) : tour.primaryDestination && (
            <span className="flex items-center gap-1">
              <FiMapPin size={13} className="text-sky-500" />
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
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

              <div className="p-5 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">From</p>
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-3xl font-black leading-none text-sky-600">
                    LKR {tour.price?.toLocaleString()}
                  </span>
                  {tour.oldPrice && (
                    <span className="text-sm text-gray-400 line-through mb-0.5">LKR {tour.oldPrice?.toLocaleString()}</span>
                  )}
                </div>
                {tour.paxType && <p className="text-xs text-gray-400 mt-0.5">{tour.paxType}</p>}

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Days', val: tour.duration },
                    { label: 'Nights', val: tour.nights },
                    { label: 'Stars', val: `${stars}★` },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-gray-50 rounded-xl py-2">
                      <p className="font-bold text-gray-800">{s.val}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food / Transport */}
              <div className="px-5 py-3 border-b border-gray-100 flex gap-4">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${tour.isFoodIncluded ? 'text-green-600' : 'text-gray-300'}`}>
                  {tour.isFoodIncluded ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />} Food
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${tour.isTransportIncluded ? 'text-green-600' : 'text-gray-300'}`}>
                  {tour.isTransportIncluded ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />} Transport
                </span>
              </div>

              {/* Visa notes callout */}
              {tour.visaNotes && (
                <div className="mx-5 my-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5 flex items-center gap-1">
                    <FiFlag size={11} /> Visa Info
                  </p>
                  <p className="text-xs text-blue-600 leading-relaxed">{tour.visaNotes}</p>
                </div>
              )}

              {/* Cancellation policy from DB */}
              {tour.cancellationPolicy && (
                <div className="px-5 py-3 border-b border-gray-100">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <FiCheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{tour.cancellationPolicy}</span>
                  </div>
                </div>
              )}

              {/* Inquiry form */}
              <div className="p-5">
                <InquiryForm packageId={tour.id} packageTitle={tour.title} />
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <FiShield size={14} style={{ color: 'var(--teal)' }} /> Need Help?
              </p>
              <p className="text-xs text-gray-500 mb-3">Travel experts available 8 AM – 10 PM daily.</p>
              <div className="space-y-2">
                <a href="tel:+94704545455"
                  className="flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                  <FiPhone size={14} /> +94 70 454 5455
                </a>
                <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl bg-green-500 hover:bg-green-600 transition-colors">
                  <FaWhatsapp size={15} /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Languages */}
            {tour.hostLanguage?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <FiGlobe size={14} style={{ color: 'var(--teal)' }} /> Languages
                </p>
                <div className="flex flex-wrap gap-1">
                  {tour.hostLanguage.map((l: string) => (
                    <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l}</span>
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
