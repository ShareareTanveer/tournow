import Link from 'next/link'
import Image from 'next/image'

interface DestinationCardProps {
  name: string
  slug: string
  region: string
  language: string
  bestSeason: string
  costLevel: string
  images: string[]
  packageCount?: number
}

const COST_COLOR: Record<string, string> = {
  Budget: 'bg-green-50 text-green-800',
  Moderate: 'bg-blue-50 text-blue-800',
  Luxury: 'bg-purple-50 text-purple-800',
}

export default function DestinationCard({
  name,
  slug,
  region,
  language,
  bestSeason,
  costLevel,
  images,
  packageCount,
}: DestinationCardProps) {
  const img = images[0] ?? '/images/placeholder.jpg'

  return (
    <Link
      href={`/destinations/${slug}`}
      className="block rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
        />
        {/* Overlay for text */}
        <div className="absolute bottom-0 left-0 w-full bg-black/25 p-3">
          <h3 className="font-semibold text-white text-base">{name}</h3>
          <p className="text-xs text-white/80">{region}</p>
        </div>
        {/* Package count */}
        {packageCount !== undefined && (
          <span className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
            {packageCount} tours
          </span>
        )}
      </div>

      {/* Info section */}
      <div className="p-3 space-y-1">
        <div className="flex flex-wrap gap-2">
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${COST_COLOR[costLevel] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {costLevel}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
            🗣 {language}
          </span>
        </div>
        <p className="text-xs text-gray-500">🌤 Best: {bestSeason}</p>
      </div>
    </Link>
  )
}