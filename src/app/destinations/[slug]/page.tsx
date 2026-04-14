import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import PackageCard from '@/components/ui/PackageCard'
import TourCard from '@/components/ui/TourCard'
import { buildMetadata, jsonLd, BASE_URL } from '@/lib/seo'
import {
  FiMapPin, FiSun, FiMessageSquare, FiDollarSign,
  FiChevronRight, FiPhone, FiCalendar, FiStar,
  FiArrowRight, FiCheckCircle,
} from 'react-icons/fi'

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

const COST_COLOR: Record<string, string> = {
  Budget:  'bg-green-100 text-green-700',
  Economy: 'bg-lime-100 text-lime-700',
  Comfort: 'bg-blue-100 text-blue-700',
  Premium: 'bg-violet-100 text-violet-700',
  Luxury:  'bg-amber-100 text-amber-700',
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) notFound()

  const heroImage = dest.images?.[0] ?? dest.imageUrl
  const hasPackages = dest.packages?.length > 0
  const hasTours    = dest.tours?.length > 0

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
      { '@type': 'ListItem', position: 1, name: 'Home',         item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${BASE_URL}/destinations` },
      { '@type': 'ListItem', position: 3, name: dest.name,      item: `${BASE_URL}/destinations/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="schema-destination"  type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <Script id="schema-breadcrumb"   type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-teal-900" />
        )}
        {/* layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-4">
          <div className="max-w-7xl mx-auto w-full">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <FiChevronRight size={11} />
              <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
              <FiChevronRight size={11} />
              <span className="text-white/90">{dest.name}</span>
            </nav>

            {/* Region badge */}
            {dest.region && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-full mb-3 border border-white/20">
                <FiMapPin size={11} /> {dest.region}
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none mb-3 drop-shadow-lg">
              {dest.name}
            </h1>

            {dest.description && (
              <p className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed line-clamp-2">
                {dest.description}
              </p>
            )}

            {/* Quick stat pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {dest.bestSeason && (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/20">
                  <FiSun size={11} /> Best: {dest.bestSeason}
                </span>
              )}
              {dest.language && (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/20">
                  <FiMessageSquare size={11} /> {dest.language}
                </span>
              )}
              {dest.costLevel && (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/20">
                  <FiDollarSign size={11} /> {dest.costLevel}
                </span>
              )}
              {hasPackages && (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/20">
                  <FiCalendar size={11} /> {dest.packages.length} Package{dest.packages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK INFO BAR ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide divide-x divide-gray-100">
            {[
              dest.region    && { icon: <FiMapPin size={14} />,       label: 'Region',      val: dest.region },
              dest.language  && { icon: <FiMessageSquare size={14} />,label: 'Language',    val: dest.language },
              dest.bestSeason&& { icon: <FiSun size={14} />,          label: 'Best Season', val: dest.bestSeason },
              dest.costLevel && { icon: <FiDollarSign size={14} />,   label: 'Cost Level',  val: dest.costLevel },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="flex items-center gap-2.5 px-6 py-4 shrink-0">
                <span className="text-gray-400">{item.icon}</span>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{item.val}</p>
                </div>
              </div>
            ))}

            {/* CTA in bar */}
            <div className="ml-auto px-6 py-3 shrink-0">
              <Link
                href="/consultation"
                className="flex items-center gap-2 brand-gradient text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
              >
                <FiPhone size={13} /> Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
        {dest.description && (
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SectionHeading>About {dest.name}</SectionHeading>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                  <p className="text-gray-600 leading-relaxed text-[15px]">{dest.description}</p>

                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                    {dest.region && (
                      <InfoPill icon={<FiMapPin size={11} />} label={dest.region} />
                    )}
                    {dest.costLevel && (
                      <InfoPill icon={<FiDollarSign size={11} />} label={dest.costLevel} color={COST_COLOR[dest.costLevel]} />
                    )}
                    {dest.bestSeason && (
                      <InfoPill icon={<FiSun size={11} />} label={`Best: ${dest.bestSeason}`} />
                    )}
                    {dest.language && (
                      <InfoPill icon={<FiMessageSquare size={11} />} label={dest.language} />
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky CTA sidebar card */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {heroImage && (
                    <div className="h-36 overflow-hidden">
                      <img src={heroImage} alt={dest.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="font-bold text-gray-900 text-base mb-1">Plan a trip to {dest.name}</p>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">Get a personalised package from our travel experts — tailored to your budget and dates.</p>
                    <Link href="/consultation" className="block text-center brand-gradient text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                      Book Free Consultation
                    </Link>
                    <a href="tel:+94704545455" className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2">
                      <FiPhone size={13} /> +94 70 454 5455
                    </a>
                  </div>
                </div>

                {/* Why book with us */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">Why Book With Us</p>
                  <ul className="space-y-2">
                    {['Best price guarantee', 'Free itinerary planning', 'Expert local knowledge', '24/7 travel support'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCheckCircle size={13} className="text-amber-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── PACKAGES ──────────────────────────────────────────────────────── */}
        {hasPackages && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <SectionHeading>Packages to {dest.name}</SectionHeading>
                <p className="text-sm text-gray-500 mt-1">{dest.packages.length} handpicked packages to choose from</p>
              </div>
              <Link href={`/packages?destination=${slug}`} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View all <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dest.packages.map((pkg: any) => (
                <PackageCard key={pkg.id} {...pkg} destination={{ name: dest.name, region: dest.region }} />
              ))}
            </div>
          </section>
        )}

        {/* ── TOURS ─────────────────────────────────────────────────────────── */}
        {hasTours && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <SectionHeading>Tours featuring {dest.name}</SectionHeading>
                <p className="text-sm text-gray-500 mt-1">Multi-destination tours that include {dest.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dest.tours.map((tour: any) => (
                <TourCard key={tour.id} {...tour} primaryDestination={{ name: dest.name, region: dest.region }} />
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM CTA BANNER ─────────────────────────────────────────────── */}
        <section>
          <div className="relative rounded-3xl overflow-hidden">
            {heroImage && (
              <img src={heroImage} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
            <div className="relative z-10 px-8 py-14 sm:py-16 max-w-2xl">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">{dest.name} • {dest.region}</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Start Your {dest.name} Journey
              </h2>
              <p className="text-white/75 text-base mb-8 leading-relaxed">
                Let our experts craft the perfect itinerary for you. Free consultation, best prices, and unforgettable memories.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/consultation" className="flex items-center gap-2 brand-gradient text-white font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
                  <FiPhone size={15} /> Book Free Consultation
                </Link>
                {hasPackages && (
                  <Link href={`/packages?destination=${slug}`} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-bold px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/25 transition-colors">
                    Browse Packages <FiArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-black text-gray-900 mb-1">{children}</h2>
  )
}

function InfoPill({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
      color ?? 'bg-gray-100 text-gray-600 border-gray-200'
    }`}>
      {icon} {label}
    </span>
  )
}
