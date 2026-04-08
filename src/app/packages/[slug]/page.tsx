import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PackageTabs from '@/components/packages/PackageTabs'
import PackageGallery from '@/components/packages/PackageGallery'
import PackageInquirySection from '@/components/packages/PackageInquirySection'
import CustomizeTourButton from '@/components/packages/CustomizeTourButton'
import BookNowButton from '@/components/booking/BookNowButton'
import {
  FiMapPin, FiClock, FiStar, FiUsers, FiPhone, FiCheckCircle, FiXCircle,
  FiShield, FiGlobe, FiArrowRight,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

type Props = { params: Promise<{ slug: string }> }

async function getPackage(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/packages/${slug}`, {
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
  const pkg = await getPackage(slug)
  if (!pkg) return { title: 'Package Not Found' }
  return {
    title: pkg.title,
    description: pkg.description?.replace(/<[^>]*>/g, '').slice(0, 160),
  }
}

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }
const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  CHALLENGING: 'bg-orange-100 text-orange-700',
  EXTREME: 'bg-red-100 text-red-700',
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params
  const pkg = await getPackage(slug)
  if (!pkg) notFound()

  const stars = STAR_MAP[pkg.starRating] ?? 4
  const avgRating = pkg.reviews?.length
    ? (pkg.reviews.reduce((s: number, r: any) => s + r.rating, 0) / pkg.reviews.length).toFixed(1)
    : null
  const reviewCount = pkg.reviews?.length ?? 0

  return (
    <div className="min-h-screen bg-white">

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <FiArrowRight size={10} />
          <Link href="/packages-from-sri-lanka/family" className="hover:text-gray-600">Packages</Link>
          <FiArrowRight size={10} />
          {pkg.destination && (
            <>
              <Link href={`/destinations/${pkg.destination.slug}`} className="hover:text-gray-600">{pkg.destination.name}</Link>
              <FiArrowRight size={10} />
            </>
          )}
          <span className="text-gray-600 truncate max-w-[200px]">{pkg.title}</span>
        </nav>
      </div>

      {/* ── Hero title (full width, above the 2-col split) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {pkg.isFeatured && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Top rated</span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
            style={{ background: 'var(--brand-muted)', color: 'var(--brand-dark)' }}>
            {pkg.category?.toLowerCase()}
          </span>
          {pkg.difficulty && pkg.difficulty !== 'EASY' && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[pkg.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
              {pkg.difficulty.charAt(0) + pkg.difficulty.slice(1).toLowerCase()}
            </span>
          )}
          {pkg.isCustomizable && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Customizable</span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{pkg.title}</h1>

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
          {pkg.destination && (
            <span className="flex items-center gap-1">
              <FiMapPin size={13} style={{ color: 'var(--teal)' }} />
              {pkg.destination.name}, {pkg.destination.region}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiClock size={13} style={{ color: 'var(--brand)' }} />
            {pkg.duration} Days / {pkg.nights} Nights
          </span>
          {pkg.maxGroupSize && (
            <span className="flex items-center gap-1">
              <FiUsers size={13} />
              Max {pkg.maxGroupSize} pax
            </span>
          )}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT — Gallery + Tabs stacked */}
          <div className="space-y-6">
            <PackageGallery images={pkg.images ?? []} title={pkg.title} layout={pkg.galleryLayout ?? 'grid-2x2'} />
            <PackageTabs pkg={pkg} stars={stars} />
          </div>

          {/* RIGHT — Sticky booking panel */}
          <div className="lg:sticky lg:top-20 space-y-4">

            {/* Price + Book card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

              <div className="p-5 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">From</p>
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-3xl font-black leading-none" style={{ color: 'var(--brand)' }}>
                    LKR {pkg.price?.toLocaleString()}
                  </span>
                  {pkg.oldPrice && (
                    <span className="text-sm text-gray-400 line-through mb-0.5">LKR {pkg.oldPrice?.toLocaleString()}</span>
                  )}
                </div>
                {pkg.paxType && <p className="text-xs text-gray-400 mt-0.5">{pkg.paxType}</p>}

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Days', val: pkg.duration },
                    { label: 'Nights', val: pkg.nights },
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
                <span className={`flex items-center gap-1.5 text-xs font-medium ${pkg.isFoodIncluded ? 'text-green-600' : 'text-gray-300'}`}>
                  {pkg.isFoodIncluded ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />} Food
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${pkg.isTransportIncluded ? 'text-green-600' : 'text-gray-300'}`}>
                  {pkg.isTransportIncluded ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />} Transport
                </span>
              </div>

              {/* Cancellation policy from DB */}
              {pkg.cancellationPolicy && (
                <div className="px-5 py-3 border-b border-gray-100">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <FiCheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{pkg.cancellationPolicy}</span>
                  </div>
                </div>
              )}

              {/* Book Now CTA */}
              <div className="px-5 pt-4 pb-2">
                <BookNowButton target={{
                  id: pkg.id,
                  type: 'package',
                  title: pkg.title,
                  price: pkg.price,
                  priceTwin: pkg.priceTwin,
                  priceChild: pkg.priceChild,
                  extraNightPrice: pkg.extraNightPrice,
                  duration: pkg.duration,
                  nights: pkg.nights,
                  paxType: pkg.paxType,
                  options: pkg.options,
                  cancellationTiers: pkg.cancellationTiers,
                  cancellationPolicy: pkg.cancellationPolicy,
                }} />
              </div>

              {/* Inquiry CTA */}
              <PackageInquirySection packageId={pkg.id} packageTitle={pkg.title} />
            </div>

            {/* Customize CTA */}
            {pkg.isCustomizable && (
              <CustomizeTourButton packageId={pkg.id} packageTitle={pkg.title} />
            )}

            {/* Contact card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <FiShield size={14} style={{ color: 'var(--teal)' }} /> Need Help?
              </p>
              <p className="text-xs text-gray-500 mb-3">Travel experts available 8 AM – 10 PM daily.</p>
              <div className="space-y-2">
                <a href="tel:+94704545455"
                  className="flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  <FiPhone size={14} /> +94 70 454 5455
                </a>
                <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl bg-green-500 hover:bg-green-600 transition-colors">
                  <FaWhatsapp size={15} /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Languages */}
            {(pkg.hostLanguage?.length > 0 || pkg.audioGuideLanguage?.length > 0) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <FiGlobe size={14} style={{ color: 'var(--teal)' }} /> Languages
                </p>
                {pkg.hostLanguage?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Host / Guide</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.hostLanguage.map((l: string) => (
                        <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {pkg.audioGuideLanguage?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Audio Guide</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.audioGuideLanguage.map((l: string) => (
                        <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
