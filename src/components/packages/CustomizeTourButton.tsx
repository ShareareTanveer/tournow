'use client'

import { useState } from 'react'
import { FiEdit2, FiX, FiCalendar, FiUsers, FiDollarSign } from 'react-icons/fi'

interface Props {
  packageId: string
  packageTitle: string
}

export default function CustomizeTourButton({ packageId, packageTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    travelDate: '', paxCount: '2', requests: '', budget: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/tour-customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, packageId, paxCount: parseInt(form.paxCount), budget: form.budget ? parseFloat(form.budget) : null }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all border-2 hover:shadow-md"
        style={{ borderColor: 'var(--brand)', color: 'var(--brand-dark)', background: 'var(--brand-light)' }}
      >
        <FiEdit2 size={14} /> Customize This Tour
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Customize This Tour</h2>
                <p className="text-xs text-gray-400 mt-0.5">{packageTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <FiX size={14} />
              </button>
            </div>

            {status === 'success' ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--brand-muted)' }}>
                  <FiEdit2 size={28} style={{ color: 'var(--brand)' }} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Request Submitted!</h3>
                <p className="text-sm text-gray-500 mb-5">Our team will review your customization request and get back to you within 24 hours.</p>
                <button onClick={() => { setOpen(false); setStatus('idle') }}
                  className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your Name" required>
                    <input type="text" required value={form.customerName}
                      onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                      className="input-base" placeholder="John Doe" />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" required value={form.customerEmail}
                      onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                      className="input-base" placeholder="john@example.com" />
                  </Field>
                </div>

                <Field label="Phone">
                  <input type="tel" value={form.customerPhone}
                    onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                    className="input-base" placeholder="+94 70 xxx xxxx" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Travel Date">
                    <input type="date" value={form.travelDate}
                      onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))}
                      className="input-base" />
                  </Field>
                  <Field label="Passengers">
                    <input type="number" min="1" max="50" required value={form.paxCount}
                      onChange={e => setForm(f => ({ ...f, paxCount: e.target.value }))}
                      className="input-base" />
                  </Field>
                </div>

                <Field label="Budget (LKR, optional)">
                  <input type="number" value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="input-base" placeholder="e.g. 500000" />
                </Field>

                <Field label="Customization Requests" required>
                  <textarea required rows={3} value={form.requests}
                    onChange={e => setForm(f => ({ ...f, requests: e.target.value }))}
                    className="input-base resize-none"
                    placeholder="Describe what you'd like to change — dates, hotels, activities, special requirements…" />
                </Field>

                {status === 'error' && (
                  <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
                )}

                <button type="submit" disabled={status === 'loading'}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  {status === 'loading' ? 'Sending…' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`.input-base { width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; } .input-base:focus { border-color: var(--brand); }`}</style>
    </>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
