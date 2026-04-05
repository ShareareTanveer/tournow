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
  Budget: 'bg-green-100 text-green-700',
  Moderate: 'bg-blue-100 text-blue-700',
  Luxury: 'bg-purple-100 text-purple-700',
}

export default function DestinationCard({ name, slug, region, language, bestSeason, costLevel, images, packageCount }: DestinationCardProps) {
  const img = images[0] ?? '/images/placeholder.jpg'

  return (
    <Link href={`/destinations/${slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-gray-100">
      <div className="relative h-44 overflow-hidden">
        <Image src={img} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 300px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-bold text-lg leading-tight">{name}</h3>
          <p className="text-xs text-white/80">{region}</p>
        </div>
        {packageCount !== undefined && (
          <span className="absolute top-3 right-3 brand-gradient text-white text-xs font-semibold px-2 py-1 rounded-full">
            {packageCount} tours
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${COST_COLOR[costLevel] ?? 'bg-gray-100 text-gray-600'}`}>{costLevel}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">🗣 {language}</span>
        </div>
        <p className="text-xs text-gray-500">🌤 Best: {bestSeason}</p>
      </div>
    </Link>
  )
}
