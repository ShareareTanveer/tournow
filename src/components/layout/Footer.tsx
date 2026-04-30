import Link from "next/link";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";

const SOCIAL = [
  {
    icon: FaWhatsapp,
    href: "https://wa.me/94704545455",
    label: "WhatsApp",
    color: "#25d366",
  },
  { icon: FaInstagram, href: "#", label: "Instagram", color: "#e1306c" },
  { icon: FaFacebookF, href: "#", label: "Facebook", color: "#1877f2" },
  { icon: FaYoutube, href: "#", label: "YouTube", color: "#ff0000" },
  { icon: FaTiktok, href: "#", label: "TikTok", color: "#ffffff" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn", color: "#0077b5" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
             <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="Metro Voyage Logo"
              className="w-40 h-24 rounded-xl mb-4"
            />
          </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              Crafting personalized, unforgettable holidays from Sri Lanka since
              2018. SLTDA Licensed &amp; fully bonded.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {SOCIAL.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ color }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h3 className="font-bold text-white mb-5 text-xs uppercase tracking-widest">
              Packages
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Family Packages", "/packages-from-sri-lanka/family"],
                ["Honeymoon Packages", "/packages-from-sri-lanka/honeymoon"],
                ["Solo Packages", "/packages-from-sri-lanka/solo"],
                ["Squad Packages", "/packages-from-sri-lanka/squad"],
                ["Corporate Packages", "/packages-from-sri-lanka/corporate"],
                ["Special Packages", "/packages-from-sri-lanka/special"],
                ["2026 Holiday Packages", "/packages-from-sri-lanka/holiday"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-[#0a83f5] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white mb-5 text-xs uppercase tracking-widest">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ["About Us", "/about"],
                ["Destinations", "/destinations"],
                ["Visa Services", "/visas"],
                ["Reviews", "/reviews"],
                ["News", "/news"],
                ["Blog", "/blogs"],
                ["Privilege Card", "/privilege-card"],
                ["Wishful Wardrobe", "/wishful-wardrobe"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-[#0a83f5] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-5 text-xs uppercase tracking-widest">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href="tel:+94704545455"
                  className="flex items-start gap-3 hover:text-[#0a83f5] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0a83f5]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0a83f5]/20 transition-colors">
                    <FiPhone className="text-[#0a83f5] text-sm" />
                  </div>
                  <span className="leading-relaxed pt-1">+94 70 454 5455</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@metrovoyage.com"
                  className="flex items-start gap-3 hover:text-[#0a83f5] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0a83f5]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0a83f5]/20 transition-colors">
                    <FiMail className="text-[#0a83f5] text-sm" />
                  </div>
                  <span className="leading-relaxed pt-1">
                    contact@metrovoyage.com
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0a83f5]/10 flex items-center justify-center shrink-0">
                  <FiMapPin className="text-[#0a83f5] text-sm" />
                </div>
                <span className="text-gray-400 leading-relaxed pt-1">
                  Level 2, 9/1, Deal Place A,
                  <br />
                  Kollupitiya, Colombo 03
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0a83f5]/10 flex items-center justify-center shrink-0">
                  <FiClock className="text-[#0a83f5] text-sm" />
                </div>
                <span className="text-gray-400 leading-relaxed pt-1">
                  9 AM – 10 PM, Daily
                </span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/consultation"
                className="inline-block teal-gradient text-white text-sm font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              © {new Date().getFullYear()} Metro Voyage (Pvt) Ltd. All rights
              reserved.
            </span>
            <span className="text-gray-700 font-medium">Reg: PV 00250114</span>
          </div>
          <div className="flex gap-5">
            {[
              ["Privacy Policy", "/privacy-policy"],
              ["Cookie Policy", "/cookie-policy"],
              ["Help", "/help"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="hover:text-[#0a83f5] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
