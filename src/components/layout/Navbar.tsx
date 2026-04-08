"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiChevronDown,
  FiChevronRight,
  FiPhone,
  FiMenu,
  FiX,
  FiMapPin,
  FiPackage,
  FiGrid,
  FiUsers,
  FiHeart,
  FiUser,
  FiSmile,
  FiBriefcase,
  FiStar,
  FiSun,
  FiGlobe,
} from "react-icons/fi";
import CurrencySelector from "./CurrencySelector";

const PACKAGE_CATEGORIES = [
  { label: "Family Packages",       slug: "family",    desc: "Perfect for the whole family",   icon: FiUsers,     color: "#3b82f6" },
  { label: "Honeymoon Packages",    slug: "honeymoon", desc: "Romantic getaways for two",       icon: FiHeart,     color: "#ec4899" },
  { label: "Solo Packages",         slug: "solo",      desc: "Explore the world your way",      icon: FiUser,      color: "#8b5cf6" },
  { label: "Squad Packages",        slug: "squad",     desc: "Travel with your crew",           icon: FiSmile,     color: "#10b981" },
  { label: "Corporate Packages",    slug: "corporate", desc: "MICE & business travel",          icon: FiBriefcase, color: "#64748b" },
  { label: "Special Packages",      slug: "special",   desc: "VIP & exclusive experiences",     icon: FiStar,      color: "#f59e0b" },
  { label: "2026 Holiday Packages", slug: "holiday",   desc: "Seasonal specials",               icon: FiSun,       color: "#f97316" },
];

const DESTINATION_REGIONS = [
  {
    region: "Asia",
    destinations: [
      { label: "Maldives", slug: "maldives" },
      { label: "Thailand", slug: "thailand" },
      { label: "Turkey", slug: "turkey" },
      { label: "Japan", slug: "japan" },
      { label: "Indonesia (Bali)", slug: "bali" },
      { label: "China", slug: "china" },
      { label: "South Korea", slug: "south-korea" },
      { label: "Russia", slug: "russia" },
    ],
  },
  {
    region: "Europe",
    destinations: [
      { label: "France", slug: "france" },
      { label: "Italy", slug: "italy" },
      { label: "Greece", slug: "greece" },
    ],
  },
  {
    region: "Middle East",
    destinations: [
      { label: "Dubai (UAE)", slug: "dubai" },
      { label: "Oman", slug: "oman" },
      { label: "Azerbaijan", slug: "azerbaijan" },
    ],
  },
  {
    region: "Africa",
    destinations: [{ label: "Egypt", slug: "egypt" }],
  },
  {
    region: "Australia & Oceania",
    destinations: [{ label: "Australia", slug: "australia" }],
  },
];

const TOUR_REGIONS = [
  {
    label: "South East Asia", slug: "south-east-asia", color: "#0ea5e9",
    countries: ["Singapore", "Thailand", "Malaysia", "Bali", "Vietnam", "Cambodia"],
  },
  {
    label: "Middle East",     slug: "middle-east",     color: "#f59e0b",
    countries: ["Dubai", "Abu Dhabi", "Qatar", "Oman", "Jordan", "Saudi Arabia"],
  },
  {
    label: "Europe",          slug: "europe",          color: "#8b5cf6",
    countries: ["France", "Italy", "Switzerland", "Spain", "Greece", "Turkey"],
  },
  {
    label: "Far East",        slug: "far-east",        color: "#ec4899",
    countries: ["Japan", "South Korea", "China", "Hong Kong", "Taiwan"],
  },
  {
    label: "South Asia",      slug: "south-asia",      color: "#10b981",
    countries: ["India", "Nepal", "Bhutan", "Maldives", "Sri Lanka"],
  },
  {
    label: "Africa",          slug: "africa",          color: "#f97316",
    countries: ["Egypt", "Kenya", "Tanzania", "South Africa", "Morocco"],
  },
  {
    label: "Americas",        slug: "americas",        color: "#6366f1",
    countries: ["USA", "Canada", "Brazil", "Peru", "Argentina"],
  },
  {
    label: "Pacific",         slug: "pacific",         color: "#14b8a6",
    countries: ["Australia", "New Zealand", "Fiji", "Hawaii"],
  },
];

