import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Halo Holidays — Sri Lanka\'s trusted SLTDA-licensed travel agency, serving travellers since 2018.',
}

async function getStaff() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/staff`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

const FALLBACK_STAFF = [
  { name: 'Kasun Gatamanna', role: 'All-in-One Specialist', specialties: ['Luxury Travel', 'Cultural Experiences', 'Group Tours'], yearsExp: 4 },
  { name: 'Mohamed Naveed', role: 'Middle East & Asia Specialist', specialties: ['Desert Adventures', 'Honeymoon Packages', 'Middle East'], yearsExp: 1 },
  { name: 'Shihaar Gazzaly', role: 'Europe & Asia Specialist', specialties: ['Europe', 'Couple Travel', 'Family Packages'], yearsExp: 1 },
  { name: 'Naflan Naufer', role: 'Europe Specialist', specialties: ['City Breaks', 'Solo Travel', 'Europe'], yearsExp: 1 },
]

export default async function AboutPage() {
  const staff = await getStaff()
  const displayStaff = staff.length > 0 ? staff : FALLBACK_STAFF

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">About Halo Holidays</h1>
        <p className="text-white/80 max-w-xl mx-auto">Your trusted travel partner from Sri Lanka since 2018</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Story */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Our Story</h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>Halo Holidays was born in 2018 from a simple belief: every holiday should be extraordinary. What started as crafting trips for friends and family across Southeast Asia has grown into a full-service travel agency serving 50+ countries by 2025.</p>
            <p>We are not a &ldquo;one-size-fits-all&rdquo; agency. We take the time to understand your travel style, budget, and dreams — then craft an itinerary that is uniquely yours. Whether it&apos;s a romantic Maldives honeymoon, a family adventure in Japan, or a corporate retreat in Dubai, we handle every detail.</p>
            <p>Our team regularly visits the destinations we sell, ensuring our recommendations come from first-hand experience — not just brochures.</p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: '❤️', title: 'Customer First', desc: 'Your satisfaction is our priority. We are available until 10 PM, every day.' },
            { icon: '🌍', title: 'Destination Experts', desc: 'We visit every destination we recommend to give you first-hand insights.' },
            { icon: '✈️', title: 'Passion for Travel', desc: 'We are travellers ourselves. That passion shows in every package we create.' },
            { icon: '🛡️', title: 'Trust & Reliability', desc: 'SLTDA licensed, Civil Aviation certified, and fully bonded & insured.' },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4">
              <div className="text-3xl">{v.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Credentials */}
        <div className="bg-[var(--brand-light)] rounded-2xl p-6 border border-[var(--brand)]/20">
          <h3 className="font-bold text-gray-800 mb-4">Our Credentials</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div><p className="font-bold text-[var(--brand)] text-lg">SLTDA</p><p className="text-gray-600 text-xs">Licensed</p></div>
            <div><p className="font-bold text-[var(--brand)] text-lg">CAA</p><p className="text-gray-600 text-xs">Certified</p></div>
            <div><p className="font-bold text-[var(--brand)] text-lg">2024</p><p className="text-gray-600 text-xs">Travel Excellence Award</p></div>
            <div><p className="font-bold text-[var(--brand)] text-lg">PV 00250114</p><p className="text-gray-600 text-xs">Registration No.</p></div>
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Meet Our Travel Experts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayStaff.map((member: any) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center card-hover">
                <div className="w-16 h-16 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-800">{member.name}</h3>
                <p className="text-sm text-[var(--brand)] mb-2">{member.role}</p>
                {member.yearsExp && <p className="text-xs text-gray-400 mb-3">{member.yearsExp}+ years experience</p>}
                <div className="flex flex-wrap justify-center gap-1">
                  {member.specialties?.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/consultation" className="inline-block brand-gradient text-white font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
            Book a Free Consultation
          </Link>
        </div>
      </div>
    </div>
  )
}
