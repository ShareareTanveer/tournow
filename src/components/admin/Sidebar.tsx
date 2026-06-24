'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FiGrid, FiPackage, FiMapPin, FiInbox, FiVideo, FiBookOpen,
  FiStar, FiFileText, FiEdit3, FiShield, FiUsers, FiMail,
  FiHeart, FiCreditCard, FiZap, FiEdit2, FiImage, FiSettings,
  FiGlobe, FiLogOut, FiTag, FiChevronDown, FiMenu, FiX,
  FiCalendar, FiBarChart2, FiTrendingUp, FiChevronsLeft,
  FiChevronsRight, FiPhone,
} from 'react-icons/fi'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  exact?: boolean
}

type NavGroupData = {
  label: string
  icon: React.ReactNode
  items: NavItem[]
}

const GROUPS: NavGroupData[] = [
  {
    label: 'Content',
    icon: <FiPackage size={17} />,
    items: [
      { label: 'Packages', href: '/admin/packages', icon: <FiPackage size={16} /> },
      { label: 'Tours', href: '/admin/tours', icon: <FiGlobe size={16} /> },
      { label: 'Categories', href: '/admin/categories', icon: <FiTag size={16} /> },
      { label: 'Destinations', href: '/admin/destinations', icon: <FiMapPin size={16} /> },
      { label: 'Blog', href: '/admin/blogs', icon: <FiEdit3 size={16} /> },
      { label: 'News', href: '/admin/news', icon: <FiFileText size={16} /> },
      { label: 'Visa Services', href: '/admin/visas', icon: <FiShield size={16} /> },
    ],
  },
  {
    label: 'Operations',
    icon: <FiInbox size={17} />,
    items: [
      { label: 'Inquiries', href: '/admin/inquiries', icon: <FiInbox size={16} /> },
      { label: 'Consultations', href: '/admin/consultations', icon: <FiVideo size={16} /> },
      { label: 'Bookings', href: '/admin/bookings', icon: <FiBookOpen size={16} /> },
      { label: 'Calendar', href: '/admin/calendar', icon: <FiCalendar size={16} /> },
      { label: 'Tour Requests', href: '/admin/customizations', icon: <FiEdit2 size={16} /> },
      { label: 'Reviews', href: '/admin/reviews', icon: <FiStar size={16} /> },
    ],
  },
  {
    label: 'Customers',
    icon: <FiUsers size={17} />,
    items: [
      { label: 'Customers', href: '/admin/customers', icon: <FiUsers size={16} /> },
      { label: 'Loyalty Cards', href: '/admin/loyalty', icon: <FiCreditCard size={16} /> },
      { label: 'Perks', href: '/admin/perks', icon: <FiZap size={16} /> },
      { label: 'Newsletter', href: '/admin/newsletter', icon: <FiMail size={16} /> },
      { label: 'Charity', href: '/admin/charity', icon: <FiHeart size={16} /> },
    ],
  },
  {
    label: 'Reporting',
    icon: <FiBarChart2 size={17} />,
    items: [
      { label: 'Reports', href: '/admin/reports', icon: <FiBarChart2 size={16} /> },
      { label: 'Growth Analytics', href: '/admin/growth-analytics', icon: <FiTrendingUp size={16} /> },
    ],
  },
  {
    label: 'System',
    icon: <FiSettings size={17} />,
    items: [
      { label: 'Staff', href: '/admin/staff', icon: <FiUsers size={16} /> },
      { label: 'Suppliers', href: '/admin/suppliers', icon: <FiPhone size={16} /> },
      { label: 'Media Library', href: '/admin/media', icon: <FiImage size={16} /> },
      { label: 'AI Provider Config', href: '/admin/settings/ai', icon: <FiZap size={16} /> },
      { label: 'Settings', href: '/admin/settings', icon: <FiSettings size={16} />, exact: true },
    ],
  },
]

function itemIsActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

