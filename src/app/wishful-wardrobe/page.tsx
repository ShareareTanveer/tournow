import { Metadata } from 'next'
import DonationForm from './DonationForm'

export const metadata: Metadata = { title: 'Wishful Wardrobe', description: 'Donate gently used clothing and help those in need through the Halo Holidays Wishful Wardrobe initiative.' }

export default function WishfulWardrobePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 py-16 px-4 text-center text-white">
        <div className="text-5xl mb-3">👗</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Wishful Wardrobe</h1>
        <p className="text-white/80 max-w-xl mx-auto">Donate gently used clothing and help those in need. Access to clean clothing is a fundamental right.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Initiative</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Wishful Wardrobe is a charity initiative by Halo Holidays to collect and distribute gently used clothing to those in need. We believe access to clean, good condition clothing is a fundamental right, and together we can make a difference.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">How to Donate</h2>
              <div className="space-y-4">
                {[
                  { step: '1', icon: '✅', title: 'Check Condition', desc: 'Clothing must be clean, free from tears or stains, and in good condition.' },
                  { step: '2', icon: '📦', title: 'Prepare Donation', desc: 'Pack your items neatly in a bag or box, ready for drop-off or pickup.' },
                  { step: '3', icon: '🚗', title: 'Drop-off or Pickup', desc: 'Visit our Colombo office or arrange a home pickup using the form below.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="text-2xl">{s.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">Drop-off Location</h3>
              <p className="text-sm text-purple-700">Level 2, 9/1, Deal Place A, Kollupitiya, Colombo 03</p>
              <p className="text-sm text-purple-600 mt-1">Open daily: 9 AM – 10 PM</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Register Your Donation</h2>
            <DonationForm />
          </div>
        </div>
      </div>
    </div>
  )
}
