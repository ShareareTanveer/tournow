'use client'

import { useState } from 'react'

export default function ReviewSubmitForm() {
  const [form, setForm] = useState({ name: '', location: '', rating: 5, body: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/reviews', {
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
    <div className="text-center py-8">
      <div className="text-5xl mb-3">🙏</div>
      <h3 className="font-bold text-gray-800 mb-2">Thank you for your review!</h3>
      <p className="text-gray-500 text-sm">Your review will appear after approval.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" placeholder="Colombo, Sri Lanka" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Rating *</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}
              className={`text-2xl transition-transform hover:scale-110 ${n <= form.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Your Review *</label>
        <textarea required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Tell us about your experience..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full brand-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
