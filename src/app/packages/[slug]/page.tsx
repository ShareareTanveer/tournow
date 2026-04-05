import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import InquiryForm from '@/components/forms/InquiryForm'

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
    description: pkg.description?.slice(0, 160),
  }
}

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params
  const pkg = await getPackage(slug)
  if (!pkg) notFound()

  const stars = STAR_MAP[pkg.starRating] ?? 4

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero image */}
      <div className="relative h-80 md:h-[480px] bg-gray-300">
        {pkg.images?.[0] ? (
          <Image src={pkg.images[0]} alt={pkg.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full brand-gradient flex items-center justify-center">
            <span className="text-white text-6xl">✈️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="brand-gradient text-xs font-semibold px-3 py-1 rounded-full capitalize">{pkg.category?.toLowerCase()}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: stars }).map((_: unknown, i: number) => <span key={i} className="text-yellow-400">★</span>)}
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold">{pkg.title}</h1>
          {pkg.destination && (
            <p className="text-white/80 mt-1">📍 {pkg.destination.name}, {pkg.destination.region}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
                <div className="py-2">
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{pkg.duration}</p>
                  <p className="text-xs text-gray-500">Days</p>
                </div>
                <div className="py-2">
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{pkg.nights}</p>
                  <p className="text-xs text-gray-500">Nights</p>
                </div>
                <div className="py-2">
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{stars}⭐</p>
                  <p className="text-xs text-gray-500">Hotel Rating</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Package</h2>
              <p className="text-gray-600 leading-relaxed">{pkg.description}</p>

              {pkg.highlights?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-gray-700 mb-3">Highlights</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pkg.highlights.map((h: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold">✓</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day: any) => (
                    <details key={day.id} className="group border border-gray-100 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full brand-gradient text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {day.dayNumber}
                          </span>
                          <span className="font-semibold text-gray-800">{day.title}</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-gray-600 text-sm mt-3 leading-relaxed">{day.description}</p>
                        {day.activities?.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {day.activities.map((act: string, i: number) => (
                              <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="text-[var(--brand)]">•</span> {act}
                              </li>
                            ))}
                          </ul>
                        )}
                        {day.meals?.length > 0 && (
                          <p className="mt-2 text-xs text-gray-400">🍽 Meals: {day.meals.join(', ')}</p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pkg.inclusions?.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="font-bold text-green-800 mb-3">✅ What's Included</h3>
                  <ul className="space-y-2">
                    {pkg.inclusions.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.exclusions?.length > 0 && (
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                  <h3 className="font-bold text-red-800 mb-3">❌ Not Included</h3>
                  <ul className="space-y-2">
                    {pkg.exclusions.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Image gallery */}
            {pkg.images?.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pkg.images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="relative h-32 rounded-xl overflow-hidden">
                      <Image src={img} alt={`${pkg.title} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="mb-5">
                <span className="text-xs text-gray-400">Starting from</span>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold" style={{ color: 'var(--brand)' }}>
                    LKR {pkg.price?.toLocaleString()}
                  </p>
                </div>
                {pkg.paxType && <p className="text-xs text-gray-400">{pkg.paxType}</p>}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between"><span>Duration</span><span className="font-medium">{pkg.duration} Days / {pkg.nights} Nights</span></div>
                <div className="flex justify-between"><span>Hotel</span><span className="font-medium">{stars} Star</span></div>
                <div className="flex justify-between"><span>Category</span><span className="font-medium capitalize">{pkg.category?.toLowerCase()}</span></div>
              </div>

              <InquiryForm packageId={pkg.id} packageTitle={pkg.title} />
            </div>

            {/* Need help */}
            <div className="bg-[var(--brand-light)] rounded-2xl p-5 border border-[var(--brand)]/20">
              <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">Our travel experts are available until 10 PM.</p>
              <a href="tel:+94704545455" className="block text-center brand-gradient text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 mb-2">
                📞 +94 70 454 5455
              </a>
              <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer" className="block text-center bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
