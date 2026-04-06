'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiMoon, FiCalendar, FiStar } from 'react-icons/fi'
import { useCurrency } from '@/lib/useCurrency'

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
  paxType
}: PackageCardProps) {
  const { format } = useCurrency()
  const stars = STAR_MAP[starRating] ?? 4
  const img = images[0]

  return (
    <Link
      href={`/packages/${slug}`}
      className="group block rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand-muted), #f0fdf9)' }}
          >
            <span className="text-5xl font-black opacity-10" style={{ color: 'var(--brand)' }}>
              {title[0]}
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Category */}
        {category && (
  <span
    className="absolute top-4 left-4 text-white text-xs font-medium px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm"
  >
    {category}
  </span>
)}

        {/* Stars */}
        <div className="absolute top-4 right-4 flex gap-0.5 bg-black/30 backdrop-blur px-2 py-1 rounded-full">
          {Array.from({ length: stars }).map((_, i) => (
            <FiStar key={i} size={11} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {/* Floating Bottom Info */}
        <div className="absolute bottom-0 left-0 w-full p-4">
          {destination && (
            <p className="text-xs text-white/80 flex items-center gap-1 mb-1">
              <FiMapPin size={12} />
              {destination.name}, {destination.region}
            </p>
          )}

          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">

        {/* Trip Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
            <FiMoon size={12} /> {nights} Nights
          </span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
            <FiCalendar size={12} /> {duration} Days
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] text-gray-400">Starting from</span>

            <p className="text-lg font-extrabold leading-tight" style={{ color: 'var(--brand)' }}>
              {format(price)}
            </p>

            {oldPrice && (
              <p className="text-[11px] text-gray-400 line-through">
                {format(oldPrice)}
              </p>
            )}

            {paxType && (
              <span className="text-[10px] text-gray-400 block">
                {paxType}
              </span>
            )}
          </div>

          {/* CTA */}
        <span
  className="text-xs font-medium px-4 py-2 rounded-full border transition-all duration-200 group-hover:bg-gray-100"
  style={{
    color: 'var(--brand)',
    borderColor: 'var(--brand)',
  }}
>
  View Package
</span>
        </div>
      </div>
    </Link>
  )
}