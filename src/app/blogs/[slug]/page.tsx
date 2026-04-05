import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blogs/${slug}`, { next: { revalidate: 1800 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlog(slug)
  if (!blog) return { title: 'Blog Post' }
  return { title: blog.title, description: blog.excerpt }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const blog = await getBlog(slug)
  if (!blog) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {blog.imageUrl && (
        <div className="relative h-72 md:h-96">
          <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
          <Link href="/blogs" className="hover:text-[var(--brand)]">← Back to Blog</Link>
          <span>•</span>
          <span>{blog.readingTime} min read</span>
          <span>•</span>
          <span>{new Date(blog.publishedAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{blog.title}</h1>
        <p className="text-gray-500 text-sm mb-8">By {blog.author}</p>

        <div
          className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.body }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Ready to Travel?</h3>
          <div className="flex gap-4">
            <Link href="/consultation" className="brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 text-sm">Book Consultation</Link>
            <Link href="/packages-from-sri-lanka/family" className="border-2 border-[var(--brand)] text-[var(--brand)] font-semibold px-6 py-3 rounded-full hover:bg-[var(--brand)] hover:text-white transition-colors text-sm">Browse Packages</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
