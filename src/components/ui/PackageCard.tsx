'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiMoon, FiCalendar, FiStar, FiArrowRight, FiMapPin } from 'react-icons/fi'
import { useCurrency } from '@/lib/useCurrency'
import { getTravelImage } from '@/lib/travel-images'

interface PackageCardProps {
  title: string
  slug: string
  price: number
  oldPrice?: number | null
  duration: number
  nights: number
  starRating: string
  category?: string | null
  images: string[]
  destination?: { name: string; region: string }
  isFeatured?: boolean
  paxType?: string | null
}

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }

const CATEGORY_COLORS: Record<string, string> = {
  FAMILY:    '#007f89',
  HONEYMOON: '#b85c38',
  SOLO:      '#3f8f64',
  SQUAD:     '#2f6f9f',
  CORPORATE: '#64748b',
  SPECIAL:   '#c99a45',
  HOLIDAY:   '#5f4b8b',
}

export default function PackageCard({
  title,
  slug,
  price,
  oldPrice,
  duration,
  nights,
  starRating,
  category,
  images,
  destination,
  isFeatured,
  paxType,
}: PackageCardProps) {
  const { format } = useCurrency()
  const stars = STAR_MAP[starRating] ?? 4
  const img = images[0] || getTravelImage(destination?.name ?? category)
  const catColor = CATEGORY_COLORS[category ?? ''] ?? '#007f89'

  return (
    <Link
      href={`/packages/${slug}`}
      className="group block overflow-hidden rounded-lg border border-[#e5e8e4] bg-white shadow-[0_8px_30px_rgba(16,24,23,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#cdd7d1] hover:shadow-[0_24px_54px_rgba(16,24,23,0.14)]"
    >
      <div className="relative h-60 overflow-hidden bg-[#edf0ed]">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,24,23,0.82),rgba(16,24,23,0.12),rgba(16,24,23,0.04))]" />

        {isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full text-[#101817] bg-[#f0d492]">
              Top Rated
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-0.5 rounded-full border border-white/15 bg-black/[0.38] px-2.5 py-1.5 backdrop-blur-md">
          {Array.from({ length: stars }).map((_, i) => (
            <FiStar key={i} size={10} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          {destination && (
            <p className="text-white/70 text-[11px] flex items-center gap-1 mb-1">
              <FiMapPin size={10} />
              {destination.name}, {destination.region}
            </p>
          )}
          <h3 className="text-white font-black text-lg leading-snug line-clamp-2">{title}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#52615d] bg-[#f4f1ea] px-2.5 py-1.5 rounded-full">
            <FiMoon size={10} /> {nights}N
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#52615d] bg-[#f4f1ea] px-2.5 py-1.5 rounded-full">
            <FiCalendar size={10} /> {duration}D
          </span>
          {category && (
            <span className="text-[10px] font-black px-2.5 py-1.5 rounded-full capitalize"
              style={{ background: `${catColor}15`, color: catColor }}>
              {category.toLowerCase()}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-[#8a9691] font-bold uppercase tracking-[0.14em] mb-1">From</p>
            <p className="text-xl font-black leading-none" style={{ color: '#007f89' }}>
              {format(price)}
            </p>
            {oldPrice && (
              <p className="text-[11px] text-[#9ca7a2] line-through mt-0.5">
                {format(oldPrice)}
              </p>
            )}
            {paxType && (
              <p className="text-[10px] text-[#8a9691] mt-0.5">{paxType}</p>
            )}
          </div>

          <span className="flex items-center gap-1.5 rounded-lg border border-[#007f89] px-4 py-2 text-xs font-black text-[#007f89] transition-all duration-300 group-hover:bg-[#007f89] group-hover:text-white">
            View <FiArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  )
}
