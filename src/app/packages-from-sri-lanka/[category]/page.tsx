import { Metadata } from 'next'
import PackageCard from '@/components/ui/PackageCard'
import FilterBar from '@/components/packages/FilterBar'

const CATEGORY_META: Record<string, { label: string; desc: string; icon: string }> = {
  family:    { label: 'Family Packages',        desc: 'Fun-filled holidays for the whole family with kid-friendly itineraries.',   icon: '👨‍👩‍👧‍👦' },
  honeymoon: { label: 'Honeymoon Packages',     desc: 'Romantic escapes crafted for couples — private dinners, spa & more.',       icon: '💑' },
  solo:      { label: 'Solo Packages',          desc: 'Safe, guided adventures for solo travellers across 50+ destinations.',      icon: '🧳' },
  squad:     { label: 'Squad Packages',         desc: 'Epic group trips designed for friends who love to travel together.',        icon: '👯' },
  corporate: { label: 'Corporate Packages',     desc: 'MICE events, business travel, team retreats & conference solutions.',       icon: '💼' },
  special:   { label: 'Special Packages',       desc: 'VIP & exclusive experiences — F1 Grand Prix, safaris & luxury tours.',      icon: '⭐' },
  holiday:   { label: '2026 Holiday Packages',  desc: 'Curated packages for 2026 holidays and special occasions.',                 icon: '🎉' },
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const meta = CATEGORY_META[category] ?? { label: 'Packages', desc: 'Browse our travel packages' }
  return { title: meta.label, description: meta.desc }
}

async function getPackages(category: string, searchParams: Record<string, string>) {
  const params = new URLSearchParams({ category, limit: '12', ...searchParams })
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/packages?${params}`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return { packages: [], total: 0 }
    return res.json()
  } catch {
    return { packages: [], total: 0 }
  }
}

export default async function PackageListingPage({ params, searchParams }: Props & { searchParams: Promise<Record<string, string>> }) {
  const { category } = await params
  const sp = await searchParams
  const meta = CATEGORY_META[category] ?? { label: 'Packages', desc: '', icon: '✈️' }
  const { packages, total } = await getPackages(category, sp)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <div className="text-5xl mb-3">{meta.icon}</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{meta.label}</h1>
        <p className="text-white/80 max-w-xl mx-auto">{meta.desc}</p>
        {total > 0 && <p className="mt-3 text-white/60 text-sm">{total} packages available</p>}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <FilterBar />

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {packages.map((pkg: any) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No packages found</h3>
            <p className="text-gray-500">Try adjusting your filters or <a href="/contact" className="text-[var(--brand)] underline">contact us</a> for a custom package.</p>
          </div>
        )}
      </div>
    </div>
  )
}
