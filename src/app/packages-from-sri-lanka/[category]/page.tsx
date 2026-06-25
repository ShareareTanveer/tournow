import { Metadata } from 'next'
import PackageCard from '@/components/ui/PackageCard'
import FilterBar from '@/components/packages/FilterBar'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { getPackageSearchResults } from '@/lib/package-search'
import { FiMapPin } from 'react-icons/fi'

const CATEGORY_META: Record<string, { label: string; desc: string }> = {
  family:    { label: 'Family Packages',       desc: 'Fun-filled holidays for the whole family with kid-friendly itineraries.' },
  honeymoon: { label: 'Honeymoon Packages',    desc: 'Romantic escapes crafted for couples — private dinners, spa & more.' },
  solo:      { label: 'Solo Packages',         desc: 'Safe, guided adventures for solo travellers across 50+ destinations.' },
  squad:     { label: 'Squad Packages',        desc: 'Epic group trips designed for friends who love to travel together.' },
  corporate: { label: 'Corporate Packages',    desc: 'MICE events, business travel, team retreats & conference solutions.' },
  special:   { label: 'Special Packages',      desc: 'VIP & exclusive experiences — F1 Grand Prix, safaris & luxury tours.' },
  holiday:   { label: '2026 Holiday Packages', desc: 'Curated packages for 2026 holidays and special occasions.' },
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const meta = CATEGORY_META[category] ?? { label: 'Packages', desc: 'Browse our travel packages' }
  return {
    title: meta.label,
    description: meta.desc,
    openGraph: {
      type: 'website',
      title: meta.label,
      description: meta.desc,
      siteName: 'Metro Voyage',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/packages-from-sri-lanka/${category}`,
    },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/packages-from-sri-lanka/${category}` },
  }
}

async function getCategoryConfig(slug: string) {
  try {
    return await prisma.packageCategoryConfig.findUnique({ where: { slug } })
  } catch { return null }
}

export default async function PackageListingPage({ params, searchParams }: Props & { searchParams: Promise<Record<string, string>> }) {
  const { category } = await params
  const sp = await searchParams
  const meta = CATEGORY_META[category] ?? { label: 'Packages', desc: '' }

  const [categoryConfig, { packages, total }] = await Promise.all([
    getCategoryConfig(category),
    getPackageSearchResults({ ...sp, category, limit: '12' }),
  ])

  // Use DB image if available, else generic fallback
  const heroImage = categoryConfig?.imageUrl ?? getPageHeroImage('packages')

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <PageHero
        title={categoryConfig?.label ?? meta.label}
        subtitle={categoryConfig?.description ?? meta.desc}
        imageUrl={heroImage}
        breadcrumbs={[{ label: 'Packages', href: '/packages-from-sri-lanka/family' }, { label: categoryConfig?.label ?? meta.label }]}
      >
        {total > 0 && (
          <p className="flex items-center gap-1.5 text-white/60 text-sm mt-2">
            <FiMapPin size={12} /> {total} packages available
          </p>
        )}
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
            <p className="text-[#52615d]">Try adjusting your filters or <a href="/contact" className="underline" style={{ color: 'var(--brand)' }}>contact us</a> for a custom package.</p>
          </div>
        )}
      </div>
    </div>
  )
}
