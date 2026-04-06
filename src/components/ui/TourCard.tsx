'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiMoon, FiCalendar, FiStar, FiGlobe } from 'react-icons/fi'
import { useCurrency } from '@/lib/useCurrency'

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
  const img = images[0]
  const countries = multiDestinations && multiDestinations.length > 0 ? multiDestinations : null

  return (
    <Link href={`/tours/${slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <FiGlobe size={40} className="text-white opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Duration badge top-left */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <FiCalendar size={10} /> {duration}D / {nights}N
        </div>

        {/* Star rating top-right */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <FiStar key={i} size={11} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {/* Region badge bottom-left */}
        {region && (
          <span className="absolute bottom-3 left-3 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            {region}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Multi-country pills */}
        {countries ? (
          <div className="flex flex-wrap gap-1 mb-2">
            {countries.slice(0, 4).map((c) => (
              <span key={c} className="text-[10px] font-medium text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <FiMapPin size={8} /> {c}
              </span>
            ))}
            {countries.length > 4 && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
                +{countries.length - 4} more
              </span>
            )}
          </div>
        ) : primaryDestination && (
          <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
            <FiMapPin size={10} className="text-sky-500" />
            {primaryDestination.name}, {primaryDestination.region}
          </p>
        )}

        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <ul className="space-y-0.5 mb-3">
            {highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-[11px] text-gray-500 flex items-start gap-1">
                <span className="mt-0.5 shrink-0 text-sky-400">✓</span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <span className="text-[10px] text-gray-400">From</span>
            <p className="font-black text-base leading-tight text-sky-600">
              {format(price)}
            </p>
            {oldPrice && (
              <p className="text-[10px] text-gray-400 line-through">{format(oldPrice)}</p>
            )}
            {paxType && <span className="text-[10px] text-gray-400">{paxType}</span>}
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-sky-400 text-sky-600 group-hover:bg-sky-400 group-hover:text-white transition-colors">
            Explore
          </span>
        </div>
      </div>
    </Link>
  )
}
