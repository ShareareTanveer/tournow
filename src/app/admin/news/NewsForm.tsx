'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import MediaUploader from '@/components/admin/MediaUploader'
import InternalLinkPanel from '@/components/admin/InternalLinkPanel'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

export default function NewsForm({ news }: { news?: any }) {
  const router = useRouter()
  const isEdit = !!news
  const [form, setForm] = useState({
    title: news?.title ?? '',
    slug: news?.slug ?? '',
    body: news?.body ?? '',
    excerpt: news?.excerpt ?? '',
    source: news?.source ?? '',
    imageUrl: news?.imageUrl ?? '',
    isActive: news?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/news/${news.slug}` : '/api/news'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    router.push('/admin/news')
    router.refresh()
  }

  return (
    <>
    <InternalLinkPanel
      title={form.title}
      content={form.body}
      currentSlug={form.slug}
      onAutoLink={(newBody) => setForm(f => ({ ...f, body: newBody }))}
    />
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-800 mb-1">Article Details</h3>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
          <input required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug *</label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Source</label>
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="News First, Daily Mirror…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Excerpt / Summary</label>
          <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <MediaUploader
          label="Featured Image"
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          folder="news"
        />
      </div>

      {/* Body */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-3">
        <h3 className="font-bold text-gray-800">Article Body *</h3>
        <RichTextEditor
          value={form.body}
          onChange={(html) => setForm({ ...form, body: html })}
          placeholder="Write the news article here…"
        />
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
          <span className="text-sm text-gray-700 font-medium">Published (visible on website)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Article'}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl transition-colors hover:bg-gray-50">Cancel</button>
      </div>
    </form>
    </>
  )
}
