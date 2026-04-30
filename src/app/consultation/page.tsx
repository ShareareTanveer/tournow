import { Metadata } from 'next'
import ConsultationForm from './ConsultationForm'
import PageHero, { getPageHeroImage } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Book a Consultation',
  description: 'Book a free video or phone consultation with our travel experts. Plan your dream holiday today.',
}

const CONSULTANTS = [
  { name: 'Kasun', role: 'All-in-One Specialist', specialties: 'Luxury, Cultural, Groups' },
  { name: 'Naveed', role: 'Middle East & Asia', specialties: 'Dubai, Oman, Honeymoon' },
  { name: 'Shihaar', role: 'Europe & Asia', specialties: 'Couples, Families' },
  { name: 'Naflan', role: 'Europe Specialist', specialties: 'City Breaks, Solo' },
]

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Book a Free Consultation"
        subtitle="Chat with one of our travel experts via video or phone call. Personalised holiday planning, at no cost."
        imageUrl={getPageHeroImage('consultation')}
        breadcrumbs={[{ label: 'Consultation' }]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Request a Consultation</h2>
            <ConsultationForm />
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* How it works */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Fill the Form', desc: 'Tell us your preferred consultation method and any details.' },
                  { step: '2', title: 'We Confirm', desc: 'Our team will contact you to schedule the best time.' },
                  { step: '3', title: 'Chat with an Expert', desc: 'Get personalised advice and a custom holiday plan.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full brand-gradient text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Our experts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Meet Our Experts</h3>
              <div className="grid grid-cols-2 gap-4">
                {CONSULTANTS.map((c) => (
                  <div key={c.name} className="p-3 rounded-xl bg-gray-50 text-center">
                    <div className="w-12 h-12 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                      {c.name.charAt(0)}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.role}</p>
                    <p className="text-xs text-[var(--brand)] mt-1">{c.specialties}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-[var(--brand-light)] rounded-2xl p-5 border border-[var(--brand)]/20">
              <h3 className="font-semibold text-gray-800 mb-3">Or reach us directly</h3>
              <div className="space-y-2 text-sm">
                <a href="tel:+94704545455" className="flex items-center gap-2 text-gray-700 hover:text-[var(--brand)]">📞 +94 70 454 5455</a>
                <a href="mailto:contact@metrovoyage.com" className="flex items-center gap-2 text-gray-700 hover:text-[var(--brand)]">📧 contact@metrovoyage.com</a>
                <p className="text-gray-500 text-xs">Open daily 9 AM – 10 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
