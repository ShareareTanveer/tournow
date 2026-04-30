import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { FiArrowRight, FiChevronRight } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Travel Perks & Offers',
  description: 'Exclusive travel perks and handpicked offers from Metro Voyage to stretch your budget.',
}

async function getPerks() {
  try {
    return await prisma.perk.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
  } catch { return [] }
}

const GRADIENTS = [
  'from-pink-500 via-fuchsia-500 to-yellow-400',
  'from-purple-600 via-violet-500 to-pink-500',
  'from-teal-500 via-cyan-400 to-blue-500',
  'from-indigo-500 via-amber-400 to-yellow-300',
  'from-rose-500 via-pink-500 to-fuchsia-600',
  'from-indigo-600 via-blue-500 to-cyan-400',
]

export default async function PerksPage() {
  const perks = await getPerks()

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Travel Perks You'll Love"
        subtitle="Handpicked offers to stretch your budget and smooth every step of your journey"
        imageUrl={getPageHeroImage('packages')}
        breadcrumbs={[{ label: 'Perks & Offers' }]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {perks.map((perk, idx) => {
            const gradient = GRADIENTS[idx % GRADIENTS.length]
            return (
              <Link key={perk.id} href={`/perks/${perk.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                {/* Banner */}
                <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient}`}>
                  {perk.imageUrl ? (
                    <img src={perk.imageUrl} alt={perk.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <>
                      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-5xl font-black opacity-20">{perk.title[0]}</span>
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight group-hover:text-pink-600 transition-colors">{perk.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{perk.description}</p>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-pink-600">
                    Get it now <FiChevronRight size={15} />
                  </span>
                </div>
              </Link>
            )
          })}

          {perks.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <p className="text-lg font-semibold mb-2">No perks available yet</p>
              <p className="text-sm">Check back soon for exclusive travel offers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
