'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  FiGrid, FiPackage, FiMapPin, FiInbox, FiVideo, FiBookOpen,
  FiStar, FiFileText, FiEdit3, FiShield, FiUsers, FiMail,
  FiHeart, FiCreditCard, FiZap, FiEdit2, FiImage, FiSettings,
  FiGlobe, FiLogOut, FiTag, FiChevronDown,
} from 'react-icons/fi'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

type NavGroup = {
  label: string
  icon: React.ReactNode
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    label: 'Content',
    icon: <FiPackage size={15} />,
    items: [
      { label: 'Packages',     href: '/admin/packages',     icon: <FiPackage size={14} /> },
      { label: 'Tours',        href: '/admin/tours',        icon: <FiGlobe size={14} /> },
      { label: 'Categories',   href: '/admin/categories',   icon: <FiTag size={14} /> },
      { label: 'Destinations', href: '/admin/destinations', icon: <FiMapPin size={14} /> },
      { label: 'Blog',         href: '/admin/blogs',        icon: <FiEdit3 size={14} /> },
      { label: 'News',         href: '/admin/news',         icon: <FiFileText size={14} /> },
      { label: 'Visa Services',href: '/admin/visas',        icon: <FiShield size={14} /> },
    ],
  },
  {
    label: 'Operations',
    icon: <FiInbox size={15} />,
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
    icon: <FiUsers size={15} />,
    items: [
      { label: 'Loyalty Cards', href: '/admin/loyalty',    icon: <FiCreditCard size={14} /> },
      { label: 'Perks',         href: '/admin/perks',      icon: <FiZap size={14} /> },
      { label: 'Newsletter',    href: '/admin/newsletter', icon: <FiMail size={14} /> },
      { label: 'Charity',       href: '/admin/charity',    icon: <FiHeart size={14} /> },
    ],
  },
  {
    label: 'System',
    icon: <FiSettings size={15} />,
    items: [
      { label: 'Staff',         href: '/admin/staff',    icon: <FiUsers size={14} /> },
      { label: 'Media Library', href: '/admin/media',    icon: <FiImage size={14} /> },
      { label: 'Settings',      href: '/admin/settings', icon: <FiSettings size={14} /> },
    ],
  },
]

function NavGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isAnyActive = group.items.some(item => pathname.startsWith(item.href))
  const [open, setOpen] = useState(isAnyActive)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
          isAnyActive
            ? 'text-orange-400'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <span>{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        <FiChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-0.5 ml-2 space-y-0.5">
          {group.items.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            M
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Metro Voyage</p>
            <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard — always visible, not grouped */}
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname === '/admin/dashboard'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <FiGrid size={16} className={pathname === '/admin/dashboard' ? 'text-white' : 'text-gray-500'} />
          Dashboard
        </Link>

        <div className="pt-1 space-y-1">
          {GROUPS.map(group => (
            <NavGroup key={group.label} group={group} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <FiGlobe size={16} className="text-gray-500" /> View Website
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors text-left"
        >
          <FiLogOut size={16} className="text-gray-500" />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}
