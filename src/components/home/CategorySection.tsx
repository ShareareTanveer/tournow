import Link from 'next/link'

const CATEGORIES = [
  { slug: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Fun for the whole family', color: 'from-blue-400 to-blue-600' },
  { slug: 'honeymoon', label: 'Honeymoon', icon: '💑', desc: 'Romantic getaways', color: 'from-pink-400 to-rose-600' },
  { slug: 'solo', label: 'Solo', icon: '🧳', desc: 'Explore on your own', color: 'from-purple-400 to-purple-600' },
  { slug: 'squad', label: 'Squad', icon: '👯', desc: 'Travel with friends', color: 'from-green-400 to-emerald-600' },
  { slug: 'corporate', label: 'Corporate', icon: '💼', desc: 'MICE & business travel', color: 'from-gray-500 to-gray-700' },
  { slug: 'special', label: 'Special', icon: '⭐', desc: 'VIP & exclusive experiences', color: 'from-yellow-400 to-orange-500' },
  { slug: 'holiday', label: '2026 Holidays', icon: '🎉', desc: 'Season special packages', color: 'from-orange-400 to-red-500' },
]

export default function CategorySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Find Your Perfect <span style={{ color: 'var(--brand)' }}>Holiday Type</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Whatever your travel style, we have the perfect package for you</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/packages-from-sri-lanka/${cat.slug}`}
              className="group flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 card-hover border border-gray-100 text-center"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-[var(--brand)] transition-colors">{cat.label}</h3>
              <p className="text-xs text-gray-400 hidden sm:block">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
