'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiCalendar, FiStar, FiArrowRight } from 'react-icons/fi'
import { useCurrency } from '@/lib/useCurrency'
import { getTravelImage } from '@/lib/travel-images'

interface TourCardProps {
  title: string
  slug: string
  price: number
  oldPrice?: number | null
  duration: number
  nights: number
  starRating: string
  images: string[]
  primaryDestination?: { name: string; region: string }
  region?: string | null
  multiDestinations?: string[]
  highlights?: string[]
  paxType?: string | null
  isFeatured?: boolean
}

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }

export default function TourCard({
  title, slug, price, oldPrice, duration, nights, starRating,
  images, primaryDestination, region, multiDestinations, highlights, paxType,
}: TourCardProps) {
  const { format } = useCurrency()
  const stars = STAR_MAP[starRating] ?? 4
  const img = images[0] || getTravelImage(primaryDestination?.name ?? region)
  const countries = multiDestinations && multiDestinations.length > 0 ? multiDestinations : null

  return (
    <Link href={`/tours/${slug}`}
      className="group block overflow-hidden rounded-lg border border-[#e5e8e4] bg-white shadow-[0_8px_30px_rgba(16,24,23,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cdd7d1] hover:shadow-[0_24px_54px_rgba(16,24,23,0.14)]">
      <div className="relative h-56 overflow-hidden bg-[#edf0ed]">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,24,23,0.78),rgba(16,24,23,0.10),rgba(16,24,23,0.02))]" />

        <div className="absolute top-3 left-3 bg-black/[0.48] backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <FiCalendar size={10} /> {duration}D / {nights}N
        </div>

        <div className="absolute top-3 right-3 flex gap-0.5 rounded-full border border-white/15 bg-black/[0.38] px-2.5 py-1.5 backdrop-blur-md">
          {Array.from({ length: stars }).map((_, i) => (
            <FiStar key={i} size={11} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {region && (
          <span className="absolute bottom-3 left-3 text-white text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#007f89]">
            {region}
          </span>
        )}
      </div>

      <div className="p-4">
        {countries ? (
          <div className="flex flex-wrap gap-1 mb-2">
            {countries.slice(0, 4).map((c) => (
              <span key={c} className="text-[10px] font-bold text-[#007f89] bg-[#edf8f6] border border-[#d8eee9] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <FiMapPin size={8} /> {c}
              </span>
            ))}
            {countries.length > 4 && (
              <span className="text-[10px] font-medium text-[#8a9691] bg-[#f4f1ea] border border-[#ece6da] px-1.5 py-0.5 rounded-full">
                +{countries.length - 4} more
              </span>
            )}
          </div>
        ) : primaryDestination && (
          <p className="text-xs text-[#52615d] mb-1.5 flex items-center gap-1">
            <FiMapPin size={10} className="text-[#007f89]" />
            {primaryDestination.name}, {primaryDestination.region}
          </p>
        )}

        <h3 className="font-black text-[#101817] text-base leading-snug mb-2 line-clamp-2">
          {title}
        </h3>

        {highlights && highlights.length > 0 && (
          <ul className="space-y-0.5 mb-3">
            {highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-[11px] text-[#52615d] flex items-start gap-1">
                <span className="mt-0.5 shrink-0 text-[#3f8f64]">✓</span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#edf0ed]">
          <div>
            <span className="text-[10px] text-[#8a9691] font-bold uppercase tracking-[0.14em]">From</span>
            <p className="font-black text-base leading-tight text-[#007f89]">
              {format(price)}
            </p>
            {oldPrice && (
              <p className="text-[10px] text-[#9ca7a2] line-through">{format(oldPrice)}</p>
            )}
            {paxType && <span className="text-[10px] text-[#8a9691]">{paxType}</span>}
          </div>
          <span className="flex items-center gap-1 rounded-lg border border-[#007f89] px-3 py-2 text-xs font-black text-[#007f89] transition-colors group-hover:bg-[#007f89] group-hover:text-white">
            Explore <FiArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  )
}
