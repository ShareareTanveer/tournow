'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  FiGrid, FiPackage, FiMapPin, FiInbox, FiVideo, FiBookOpen,
  FiStar, FiFileText, FiEdit3, FiShield, FiUsers, FiMail,
  FiHeart, FiCreditCard, FiZap, FiEdit2, FiImage, FiSettings,
  FiGlobe, FiLogOut, FiTag, FiChevronDown, FiMenu, FiX,
} from 'react-icons/fi'

type NavItem  = { label: string; href: string; icon: React.ReactNode; badge?: number; exact?: boolean }
type NavGroup = { label: string; icon: React.ReactNode; items: NavItem[] }

const GROUPS: NavGroup[] = [
  {
    label: 'Content',
    icon: <FiPackage size={14} />,
    items: [
      { label: 'Packages',      href: '/admin/packages',     icon: <FiPackage size={14} /> },
      { label: 'Tours',         href: '/admin/tours',        icon: <FiGlobe size={14} /> },
      { label: 'Categories',    href: '/admin/categories',   icon: <FiTag size={14} /> },
      { label: 'Destinations',  href: '/admin/destinations', icon: <FiMapPin size={14} /> },
      { label: 'Blog',          href: '/admin/blogs',        icon: <FiEdit3 size={14} /> },
      { label: 'News',          href: '/admin/news',         icon: <FiFileText size={14} /> },
      { label: 'Visa Services', href: '/admin/visas',        icon: <FiShield size={14} /> },
    ],
  },
  {
    label: 'Operations',
    icon: <FiInbox size={14} />,
    items: [
      { label: 'Inquiries',     href: '/admin/inquiries',      icon: <FiInbox size={14} /> },
      { label: 'Consultations', href: '/admin/consultations',  icon: <FiVideo size={14} /> },
      { label: 'Bookings',      href: '/admin/bookings',       icon: <FiBookOpen size={14} /> },
      { label: 'Tour Requests', href: '/admin/customizations', icon: <FiEdit2 size={14} /> },
      { label: 'Reviews',       href: '/admin/reviews',        icon: <FiStar size={14} /> },
    ],
  },
  {
    label: 'Customers',
    icon: <FiUsers size={14} />,
    items: [
      { label: 'Loyalty Cards', href: '/admin/loyalty',    icon: <FiCreditCard size={14} /> },
      { label: 'Perks',         href: '/admin/perks',      icon: <FiZap size={14} /> },
      { label: 'Newsletter',    href: '/admin/newsletter', icon: <FiMail size={14} /> },
      { label: 'Charity',       href: '/admin/charity',    icon: <FiHeart size={14} /> },
    ],
  },
  {
    label: 'System',
    icon: <FiSettings size={14} />,
    items: [
      { label: 'Staff',              href: '/admin/staff',        icon: <FiUsers size={14} /> },
      { label: 'Media Library',      href: '/admin/media',        icon: <FiImage size={14} /> },
      { label: 'AI Provider Config', href: '/admin/settings/ai',  icon: <FiZap size={14} /> },
      { label: 'Settings',           href: '/admin/settings',     icon: <FiSettings size={14} />, exact: true },
    ],
  },
]

function NavGroup({ group, pathname, onNavigate }: { group: NavGroup; pathname: string; onNavigate?: () => void }) {
  const isActive = (item: NavItem) => item.exact ? pathname === item.href : pathname.startsWith(item.href)
  const isAnyActive = group.items.some(isActive)
  const [open, setOpen] = useState(isAnyActive)

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors ${
          isAnyActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <span className="opacity-70">{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        <FiChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-0.5 ml-1 space-y-0.5">
          {group.items.map(item => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}>{item.icon}</span>
                <span className="flex-1 text-[13px]">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="bg-indigo-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4.5 text-center leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [bookingBadge, setBookingBadge] = useState(0)
  const [mobileOpen, setMobileOpen]    = useState(false)

  useEffect(() => {
    async function fetchBadge() {
      try {
        const res = await fetch('/api/admin/bookings/badge')
        if (res.ok) { const d = await res.json(); setBookingBadge(d.count ?? 0) }
      } catch {}
    }
    fetchBadge()
    const id = setInterval(fetchBadge, 60_000)
    return () => clearInterval(id)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const groups = GROUPS.map(g => ({
    ...g,
    items: g.items.map(item =>
      item.href === '/admin/bookings' ? { ...item, badge: bookingBadge } : item
    ),
  }))

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5 shrink-0">
       <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="Metro Voyage Logo"
              className="w-20 h-12 rounded-xl"
            />
          </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all mb-3 ${
            pathname === '/admin/dashboard'
              ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 font-semibold'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FiGrid size={14} className={pathname === '/admin/dashboard' ? 'text-white' : 'text-gray-500'} />
          Dashboard
        </Link>

        <div className="space-y-0.5">
          {groups.map(group => (
            <NavGroup key={group.label} group={group} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5 shrink-0">
        <Link href="/" target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <FiGlobe size={14} className="text-gray-500" /> View Website
        </Link>
        <button onClick={handleLogout} disabled={loggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left">
          <FiLogOut size={14} className="text-gray-500" />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 min-h-screen bg-[#19142f] flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center bg-[#0f1623] text-white rounded-xl shadow-lg"
      >
        <FiMenu size={18} />
      </button>

      {/* ── Mobile: overlay + drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-[#0f1623] h-full flex flex-col shadow-2xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white">
              <FiX size={16} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
