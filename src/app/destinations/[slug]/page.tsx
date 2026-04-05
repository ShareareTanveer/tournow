import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import PackageCard from '@/components/ui/PackageCard'

type Props = { params: Promise<{ slug: string }> }

async function getDestination(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/destinations/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) return { title: 'Destination Not Found' }
  return { title: dest.name, description: dest.description?.slice(0, 160) }
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-72 md:h-96 bg-gray-300">
        {dest.images?.[0] ? (
          <Image src={dest.images[0]} alt={dest.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full brand-gradient flex items-center justify-center">
            <span className="text-white text-7xl">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-white/70 text-sm mb-1">{dest.region}</p>
          <h1 className="text-3xl md:text-5xl font-bold">{dest.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About {dest.name}</h2>
              <p className="text-gray-600 leading-relaxed">{dest.description}</p>
            </div>

            {dest.packages?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-5">Packages to {dest.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {dest.packages.map((pkg: any) => (
                    <PackageCard key={pkg.id} {...pkg} destination={{ name: dest.name, region: dest.region }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Region</span><span className="font-medium">{dest.region}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Language</span><span className="font-medium">{dest.language}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Best Season</span><span className="font-medium">{dest.bestSeason}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cost Level</span><span className="font-medium">{dest.costLevel}</span></div>
              </div>
            </div>

            <div className="bg-[var(--brand-light)] rounded-2xl p-5 border border-[var(--brand)]/20">
              <h3 className="font-semibold text-gray-800 mb-2">Plan a trip to {dest.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Get a personalised package from our experts.</p>
              <Link href="/consultation" className="block text-center brand-gradient text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90">
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
