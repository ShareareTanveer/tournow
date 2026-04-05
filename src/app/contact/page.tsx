import { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = { title: 'Contact Us', description: 'Get in touch with Halo Holidays. Call, WhatsApp, or visit our office in Colombo.' }

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-white/80">We are here to help plan your dream holiday</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a message</h2>
            <ContactForm />
          </div>

          {/* Info */}
          <div className="space-y-5">
            {[
              { icon: '📞', title: 'Phone', content: '+94 70 454 5455', href: 'tel:+94704545455' },
              { icon: '📧', title: 'Email', content: 'contact@haloholidays.lk', href: 'mailto:contact@haloholidays.lk' },
              { icon: '💬', title: 'WhatsApp', content: '+94 70 454 5455', href: 'https://wa.me/94704545455' },
            ].map((item) => (
              <a key={item.title} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow card-hover">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.title}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{item.content}</p>
                </div>
              </a>
            ))}

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div className="text-3xl">📍</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Office Address</p>
                  <p className="font-semibold text-gray-800 mt-0.5">Level 2, 9/1, Deal Place A</p>
                  <p className="text-gray-500 text-sm">Kollupitiya, Colombo 03</p>
                  <p className="text-gray-500 text-sm mt-1">🕐 Open daily: 9 AM – 10 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
