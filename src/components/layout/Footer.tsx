import Link from "next/link";
import Image from "next/image";
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
    <footer className="relative overflow-hidden bg-[#101817] text-white/[0.56]">
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 text-xs text-white/[0.52] sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-[#f0d492]">Metro Voyage travel desk is open daily, 9 AM - 10 PM.</span>
            <span>SLTDA Licensed · CAA Certified · Reg: PV 00250114</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
             <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.png"
              alt="Metro Voyage Logo"
              width={210}
              height={130}
              className="mb-5 h-16 w-auto"
            />
          </Link>
            <p className="text-sm leading-relaxed text-white/[0.58] mb-6">
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
                  className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{ color }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-5 text-xs uppercase tracking-[0.18em]">
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
                    className="hover:text-[#f0d492] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-5 text-xs uppercase tracking-[0.18em]">
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
                    className="hover:text-[#f0d492] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-5 text-xs uppercase tracking-[0.18em]">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href="tel:+94704545455"
                  className="flex items-start gap-3 hover:text-[#f0d492] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white/[0.14] transition-colors">
                    <FiPhone className="text-[#f0d492] text-sm" />
                  </div>
                  <span className="leading-relaxed pt-1">+94 70 454 5455</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@metrovoyage.com"
                  className="flex items-start gap-3 hover:text-[#f0d492] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white/[0.14] transition-colors">
                    <FiMail className="text-[#f0d492] text-sm" />
                  </div>
                  <span className="leading-relaxed pt-1">
                    contact@metrovoyage.com
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0">
                  <FiMapPin className="text-[#f0d492] text-sm" />
                </div>
                <span className="text-white/[0.56] leading-relaxed pt-1">
                  Level 2, 9/1, Deal Place A,
                  <br />
                  Kollupitiya, Colombo 03
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0">
                  <FiClock className="text-[#f0d492] text-sm" />
                </div>
                <span className="text-white/[0.56] leading-relaxed pt-1">
                  9 AM - 10 PM, Daily
                </span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/consultation"
                className="inline-block bg-white text-[#101817] text-sm font-black px-5 py-3 rounded-lg hover:bg-[#f4efe6] transition-colors"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/[0.38] sm:px-6">
          <div className="flex items-center gap-4">
            <span>
              © {new Date().getFullYear()} Metro Voyage (Pvt) Ltd. All rights
              reserved.
            </span>
            <span className="font-medium">Reg: PV 00250114</span>
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
                className="hover:text-[#f0d492] transition-colors"
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
