import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-bold text-xl text-white">Halo <span style={{ color: 'var(--brand)' }}>Holidays</span></span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Crafting personalized, unforgettable holidays from Sri Lanka since 2018. SLTDA licensed & fully bonded.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'WA', href: 'https://wa.me/94704545455', label: 'WhatsApp' },
                { icon: 'IN', href: '#', label: 'Instagram' },
                { icon: 'FB', href: '#', label: 'Facebook' },
                { icon: 'YT', href: '#', label: 'YouTube' },
                { icon: 'TK', href: '#', label: 'TikTok' },
                { icon: 'LI', href: '#', label: 'LinkedIn' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[var(--brand)] flex items-center justify-center text-xs font-bold text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Packages</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Family Packages', '/packages-from-sri-lanka/family'],
                ['Honeymoon Packages', '/packages-from-sri-lanka/honeymoon'],
                ['Solo Packages', '/packages-from-sri-lanka/solo'],
                ['Squad Packages', '/packages-from-sri-lanka/squad'],
                ['Corporate Packages', '/packages-from-sri-lanka/corporate'],
                ['Special Packages', '/packages-from-sri-lanka/special'],
                ['2026 Holiday Packages', '/packages-from-sri-lanka/holiday'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[var(--brand)] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['About Us', '/about'],
                ['Destinations', '/destinations'],
                ['Visa Services', '/visas'],
                ['Reviews', '/reviews'],
                ['News', '/news'],
                ['Blog', '/blogs'],
                ['Privilege Card', '/privilege-card'],
                ['Wishful Wardrobe', '/wishful-wardrobe'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[var(--brand)] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span>📞</span>
                <a href="tel:+94704545455" className="hover:text-[var(--brand)] transition-colors">+94 70 454 5455</a>
              </li>
              <li className="flex gap-2">
                <span>📧</span>
                <a href="mailto:contact@haloholidays.lk" className="hover:text-[var(--brand)] transition-colors">contact@haloholidays.lk</a>
              </li>
              <li className="flex gap-2">
                <span>📍</span>
                <span className="text-gray-400">Level 2, 9/1, Deal Place A,<br />Kollupitiya, Colombo 03</span>
              </li>
              <li className="flex gap-2">
                <span>🕐</span>
                <span className="text-gray-400">9 AM – 10 PM, Daily</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/consultation"
                className="inline-block brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Halo Holidays. All rights reserved.</span>
            <span>Reg: PV 00250114</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-[var(--brand)]">Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:text-[var(--brand)]">Cookie Policy</Link>
            <Link href="/help" className="hover:text-[var(--brand)]">Help</Link>
            <Link href="/contact" className="hover:text-[var(--brand)]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
