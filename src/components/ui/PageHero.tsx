import Link from 'next/link'
import Image from 'next/image'
import { FiChevronRight, FiMapPin } from 'react-icons/fi'
import { PAGE_HERO_IMAGES } from '@/lib/travel-images'

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

const DEFAULT_GRADIENT = 'from-[#101817] via-[#12313a] to-[#273b31]'

export function getPageHeroImage(page: string) {
  return PAGE_HERO_IMAGES[page] ?? PAGE_HERO_IMAGES.default
}

export default function PageHero({ title, subtitle, imageUrl, breadcrumbs, gradient = DEFAULT_GRADIENT, children }: Props) {
  const bg = imageUrl ?? PAGE_HERO_IMAGES.default

  return (
    <div className={`relative min-h-[360px] overflow-hidden bg-gradient-to-br ${gradient}`}>
      <Image
        src={bg}
        alt={title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(16,24,23,0.92)_0%,rgba(16,24,23,0.76)_42%,rgba(16,24,23,0.26)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(251,250,247,1)_0%,rgba(251,250,247,0.0)_34%)]" />

      <div className="relative z-10 flex min-h-[360px] flex-col justify-end px-4 pb-14 pt-32">
        <div className="max-w-7xl mx-auto w-full">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/65">
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

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
            <FiMapPin size={12} />
            Crafted from Sri Lanka
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/[0.72] sm:text-lg">{subtitle}</p>
          )}

          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </div>
  )
}
