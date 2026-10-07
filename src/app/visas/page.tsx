import { Metadata } from 'next'
import Link from 'next/link'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import VisaFee from '@/components/visas/VisaFee'
import { FiCheckCircle, FiFileText, FiClock, FiDollarSign } from 'react-icons/fi'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.metrovoyage.com'

type VisaListItem = {
  slug: string
  country: string
  isVisaFree: boolean
  processingTime?: string | null
  fee?: string | null
}

export const metadata: Metadata = {
  title: 'Visa Services',
  description: 'Free visa consultation for Dubai, Malaysia, Schengen, Thailand and more. We handle your visa application end-to-end.',
  alternates: { canonical: `${BASE}/visas` },
  keywords: ['visa Sri Lanka', 'Dubai visa', 'Schengen visa', 'Malaysia visa', 'visa assistance'],
  openGraph: { title: 'Visa Services | Metro Voyage', description: 'Free visa consultation. We handle Dubai, Malaysia, Schengen, Thailand & more.', url: `${BASE}/visas`, siteName: 'Metro Voyage', type: 'website' },
}

async function getVisas(): Promise<VisaListItem[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/visas`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

const FALLBACK_VISAS: VisaListItem[] = [
  { slug: 'maldives', country: 'Maldives', isVisaFree: true, processingTime: 'On arrival', fee: 'Free' },
  { slug: 'thailand', country: 'Thailand', isVisaFree: true, processingTime: 'On arrival', fee: 'Free' },
  { slug: 'malaysia', country: 'Malaysia', isVisaFree: true, processingTime: 'On arrival', fee: 'Free' },
  { slug: 'dubai', country: 'Dubai (UAE)', isVisaFree: false, processingTime: '3-5 days', fee: 'USD 90-100' },
  { slug: 'schengen', country: 'Schengen (Europe)', isVisaFree: false, processingTime: '15-30 days', fee: 'EUR 80' },
  { slug: 'vietnam', country: 'Vietnam', isVisaFree: false, processingTime: '3-5 days', fee: 'USD 25' },
  { slug: 'cambodia', country: 'Cambodia', isVisaFree: false, processingTime: 'On arrival', fee: 'USD 30' },
  { slug: 'china', country: 'China', isVisaFree: false, processingTime: '4-7 days', fee: 'USD 60' },
]

export default async function VisasPage() {
  const visas = await getVisas()
  const displayVisas = visas.length > 0 ? visas : FALLBACK_VISAS

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <PageHero
        title="Visa Services"
        subtitle="Free visa consultation. We handle your application from start to finish."
        imageUrl={getPageHeroImage('visas')}
        breadcrumbs={[{ label: 'Visas' }]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-black text-[#101817] mb-6 flex items-center gap-2">
            <FiCheckCircle size={22} className="text-[#39ac44]" /> Visa-Free Destinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayVisas.filter((v) => v.isVisaFree).map((visa) => (
              <Link key={visa.slug} href={`/visas/${visa.slug}`} className="bg-white rounded-lg p-5 shadow-sm border border-[#e5e8e4] hover:shadow-md transition-shadow card-hover">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#101817]">{visa.country}</h3>
                  <span className="text-xs bg-[#eaf7fc] text-[#39ac44] px-2 py-1 rounded-full font-bold">Visa Free</span>
                </div>
                <div className="space-y-2 text-sm text-[#52615d]">
                  <p className="flex items-center gap-1.5"><FiClock size={12} /> {visa.processingTime}</p>
                  <p className="flex items-center gap-1.5"><FiDollarSign size={12} /> <VisaFee fee={visa.fee} /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#101817] mb-6 flex items-center gap-2">
            <FiFileText size={22} className="text-[#0395d5]" /> Visa Required - We Assist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayVisas.filter((v) => !v.isVisaFree).map((visa) => (
              <Link key={visa.slug} href={`/visas/${visa.slug}`} className="bg-white rounded-lg p-5 shadow-sm border border-[#e5e8e4] hover:shadow-md transition-shadow card-hover">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#101817]">{visa.country}</h3>
                  <span className="text-xs bg-[#f0eef7] text-[#0395d5] px-2 py-1 rounded-full font-bold">We Assist</span>
                </div>
                <div className="space-y-2 text-sm text-[#52615d]">
                  <p className="flex items-center gap-1.5"><FiClock size={12} /> {visa.processingTime}</p>
                  <p className="flex items-center gap-1.5"><FiDollarSign size={12} /> <VisaFee fee={visa.fee} /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-lg p-8 text-center bg-[#eaf7fc] border border-[#d5eef8]">
          <h3 className="text-2xl font-black text-[#101817] mb-2">Free Visa Consultation</h3>
          <p className="text-[#52615d] mb-6">Not sure about your visa requirements? Our experts will guide you through the entire process.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation" className="bg-[#0395d5] text-white font-black px-8 py-3 rounded-lg hover:bg-[#0878ab] transition-colors">Book Free Consultation</Link>
            <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer" className="bg-[#25d366] hover:bg-[#1fb85a] text-white font-black px-8 py-3 rounded-lg transition-colors">WhatsApp Us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
