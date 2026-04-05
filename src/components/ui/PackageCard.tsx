import Link from 'next/link'
import Image from 'next/image'

interface PackageCardProps {
  title: string
  slug: string
  price: number
  duration: number
  nights: number
  starRating: string
  category: string
  images: string[]
  destination?: { name: string; region: string }
  isFeatured?: boolean
  paxType?: string | null
}

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }

export default function PackageCard({ title, slug, price, duration, nights, starRating, category, images, destination, paxType }: PackageCardProps) {
  const stars = STAR_MAP[starRating] ?? 4
  const img = images[0] ?? '/images/placeholder.jpg'

  return (
    <Link href={`/packages/${slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-gray-100">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Category badge */}
        <span className="absolute top-3 left-3 brand-gradient text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
          {category.toLowerCase()}
        </span>
        {/* Stars */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-sm">★</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {destination && (
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <span>📍</span> {destination.name}, {destination.region}
          </p>
        )}
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-3 line-clamp-2 group-hover:text-[var(--brand)] transition-colors">
          {title}
        </h3>

        {/* Duration */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">🌙 {nights} Nights</span>
          <span className="flex items-center gap-1">📅 {duration} Days</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">From</span>
            <p className="font-bold text-lg" style={{ color: 'var(--brand)' }}>
              LKR {price.toLocaleString()}
            </p>
            {paxType && <span className="text-xs text-gray-400">{paxType}</span>}
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 text-[var(--brand)] border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white transition-colors">
            View Details
          </span>
        </div>
      </div>
    </Link>
  )
}
