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

      {/* Featured Tours */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="section-tag mb-3">Trending Now</div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#101817] mb-3">
                Featured <span className="gradient-text">Holiday Packages</span>
              </h2>
              <p className="text-[#52615d] text-sm leading-6">Hand-picked escapes with the strongest value, logistics, and traveller feedback.</p>
            </div>
            <Link href="/packages-from-sri-lanka/family"
              className="hidden sm:flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-lg border border-[#d8ded9] hover:border-[#007f89] text-[#52615d] hover:text-[#007f89] transition-all">
              View all <FiArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayPackages.map((pkg: any) => (
              <PackageCard key={pkg.slug} {...pkg} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/packages-from-sri-lanka/family"
              className="inline-flex items-center gap-2 font-black px-8 py-3.5 rounded-lg bg-[#007f89] text-white text-sm transition-all hover:-translate-y-0.5 hover:bg-[#063c43]">
              Explore All Packages <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 sm:py-24 bg-[#fbfaf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="section-tag mb-3">Where To Go</div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#101817] mb-3">
                Popular <span className="gradient-text">Destinations</span>
              </h2>
              <p className="text-[#52615d] text-sm leading-6">Explore high-demand destinations selected for scenery, access, and seasonal value.</p>
            </div>
            <Link href="/destinations"
              className="hidden sm:flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-lg border border-[#d8ded9] hover:border-[#007f89] text-[#52615d] hover:text-[#007f89] transition-all">
              All destinations <FiArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayDestinations.slice(0, 8).map((dest: any) => (
              <DestinationCard key={dest.slug} {...dest} packageCount={dest._count?.packages} />
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <PerksSection perks={perks} />

      {/* Blog Collage */}
      {blogs.length > 0 && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <div className="section-tag mb-3">Travel Stories</div>
                <h2 className="text-3xl sm:text-5xl font-black text-[#101817] mb-3">
                  From Our <span style={{ color: 'var(--brand)' }}>Travel Blog</span>
                </h2>
                <p className="text-[#52615d] text-sm leading-6">Stories, tips and practical inspiration from our travel desk.</p>
              </div>
              <Link href="/blogs" className="hidden sm:flex items-center gap-1.5 text-sm font-bold hover:underline shrink-0" style={{ color: 'var(--brand)' }}>
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
                    className="lg:col-span-3 group bg-white rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(16,24,23,0.06)] border border-[#e5e8e4] hover:shadow-[0_24px_54px_rgba(16,24,23,0.14)] transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-64 sm:h-72 flex gap-1 bg-gray-200 overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#edf8f6] text-[#007f89]">{featured.category}</span>
                        {featured.readingTime && (
                          <span className="flex items-center gap-1 text-xs text-[#8a9691]">
                            <FiClock size={11} /> {featured.readingTime} min read
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-[#101817] text-xl mb-2 leading-tight group-hover:text-[#007f89] transition-colors line-clamp-2">{featured.title}</h3>
                      <p className="text-sm text-[#52615d] leading-relaxed line-clamp-2 flex-1">{featured.excerpt}</p>
                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 bg-[#007f89]">
                            {featured.author?.[0] ?? 'M'}
                          </div>
                          <span className="text-xs text-[#52615d]">{featured.author}</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--brand)' }}>
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
                        className="group flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm border border-[#e5e8e4] hover:shadow-md transition-all duration-300 p-3"
                      >
                        <div className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0">
                          {blog.imageUrl ? (
                            <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full brand-gradient" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#007f89]">{blog.category}</span>
                          <h4 className="font-bold text-[#101817] text-sm leading-tight mt-0.5 line-clamp-2 group-hover:text-[#007f89] transition-colors">{blog.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#8a9691]">
                            {blog.readingTime && <span className="flex items-center gap-0.5"><FiClock size={10} /> {blog.readingTime}m</span>}
                            <span>{blog.author}</span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    <Link href="/blogs"
                      className="flex items-center justify-center gap-2 border border-dashed border-[#d8ded9] hover:border-[#007f89] rounded-lg py-5 text-sm font-bold text-[#8a9691] hover:text-[#007f89] transition-all group">
                      <FiBookOpen size={16} /> View all stories <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-[#fbfaf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="section-tag mx-auto inline-flex mb-4">Traveller Stories</div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#101817] mb-3">
              What Our <span className="gradient-text">Travellers Say</span>
            </h2>
            <p className="text-[#52615d] text-sm max-w-sm mx-auto leading-6">Real experiences from people who trusted us with their holidays.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(reviews.length > 0 ? reviews : SAMPLE_REVIEWS).map((review: any, i: number) => (
              <div
                key={review.id ?? review.name}
                className="group relative bg-white p-6 rounded-lg border border-[#e5e8e4] hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(16,24,23,0.12)] shadow-[0_8px_30px_rgba(16,24,23,0.06)] transition-all duration-300"
              >
                <div className="text-4xl font-black leading-none mb-3 text-[#c99a45]/25 select-none">&ldquo;</div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <FiStar key={j} size={12} className={j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-100'} />
                  ))}
                </div>
                <p className="text-[#52615d] text-sm leading-relaxed mb-5 line-clamp-3">{review.body}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#edf0ed]">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 bg-[#007f89]">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#101817]">{review.name}</p>
                    {review.location && <p className="text-[11px] text-[#8a9691]">{review.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/reviews"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-lg border border-[#d8ded9] text-[#52615d] hover:border-[#007f89] hover:text-[#007f89] transition-all">
              Read all reviews <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="bg-[#101817] py-20 text-white sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#f0d492]">
            Free Consultation
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-5 leading-tight">
            Not sure where to start?
          </h2>
          <p className="text-white/[0.62] mb-9 max-w-xl mx-auto text-sm leading-7">
            Share your dates, budget, and travel mood. Our experts will shape a polished itinerary with flights, stays, transfers, visas, and local experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#101817] font-black px-8 py-4 rounded-lg transition-all hover:-translate-y-0.5 hover:bg-[#f4efe6]">
              Book Free Consultation
            </Link>
            <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-lg transition-all hover:-translate-y-0.5 border border-white/[0.18] bg-white/10 hover:bg-white/[0.16]">
              <FaWhatsapp size={18} style={{ color: '#25d366' }} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
      {/* Loyalty */}
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
