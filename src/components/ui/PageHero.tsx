import Link from 'next/link'
import { FiChevronRight } from 'react-icons/fi'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  title: string
  subtitle?: string
  imageUrl?: string
  breadcrumbs?: BreadcrumbItem[]
  /** Tailwind gradient fallback when no imageUrl */
  gradient?: string
  /** Extra content (e.g. badges, stats) rendered below subtitle */
  children?: React.ReactNode
}

const DEFAULT_GRADIENT = 'from-slate-900 via-slate-800 to-teal-900'

// Map of page slugs → picsum seed images (used if no imageUrl passed)
const PAGE_IMAGES: Record<string, string> = {
  blogs:         'https://picsum.photos/seed/travel-blog-hero/1920/500',
  news:          'https://picsum.photos/seed/travel-news-hero/1920/500',
  destinations:  'https://picsum.photos/seed/destinations-hero/1920/500',
  visas:         'https://picsum.photos/seed/visa-hero/1920/500',
  about:         'https://picsum.photos/seed/about-team/1920/500',
  reviews:       'https://picsum.photos/seed/reviews-hero/1920/500',
  contact:       'https://picsum.photos/seed/contact-hero/1920/500',
  packages:      'https://picsum.photos/seed/packages-hero/1920/500',
  tours:         'https://picsum.photos/seed/tours-world-hero/1920/500',
  consultation:  'https://picsum.photos/seed/consultation-hero/1920/500',
  default:       'https://picsum.photos/seed/metro-voyage-hero/1920/500',
}

export function getPageHeroImage(page: string) {
  return PAGE_IMAGES[page] ?? PAGE_IMAGES.default
}

export default function PageHero({ title, subtitle, imageUrl, breadcrumbs, gradient = DEFAULT_GRADIENT, children }: Props) {
  const bg = imageUrl ?? PAGE_IMAGES.default

  return (
    <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden">
      {/* Background image */}
      <img
        src={bg}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-8 px-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center flex-wrap gap-1 mb-3 text-white/60 text-xs">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <FiChevronRight size={11} />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-white/90">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-1">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-white/70 text-sm sm:text-base max-w-xl mt-1">{subtitle}</p>
          )}

          {children}
        </div>
      </div>
    </div>
  )
}
