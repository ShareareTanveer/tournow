'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowRight, FiArrowLeft, FiZap } from 'react-icons/fi'
import { TRAVEL_IMAGES } from '@/lib/travel-images'

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

const CARD_ACCENTS = [
  { from: '#b85c38', to: '#c99a45' },
  { from: '#007f89', to: '#3f8f64' },
  { from: '#2f6f9f', to: '#007f89' },
  { from: '#5f4b8b', to: '#2f6f9f' },
  { from: '#3f8f64', to: '#c99a45' },
]

const DEFAULT_PERKS: Perk[] = [
  { id: '1', title: 'FREE Visa Consultation',        description: 'Expert visa guidance at zero cost — travel smarter with less stress.',             imageUrl: TRAVEL_IMAGES.editorial,  iconName: 'FiShield',    iconColor: '#b85c38', bgColor: '#fdf2f8' },
  { id: '2', title: 'Big Families, Bigger Perks',    description: 'Families of 5+ enjoy complimentary tours at top destinations worldwide.',          imageUrl: TRAVEL_IMAGES.family,   iconName: 'FiUsers',     iconColor: '#007f89', bgColor: '#e6fafb' },
  { id: '3', title: 'Corporate Travel to Your Door', description: 'Tailored travel consultations for businesses, delivered right at your office.',    imageUrl: TRAVEL_IMAGES.corporate,   iconName: 'FiBriefcase', iconColor: '#3f8f64', bgColor: '#f0fdf4' },
  { id: '4', title: 'Children Stay Free',            description: 'Kids under 12 stay free on select packages when travelling with 2 adults.',        imageUrl: TRAVEL_IMAGES.holiday,   iconName: 'FiHeart',     iconColor: '#b85c38', bgColor: '#fef2f2' },
  { id: '5', title: 'Best Price Guarantee',          description: "Find a lower price elsewhere and we'll match it — no hidden fees, ever.",         imageUrl: TRAVEL_IMAGES.special,      iconName: 'FiAward',     iconColor: '#007f89', bgColor: '#f0fdf9' },
]

export default function PerksSection({ perks }: Props) {
  const items = perks.length > 0 ? perks : DEFAULT_PERKS
  const [active, setActive] = useState(0)
  const visible = 3
  const maxIndex = Math.max(0, items.length - visible)

  return (
    <section className="bg-[#101817] py-20 text-white sm:py-24" style={{ overflowX: 'clip' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-end justify-between mb-12 gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#f0d492]">
              <FiZap size={10} /> Exclusive Offers
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Perks built into the journey
            </h2>
            <p className="text-white/[0.58] mt-3 text-sm max-w-md leading-6">
              Handpicked benefits to stretch your budget and smooth every step.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setActive(i => Math.max(0, i - 1))}
              disabled={active === 0}
              aria-label="Previous perks"
              className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center text-white/70 hover:border-[#f0d492] hover:text-[#f0d492] disabled:opacity-30 transition-all"
            >
              <FiArrowLeft size={16} />
            </button>
            <button
              onClick={() => setActive(i => Math.min(maxIndex, i + 1))}
              disabled={active >= maxIndex}
              aria-label="Next perks"
              className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center text-white/70 hover:border-[#f0d492] hover:text-[#f0d492] disabled:opacity-30 transition-all"
            >
              <FiArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="overflow-hidden">
          <div
            className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(.25,.46,.45,.94)]"
            style={{ transform: `translateX(calc(-${active * (100 / visible)}% - ${active * 20 / visible}px))` }}
          >
            {items.map((perk, idx) => {
              const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length]
              const href = `/perks/${perk.id}`

              return (
                <Link
                  key={perk.id}
                  href={href}
                  className="group block w-full shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white text-[#101817] shadow-[0_18px_60px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 sm:w-[calc(50%_-_10px)] lg:w-[calc(33.333%_-_14px)]"
                >
                  <div className="relative h-52 overflow-hidden">
                    {perk.imageUrl ? (
                      <Image
                        src={perk.imageUrl}
                        alt={perk.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full text-white"
                        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}>
                        <FiZap size={8} /> Exclusive
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-black text-white text-lg leading-tight drop-shadow-sm">
                        {perk.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-[#52615d] leading-relaxed line-clamp-2 mb-4">
                      {perk.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-black transition-all group-hover:gap-3"
                        style={{ color: accent.from }}>
                        Get it now <FiArrowRight size={13} />
                      </span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{ background: `${accent.from}18` }}>
                        <FiArrowRight size={12} style={{ color: accent.from }} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === active ? '28px' : '8px',
                  background: i === active ? '#f0d492' : 'rgba(255,255,255,0.24)',
                }}
              />
            ))}
          </div>
          <Link href="/perks"
            className="flex items-center gap-1.5 text-sm font-bold text-[#f0d492] hover:underline">
            All perks <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
