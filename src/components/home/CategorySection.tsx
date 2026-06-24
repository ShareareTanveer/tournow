import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  FiUsers, FiHeart, FiUser, FiSmile,
  FiBriefcase, FiStar, FiSun, FiGlobe, FiArrowRight,
} from 'react-icons/fi'
import { TRAVEL_IMAGES } from '@/lib/travel-images'
import SectionTag from '@/components/ui/SectionTag'

const DEFAULTS = [
  {
    slug: 'family', label: 'Family', icon: FiUsers,
    desc: 'Fun-filled holidays for every generation',
    accent: '#2f6f9f',
    imageUrl: TRAVEL_IMAGES.family,
    span: 'lg:col-span-5 lg:row-span-2',
    height: 'h-full min-h-[420px]',
  },
  {
    slug: 'honeymoon', label: 'Honeymoon', icon: FiHeart,
    desc: 'Romantic escapes for two',
    accent: '#b85c38',
    imageUrl: TRAVEL_IMAGES.honeymoon,
    span: 'lg:col-span-4',
    height: 'h-52',
  },
  {
    slug: 'solo', label: 'Solo', icon: FiUser,
    desc: 'Explore the world your way',
    accent: '#5f4b8b',
    imageUrl: TRAVEL_IMAGES.solo,
    span: 'lg:col-span-3',
    height: 'h-52',
  },
  {
    slug: 'squad', label: 'Squad', icon: FiSmile,
    desc: 'Epic trips with your crew',
    accent: '#3f8f64',
    imageUrl: TRAVEL_IMAGES.squad,
    span: 'lg:col-span-3',
    height: 'h-52',
  },
  {
    slug: 'corporate', label: 'Corporate', icon: FiBriefcase,
    desc: 'MICE & business travel',
    accent: '#64748b',
    imageUrl: TRAVEL_IMAGES.corporate,
    span: 'lg:col-span-4',
    height: 'h-52',
  },
  {
    slug: 'special', label: 'Special', icon: FiStar,
    desc: 'VIP & exclusive experiences',
    accent: '#c99a45',
    imageUrl: TRAVEL_IMAGES.special,
    span: 'lg:col-span-4',
    height: 'h-52',
  },
  {
    slug: 'holiday', label: '2026 Holidays', icon: FiSun,
    desc: 'Curated seasonal packages',
    accent: '#007f89',
    imageUrl: TRAVEL_IMAGES.holiday,
    span: 'lg:col-span-4',
    height: 'h-52',
  },
  {
    slug: 'culture', label: 'Cultural', icon: FiGlobe,
    desc: 'Immersive cultural journeys',
    accent: '#b85c38',
    imageUrl: TRAVEL_IMAGES.culture,
    span: 'lg:col-span-4',
    height: 'h-52',
  },
]

async function getCategories() {
  try {
    const dbCats = await prisma.packageCategoryConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return DEFAULTS.map(def => {
      const db = dbCats.find(c => c.slug === def.slug)
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

function placeholderStyle(accent: string) {
  return {
    background: `linear-gradient(135deg, ${accent} 0%, #101817 100%)`,
  }
}

function imageLayerStyle(imageUrl: string) {
  return {
    backgroundImage: `url("${imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const
}

export default async function CategorySection() {
  const categories = await getCategories()

  return (
    <section className="bg-[#fbfaf7] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            <SectionTag className="mb-3">Browse by Type</SectionTag>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-[#101817] sm:text-5xl">
              Find Your Perfect{' '}
              <span className="gradient-text">Travel Style</span>
            </h2>
            <p className="text-[#52615d] mt-3 text-sm max-w-md leading-6">
              Every kind of traveller has a perfect match — discover yours
            </p>
          </div>
          <Link href="/packages-from-sri-lanka/family"
            className="hidden sm:flex items-center gap-2 text-sm font-bold shrink-0 px-5 py-3 rounded-lg border border-[#d8ded9] hover:border-[#007f89] text-[#52615d] hover:text-[#007f89] transition-all">
            View all <FiArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">
          {categories.slice(0, 8).map((cat, i) => {
            const Icon = cat.icon
            const isFeatured = i === 0

            return (
              <Link
                key={cat.slug}
                href={`/packages-from-sri-lanka/${cat.slug}`}
                className={`group bento-card ${cat.span} ${cat.height} block border border-white/70 bg-[#101817]`}
                style={{ minHeight: isFeatured ? undefined : '208px' }}
              >
                <div className="absolute inset-0" style={placeholderStyle(cat.accent)} />
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={imageLayerStyle(cat.imageUrl)}
                />
                <div className="absolute right-4 bottom-4 text-white/8 text-6xl font-black uppercase tracking-[0.08em] select-none">
                  {cat.label}
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,24,23,0.56),rgba(16,24,23,0.10),rgba(16,24,23,0.04))]" />
                <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-10"
                  style={{ background: `linear-gradient(135deg, ${cat.accent}cc, transparent 48%)` }} />

                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                  <div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center border border-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `${cat.accent}55` }}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-black text-white leading-tight ${isFeatured ? 'text-3xl sm:text-4xl' : 'text-xl'}`}>
                      {cat.label}
                    </h3>
                    <p className={`${isFeatured ? 'text-sm' : 'text-xs'} text-white/[0.68] mt-2 leading-5`}>{cat.desc}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      Explore packages <FiArrowRight size={11} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link href="/packages-from-sri-lanka/family"
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-lg border border-[#d8ded9] text-[#52615d] hover:border-[#007f89] hover:text-[#007f89] transition-all">
            View all packages <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
