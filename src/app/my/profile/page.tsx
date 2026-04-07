'use client'

import { useEffect, useState } from 'react'
import { FiUser, FiMail, FiLock, FiSave, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

interface UserData { id: string; name: string; email: string; role: string }

export default function MyProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [name, setName] = useState('')

  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user)
          setName(data.user.name)
        }
      })
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setUser(data.user)
      setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setProfileMsg({ type: 'err', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'err', text: 'New passwords do not match.' })
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwMsg({ type: 'ok', text: 'Password changed successfully.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setPwMsg({ type: 'err', text: msg })
    } finally {
      setPwSaving(false)
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details and password.</p>
      </div>

      {/* Avatar row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
          {initials}
        </div>
        <div>
          <p className="font-bold text-gray-800">{user?.name ?? '…'}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="mt-1 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
            {user?.role ?? 'CUSTOMER'}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfileSave}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <FiUser size={15} /> Personal Info
        </h2>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ '--tw-ring-color': 'var(--brand)' } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
          <div className="flex items-center gap-2 w-full border border-gray-100 rounded-xl px-3 py-2.5 bg-gray-50 text-sm text-gray-400">
            <FiMail size={14} /> {user?.email}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        {profileMsg && (
          <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 ${
            profileMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {profileMsg.type === 'ok' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            {profileMsg.text}
          </div>
        )}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
          <FiSave size={14} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePasswordSave}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <FiLock size={15} /> Change Password
        </h2>

        {[
          { label: 'Current Password', value: currentPw, set: setCurrentPw },
          { label: 'New Password',     value: newPw,     set: setNewPw },
          { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            <input
              type="password"
              value={value}
              onChange={e => set(e.target.value)}
              required
              minLength={label === 'Current Password' ? 1 : 6}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': 'var(--brand)' } as React.CSSProperties}
            />
          </div>
        ))}

        {pwMsg && (
          <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 ${
            pwMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {pwMsg.type === 'ok' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            {pwMsg.text}
          </div>
        )}

        <button type="submit" disabled={pwSaving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
          <FiLock size={14} /> {pwSaving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
