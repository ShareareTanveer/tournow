'use client'

import { useState } from 'react'

export default function ConsultationForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', method: 'VIDEO_CALL', additionalInfo: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="text-center py-10">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="font-bold text-gray-800 text-xl mb-2">Request Received!</h3>
      <p className="text-gray-500">We&apos;ll get back to you shortly to schedule your consultation.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your full name"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+94 70 xxx xxxx"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)]" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Preferred Method *</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ value: 'VIDEO_CALL', label: '🎥 Video Call' }, { value: 'PHONE_CALL', label: '📞 Phone Call' }].map((m) => (
            <button key={m.value} type="button" onClick={() => setForm({ ...form, method: m.value })}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.method === m.value ? 'border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]' : 'border-gray-200 text-gray-600 hover:border-[var(--brand)]'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Additional Information</label>
        <textarea rows={3} value={form.additionalInfo} onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
          placeholder="Tell us your destination, budget, travel dates..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] resize-none" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-60">
        {loading ? 'Submitting...' : 'Book Consultation'}
      </button>
    </form>
  )
}
