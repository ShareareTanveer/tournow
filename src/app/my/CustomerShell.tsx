'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/lib/customerAuth'
import {
  FiGrid, FiTag, FiCalendar, FiUser, FiLogOut,
  FiChevronRight, FiMenu, FiMapPin, FiAward,
} from 'react-icons/fi'

const NAV = [
  { href: '/my',                  label: 'Overview',        icon: FiGrid },
  { href: '/my/perks',            label: 'My Perks',        icon: FiTag },
  { href: '/my/privilege-card',   label: 'Privilege Card',  icon: FiAward },
  { href: '/my/bookings',         label: 'My Bookings',     icon: FiCalendar },
  { href: '/my/profile',          label: 'Profile',         icon: FiUser },
]

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { customer, loading, logout } = useCustomerAuth()

  useEffect(() => {
    if (!loading && !customer) {
      router.replace('/login?redirect=/my')
    }
  }, [loading, customer, router])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (!customer) return null

  const initials = customer.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-gray-100 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              <FiMapPin size={14} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm">Metro Voyage</span>
          </Link>

          {/* User card */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">{customer.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{customer.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/my' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={active ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' } : {}}>
                <Icon size={16} />
                {label}
                {active && <FiChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link href="/packages-from-sri-lanka/family"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            <FiMapPin size={16} /> Browse Packages
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all text-left">
            <FiLogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <FiMenu size={18} />
          </button>
          <span className="font-bold text-gray-800 text-sm">My Account</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            {initials}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
