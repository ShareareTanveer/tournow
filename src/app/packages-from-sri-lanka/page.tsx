import { Metadata } from 'next'
import PackageCard from '@/components/ui/PackageCard'
import FilterBar from '@/components/packages/FilterBar'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { getPackageSearchResults } from '@/lib/package-search'
import { FiMapPin } from 'react-icons/fi'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Holiday Packages From Sri Lanka',
  description: 'Search curated international holiday packages from Sri Lanka by destination, budget, duration, and hotel rating.',
  openGraph: {
    type: 'website',
    title: 'Holiday Packages From Sri Lanka',
    description: 'Search curated international holiday packages from Sri Lanka by destination, budget, duration, and hotel rating.',
    siteName: 'Metro Voyage',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/packages-from-sri-lanka`,
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/packages-from-sri-lanka` },
}

function getSearchSummary(searchParams: Record<string, string>, total: number) {
  const parts: string[] = []
  if (searchParams.destination) parts.push(searchParams.destination.replace(/-/g, ' '))
  if (searchParams.minPrice || searchParams.maxPrice) {
    const min = searchParams.minPrice ? Number(searchParams.minPrice).toLocaleString('en') : '0'
    const max = searchParams.maxPrice && searchParams.maxPrice !== '99999999'
      ? Number(searchParams.maxPrice).toLocaleString('en')
      : 'above'
    parts.push(max === 'above' ? `from LKR ${min}` : `LKR ${min} - ${max}`)
  }

  if (parts.length === 0) return `${total} packages available`
  return `${total} packages matching ${parts.join(' - ')}`
}

export default async function PackagesSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const { packages, total } = await getPackageSearchResults({ ...sp, limit: '12' })

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <PageHero
        title="Holiday Packages From Sri Lanka"
        subtitle="Search all curated packages by destination, budget, duration, and hotel rating."
        imageUrl={getPageHeroImage('packages')}
        breadcrumbs={[{ label: 'Packages', href: '/packages-from-sri-lanka' }]}
      >
        <p className="flex items-center gap-1.5 text-white/60 text-sm mt-2 capitalize">
          <FiMapPin size={12} /> {getSearchSummary(sp, total)}
        </p>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
        <FilterBar />

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {packages.map((pkg: any) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-lg bg-white border border-[#e5e8e4] flex items-center justify-center mx-auto mb-4">
              <FiMapPin size={24} className="text-[#8a9691]" />
            </div>
            <h3 className="text-xl font-black text-[#101817] mb-2">No packages found</h3>
            <p className="text-[#52615d]">Try another destination, clear budget filters, or <a href="/contact" className="underline" style={{ color: 'var(--brand)' }}>contact us</a> for a custom package.</p>
          </div>
        )}
      </div>
    </div>
  )
}
