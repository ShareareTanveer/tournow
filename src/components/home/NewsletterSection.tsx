'use client'

import { useState } from 'react'

export default function NewsletterSection() {
  const [form, setForm] = useState({ email: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="text-4xl mb-4">✈️</div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Get <span style={{ color: 'var(--brand)' }}>Exclusive Deals</span> First
        </h2>
        <p className="text-gray-400 mb-8">Subscribe to receive early access to flash sales, travel tips, and holiday inspiration.</p>

        {success ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-green-300">
            🎉 You&apos;re subscribed! Watch out for amazing deals coming your way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your email address"
                className="flex-1 px-5 py-4 rounded-2xl text-gray-800 text-sm focus:outline-none"
              />
              <input
                type="tel" value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="WhatsApp number (optional)"
                className="flex-1 px-5 py-4 rounded-2xl text-gray-800 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="brand-gradient text-white font-semibold px-10 py-4 rounded-2xl hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              {loading ? 'Subscribing...' : 'Subscribe for Free'}
            </button>
            <p className="text-xs text-gray-500">No spam, unsubscribe anytime.</p>
          </form>
        )}
      </div>
    </section>
  )
}
