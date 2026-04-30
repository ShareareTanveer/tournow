'use client'

import { useState } from 'react'

export default function DonationForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', pickupRequired: false, address: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/charity', {
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
      <div className="text-5xl mb-4">💜</div>
      <h3 className="font-bold text-gray-800 text-xl mb-2">Thank You!</h3>
      <p className="text-gray-500 text-sm">Your donation has been registered. Our team will be in touch soon.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400" placeholder="Your name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
          <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400" placeholder="+94 70 xxx xxxx" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400" placeholder="email@example.com" />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 cursor-pointer" onClick={() => setForm({ ...form, pickupRequired: !form.pickupRequired })}>
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.pickupRequired ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
          {form.pickupRequired && <span className="text-white text-xs font-bold">✓</span>}
        </div>
        <span className="text-sm text-gray-700">I need a home pickup (available in Colombo area)</span>
      </div>

      {form.pickupRequired && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Address *</label>
          <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            required={form.pickupRequired}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none"
            placeholder="Your full address..." />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none"
          placeholder="Type of clothing, quantity, preferred time for pickup..." />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-60">
        {loading ? 'Registering...' : 'Register Donation'}
      </button>
    </form>
  )
}
