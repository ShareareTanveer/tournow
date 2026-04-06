'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiArrowLeft, FiTag } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

interface Perk {
  id: string
  title: string
  description: string
  imageUrl?: string | null
  ctaLink?: string | null
  iconName: string
  iconColor: string
  bgColor: string
}

interface Props {
  perks: Perk[]
}

// Vibrant travel-inspired gradient fallbacks (used when no imageUrl)
const FALLBACK_BG = [
  { from: '#f43f5e', to: '#f97316', label: 'Offer' },
  { from: '#8b5cf6', to: '#ec4899', label: 'Perk' },
  { from: '#0ea5e9', to: '#14b8a6', label: 'Deal' },
  { from: '#f59e0b', to: '#f43f5e', label: 'Offer' },
  { from: '#10b981', to: '#0ea5e9', label: 'Perk' },
  { from: '#6366f1', to: '#8b5cf6', label: 'Deal' },
]

const DEFAULT_PERKS: Perk[] = [
  { id: '1', title: 'FREE Visa Consultation',          description: 'Get expert visa guidance at no cost — travel smarter with zero stress',          imageUrl: 'https://picsum.photos/seed/visa-passport/700/440',    iconName: 'FiShield',    iconColor: '#ec4899', bgColor: '#fdf2f8' },
  { id: '2', title: 'Big Families, Big Perks',         description: 'Families of 5 or more enjoy complimentary tours at top destinations',            imageUrl: 'https://picsum.photos/seed/family-beach/700/440',     iconName: 'FiUsers',     iconColor: '#f59e0b', bgColor: '#fffbeb' },
  { id: '3', title: 'Corporate Travel to Your Door',   description: 'Tailored travel consultations for businesses, right at your office',             imageUrl: 'https://picsum.photos/seed/corp-meeting/700/440',     iconName: 'FiBriefcase', iconColor: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: '4', title: 'Child Stays FREE',                description: 'Children under 12 stay free on select packages when travelling with 2 adults',   imageUrl: 'https://picsum.photos/seed/kids-holiday/700/440',     iconName: 'FiHeart',     iconColor: '#ef4444', bgColor: '#fef2f2' },
  { id: '5', title: 'Best Price Guarantee',            description: "Find a lower price elsewhere and we'll match it — no hidden fees, ever",         imageUrl: 'https://picsum.photos/seed/price-tag/700/440',        iconName: 'FiAward',     iconColor: '#0d9488', bgColor: '#f0fdf9' },
]

export default function PerksSection({ perks }: Props) {
  const items = perks.length > 0 ? perks : DEFAULT_PERKS
  const [active, setActive] = useState(0)

  // Show 3 cards at a time on desktop, 1 on mobile
  const visibleCount = 3
  const maxIndex = Math.max(0, items.length - visibleCount)

  return (
    <section className="py-20 bg-white" style={{ overflowX: 'clip' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <div className="section-tag mb-3">Exclusive Offers</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              Travel perks you&apos;ll <span style={{ color: '#ec4899' }}>love</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              Handpicked offers to stretch your budget and smooth every step of your journey.
            </p>
          </div>
          <Link href="/perks"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:underline shrink-0 transition-colors"
            style={{ color: '#ec4899' }}>
            All perks <FiArrowRight size={14} />
          </Link>
        </div>

        {/* ── Slider ── */}
        <div className="relative">
          {/* Prev */}
          <button
            onClick={() => setActive(i => Math.max(0, i - 1))}
            disabled={active === 0}
            className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous">
            <FiArrowLeft size={18} />
          </button>

          {/* Cards track */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex gap-5 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(calc(-${active * (100 / visibleCount)}% - ${active * 20 / visibleCount}px))` }}
            >
              {items.map((perk, idx) => {
                const fb = FALLBACK_BG[idx % FALLBACK_BG.length]
                const detailHref = `/perks/${perk.id}`

                return (
                  /* ── Individual perk card — entire card is a link ── */
                  <Link
                    key={perk.id}
                    href={detailHref}
                    className="group shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 hover:border-pink-200 block"
                  >
                    {/* ── Hero image — travel destination style ── */}
                    <div className="relative h-52 overflow-hidden">
                      {perk.imageUrl ? (
                        <img
                          src={perk.imageUrl}
                          alt={perk.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: `linear-gradient(135deg, ${fb.from}, ${fb.to})` }}
                        >
                          <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")` }} />
                        </div>
                      )}

                      {/* Dark gradient overlay at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Perk badge — top left */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500 text-white shadow">
                          <FiTag size={9} /> Exclusive
                        </span>
                      </div>

                      {/* Title overlaid on image — GYG style */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-black text-white text-base leading-tight drop-shadow-sm">
                          {perk.title}
                        </h3>
                      </div>
                    </div>

                    {/* ── Card body ── */}
                    <div className="p-4">
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {perk.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all"
                          style={{ color: '#ec4899' }}
                        >
                          Get it now <FiArrowRight size={14} />
                        </span>
                        <span className="text-xs text-gray-300 font-medium">View details →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={() => setActive(i => Math.min(maxIndex, i + 1))}
            disabled={active >= maxIndex}
            className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next">
            <FiArrowRight size={18} />
          </button>
        </div>

        {/* ── Dots ── */}
        <div className="flex justify-center gap-2 mt-7">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? 'w-7 bg-pink-500' : 'w-2 bg-gray-200 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
