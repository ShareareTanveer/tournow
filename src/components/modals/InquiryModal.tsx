'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useCustomerAuth } from '@/lib/customerAuth'
import AuthModal from '@/components/auth/AuthModal'

interface InquiryModalProps {
  open: boolean
  onClose: () => void
  packageId?: string
  packageTitle?: string
}

export default function InquiryModal({ open, onClose, packageId, packageTitle }: InquiryModalProps) {
  const { customer, loading: authLoading } = useCustomerAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '', travelDate: '', paxCount: 1,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (open && !success) {
      setError('')
    }
  }, [open, success])

  if (!open) return null

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

  const handleClose = () => {
    setSuccess(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto mt-5">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Send Inquiry</h2>
              {packageTitle && (
                <p className="text-xs text-gray-500 mt-0.5">{packageTitle}</p>
              )}
            </div>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100">
              <FiX size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-green-800 text-lg mb-2">Inquiry Received!</h3>
                <p className="text-green-700 text-sm mb-6">
                  Our travel expert will contact you within a few hours. You can also reach us on WhatsApp for faster response.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2.5 rounded-xl text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ✅ COMPACT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      disabled={!!customer}
                      className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors ${customer ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      disabled={!!customer}
                      className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors ${customer ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+94 70 xxx xxxx"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  {/* Travel Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Travel Date</label>
                    <input
                      type="date"
                      value={form.travelDate}
                      onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  {/* Pax Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Number of Travellers</label>
                    <select
                      value={form.paxCount}
                      onChange={(e) => setForm({ ...form, paxCount: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                      ))}
                      <option value={11}>10+ people (group)</option>
                    </select>
                  </div>

                  {/* Message FULL WIDTH */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your dream holiday..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors resize-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}
                >
                  {loading ? 'Sending...' : 'Send Inquiry'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Or call: <a href="tel:+94704545455" className="font-semibold text-indigo-500">+94 70 454 5455</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {authOpen && (
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => setAuthOpen(false)}
          initialTab="login"
        />
      )}
    </>
  )
}