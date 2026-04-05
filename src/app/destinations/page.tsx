import { Metadata } from 'next'
import DestinationCard from '@/components/ui/DestinationCard'

export const metadata: Metadata = {
  title: 'Destinations',
  description: 'Explore 50+ travel destinations from Sri Lanka. Asia, Europe, Middle East, Africa & more.',
}

async function getDestinations() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/destinations`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

const REGIONS = ['All', 'Southeast Asia', 'East Asia', 'South Asia', 'Middle East', 'Europe', 'Africa', 'Oceania']

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Explore Destinations</h1>
        <p className="text-white/80 max-w-xl mx-auto">Discover amazing destinations across Asia, Europe, Middle East, Africa & beyond</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Featured */}
        {destinations.filter((d: any) => d.isFeatured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {destinations.filter((d: any) => d.isFeatured).map((dest: any) => (
                <DestinationCard key={dest.id} {...dest} packageCount={dest._count?.packages} />
              ))}
            </div>
          </div>
        )}

        {/* All */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Destinations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {destinations.map((dest: any) => (
            <DestinationCard key={dest.id} {...dest} packageCount={dest._count?.packages} />
          ))}
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-gray-500">Destinations coming soon. Connect your database to see all destinations.</p>
          </div>
        )}
      </div>
    </div>
  )
}
