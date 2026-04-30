export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { getBlogs } from '@/lib/data'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.metrovoyage.com'
export const metadata: Metadata = {
  title: 'Travel Blog',
  description: 'Travel stories, tips and inspiration from the Metro Voyage team.',
  alternates: { canonical: `${BASE}/blogs` },
  openGraph: { title: 'Travel Blog | Metro Voyage', description: 'Travel stories, tips and inspiration from the Metro Voyage team.', url: `${BASE}/blogs`, siteName: 'Metro Voyage', type: 'website' },
}

const CATEGORY_COLORS: Record<string, string> = {
  Adventure: 'bg-indigo-100 text-indigo-700',
  Honeymoon: 'bg-pink-100 text-pink-700',
  Family: 'bg-blue-100 text-blue-700',
  Solo: 'bg-purple-100 text-purple-700',
  Budget: 'bg-green-100 text-green-700',
}

export default async function BlogsPage() {
  const blogs = await getBlogs()

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Travel Blog"
        subtitle="Stories, tips and inspiration from our travellers and team"
        imageUrl={getPageHeroImage('blogs')}
        breadcrumbs={[{ label: 'Blog' }]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {blogs.map((blog: any) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {blog.imageUrl ? (
                    <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full brand-gradient flex items-center justify-center text-4xl">✈️</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[blog.category] ?? 'bg-gray-100 text-gray-600'}`}>{blog.category}</span>
                    <span className="text-xs text-gray-400">{blog.readingTime} min read</span>
                  </div>
                  <h2 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[var(--brand)] transition-colors">{blog.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">{blog.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{blog.author}</span>
                    <span>{new Date(blog.publishedAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✍️</div>
            <p className="text-gray-500">Blog posts will appear here once connected to the database.</p>
          </div>
        )}
      </div>
    </div>
  )
}
