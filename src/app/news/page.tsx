import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Travel News',
  description: 'Latest travel news, destination updates, and industry insights from Halo Holidays.',
}

async function getNews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/news`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.news ?? []
  } catch { return [] }
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Travel News</h1>
        <p className="text-white/80">Stay updated with the latest travel insights and destination news</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {news.length > 0 ? (
          <div className="space-y-6">
            {news.map((article: any) => (
              <div key={article.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className="flex items-start gap-5">
                  {article.imageUrl && (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {article.source && <span className="text-xs bg-[var(--brand-light)] text-[var(--brand)] px-2 py-0.5 rounded-full font-medium">{article.source}</span>}
                      <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h2 className="font-bold text-gray-800 mb-2 hover:text-[var(--brand)] transition-colors">{article.title}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{article.excerpt ?? article.body?.slice(0, 150)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-gray-500">News articles will appear here once connected to the database.</p>
          </div>
        )}
      </div>
    </div>
  )
}
