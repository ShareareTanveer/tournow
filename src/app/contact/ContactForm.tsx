'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="text-center py-10">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="font-bold text-gray-800 text-xl mb-2">Message Sent!</h3>
      <p className="text-gray-500">We&apos;ll get back to you as soon as possible.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" placeholder="your@email.com" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" placeholder="+94 70 xxx xxxx" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] resize-none"
          placeholder="How can we help you?" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-60">
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
