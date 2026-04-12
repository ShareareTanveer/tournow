import { Metadata } from 'next'
import ContactForm from './ContactForm'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'
import { FiPhone, FiMail, FiMessageSquare, FiMapPin, FiClock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export const metadata: Metadata = { title: 'Contact Us', description: 'Get in touch with Metro Voyage. Call, WhatsApp, or visit our office in Colombo.' }

const CONTACT_ITEMS = [
  { Icon: FiPhone,        iconBg: '#eff6ff', iconColor: '#3b82f6', title: 'Phone',    content: '+94 70 454 5455',          href: 'tel:+94704545455' },
  { Icon: FiMail,         iconBg: '#fef3c7', iconColor: '#0a83f5', title: 'Email',    content: 'contact@metrovoyage.com',  href: 'mailto:contact@metrovoyage.com' },
  { Icon: FaWhatsapp,     iconBg: '#dcfce7', iconColor: '#22c55e', title: 'WhatsApp', content: '+94 70 454 5455',          href: 'https://wa.me/94704545455' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Contact Us"
        subtitle="We are here to help plan your dream holiday"
        imageUrl={getPageHeroImage('contact')}
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a message</h2>
            <ContactForm />
          </div>

          {/* Info */}
          <div className="space-y-4">
            {CONTACT_ITEMS.map((item) => (
              <a key={item.title} href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all card-hover items-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: item.iconBg }}>
                  <item.Icon size={20} style={{ color: item.iconColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.title}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{item.content}</p>
                </div>
              </a>
            ))}

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-50">
                  <FiMapPin size={20} style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Office Address</p>
                  <p className="font-semibold text-gray-800 mt-0.5">Level 2, 9/1, Deal Place A</p>
                  <p className="text-gray-500 text-sm">Kollupitiya, Colombo 03</p>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                    <FiClock size={12} /> Open daily: 9 AM – 10 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
