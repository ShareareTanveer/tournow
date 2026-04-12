'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import MediaUploader from '@/components/admin/MediaUploader'
import InternalLinkPanel from '@/components/admin/InternalLinkPanel'
import AiFieldAssist from '@/components/admin/AiFieldAssist'
import JsonEditorPanel from '@/components/admin/JsonEditorPanel'

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

  const aiContext = useMemo(() => ({
    title:    form.title,
    category: form.category,
    author:   form.author,
    excerpt:  form.excerpt.slice(0, 200),
  }), [form.title, form.category, form.author, form.excerpt])

  return (
    <>
    <InternalLinkPanel
      title={form.title}
      content={form.body}
      currentSlug={form.slug}
      onAutoLink={(newBody) => setForm(f => ({ ...f, body: newBody }))}
    />
    <JsonEditorPanel
      formData={form as unknown as Record<string, unknown>}
      onApply={(patch) => setForm(f => ({ ...f, ...patch }))}
      entityLabel="Blog Post"
    />
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-800 mb-1">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
            <div className="flex gap-2">
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
              <AiFieldAssist fieldLabel="Title" fieldName="title" currentValue={form.title} formContext={aiContext} onApply={v => setForm(f => ({ ...f, title: v, slug: autoSlug(v) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category *</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              placeholder="Travel Tips, Destinations…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Author *</label>
            <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reading Time (min)</label>
            <input type="number" min={1} value={form.readingTime}
              onChange={(e) => setForm({ ...form, readingTime: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Excerpt / Summary</label>
              <AiFieldAssist fieldLabel="Excerpt" fieldName="excerpt" currentValue={form.excerpt} formContext={aiContext} onApply={v => setForm(f => ({ ...f, excerpt: v }))} />
            </div>
            <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
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
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Article Body *</h3>
          <AiFieldAssist fieldLabel="Article Body" fieldName="body" currentValue={form.body.replace(/<[^>]+>/g, ' ').slice(0, 200)} formContext={aiContext} onApply={v => setForm(f => ({ ...f, body: v }))} />
        </div>
        <RichTextEditor
          value={form.body}
          onChange={(html) => setForm({ ...form, body: html })}
          placeholder="Write the article content here…"
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
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl transition-colors hover:bg-gray-50">Cancel</button>
      </div>
    </form>
    </>
  )
}
