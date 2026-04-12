import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCalendar, FiExternalLink } from 'react-icons/fi'
import PageHero from '@/components/ui/PageHero'

type Props = { params: Promise<{ slug: string }> }

async function getArticle(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/news/${slug}`, {
      next: { revalidate: 1800 },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getRelatedNews(currentSlug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/news?limit=4`, {
      next: { revalidate: 1800 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.news ?? []).filter((n: any) => n.slug !== currentSlug).slice(0, 3)
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'News' }
  return {
    title: article.title,
    description: article.excerpt ?? article.body?.replace(/<[^>]*>/g, '').slice(0, 160),
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const [article, related] = await Promise.all([getArticle(slug), getRelatedNews(slug)])
  if (!article) notFound()

  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title={article.title}
        subtitle={article.excerpt}
        imageUrl={article.imageUrl}
        breadcrumbs={[{ label: 'News', href: '/news' }, { label: article.title }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 transition-colors mb-6">
              <FiArrowLeft size={14} /> Back to News
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Meta bar */}
              <div className="px-7 py-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
                {article.source && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--brand-muted)', color: 'var(--brand-dark)' }}>
                    {article.source}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <FiCalendar size={12} /> {publishedDate}
                </span>
              </div>

              {/* Body */}
              <div className="px-7 py-8">
                {article.body?.startsWith('<') ? (
                  <div
                    className="prose prose-gray prose-sm sm:prose max-w-none leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.body }}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{article.body}</p>
                )}
              </div>

              {/* Footer CTA */}
              <div className="px-7 py-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">Ready to plan your next trip?</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/consultation"
                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                    Book Free Consultation
                  </Link>
                  <Link href="/packages-from-sri-lanka/family"
                    className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-2 transition hover:bg-indigo-50"
                    style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                    Browse Packages
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Related news */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">More News</h3>
                <div className="space-y-4">
                  {related.map((item: any) => (
                    <Link key={item.slug} href={`/news/${item.slug}`}
                      className="flex gap-3 group">
                      {item.imageUrl && (
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 line-clamp-2 group-hover:text-indigo-500 transition-colors leading-snug">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.publishedAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/news" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4 hover:underline" style={{ color: 'var(--brand)' }}>
                  All news <FiExternalLink size={11} />
                </Link>
              </div>
            )}

            {/* Quick CTA card */}
            <div className="rounded-2xl p-5 text-white overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
              <p className="relative font-bold text-base mb-1">Plan Your Holiday</p>
              <p className="relative text-white/80 text-xs mb-4">Get expert advice from our travel specialists — free of charge.</p>
              <Link href="/consultation"
                className="relative inline-flex items-center gap-1.5 text-xs font-bold bg-white px-4 py-2 rounded-xl transition hover:bg-indigo-50"
                style={{ color: 'var(--brand-dark)' }}>
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
