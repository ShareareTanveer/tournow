import { Metadata } from 'next'
import ReviewSubmitForm from './ReviewSubmitForm'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Read what thousands of happy travellers say about Halo Holidays.',
}

async function getReviews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reviews?limit=50`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.reviews ?? []
  } catch { return [] }
}

const FALLBACK_REVIEWS = [
  { name: 'Sanduni Nimeshika Gunawardana', location: 'Colombo', rating: 5, body: 'Our Dubai trip was absolutely incredible! The Marina Dhow Cruise, Burj Khalifa visit, and the Desert Safari were all perfectly organized. Halo Holidays took care of every detail.' },
  { name: 'Sajjaad Ahamed', location: 'Kandy', rating: 5, body: 'The customer service was exceptional. Naveed helped us with our visa and made the whole process stress-free. The Singapore tour was well-organized.' },
  { name: 'Shashika Radalage', location: 'Galle', rating: 5, body: 'I was amazed by how well the Singapore tour was organized. Every transfer was on time, the guides were knowledgeable and friendly.' },
]

export default async function ReviewsPage() {
  const reviews = await getReviews()
  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">What Our Travellers Say</h1>
        <p className="text-white/80">Thousands of happy travellers trust Halo Holidays</p>
        <div className="flex justify-center gap-1 mt-4">
          {[1,2,3,4,5].map((i) => <span key={i} className="text-yellow-400 text-2xl">★</span>)}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {displayReviews.map((review: any, i: number) => (
            <div key={review.id ?? i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: review.rating }).map((_: unknown, j: number) => <span key={j} className="text-yellow-400 text-lg">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{review.body}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                  {review.location && <p className="text-xs text-gray-400">📍 {review.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit review */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Share Your Experience</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Travelled with us? We&apos;d love to hear about it!</p>
            <ReviewSubmitForm />
          </div>
        </div>
      </div>
    </div>
  )
}
