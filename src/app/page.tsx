import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import WhyUsSection from '@/components/home/WhyUsSection'
import NewsletterSection from '@/components/home/NewsletterSection'
import PackageCard from '@/components/ui/PackageCard'
import DestinationCard from '@/components/ui/DestinationCard'

async function getFeaturedPackages() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/packages?featured=true&limit=8`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.packages ?? []
  } catch {
    return []
  }
}

async function getFeaturedDestinations() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/destinations?featured=true`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return (await res.json()) ?? []
  } catch {
    return []
  }
}

async function getReviews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reviews?limit=3`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.reviews ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [packages, destinations, reviews] = await Promise.all([
    getFeaturedPackages(),
    getFeaturedDestinations(),
    getReviews(),
  ])

  const displayPackages = packages.length > 0 ? packages : SAMPLE_PACKAGES
  const displayDestinations = destinations.length > 0 ? destinations : SAMPLE_DESTINATIONS

  return (
    <>
      <HeroSection />
      <CategorySection />

      {/* Featured Tours */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Trending <span style={{ color: 'var(--brand)' }}>Tours</span>
              </h2>
              <p className="text-gray-500">Hand-picked packages loved by thousands of travellers</p>
            </div>
            <Link href="/packages-from-sri-lanka/family" className="text-sm font-semibold text-[var(--brand)] hover:underline hidden sm:block">
              View all packages →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPackages.map((pkg: any) => (
              <PackageCard key={pkg.slug} {...pkg} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/packages-from-sri-lanka/family" className="inline-block border-2 border-[var(--brand)] text-[var(--brand)] font-semibold px-8 py-3 rounded-full hover:bg-[var(--brand)] hover:text-white transition-colors">
              Explore All Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Popular <span style={{ color: 'var(--brand)' }}>Destinations</span>
              </h2>
              <p className="text-gray-500">Explore our most-loved travel destinations</p>
            </div>
            <Link href="/destinations" className="text-sm font-semibold text-[var(--brand)] hover:underline hidden sm:block">
              All destinations →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayDestinations.slice(0, 8).map((dest: any) => (
              <DestinationCard key={dest.slug} {...dest} packageCount={dest._count?.packages} />
            ))}
          </div>
        </div>
      </section>

      <WhyUsSection />

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Our <span style={{ color: 'var(--brand)' }}>Travellers Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews.length > 0 ? reviews : SAMPLE_REVIEWS).map((review: any) => (
              <div key={review.id ?? review.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{review.body}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                    {review.location && <p className="text-xs text-gray-400">{review.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/reviews" className="text-sm font-semibold text-[var(--brand)] hover:underline">Read all reviews →</Link>
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Not Sure Where to Start?</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Book a free consultation with one of our travel experts. We&apos;ll plan your perfect holiday together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation" className="brand-gradient text-white font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
              Book Free Consultation
            </Link>
            <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full transition-colors">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  )
}

// Fallback data when DB is not connected
const SAMPLE_PACKAGES = [
  { title: 'Dubai City Escape', slug: 'dubai-city-escape', price: 120000, duration: 5, nights: 4, starRating: 'THREE', category: 'FAMILY', images: [], isFeatured: true, destination: { name: 'Dubai', region: 'Middle East' }, paxType: 'per person' },
  { title: 'Maldives Romantic Escape', slug: 'maldives-romantic-escape', price: 350000, duration: 5, nights: 4, starRating: 'FIVE', category: 'HONEYMOON', images: [], isFeatured: true, destination: { name: 'Maldives', region: 'South Asia' }, paxType: 'per couple' },
  { title: 'Japan Family Tour 5-Star', slug: 'japan-family-5star', price: 1250000, duration: 8, nights: 7, starRating: 'FIVE', category: 'FAMILY', images: [], isFeatured: true, destination: { name: 'Japan', region: 'East Asia' }, paxType: 'per person' },
  { title: 'Bali Love Story', slug: 'bali-love-story', price: 320000, duration: 6, nights: 5, starRating: 'FOUR', category: 'HONEYMOON', images: [], isFeatured: true, destination: { name: 'Bali', region: 'Southeast Asia' }, paxType: 'per couple' },
  { title: 'Timeless Turkey', slug: 'timeless-turkey', price: 561000, duration: 7, nights: 6, starRating: 'FOUR', category: 'FAMILY', images: [], isFeatured: true, destination: { name: 'Turkey', region: 'Western Asia' }, paxType: 'per person' },
  { title: 'Malaysia City & Adventure', slug: 'malaysia-city-adventure', price: 189000, duration: 4, nights: 3, starRating: 'THREE', category: 'SOLO', images: [], isFeatured: true, destination: { name: 'Malaysia', region: 'Southeast Asia' }, paxType: 'per person' },
  { title: 'Dubai Glamour & Desert', slug: 'dubai-glamour-desert', price: 320000, duration: 5, nights: 4, starRating: 'FOUR', category: 'SQUAD', images: [], isFeatured: true, destination: { name: 'Dubai', region: 'Middle East' }, paxType: 'per person' },
  { title: 'Kyoto & Tokyo Honeymoon', slug: 'kyoto-tokyo-honeymoon', price: 600000, duration: 7, nights: 6, starRating: 'FOUR', category: 'HONEYMOON', images: [], isFeatured: true, destination: { name: 'Japan', region: 'East Asia' }, paxType: 'per couple' },
]

const SAMPLE_DESTINATIONS = [
  { name: 'Maldives', slug: 'maldives', region: 'South Asia', language: 'Dhivehi', bestSeason: 'Nov – Apr', costLevel: 'Luxury', images: [] },
  { name: 'Japan', slug: 'japan', region: 'East Asia', language: 'Japanese', bestSeason: 'Mar – May', costLevel: 'Luxury', images: [] },
  { name: 'Dubai', slug: 'dubai', region: 'Middle East', language: 'Arabic', bestSeason: 'Nov – Apr', costLevel: 'Luxury', images: [] },
  { name: 'France', slug: 'france', region: 'Europe', language: 'French', bestSeason: 'Apr – Jun', costLevel: 'Luxury', images: [] },
]

const SAMPLE_REVIEWS = [
  { name: 'Sanduni Nimeshika', location: 'Colombo, Sri Lanka', rating: 5, body: 'Our Dubai trip was absolutely incredible! The Marina Dhow Cruise, Burj Khalifa visit, and the Desert Safari were all perfectly organized.' },
  { name: 'Sajjaad Ahamed', location: 'Kandy, Sri Lanka', rating: 5, body: 'The customer service was exceptional. Naveed helped us with our visa and made the whole process stress-free.' },
  { name: 'Shashika Radalage', location: 'Galle, Sri Lanka', rating: 5, body: 'I was amazed by how well the Singapore tour was organized. Every transfer was on time, the guides were knowledgeable and friendly.' },
]