function NavGroup({
  group,
  pathname,
  collapsed,
  onNavigate,
  onExpand,
}: {
  group: NavGroupData
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
  onExpand?: () => void
}) {
  const isAnyActive = group.items.some(item => itemIsActive(item, pathname))
  const [open, setOpen] = useState(isAnyActive)

  if (collapsed) {
    return (
      <button
        type="button"
        title={group.label}
        aria-label={`Open ${group.label} navigation`}
        onClick={onExpand}
        className={`admin-sidebar-icon-button ${isAnyActive ? 'is-active' : ''}`}
      >
        {group.icon}
        {group.items.some(item => (item.badge ?? 0) > 0) && <span className="admin-sidebar-dot" />}
      </button>
    )
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className={`admin-sidebar-group ${isAnyActive ? 'is-active' : ''}`}
      >
        <span>{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        <FiChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="admin-sidebar-group-items">
          {group.items.map(item => {
            const active = itemIsActive(item, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`admin-sidebar-link ${active ? 'is-active' : ''}`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="admin-sidebar-badge">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SidebarContent({
  pathname,
  groups,
  collapsed,
  loggingOut,
  onNavigate,
  onLogout,
  onToggleCollapse,
}: {
  pathname: string
  groups: NavGroupData[]
  collapsed: boolean
  loggingOut: boolean
  onNavigate?: () => void
  onLogout: () => void
  onToggleCollapse?: () => void
}) {
  const dashboardActive = pathname === '/admin/dashboard'

  return (
    <div className="flex h-full flex-col">
      <div className="admin-sidebar-brand">
        <Link href="/admin/dashboard" onClick={onNavigate} className="min-w-0">
          {collapsed ? (
            <div className="admin-sidebar-monogram">MV</div>
          ) : (
            <Image src="/logo.png" alt="Metro Voyage" width={120} height={68} className="h-10 w-auto" priority />
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="admin-sidebar-collapse"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronsRight size={17} /> : <FiChevronsLeft size={17} />}
          </button>
        )}
      </div>

      <nav className={`admin-sidebar-nav ${collapsed ? 'is-collapsed' : ''}`}>
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          title={collapsed ? 'Dashboard' : undefined}
          className={`admin-sidebar-link admin-sidebar-dashboard ${dashboardActive ? 'is-active' : ''} ${collapsed ? 'is-collapsed' : ''}`}
        >
          <FiGrid size={17} />
          {!collapsed && <span className="flex-1">Dashboard</span>}
        </Link>

        <div className={collapsed ? 'space-y-2' : 'space-y-0.5'}>
          {groups.map(group => (
            <NavGroup
              key={group.label}
              group={group}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
              onExpand={onToggleCollapse}
            />
          ))}
        </div>
      </nav>

      <div className={`admin-sidebar-footer ${collapsed ? 'is-collapsed' : ''}`}>
        <Link href="/" target="_blank" title={collapsed ? 'View Website' : undefined} className="admin-sidebar-link">
          <FiGlobe size={17} />
          {!collapsed && <span>View Website</span>}
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          title={collapsed ? 'Logout' : undefined}
          className="admin-sidebar-link admin-sidebar-logout"
        >
          <FiLogOut size={17} />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [bookingBadge, setBookingBadge] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function fetchBadge() {
      try {
        const res = await fetch('/api/admin/bookings/badge')
        if (res.ok) {
          const data = await res.json()
          setBookingBadge(data.count ?? 0)
        }
      } catch {}
    }

    fetchBadge()
    const id = setInterval(fetchBadge, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCollapsed(window.localStorage.getItem('admin-sidebar-collapsed') === 'true')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  function toggleCollapsed() {
    setCollapsed(current => {
      const next = !current
      window.localStorage.setItem('admin-sidebar-collapsed', String(next))
      return next
    })
  }

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const groups = GROUPS.map(group => ({
    ...group,
    items: group.items.map(item =>
      item.href === '/admin/bookings' ? { ...item, badge: bookingBadge } : item
    ),
  }))

  return (
    <>
      <aside className={`admin-sidebar hidden lg:flex ${collapsed ? 'is-collapsed' : ''}`}>
        <SidebarContent
          pathname={pathname}
          groups={groups}
          collapsed={collapsed}
          loggingOut={loggingOut}
          onLogout={handleLogout}
          onToggleCollapse={toggleCollapsed}
        />
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="admin-mobile-menu lg:hidden"
        aria-label="Open admin navigation"
      >
        <FiMenu size={20} />
      </button>

      {mobileOpen && (
        <div className="admin-mobile-drawer lg:hidden">
          <button
            type="button"
            className="admin-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin navigation"
          />
          <aside className="admin-mobile-sidebar">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="admin-mobile-close"
              aria-label="Close admin navigation"
            >
              <FiX size={18} />
            </button>
            <SidebarContent
              pathname={pathname}
              groups={groups}
              collapsed={false}
              loggingOut={loggingOut}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}
    </>
  )
}
