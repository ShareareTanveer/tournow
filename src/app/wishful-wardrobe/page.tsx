import { Metadata } from 'next'
import DonationForm from './DonationForm'
import PageHero from '@/components/ui/PageHero'
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiClock, FiHeart } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Wishful Wardrobe',
  description: 'Donate gently used clothing and help those in need through the Metro Voyage Wishful Wardrobe initiative.',
}

const HOW_TO_STEPS = [
  {
    Icon: FiCheckCircle,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    title: 'Check Condition',
    desc: 'Clothing must be clean, free from tears or stains, and in good wearable condition.',
  },
  {
    Icon: FiPackage,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    title: 'Prepare Donation',
    desc: 'Pack your items neatly in a bag or box, ready for drop-off or pickup.',
  },
  {
    Icon: FiTruck,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    title: 'Drop-off or Pickup',
    desc: 'Visit our Colombo office or arrange a home pickup using the form below.',
  },
]

export default function WishfulWardrobePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Wishful Wardrobe"
        subtitle="Donate gently used clothing and help those in need. Access to clean clothing is a fundamental right."
        imageUrl="https://picsum.photos/seed/clothing-charity/1920/500"
        breadcrumbs={[{ label: 'Wishful Wardrobe' }]}
      >
        {/* Charity badge */}
        <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
          <FiHeart size={13} className="text-pink-300" />
          <span className="text-white/90 text-xs font-semibold">Community Initiative by Metro Voyage</span>
        </div>
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Left: Info ── */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Initiative</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Wishful Wardrobe is a charity initiative by Metro Voyage to collect and distribute gently used clothing to those in need. We believe access to clean, good condition clothing is a fundamental right, and together we can make a difference.
              </p>
            </div>

            {/* How to donate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5">How to Donate</h2>
              <div className="space-y-5">
                {HOW_TO_STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-4 items-start">
                    {/* Step number + icon */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: step.iconBg }}
                      >
                        <step.Icon size={20} style={{ color: step.iconColor }} />
                      </div>
                      {i < HOW_TO_STEPS.length - 1 && (
                        <div className="w-0.5 h-5 bg-gray-100 rounded-full" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-semibold text-gray-800 text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop-off info */}
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <FiMapPin size={15} /> Drop-off Location
              </h3>
              <p className="text-sm text-purple-700">Level 2, 9/1, Deal Place A, Kollupitiya, Colombo 03</p>
              <p className="text-sm text-purple-600 mt-1.5 flex items-center gap-1.5">
                <FiClock size={12} /> Open daily: 9 AM – 10 PM
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Register Your Donation</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in the form below and we&apos;ll get in touch to arrange pickup or confirm your drop-off.</p>
            <DonationForm />
          </div>
        </div>
      </div>
    </div>
  )
}
