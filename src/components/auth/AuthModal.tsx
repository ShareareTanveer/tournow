'use client'

import { useState } from 'react'
import { FiX, FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'
import { useCustomerAuth } from '@/lib/customerAuth'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTab?: 'login' | 'register'
}

export default function AuthModal({ open, onClose, onSuccess, initialTab = 'login' }: Props) {
  const { refresh } = useCustomerAuth()
  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' })

  if (!open) return null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
        credentials: 'include', // Ensure cookies are included
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      // Small delay to ensure cookie is set before calling refresh
      await new Promise(r => setTimeout(r, 100))
      await refresh()
      onSuccess?.()
      onClose()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
        credentials: 'include', // Ensure cookies are included
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      // Small delay to ensure cookie is set before calling refresh
      await new Promise(r => setTimeout(r, 100))
      await refresh()
      onSuccess?.()
      onClose()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {tab === 'login' ? 'Sign in to your account' : 'Create an account'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tab === 'login' ? 'Required to make a booking' : 'Takes less than a minute'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['login', 'register'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field icon={<FiMail size={15} />} label="Email Address">
                <input type="email" required placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 pl-9" />
              </Field>
              <Field icon={<FiLock size={15} />} label="Password">
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required placeholder="••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 pl-9 pr-10" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </Field>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-gray-400">
                No account?{' '}
                <button type="button" onClick={() => setTab('register')}
                  className="text-orange-500 font-semibold hover:underline">Register here</button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field icon={<FiUser size={15} />} label="Full Name">
                <input type="text" required placeholder="Your full name" minLength={2}
                  value={regForm.name}
                  onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 pl-9" />
              </Field>
              <Field icon={<FiMail size={15} />} label="Email Address">
                <input type="email" required placeholder="your@email.com"
                  value={regForm.email}
                  onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 pl-9" />
              </Field>
              <Field icon={<FiPhone size={15} />} label="Phone (optional)">
                <input type="tel" placeholder="+94 70 xxx xxxx"
                  value={regForm.phone}
                  onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 pl-9" />
              </Field>
              <Field icon={<FiLock size={15} />} label="Password">
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required placeholder="Min 6 characters" minLength={6}
                    value={regForm.password}
                    onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 pl-9 pr-10" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </Field>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')}
                  className="text-orange-500 font-semibold hover:underline">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        {children}
      </div>
    </div>
  )
}
