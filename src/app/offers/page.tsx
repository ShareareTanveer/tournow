import { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import PackageCard from '@/components/ui/PackageCard'
import TourCard from '@/components/ui/TourCard'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { FiTag } from 'react-icons/fi'

type PackageOffer = Prisma.PackageGetPayload<{
  include: { destination: { select: { name: true; slug: true; region: true } } }
}>

type TourOffer = Prisma.TourGetPayload<{
  include: { primaryDestination: { select: { name: true; slug: true; region: true } } }
}>

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Travel Offers',
  description: 'Browse discounted holiday packages and international tours from Sri Lanka.',
  openGraph: {
    type: 'website',
    title: 'Travel Offers',
    description: 'Browse discounted holiday packages and international tours from Sri Lanka.',
    siteName: 'Metro Voyage',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/offers`,
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/offers` },
}

async function getOffers(): Promise<{ packages: PackageOffer[]; tours: TourOffer[] }> {
  try {
    const [packages, tours] = await Promise.all([
      prisma.package.findMany({
        where: { isActive: true, oldPrice: { not: null } },
        include: { destination: { select: { name: true, slug: true, region: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 24,
      }),
      prisma.tour.findMany({
        where: { isActive: true, oldPrice: { not: null } },
        include: { primaryDestination: { select: { name: true, slug: true, region: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 24,
      }),
    ])

    return { packages, tours }
  } catch {
    return { packages: [], tours: [] }
  }
}

export default async function OffersPage() {
  const { packages, tours } = await getOffers()
  const total = packages.length + tours.length

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <PageHero
        title="Travel Offers"
        subtitle="Discounted packages and tours curated for your next holiday."
        imageUrl={getPageHeroImage('packages')}
        breadcrumbs={[{ label: 'Offers' }]}
      >
        <p className="flex items-center gap-1.5 text-white/60 text-sm mt-2">
          <FiTag size={12} /> {total} offer{total !== 1 ? 's' : ''} available
        </p>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
        {packages.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0395d5] mb-2">
                  Packages
                </p>
                <h2 className="text-2xl font-black text-[#101817]">Package Offers</h2>
              </div>
              <Link href="/packages-from-sri-lanka" className="text-sm font-bold text-[#0395d5] hover:underline">
                View all packages
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          </section>
        )}

        {tours.length > 0 && (
          <section className={packages.length > 0 ? 'mt-14' : ''}>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0395d5] mb-2">
                  Tours
                </p>
                <h2 className="text-2xl font-black text-[#101817]">Tour Offers</h2>
              </div>
              <Link href="/tours-from-sri-lanka/south-east-asia" className="text-sm font-bold text-[#0395d5] hover:underline">
                View all tours
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} {...tour} />
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-lg bg-white border border-[#e5e8e4] flex items-center justify-center mx-auto mb-4">
              <FiTag size={24} className="text-[#8a9691]" />
            </div>
            <h3 className="text-xl font-black text-[#101817] mb-2">No offers available</h3>
            <p className="text-[#52615d]">
              Add an old price to a package or tour from admin to publish it here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
