import Link from 'next/link'
import Image from 'next/image'
import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import PerksSection from '@/components/home/PerksSection'
import LoyaltySection from '@/components/home/LoyaltySection'
import NewsletterSection from '@/components/home/NewsletterSection'
import PackageCard from '@/components/ui/PackageCard'
import DestinationCard from '@/components/ui/DestinationCard'
import { FiArrowRight, FiStar, FiClock, FiBookOpen } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export const dynamic = 'force-dynamic'

import {
  getFeaturedPackages,
  getFeaturedDestinations,
  getReviews,
  getHeroImage,
  getPerks,
  getBlogs,
} from '@/lib/data'

export default async function HomePage() {
  const [packages, destinations, reviews, heroImageUrl, perks, blogs] = await Promise.all([
    getFeaturedPackages(),
    getFeaturedDestinations(),
    getReviews(),
    getHeroImage(),
    getPerks(),
    getBlogs(4),
  ])

  const displayPackages = packages.length > 0 ? packages : SAMPLE_PACKAGES
  const displayDestinations = destinations.length > 0 ? destinations : SAMPLE_DESTINATIONS

  return (
    <>
      <HeroSection heroImageUrl={heroImageUrl} />
      <CategorySection />

      {/* ── Featured Tours ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="section-tag mb-3">Trending Now</div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Featured <span style={{ color: 'var(--brand)' }}>Tours</span>
              </h2>
              <p className="text-gray-500 text-sm">Hand-picked packages loved by thousands of travellers</p>
            </div>
            <Link href="/packages-from-sri-lanka/family"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: 'var(--brand)' }}>
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPackages.map((pkg: any) => (
              <PackageCard key={pkg.slug} {...pkg} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/packages-from-sri-lanka/family"
              className="inline-flex items-center gap-2 font-semibold px-8 py-3 underline transition-all hover:text-white"
              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
              onMouseEnter={undefined}>
              Explore All Packages
            </Link>
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="section-tag mb-3">Where To Go</div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Popular <span style={{ color: 'var(--brand)' }}>Destinations</span>
              </h2>
              <p className="text-gray-500 text-sm">Explore our most-loved travel destinations</p>
            </div>
            <Link href="/destinations"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: 'var(--brand)' }}>
              All destinations <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayDestinations.slice(0, 8).map((dest: any) => (
              <DestinationCard key={dest.slug} {...dest} packageCount={dest._count?.packages} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks ── */}
      <PerksSection perks={perks} />

      {/* ── Blog Collage ── */}
      {blogs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <div className="section-tag mb-3">Travel Stories</div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  From Our <span style={{ color: 'var(--brand)' }}>Travel Blog</span>
                </h2>
                <p className="text-gray-500 text-sm">Stories, tips and inspiration from our travellers</p>
              </div>
              <Link href="/blogs" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:underline shrink-0" style={{ color: 'var(--brand)' }}>
                All posts <FiArrowRight size={14} />
              </Link>
            </div>

            {(() => {
              const [featured, ...rest] = blogs

              return (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  {/* Featured blog — large card with collage */}
                  <Link
                    href={`/blogs/${featured.slug}`}
                    className="lg:col-span-3 group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Image collage */}
                    <div className="relative h-64 sm:h-72 flex gap-1 bg-gray-200 overflow-hidden">
                      {/* Main large image */}
                      <div className="relative flex-[2] overflow-hidden">
                        {featured.imageUrl ? (
                          <Image src={featured.imageUrl} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full brand-gradient" />
                        )}
                      </div>
                      {/* Two stacked thumbnails */}
                      {rest.length >= 2 && (
                        <div className="flex-1 flex flex-col gap-1">
                          {[rest[0], rest[1]].map((b: any, i: number) => (
                            <div key={i} className="relative flex-1 overflow-hidden">
                              {b.imageUrl ? (
                                <Image src={b.imageUrl} alt={b.title} fill className="object-cover brightness-90" />
                              ) : (
                                <div className="w-full h-full brand-gradient opacity-70" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">{featured.category}</span>
                        {featured.readingTime && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FiClock size={11} /> {featured.readingTime} min read
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight group-hover:text-indigo-500 transition-colors line-clamp-2">{featured.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{featured.excerpt}</p>
                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                            {featured.author?.[0] ?? 'M'}
                          </div>
                          <span className="text-xs text-gray-500">{featured.author}</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                          Read more <FiArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Sidebar — remaining blog cards */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    {rest.slice(0, 3).map((blog: any) => (
                      <Link
                        key={blog.slug}
                        href={`/blogs/${blog.slug}`}
                        className="group flex gap-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-3"
                      >
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                          {blog.imageUrl ? (
                            <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full brand-gradient" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">{blog.category}</span>
                          <h4 className="font-semibold text-gray-800 text-sm leading-tight mt-0.5 line-clamp-2 group-hover:text-indigo-500 transition-colors">{blog.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                            {blog.readingTime && <span className="flex items-center gap-0.5"><FiClock size={10} /> {blog.readingTime}m</span>}
                            <span>{blog.author}</span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    <Link href="/blogs"
                      className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-2xl py-5 text-sm font-semibold text-gray-400 hover:text-indigo-500 transition-all group">
                      <FiBookOpen size={16} /> View all stories <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="section-tag mx-auto inline-flex mb-4">Traveller Stories</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              What Our <span style={{ color: 'var(--brand)' }}>Travellers Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews.length > 0 ? reviews : SAMPLE_REVIEWS).map((review: any) => (
              <div key={review.id ?? review.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{review.body}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
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
            <Link href="/reviews" className="text-sm font-semibold hover:underline" style={{ color: 'var(--brand)' }}>
              Read all reviews →
            </Link>
          </div>
        </div>
      </section>
      {/* ── Consultation CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-tag mx-auto inline-flex mb-6">Free Consultation</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Not Sure Where to Start?</h2>
          <p className="text-gray-500 mb-8 text-lg max-w-xl mx-auto">
            Book a free consultation with one of our travel experts. We&apos;ll plan your perfect holiday together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation"
              className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', boxShadow: '0 8px 25px rgba(245,158,11,0.3)' }}>
              Book Free Consultation
            </Link>
            <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl transition-all">
              <FaWhatsapp size={18} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
      {/* ── Loyalty ── */}
      <LoyaltySection />



      <NewsletterSection />
    </>
  )
}

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
  { name: 'Sajjaad Ahamed', location: 'Kandy, Sri Lanka', rating: 5, body: 'The customer service was exceptional. Our travel expert helped us with our visa and made the whole process stress-free.' },
  { name: 'Shashika Radalage', location: 'Galle, Sri Lanka', rating: 5, body: 'I was amazed by how well the Singapore tour was organized. Every transfer was on time, the guides were knowledgeable and friendly.' },
]
