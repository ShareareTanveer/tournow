import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InquiryForm from '@/components/forms/InquiryForm'

type Props = { params: Promise<{ slug: string }> }

async function getVisa(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/visas/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const visa = await getVisa(slug)
  if (!visa) return { title: 'Visa Info' }
  return { title: `${visa.country} Visa`, description: visa.description?.slice(0, 160) }
}

export default async function VisaDetailPage({ params }: Props) {
  const { slug } = await params
  const visa = await getVisa(slug)
  if (!visa) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-14 px-4 text-center text-white">
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${visa.isVisaFree ? 'bg-green-500' : 'bg-orange-500'}`}>
          {visa.isVisaFree ? '✅ Visa Free' : '📋 Visa Required'}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold">{visa.country} Visa Guide</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Overview</h2>
              <p className="text-gray-600 leading-relaxed">{visa.description}</p>
            </div>

            {visa.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {visa.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[var(--brand)] font-bold mt-0.5">•</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {visa.documents?.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-4">📄 Documents Needed</h2>
                <ul className="space-y-2">
                  {visa.documents.map((doc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                      <span className="font-bold mt-0.5">•</span> {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {visa.notes && (
              <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
                <p className="text-sm text-yellow-800"><strong>Note:</strong> {visa.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Visa Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Processing Time</span><span className="font-medium">{visa.processingTime ?? 'Contact us'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Visa Fee</span><span className="font-medium">{visa.fee ?? 'Contact us'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{visa.isVisaFree ? 'Visa Free' : 'Visa Required'}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Get Visa Assistance</h3>
              <InquiryForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
