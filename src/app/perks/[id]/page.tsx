import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageHero from '@/components/ui/PageHero'
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import PerkClaimButton from './PerkClaimButton'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const perk = await prisma.perk.findUnique({ where: { id } })
    if (!perk) return { title: 'Perk' }
    return { title: perk.title, description: perk.description }
  } catch { return { title: 'Perk' } }
}

export default async function PerkDetailPage({ params }: Props) {
  const { id } = await params
  let perk
  try {
    perk = await prisma.perk.findUnique({ where: { id } })
  } catch { notFound() }
  if (!perk) notFound()

  const relatedPerks = await prisma.perk.findMany({
    where: { isActive: true, id: { not: id } },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  }).catch(() => [])

  const GRADIENTS = [
    'from-pink-500 via-fuchsia-500 to-yellow-400',
    'from-purple-600 via-violet-500 to-pink-500',
    'from-teal-500 via-cyan-400 to-blue-500',
    'from-indigo-500 via-amber-400 to-yellow-300',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title={perk.title}
        subtitle={perk.description}
        imageUrl={perk.imageUrl ?? undefined}
        breadcrumbs={[{ label: 'Perks', href: '/perks' }, { label: perk.title }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/perks" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors">
              <FiArrowLeft size={14} /> Back to Perks
            </Link>

            {/* Hero image */}
            {perk.imageUrl && (
              <div className="rounded-2xl overflow-hidden h-72 shadow-sm">
                <img src={perk.imageUrl} alt={perk.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Description card */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Offer</h2>
              <p className="text-gray-600 leading-relaxed text-base">{perk.description}</p>

              <div className="mt-6 space-y-3">
                {[
                  'No hidden charges or booking fees',
                  'Valid for all Metro Voyage packages',
                  'Combine with other eligible offers',
                  'Expert support throughout your journey',
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <FiCheckCircle size={16} className="text-green-500 shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-1">Ready to claim this perk?</h2>
              <p className="text-sm text-gray-500 mb-5">Log in or create an account to claim this offer and apply it to your next booking.</p>
              <PerkClaimButton perkId={perk.id} perkTitle={perk.title} ctaLink={perk.ctaLink ?? undefined} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* WhatsApp CTA */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-1">Need Help?</h3>
              <p className="text-xs text-gray-500 mb-4">Chat with our travel experts to learn more about this offer.</p>
              <a href="https://wa.me/94704545455?text=Hi! I'm interested in the perk: {encodeURIComponent(perk.title)}"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                <FaWhatsapp size={16} /> WhatsApp Us
              </a>
              <a href="tel:+94704545455"
                className="flex items-center justify-center gap-2 mt-2 text-sm font-semibold py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
                +94 70 454 5455
              </a>
            </div>

            {/* More perks */}
            {relatedPerks.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">More Perks</h3>
                <div className="space-y-3">
                  {relatedPerks.map((rp, idx) => (
                    <Link key={rp.id} href={`/perks/${rp.id}`}
                      className="flex gap-3 group items-center">
                      <div className={`w-12 h-10 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center`}>
                        {rp.imageUrl
                          ? <img src={rp.imageUrl} alt={rp.title} className="w-full h-full object-cover" />
                          : <span className="text-white font-bold text-sm">{rp.title[0]}</span>
                        }
                      </div>
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-pink-500 transition-colors line-clamp-2 leading-snug">{rp.title}</p>
                    </Link>
                  ))}
                </div>
                <Link href="/perks" className="inline-flex items-center gap-1.5 text-xs font-bold mt-4 text-pink-600 hover:underline">
                  All perks <FiArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