const MORE_LINKS = [
  { label: "News", href: "/news" },
  { label: "Blog", href: "/blogs" },
  { label: "Privilege Card", href: "/privilege-card" },
  { label: "Wishful Wardrobe", href: "/wishful-wardrobe" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobilePackages, setMobilePackages] = useState(false);
  const [mobileTours, setMobileTours] = useState(false);
  const [mobileDestinations, setMobileDestinations] = useState(false);
  const [activeRegion, setActiveRegion] = useState("Asia");
  const [activeTourRegion, setActiveTourRegion] = useState("South East Asia");
  const [authUser, setAuthUser] = useState<{ name: string; role: string } | null>(null);
  const [customerUser, setCustomerUser] = useState<{ name: string } | null>(null);
  const pathname = usePathname();

  const pkgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tourTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrop = (
    set: (v: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  ) => {
    if (timer.current) clearTimeout(timer.current);
    set(true);
  };
  const closeDrop = (
    set: (v: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  ) => {
    timer.current = setTimeout(() => set(false), 150);
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setPackagesOpen(false);
    setToursOpen(false);
    setDestinationsOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setAuthUser(data?.user ?? null))
      .catch(() => setAuthUser(null))
    fetch('/api/customer/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setCustomerUser(data?.customer ?? null))
      .catch(() => setCustomerUser(null))
  }, [pathname]);

  const activeRegionData = DESTINATION_REGIONS.find(
    (r) => r.region === activeRegion,
  );

  const amber = "#f59e0b";
  const teal = "#0d9488";

  const textColor = "#1e293b";
  const subTextColor = "#94a3b8";
  const dividerColor = "#e2e8f0";
  const hoverBg = "rgba(0,0,0,0.04)";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.06)" : "none",
          padding: "10px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="Metro Voyage Logo"
              className="w-20 h-12 rounded-xl"
            />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center">
            <div
              className="w-px h-6 mx-4 rounded-full"
              style={{ background: dividerColor }}
            />

            {/* Home */}
            <NavLink
              href="/"
              textColor={textColor}
              hoverBg={hoverBg}
              accent={amber}
            >
              Home
            </NavLink>

            {/* Packages */}
            <div
              className="relative"
              onMouseEnter={() => openDrop(setPackagesOpen, pkgTimer)}
              onMouseLeave={() => closeDrop(setPackagesOpen, pkgTimer)}
            >
              <button
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 group"
                style={{
                  color: textColor,
                  background: packagesOpen ? hoverBg : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = packagesOpen
                    ? hoverBg
                    : "transparent")
                }
              >
                <FiPackage size={14} style={{ color: "var(--brand)" }} />
                Packages
                <FiChevronDown
                  size={13}
                  style={{
                    opacity: 0.7,
                    transition: "transform 0.3s",
                    transform: packagesOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200"
                  style={{
                    background: amber,
                    width: packagesOpen ? "16px" : "0px",
                  }}
                />
              </button>

              {packagesOpen && (
                <div className="absolute top-full left-0 pt-3 z-50">
                  <div
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden w-72"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                  >
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Browse by type
                      </p>
                      <Link
                        href="/packages-from-sri-lanka"
                        className="text-xs font-semibold hover:underline"
                        style={{ color: amber }}
                      >
                        View all
                      </Link>
                    </div>
                    <div className="p-2">
                      {PACKAGE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon
                        return (
                          <Link
                            key={cat.slug}
                            href={`/packages-from-sri-lanka/${cat.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group/item"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: `${cat.color}18` }}
                            >
                              <Icon size={14} style={{ color: cat.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover/item:text-orange-500 transition-colors leading-none mb-0.5">
                                {cat.label}
                              </p>
                              <p className="text-xs text-gray-400">{cat.desc}</p>
                            </div>
                            <FiChevronRight
                              size={12}
                              className="ml-auto text-gray-300 group-hover/item:text-orange-400 transition-colors"
                            />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tours */}
            <div
              className="relative"
              onMouseEnter={() => openDrop(setToursOpen, tourTimer)}
              onMouseLeave={() => closeDrop(setToursOpen, tourTimer)}
            >
              <button
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 group"
                style={{
                  color: textColor,
                  background: toursOpen ? hoverBg : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = toursOpen ? hoverBg : "transparent")}
              >
                <FiGlobe size={14} style={{ color: "#0ea5e9" }} />
                Tours
                <FiChevronDown
                  size={13}
                  style={{
                    opacity: 0.7,
                    transition: "transform 0.3s",
                    transform: toursOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200"
                  style={{ background: "#0ea5e9", width: toursOpen ? "16px" : "0px" }}
                />
              </button>

              {toursOpen && (
                <div className="absolute top-full left-0 pt-3 z-50">
                  <div
                    className="flex rounded-2xl overflow-hidden border border-gray-100"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                  >
                    {/* Left: regions */}
                    <div className="bg-white w-48 py-2">
                      <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                        <Link
                          href="/tours-from-sri-lanka/south-east-asia"
                          className="text-xs font-bold hover:underline"
                          style={{ color: "#0ea5e9" }}
                        >
                          All Tours
                        </Link>
                      </div>
                      {TOUR_REGIONS.map((r) => (
                        <button
                          key={r.slug}
                          onMouseEnter={() => setActiveTourRegion(r.label)}
                          className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
                          style={
                            activeTourRegion === r.label
                              ? { background: "#f0f9ff", color: "#0ea5e9", fontWeight: 600 }
                              : { color: "#374151" }
                          }
                          onClick={() => { window.location.href = `/tours-from-sri-lanka/${r.slug}` }}
                        >
                          {r.label}
                          <FiChevronRight size={12} style={{ opacity: 0.5 }} />
                        </button>
                      ))}
                    </div>

                    {/* Right: countries in active region */}
                    {(() => {
                      const active = TOUR_REGIONS.find((r) => r.label === activeTourRegion)
                      if (!active) return null
                      return (
                        <div
                          className="w-44 py-3 px-2"
                          style={{ background: "#f8fafc", borderLeft: "1px solid #f1f5f9" }}
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                            {active.label}
                          </p>
                          <Link
                            href={`/tours-from-sri-lanka/${active.slug}`}
                            className="block px-3 py-1.5 text-xs font-bold rounded-xl mb-1 transition-colors"
                            style={{ color: active.color }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#fff" }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent" }}
                          >
                            View all {active.label} →
                          </Link>
                          {active.countries.map((c) => (
                            <Link
                              key={c}
                              href={`/tours-from-sri-lanka/${active.slug}?country=${encodeURIComponent(c)}`}
                              className="block px-3 py-2 text-sm text-gray-600 rounded-xl transition-colors font-medium"
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.color = "#0ea5e9"
                                ;(e.currentTarget as HTMLAnchorElement).style.background = "#fff"
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.color = "#4b5563"
                                ;(e.currentTarget as HTMLAnchorElement).style.background = "transparent"
                              }}
                            >
                              {c}
                            </Link>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Destinations */}
            <div
              className="relative"
              onMouseEnter={() => openDrop(setDestinationsOpen, destTimer)}
              onMouseLeave={() => closeDrop(setDestinationsOpen, destTimer)}
            >
              <button
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200"
                style={{
                  color: textColor,
                  background: destinationsOpen ? hoverBg : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = destinationsOpen
                    ? hoverBg
                    : "transparent")
                }
              >
                <FiMapPin size={14} style={{ color: teal }} />
                Destinations
                <FiChevronDown
                  size={13}
                  style={{
                    opacity: 0.7,
                    transition: "transform 0.3s",
                    transform: destinationsOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200"
                  style={{
                    background: teal,
                    width: destinationsOpen ? "16px" : "0px",
                  }}
                />
              </button>

              {destinationsOpen && (
                <div className="absolute top-full left-0 pt-3 z-50">
                  <div
                    className="flex rounded-2xl overflow-hidden border border-gray-100"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                  >
                    <div className="bg-white w-44 py-2">
                      <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                        <Link
                          href="/destinations"
                          className="text-xs font-bold hover:underline"
                          style={{ color: teal }}
                        >
                          All Destinations
                        </Link>
                      </div>
                      {DESTINATION_REGIONS.map((r) => (
                        <button
                          key={r.region}
                          onMouseEnter={() => setActiveRegion(r.region)}
                          className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
                          style={
                            activeRegion === r.region
                              ? {
                                  background: "#f0fdf9",
                                  color: teal,
                                  fontWeight: 600,
                                }
                              : { color: "#374151" }
                          }
                        >
                          {r.region}
                          <FiChevronRight size={12} style={{ opacity: 0.5 }} />
                        </button>
                      ))}
                    </div>
                    {activeRegionData && (
                      <div
                        className="w-44 py-3 px-2"
                        style={{
                          background: "#f8fafc",
                          borderLeft: "1px solid #f1f5f9",
                        }}
                      >
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                          {activeRegionData.region}
                        </p>
                        {activeRegionData.destinations.map((dest) => (
                          <Link
                            key={dest.slug}
                            href={`/destinations/${dest.slug}`}
                            className="block px-3 py-2 text-sm text-gray-600 rounded-xl transition-colors font-medium"
                            style={{}}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLAnchorElement
                              ).style.color = teal;
                              (
                                e.currentTarget as HTMLAnchorElement
                              ).style.background = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLAnchorElement
                              ).style.color = "#4b5563";
                              (
                                e.currentTarget as HTMLAnchorElement
                              ).style.background = "transparent";
                            }}
                          >
                            {dest.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Simple links */}
            {(
              [
                ["Reviews", "/reviews"],
                ["Visas", "/visas"],
              ] as [string, string][]
            ).map(([label, href]) => (
              <NavLink
                key={href}
                href={href}
                textColor={textColor}
                hoverBg={hoverBg}
                accent={amber}
              >
                {label}
              </NavLink>
            ))}

            {/* More */}
            <div
              className="relative"
              onMouseEnter={() => openDrop(setMoreOpen, moreTimer)}
              onMouseLeave={() => closeDrop(setMoreOpen, moreTimer)}
            >
              <button
                className="relative flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200"
                style={{
                  color: textColor,
                  background: moreOpen ? hoverBg : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = moreOpen
                    ? hoverBg
                    : "transparent")
                }
              >
                <FiGrid size={14} style={{ opacity: 0.7 }} />
                More
                <FiChevronDown
                  size={13}
                  style={{
                    opacity: 0.7,
                    transition: "transform 0.3s",
                    transform: moreOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 pt-3 z-50">
                  <div
                    className="w-44 bg-white rounded-2xl py-2 border border-gray-100"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                  >
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors group/m font-medium"
                      >
                        {link.label}
                        <FiChevronRight
                          size={12}
                          className="text-gray-300 group-hover/m:text-amber-400 transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="w-px h-6 mx-4 rounded-full"
              style={{ background: dividerColor }}
            />
          </nav>

          {/* ── CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <CurrencySelector dark={false} />
            {authUser ? (
              <Link
                href={['SUPER_ADMIN','ADMIN','EDITOR','STAFF'].includes(authUser.role) ? '/admin/dashboard' : '/my/bookings'}
                className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-gray-700"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  {authUser.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden xl:inline">{authUser.name?.split(' ')[0]}</span>
              </Link>
            ) : customerUser ? (
              <Link
                href="/my/bookings"
                className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-gray-700"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                  {customerUser.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden xl:inline">{customerUser.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-gray-700"
              >
                <FiUser size={14} /> Log In
              </Link>
            )}

          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "#f8fafc", color: "#1e293b" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transition-transform duration-300 overflow-y-auto ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                M
              </div>
              <span className="font-black text-gray-900">
                Metro <span style={{ color: amber }}>Voyage</span>
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="p-4 space-y-1">
            <Link
              href="/"
              className="flex items-center px-3 py-3 text-sm font-semibold text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
            >
              Home
            </Link>

            <div>
              <button
                onClick={() => setMobilePackages(!mobilePackages)}
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FiPackage size={14} style={{ color: amber }} /> Packages
                </span>
                <FiChevronDown
                  size={14}
                  style={{
                    transform: mobilePackages
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {mobilePackages && (
                <div className="ml-3 pl-3 border-l-2 border-amber-100 mt-1 space-y-0.5">
                  {PACKAGE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/packages-from-sri-lanka/${cat.slug}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-amber-600 rounded-lg transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setMobileTours(!mobileTours)}
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FiGlobe size={14} style={{ color: "#0ea5e9" }} /> Tours
                </span>
                <FiChevronDown
                  size={14}
                  style={{
                    transform: mobileTours ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {mobileTours && (
                <div className="ml-3 pl-3 border-l-2 border-sky-100 mt-1 space-y-0.5">
                  {TOUR_REGIONS.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/tours-from-sri-lanka/${r.slug}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-sky-600 rounded-lg transition-colors"
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setMobileDestinations(!mobileDestinations)}
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FiMapPin size={14} style={{ color: teal }} /> Destinations
                </span>
                <FiChevronDown
                  size={14}
                  style={{
                    transform: mobileDestinations
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {mobileDestinations && (
                <div className="ml-3 pl-3 border-l-2 border-teal-100 mt-1 space-y-3">
                  <Link
                    href="/destinations"
                    className="block px-3 py-1 text-sm font-bold"
                    style={{ color: teal }}
                  >
                    All Destinations
                  </Link>
                  {DESTINATION_REGIONS.map((r) => (
                    <div key={r.region}>
                      <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {r.region}
                      </p>
                      {r.destinations.map((d) => (
                        <Link
                          key={d.slug}
                          href={`/destinations/${d.slug}`}
                          className="block px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 rounded-lg transition-colors"
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(
              [
                ["Reviews", "/reviews"],
                ["Visas", "/visas"],
                ["News", "/news"],
                ["Blog", "/blogs"],
                ["Privilege Card", "/privilege-card"],
                ["About Us", "/about"],
                ["Contact", "/contact"],
              ] as [string, string][]
            ).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center px-3 py-3 text-sm font-semibold text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 space-y-3 mt-2">
            <a
              href="tel:+94704545455"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#fffbeb" }}
              >
                <FiPhone size={15} style={{ color: amber }} />
              </div>
              +94 70 454 5455
            </a>
            <Link
              href="/consultation"
              className="flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3.5 rounded-xl transition-all"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                boxShadow: "0 4px 20px",
              }}
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component to avoid repeated inline style logic
function NavLink({
  href,
  textColor,
  hoverBg,
  accent,
  children,
}: {
  href: string;
  textColor: string;
  hoverBg: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 group block"
      style={{ color: textColor }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
      <span
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full group-hover:w-4 transition-all duration-200"
        style={{ background: accent }}
      />
    </Link>
  );
}
