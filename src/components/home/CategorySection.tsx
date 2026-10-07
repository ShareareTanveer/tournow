import { prisma } from '@/lib/prisma'
import {
  FiUsers, FiHeart, FiUser, FiSmile,
  FiBriefcase, FiStar, FiSun, FiGlobe,
} from 'react-icons/fi'
import { TRAVEL_IMAGES } from '@/lib/travel-images'
import CategoryCarousel from '@/components/home/CategoryCarousel'

const DEFAULTS = [
  { slug: 'family', label: 'Family', icon: FiUsers, desc: 'Fun-filled holidays for every generation', accent: '#0395d5', imageUrl: TRAVEL_IMAGES.family },
  { slug: 'honeymoon', label: 'Honeymoon', icon: FiHeart, desc: 'Romantic escapes for two', accent: '#39ac44', imageUrl: TRAVEL_IMAGES.honeymoon },
  { slug: 'solo', label: 'Solo', icon: FiUser, desc: 'Explore the world your way', accent: '#0395d5', imageUrl: TRAVEL_IMAGES.solo },
  { slug: 'squad', label: 'Squad', icon: FiSmile, desc: 'Epic trips with your crew', accent: '#39ac44', imageUrl: TRAVEL_IMAGES.squad },
  { slug: 'corporate', label: 'Corporate', icon: FiBriefcase, desc: 'MICE & business travel', accent: '#0395d5', imageUrl: TRAVEL_IMAGES.corporate },
  { slug: 'special', label: 'Special', icon: FiStar, desc: 'VIP & exclusive experiences', accent: '#39ac44', imageUrl: TRAVEL_IMAGES.special },
  { slug: 'holiday', label: '2026 Holidays', icon: FiSun, desc: 'Curated seasonal packages', accent: '#0395d5', imageUrl: TRAVEL_IMAGES.holiday },
  { slug: 'culture', label: 'Cultural', icon: FiGlobe, desc: 'Immersive cultural journeys', accent: '#39ac44', imageUrl: TRAVEL_IMAGES.culture },
]

async function getCategories() {
  try {
    const dbCats = await prisma.packageCategoryConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return DEFAULTS.map(def => {
      const db = dbCats.find(category => category.slug === def.slug)
      return {
        slug: def.slug,
        label: db?.label ?? def.label,
        desc: db?.description ?? def.desc,
        accent: def.accent,
        imageUrl: db?.imageUrl ?? def.imageUrl,
      }
    })
  } catch {
    return DEFAULTS.map(({ slug, label, desc, accent, imageUrl }) => ({ slug, label, desc, accent, imageUrl }))
  }
}

export default async function CategorySection() {
  const categories = await getCategories()
  return <CategoryCarousel categories={categories} />
}
