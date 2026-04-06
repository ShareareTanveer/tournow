import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  FiUsers, FiHeart, FiUser, FiSmile,
  FiBriefcase, FiStar, FiSun,
  FiGlobe,
} from 'react-icons/fi'

const DEFAULTS = [
  { slug: 'family', label: 'Family', icon: FiUsers, desc: 'Fun for the whole family', color: 'from-blue-500 to-blue-700', imageUrl: 'https://picsum.photos/seed/family-travel/800/600' },
  { slug: 'honeymoon', label: 'Honeymoon', icon: FiHeart, desc: 'Romantic getaways', color: 'from-rose-500 to-pink-700', imageUrl: 'https://picsum.photos/seed/honeymoon-beach/800/600' },
  { slug: 'solo', label: 'Solo', icon: FiUser, desc: 'Explore on your own', color: 'from-purple-500 to-purple-700', imageUrl: 'https://picsum.photos/seed/solo-adventure/800/600' },
  { slug: 'squad', label: 'Squad', icon: FiSmile, desc: 'Travel with friends', color: 'from-emerald-500 to-teal-700', imageUrl: 'https://picsum.photos/seed/group-travel/800/600' },
  { slug: 'corporate', label: 'Corporate', icon: FiBriefcase, desc: 'MICE & business travel', color: 'from-slate-500 to-slate-700', imageUrl: 'https://picsum.photos/seed/corporate-travel/800/600' },
  { slug: 'special', label: 'Special', icon: FiStar, desc: 'VIP & exclusive', color: 'from-amber-500 to-orange-600', imageUrl: 'https://picsum.photos/seed/vip-travel/800/600' },
  { slug: 'holiday', label: '2026 Holidays', icon: FiSun, desc: 'Seasonal packages', color: 'from-orange-500 to-red-600', imageUrl: 'https://picsum.photos/seed/holiday-season/800/600' },
  { slug: 'culture', label: 'Cultural', icon: FiGlobe, desc: 'Immersive cultural experiences', color: 'from-indigo-500 to-blue-700', imageUrl: 'https://picsum.photos/seed/cultural-travel/800/600' },
]

async function getCategories() {
  try {
    const dbCats = await prisma.packageCategoryConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return DEFAULTS.map((def) => {
      const db = dbCats.find((c) => c.slug === def.slug)
      return {
        ...def,
        label: db?.label ?? def.label,
        desc: db?.description ?? def.desc,
        imageUrl: db?.imageUrl ?? def.imageUrl,
      }
    })
  } catch {
    return DEFAULTS
  }
}

export default async function CategorySection() {
  const categories = await getCategories()

  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-tag inline-flex mb-4 text-base px-4 py-1.5">
            Our Packages
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Find Your Perfect{' '}
            <span style={{ color: 'var(--brand)' }}>
              Holiday Type
            </span>
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Whatever your travel style, we have the perfect package crafted for you
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {categories.map(({ slug, label, icon: Icon, desc, color, imageUrl }) => (
            <Link
              key={slug}
              href={`/packages-from-sri-lanka/${slug}`}
              className="group relative h-44 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >

              {/* Background Image */}
              <img
                src={imageUrl}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-70 group-hover:opacity-70 transition`} />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 mb-4 group-hover:scale-110 transition">
                  <Icon className="text-white text-2xl" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {label}
                </h3>

              
              </div>

            </Link>
          ))}

        </div>
      </div>
    </section>
  )
}