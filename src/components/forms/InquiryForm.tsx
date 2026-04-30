'use client'

import { useState, useEffect } from 'react'
import { useCustomerAuth } from '@/lib/customerAuth'

interface InquiryFormProps {
  packageId?: string
  packageTitle?: string
}

export default function InquiryForm({ packageId, packageTitle }: InquiryFormProps) {
  const { customer } = useCustomerAuth()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '', travelDate: '', paxCount: 1,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form with logged-in customer's data
  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      }))
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, packageId }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', message: '', travelDate: '', paxCount: 1 })
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-bold text-green-800 text-lg mb-2">Inquiry Received!</h3>
        <p className="text-green-700 text-sm">Our travel expert will contact you within a few hours. You can also reach us on WhatsApp for faster response.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-green-600 underline">Submit another inquiry</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {packageTitle && (
        <div className="bg-[var(--brand-light)] rounded-xl p-3 text-sm text-gray-700">
          <span className="font-medium">Inquiring about:</span> {packageTitle}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            disabled={!!customer}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors ${customer ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            disabled={!!customer}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors ${customer ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+94 70 xxx xxxx"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Travel Date</label>
          <input
            type="date" value={form.travelDate}
            onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Number of Travellers</label>
        <select
          value={form.paxCount}
          onChange={(e) => setForm({ ...form, paxCount: parseInt(e.target.value) })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
        >
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
          ))}
          <option value={11}>10+ people (group)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
        <textarea
          required rows={4} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your dream holiday, any special requirements..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full brand-gradient text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Send Inquiry'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Or call us directly: <a href="tel:+94704545455" className="font-medium text-[var(--brand)]">+94 70 454 5455</a>
      </p>
    </form>
  )
}
