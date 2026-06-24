export const TRAVEL_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
  searchPanel: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
  family: '/packages/005a3775-a115-4a7f-b132-9826d2b1e917.jpg',
  honeymoon: '/packages/0d2d2a71-e581-4818-920a-59e91381a8f1.jpg',
  solo: '/packages/25aa2d1a-e8b6-4569-8528-9548f5447453.jpg',
  squad: '/packages/2e01f008-d546-4414-8da1-8ac81e7d522c.jpeg',
  corporate: '/packages/5a18c059-7b50-45eb-8612-ebba4282c7e6.jpg',
  special: '/packages/77efeac4-a781-4b23-ad5b-71f9439b4a16.jpg',
  holiday: '/packages/886f365d-fed1-41e3-a832-e9935a5a2a79.jpg',
  culture: '/packages/d9f72b24-1df5-4f8c-ace2-8fa0a029f9c9.jpg',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80',
  japan: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1400&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
  turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80',
  editorial: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80',
}

export const PAGE_HERO_IMAGES: Record<string, string> = {
  blogs: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=2200&q=85',
  news: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2200&q=85',
  destinations: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=85',
  visas: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2200&q=85',
  about: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=2200&q=85',
  reviews: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2200&q=85',
  contact: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&w=2200&q=85',
  packages: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2200&q=85',
  tours: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85',
  consultation: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=85',
  default: TRAVEL_IMAGES.hero,
}

export function getTravelImage(key?: string | null) {
  if (!key) return TRAVEL_IMAGES.editorial
  const normalized = key.toLowerCase().replace(/\s+/g, '-')
  return (TRAVEL_IMAGES as Record<string, string>)[normalized] ?? TRAVEL_IMAGES.editorial
}
