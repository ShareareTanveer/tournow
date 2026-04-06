import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Travel News',
  description: 'Latest travel news, destination updates, and industry insights from Metro Voyage.',
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
      <PageHero
        title="Travel News"
        subtitle="Stay updated with the latest travel insights and destination news"
        imageUrl={getPageHeroImage('news')}
        breadcrumbs={[{ label: 'News' }]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {news.length > 0 ? (
          <div className="space-y-6">
            {news.map((article: any) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all flex items-start gap-5">
                {article.imageUrl && (
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image src={article.imageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {article.source && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--brand-muted)', color: 'var(--brand-dark)' }}>{article.source}</span>}
                    <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h2 className="font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{article.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{article.excerpt ?? article.body?.replace(/<[^>]*>/g, '').slice(0, 150)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 2v6h6M8 12h8M8 16h5"/></svg>
            </div>
            <p className="text-gray-500">News articles will appear here once connected to the database.</p>
          </div>
        )}
      </div>
    </div>
  )
}
