import Link from 'next/link'
import Image from 'next/image'
import { FiSun, FiPackage, FiArrowRight } from 'react-icons/fi'
import { getTravelImage } from '@/lib/travel-images'

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

const COST_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  Budget:   { bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' },
  Moderate: { bg: 'rgba(0,127,137,0.12)', color: '#007f89', dot: '#007f89' },
  Luxury:   { bg: 'rgba(63,143,100,0.12)', color: '#3f8f64', dot: '#3f8f64' },
}

export default function DestinationCard({
  name,
  slug,
  region,
  bestSeason,
  costLevel,
  images,
  packageCount,
}: DestinationCardProps) {
  const img = images[0] || getTravelImage(name)
  const cost = COST_STYLE[costLevel] ?? { bg: 'rgba(100,116,139,0.12)', color: '#64748b', dot: '#64748b' }

  return (
    <Link
      href={`/destinations/${slug}`}
      className="group block overflow-hidden rounded-lg border border-[#e5e8e4] bg-white shadow-[0_8px_28px_rgba(16,24,23,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cdd7d1] hover:shadow-[0_24px_50px_rgba(16,24,23,0.14)]"
    >
      <div className="relative h-48 overflow-hidden bg-[#edf0ed] sm:h-56">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,24,23,0.86),rgba(16,24,23,0.12),rgba(16,24,23,0.02))]" />

        {packageCount !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black text-white px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/15 bg-black/[0.38]">
            <FiPackage size={9} /> {packageCount}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white/[0.62] text-[10px] font-bold uppercase tracking-[0.16em] mb-1">{region}</p>
          <h3 className="text-white font-black text-xl leading-tight">{name}</h3>
        </div>
      </div>

      <div className="bg-white px-4 py-3.5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#52615d]">
          <FiSun size={11} style={{ color: '#c99a45' }} />
          {bestSeason}
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: cost.bg, color: cost.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cost.dot }} />
            {costLevel}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-black text-[#007f89] transition group-hover:gap-2.5">
          Explore destination <FiArrowRight size={11} />
        </span>
      </div>
    </Link>
  )
}
