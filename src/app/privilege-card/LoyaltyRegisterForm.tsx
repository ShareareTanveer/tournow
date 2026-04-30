'use client'

import { useState } from 'react'

export default function LoyaltyRegisterForm({ ctaLabel = 'Register Now' }: { ctaLabel?: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/loyalty-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Registration failed')
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-800 text-xl mb-2">You&apos;re Registered!</h3>
        <p className="text-gray-500 text-sm mb-1">Welcome to the Metro Voyage Privilege Card program.</p>
        <p className="text-gray-400 text-xs">Our team will be in touch shortly with your card details.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Name <span className="text-pink-500">*</span>
        </label>
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your full name"
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Phone <span className="text-pink-500">*</span>
        </label>
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+94 70 xxx xxxx"
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email <span className="text-pink-500">*</span>
        </label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Registering...
          </>
        ) : (
          ctaLabel
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        By registering, you agree to our{' '}
        <a href="#terms" className="text-pink-500 hover:underline">Terms & Conditions</a>.
      </p>
    </form>
  )
}
