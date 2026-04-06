import { Metadata } from 'next'
import Link from 'next/link'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { FiCheckCircle, FiFileText, FiClock, FiDollarSign } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Visa Services',
  description: 'Free visa consultation for Dubai, Malaysia, Schengen, Thailand and more. We handle your visa application end-to-end.',
}

async function getVisas() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/visas`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

const FALLBACK_VISAS = [
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
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Visa Services"
        subtitle="Free visa consultation. We handle your application from start to finish."
        imageUrl={getPageHeroImage('visas')}
        breadcrumbs={[{ label: 'Visas' }]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Visa-free */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiCheckCircle size={20} className="text-green-500" /> Visa-Free Destinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayVisas.filter((v: any) => v.isVisaFree).map((visa: any) => (
              <Link key={visa.slug} href={`/visas/${visa.slug}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow card-hover">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{visa.country}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Visa Free</span>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-1.5"><FiClock size={12} /> {visa.processingTime}</p>
                  <p className="flex items-center gap-1.5"><FiDollarSign size={12} /> {visa.fee}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Visa required */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiFileText size={20} className="text-orange-500" /> Visa Required — We Assist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayVisas.filter((v: any) => !v.isVisaFree).map((visa: any) => (
              <Link key={visa.slug} href={`/visas/${visa.slug}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow card-hover">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{visa.country}</h3>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">We Assist</span>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-1.5"><FiClock size={12} /> {visa.processingTime}</p>
                  <p className="flex items-center gap-1.5"><FiDollarSign size={12} /> {visa.fee}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: 'var(--brand-muted)', border: '1px solid color-mix(in srgb, var(--brand) 20%, transparent)' }}>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Free Visa Consultation</h3>
          <p className="text-gray-600 mb-6">Not sure about your visa requirements? Our experts will guide you through the entire process.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation" className="brand-gradient text-white font-semibold px-8 py-3 rounded-full hover:opacity-90">Book Free Consultation</Link>
            <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">WhatsApp Us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
