'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import MediaUploader from '@/components/admin/MediaUploader'
import InternalLinkPanel from '@/components/admin/InternalLinkPanel'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

export default function BlogForm({ blog }: { blog?: any }) {
  const router = useRouter()
  const isEdit = !!blog
  const [form, setForm] = useState({
    title: blog?.title ?? '',
    slug: blog?.slug ?? '',
    body: blog?.body ?? '',
    excerpt: blog?.excerpt ?? '',
    category: blog?.category ?? '',
    author: blog?.author ?? '',
    readingTime: blog?.readingTime ?? 5,
    imageUrl: blog?.imageUrl ?? '',
    isActive: blog?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/blogs/${blog.slug}` : '/api/blogs'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    router.push('/admin/blogs')
    router.refresh()
  }

  const inp = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input type={type} value={form[key] as string} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
    </div>
  )

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
        <h3 className="font-bold text-gray-800 mb-1">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
            <input required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          {inp('slug', 'Slug *')}
          {inp('category', 'Category *', 'text', 'Travel Tips, Destinations…')}
          {inp('author', 'Author *')}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reading Time (min)</label>
            <input type="number" min={1} value={form.readingTime}
              onChange={(e) => setForm({ ...form, readingTime: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div className="sm:col-span-2">
            {inp('excerpt', 'Excerpt / Summary')}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <MediaUploader
          label="Cover Image"
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          folder="blogs"
        />
      </div>

      {/* Body */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-3">
        <h3 className="font-bold text-gray-800">Article Body *</h3>
        <RichTextEditor
          value={form.body}
          onChange={(html) => setForm({ ...form, body: html })}
          placeholder="Write the article content here…"
        />
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-orange-500" />
          <span className="text-sm text-gray-700 font-medium">Published (visible on website)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl transition-colors hover:bg-gray-50">Cancel</button>
      </div>
    </form>
    </>
  )
}
