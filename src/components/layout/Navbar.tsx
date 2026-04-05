'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PACKAGE_CATEGORIES = [
  { label: 'Family Packages', slug: 'family' },
  { label: 'Honeymoon Packages', slug: 'honeymoon' },
  { label: 'Solo Packages', slug: 'solo' },
  { label: 'Squad Packages', slug: 'squad' },
  { label: 'Corporate Packages', slug: 'corporate' },
  { label: 'Special Packages', slug: 'special' },
  { label: '2026 Holiday Packages', slug: 'holiday' },
]

const DESTINATION_REGIONS: { region: string; destinations: { label: string; slug: string }[] }[] = [
  {
    region: 'Asia',
    destinations: [
      { label: 'Maldives', slug: 'maldives' },
      { label: 'Thailand', slug: 'thailand' },
      { label: 'Turkey', slug: 'turkey' },
      { label: 'Japan', slug: 'japan' },
      { label: 'Indonesia (Bali)', slug: 'bali' },
      { label: 'China', slug: 'china' },
      { label: 'South Korea', slug: 'south-korea' },
      { label: 'Russia', slug: 'russia' },
    ],
  },
  {
    region: 'Europe',
    destinations: [
      { label: 'France', slug: 'france' },
      { label: 'Italy', slug: 'italy' },
      { label: 'Greece', slug: 'greece' },
    ],
  },
  {
    region: 'Middle East',
    destinations: [
      { label: 'Dubai (UAE)', slug: 'dubai' },
      { label: 'Oman', slug: 'oman' },
      { label: 'Azerbaijan', slug: 'azerbaijan' },
    ],
  },
  {
    region: 'Africa',
    destinations: [
      { label: 'Egypt', slug: 'egypt' },
    ],
  },
  {
    region: 'Australia & Oceania',
    destinations: [
      { label: 'Australia', slug: 'australia' },
    ],
  },
]

const MORE_LINKS = [
  { label: 'Blog', href: '/blogs' },
  { label: 'Privilege Card', href: '/privilege-card' },
  { label: 'Wishful Wardrobe', href: '/wishful-wardrobe' },
  { label: 'About Us', href: '/about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [packagesOpen, setPackagesOpen] = useState(false)
  const [destinationsOpen, setDestinationsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>('Asia')
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setPackagesOpen(false)
    setDestinationsOpen(false)
    setMoreOpen(false)
  }, [pathname])

  const activeRegionData = DESTINATION_REGIONS.find((r) => r.region === activeRegion)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center">
            <span className="text-white font-bold text-base">H</span>
          </div>
          <span className="font-bold text-lg text-gray-800">
            Halo <span style={{ color: 'var(--brand)' }}>Holidays</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>

          {/* Packages Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setPackagesOpen(true)}
            onMouseLeave={() => setPackagesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[var(--brand)] transition-colors py-1">
              Packages
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {packagesOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                {PACKAGE_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/packages-from-sri-lanka/${cat.slug}`}
                    className="block px-4 py-2.5 hover:bg-[var(--brand-light)] hover:text-[var(--brand)] transition-colors text-sm"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Destinations Dropdown — with mega submenu */}
          <div
            className="relative"
            onMouseEnter={() => setDestinationsOpen(true)}
            onMouseLeave={() => { setDestinationsOpen(false); setActiveRegion('Asia') }}
          >
            <Link
              href="/destinations"
              className="flex items-center gap-1 hover:text-[var(--brand)] transition-colors py-1"
            >
              Destinations
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {destinationsOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 flex shadow-xl rounded-xl overflow-hidden border border-gray-100">
                {/* Region list */}
                <div className="bg-white w-44 py-2">
                  <div className="px-4 py-2 mb-1">
                    <Link href="/destinations" className="text-xs font-semibold text-[var(--brand)] hover:underline">
                      All Destinations →
                    </Link>
                  </div>
                  {DESTINATION_REGIONS.map((r) => (
                    <button
                      key={r.region}
                      onMouseEnter={() => setActiveRegion(r.region)}
                      onClick={() => setActiveRegion(r.region)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        activeRegion === r.region
                          ? 'bg-[var(--brand-light)] text-[var(--brand)] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {r.region}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Destinations for selected region */}
                {activeRegionData && (
                  <div className="bg-gray-50 border-l border-gray-100 w-44 py-4 px-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">{activeRegionData.region}</p>
                    {activeRegionData.destinations.map((dest) => (
                      <Link
                        key={dest.slug}
                        href={`/destinations/${dest.slug}`}
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-[var(--brand)] hover:bg-white rounded-lg transition-colors"
                      >
                        {dest.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link href="/reviews" className="hover:text-[var(--brand)] transition-colors">Reviews</Link>
          <Link href="/visas" className="hover:text-[var(--brand)] transition-colors">Visas</Link>
          <Link href="/news" className="hover:text-[var(--brand)] transition-colors">News</Link>

          {/* More Dropdown */}
          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button className="flex items-center gap-1 hover:text-[var(--brand)] transition-colors py-1">
              More
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                {MORE_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-4 py-2.5 hover:bg-[var(--brand-light)] hover:text-[var(--brand)] transition-colors text-sm">
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="tel:+94704545455" className="text-sm font-medium text-gray-600 hover:text-[var(--brand)] transition-colors">
            +94 70 454 5455
          </a>
          <Link
            href="/consultation"
            className="brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Book Consultation
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
          <Link href="/" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">Home</Link>

          {/* Packages accordion */}
          <div>
            <button
              className="w-full text-left py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)] flex items-center justify-between"
              onClick={() => setPackagesOpen(!packagesOpen)}
            >
              Packages
              <svg className={`w-4 h-4 transition-transform ${packagesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {packagesOpen && (
              <div className="pl-4 space-y-1">
                {PACKAGE_CATEGORIES.map((cat) => (
                  <Link key={cat.slug} href={`/packages-from-sri-lanka/${cat.slug}`} className="block py-2 text-sm text-gray-600 hover:text-[var(--brand)]">
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Destinations accordion */}
          <div>
            <button
              className="w-full text-left py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)] flex items-center justify-between"
              onClick={() => setDestinationsOpen(!destinationsOpen)}
            >
              Destinations
              <svg className={`w-4 h-4 transition-transform ${destinationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {destinationsOpen && (
              <div className="pl-4 space-y-2">
                <Link href="/destinations" className="block py-1 text-sm font-semibold text-[var(--brand)]">All Destinations →</Link>
                {DESTINATION_REGIONS.map((r) => (
                  <div key={r.region}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider py-1">{r.region}</p>
                    <div className="pl-2 space-y-1">
                      {r.destinations.map((d) => (
                        <Link key={d.slug} href={`/destinations/${d.slug}`} className="block py-1.5 text-sm text-gray-600 hover:text-[var(--brand)]">
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/reviews" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">Reviews</Link>
          <Link href="/visas" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">Visas</Link>
          <Link href="/news" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">News</Link>
          <Link href="/blogs" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">Blog</Link>
          <Link href="/about" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">About</Link>
          <Link href="/privilege-card" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">Privilege Card</Link>
          <Link href="/contact" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-[var(--brand)]">Contact</Link>
          <div className="pt-2">
            <Link href="/consultation" className="block brand-gradient text-white text-sm font-semibold px-5 py-3 rounded-full text-center">
              Book Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
