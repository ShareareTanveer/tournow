/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import PackageCard from '@/components/ui/PackageCard'
import TailwindHtmlBlock from '@/components/ui/TailwindHtmlBlock'
import TourCard from '@/components/ui/TourCard'
import { applyHtmlTemplateBindings } from '@/lib/html-template'
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiDollarSign,
  FiGlobe,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiStar,
  FiSun,
} from 'react-icons/fi'

function getHeroImage(destination: any, section?: any) {
  return section?.content?.image || section?.style?.bgImage || destination.images?.[0] || destination.imageUrl
}

function getSectionStyle(section: any) {
  const style = section?.style ?? {}
  return {
    backgroundColor: style.bgColor || undefined,
    backgroundImage: style.bgImage ? `url(${style.bgImage})` : undefined,
    backgroundSize: style.bgImage ? 'cover' : undefined,
    backgroundPosition: style.bgImage ? 'center' : undefined,
    paddingTop: typeof style.paddingTop === 'number' ? `${style.paddingTop}px` : undefined,
    paddingBottom: typeof style.paddingBottom === 'number' ? `${style.paddingBottom}px` : undefined,
  } as CSSProperties
}

function getFactIcon(icon: string) {
  switch ((icon || '').toLowerCase()) {
    case 'globe':
      return <FiGlobe size={14} />
    case 'message-square':
      return <FiMessageSquare size={14} />
    case 'sun':
      return <FiSun size={14} />
    case 'dollar-sign':
      return <FiDollarSign size={14} />
    case 'calendar':
      return <FiCalendar size={14} />
    default:
      return <FiMapPin size={14} />
  }
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-1 text-2xl font-black text-gray-900">{children}</h2>
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
      {icon} {label}
    </span>
  )
}

export default function DestinationDetailRenderer({ destination }: { destination: any }) {
  const sections = Array.isArray(destination.sections) ? destination.sections : []

  return (
    <div className="min-h-screen bg-gray-50">
      {sections.map((section: any) => (
        <DestinationSection key={section.id} destination={destination} section={section} />
      ))}
    </div>
  )
}

function DestinationSection({ destination, section }: { destination: any; section: any }) {
  const sectionStyle = getSectionStyle(section)
  const heroImage = getHeroImage(destination, section)
  const content = section.content ?? {}
  const hasPackages = destination.packages?.length > 0
  const hasTours = destination.tours?.length > 0
  const htmlContent = content.htmlContent
    ? applyHtmlTemplateBindings(String(content.htmlContent), content.htmlBindings as Record<string, unknown> | undefined)
    : ''

  if (section.mode === 'html' && htmlContent) {
    return (
      <section style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <TailwindHtmlBlock html={htmlContent} />
        </div>
      </section>
    )
  }

  switch (section.sectionType) {
    case 'hero':
      return (
        <div className="relative min-h-[420px] overflow-hidden" style={sectionStyle}>
          {heroImage ? (
            <img src={heroImage} alt={destination.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-teal-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          <div className="relative z-10 flex min-h-[420px] flex-col justify-end px-4 pb-12">
            <div className="mx-auto w-full max-w-7xl">
              <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <FiChevronRight size={11} />
                <Link href="/destinations" className="transition-colors hover:text-white">Destinations</Link>
                <FiChevronRight size={11} />
                <span className="text-white/90">{destination.name}</span>
              </nav>

              {(content.eyebrow || destination.region) && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <FiMapPin size={11} /> {content.eyebrow || destination.region}
                </span>
              )}

              <h1 className="mb-3 text-4xl font-black leading-none text-white drop-shadow-lg sm:text-5xl md:text-6xl">
                {content.title || destination.name}
              </h1>

              {(content.subtitle || destination.description) && (
                <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                  {content.subtitle || destination.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {destination.bestSeason && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <FiSun size={11} /> Best: {destination.bestSeason}
                  </span>
                )}
                {destination.language && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <FiMessageSquare size={11} /> {destination.language}
                  </span>
                )}
                {destination.costLevel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <FiDollarSign size={11} /> {destination.costLevel}
                  </span>
                )}
                {hasPackages && content.showPackagesCount !== false && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <FiCalendar size={11} /> {destination.packages.length} Package{destination.packages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {content.primaryCtaText && content.primaryCtaLink && (
                <div className="mt-6">
                  <Link
                    href={content.primaryCtaLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-100"
                  >
                    <FiPhone size={14} /> {content.primaryCtaText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'quick-facts':
      return (
        <section style={sectionStyle} className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <SectionHeading>{content.title || `Why Visit ${destination.name}`}</SectionHeading>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(Array.isArray(content.facts) ? content.facts : []).map((fact: any, index: number) => (
                    <div key={`${fact.label ?? 'fact'}-${index}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                        {getFactIcon(fact.icon)}
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">{fact.label}</p>
                      <p className="mt-1 text-sm font-bold text-gray-800">{fact.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
                <p className="text-base font-bold text-gray-900">{content.ctaTitle || `Plan a trip to ${destination.name}`}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {content.ctaText || 'Get a personalised package from our travel experts tailored to your dates and budget.'}
                </p>
                <Link
                  href={content.ctaButtonLink || '/consultation'}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  <FiPhone size={14} /> {content.ctaButtonText || 'Book Free Consultation'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )

    case 'story':
      if (!content.body) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <SectionHeading>{content.heading || `About ${destination.name}`}</SectionHeading>
                <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                  <div className="space-y-4 text-[15px] leading-relaxed text-gray-600">
                    {String(content.body)
                      .split(/\n{2,}/)
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={`${destination.slug}-story-${index}`}>{paragraph}</p>
                      ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                    {destination.region && <InfoPill icon={<FiMapPin size={11} />} label={destination.region} />}
                    {destination.costLevel && <InfoPill icon={<FiDollarSign size={11} />} label={destination.costLevel} />}
                    {destination.bestSeason && <InfoPill icon={<FiSun size={11} />} label={`Best: ${destination.bestSeason}`} />}
                    {destination.language && <InfoPill icon={<FiMessageSquare size={11} />} label={destination.language} />}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  {heroImage && <img src={heroImage} alt={destination.name} className="h-40 w-full object-cover" />}
                  <div className="p-5">
                    <p className="text-base font-bold text-gray-900">Plan a trip to {destination.name}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      Get a personalised package from our travel experts tailored to your budget and travel dates.
                    </p>
                    <Link
                      href="/consultation"
                      className="mt-4 block rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                    >
                      Book Free Consultation
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-700">Why Book With Us</p>
                  <ul className="space-y-2">
                    {['Best price guarantee', 'Free itinerary planning', 'Expert local knowledge', '24/7 travel support'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCheckCircle size={13} className="shrink-0 text-amber-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )

    case 'highlights':
      if (!Array.isArray(content.items) || content.items.length === 0) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-6">
              <SectionHeading>{content.heading || `Highlights of ${destination.name}`}</SectionHeading>
              {content.subheading && <p className="mt-1 text-sm text-gray-500">{content.subheading}</p>}
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {content.items.map((item: any, index: number) => (
                <div key={`${item.title ?? 'highlight'}-${index}`} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  {item.image && <img src={item.image} alt={item.title || destination.name} className="h-48 w-full object-cover" />}
                  <div className="p-5">
                    <p className="text-lg font-bold text-gray-900">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'gallery':
      if (!Array.isArray(content.images) || content.images.length === 0) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-6">
              <SectionHeading>{content.heading || `${destination.name} Gallery`}</SectionHeading>
              {content.subheading && <p className="mt-1 text-sm text-gray-500">{content.subheading}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {content.images.map((image: string, index: number) => (
                <div key={`${destination.slug}-gallery-${index}`} className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm`}>
                  <img src={image} alt={`${destination.name} ${index + 1}`} className="h-full min-h-[180px] w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'stats-strip':
      if (!Array.isArray(content.items) || content.items.length === 0) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              {content.items.map((item: any, index: number) => (
                <div key={`${destination.slug}-stat-${index}`} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'packages':
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <SectionHeading>{content.heading || `Packages to ${destination.name}`}</SectionHeading>
                {content.subheading && <p className="mt-1 text-sm text-gray-500">{content.subheading}</p>}
              </div>
              {hasPackages && (
                <Link
                  href={`/packages?destination=${destination.slug}`}
                  className="hidden items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 sm:flex"
                >
                  {content.ctaText || 'View all packages'} <FiArrowRight size={14} />
                </Link>
              )}
            </div>

            {hasPackages ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {destination.packages.map((pkg: any) => (
                  <PackageCard key={pkg.id} {...pkg} destination={{ name: destination.name, region: destination.region }} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <FiStar size={20} />
                </div>
                <p className="mt-4 text-lg font-bold text-gray-900">{content.emptyTitle || 'Packages coming soon'}</p>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
                  {content.emptyText || `We are preparing tailored packages for ${destination.name}. Book a consultation and we can build one for you now.`}
                </p>
                <Link
                  href="/consultation"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  <FiPhone size={14} /> Book Free Consultation
                </Link>
              </div>
            )}
          </div>
        </section>
      )

    case 'tours':
      if (!hasTours) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-6">
              <SectionHeading>{content.heading || `Tours featuring ${destination.name}`}</SectionHeading>
              {content.subheading && <p className="mt-1 text-sm text-gray-500">{content.subheading}</p>}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destination.tours.map((tour: any) => (
                <TourCard key={tour.id} {...tour} primaryDestination={{ name: destination.name, region: destination.region }} />
              ))}
            </div>
          </div>
        </section>
      )

    case 'faq':
      if (!Array.isArray(content.items) || content.items.length === 0) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="mb-6 text-center">
              <SectionHeading>{content.heading || `Frequently Asked Questions about ${destination.name}`}</SectionHeading>
            </div>
            <div className="space-y-3">
              {content.items.map((item: any, index: number) => (
                <details key={`${destination.slug}-faq-${index}`} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <summary className="cursor-pointer list-none text-sm font-bold text-gray-900">{item.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )

    case 'testimonial':
      if (!content.quote) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
              {content.heading && <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">{content.heading}</p>}
              <p className="text-2xl font-black leading-relaxed text-gray-900">“{content.quote}”</p>
              <div className="mt-6 flex items-center gap-4">
                {content.image && <img src={content.image} alt={content.author || destination.name} className="h-14 w-14 rounded-2xl object-cover" />}
                <div>
                  <p className="text-sm font-bold text-gray-900">{content.author || 'Metro Voyage Traveller'}</p>
                  {content.role && <p className="text-xs text-gray-400">{content.role}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )

    case 'cta':
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="relative overflow-hidden rounded-3xl">
              {(section.style?.bgImage || heroImage) && (
                <img
                  src={section.style?.bgImage || heroImage}
                  alt={destination.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
              <div className="relative z-10 max-w-2xl px-8 py-14 sm:py-16">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/70">
                  {content.eyebrow || `${destination.name} • ${destination.region}`}
                </p>
                <h2 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                  {content.heading || `Start Your ${destination.name} Journey`}
                </h2>
                <p className="mb-8 text-base leading-relaxed text-white/75">
                  {content.body || 'Let our experts craft the perfect itinerary for you. Free consultation, best prices, and unforgettable memories.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={content.primaryCtaLink || '/consultation'}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-7 py-3.5 font-bold text-white shadow-lg transition hover:opacity-90"
                  >
                    <FiPhone size={15} /> {content.primaryCtaText || 'Book Free Consultation'}
                  </Link>
                  {content.secondaryCtaText && content.secondaryCtaLink && (
                    <Link
                      href={content.secondaryCtaLink}
                      className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-7 py-3.5 font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
                    >
                      {content.secondaryCtaText} <FiArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )

    case 'html-block':
      if (!htmlContent) return null
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12 text-gray-700">
            <TailwindHtmlBlock html={htmlContent} />
          </div>
        </section>
      )

    case 'canvas':
      return (
        <section style={sectionStyle}>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <CanvasSectionRenderer canvas={section.canvas} />
          </div>
        </section>
      )

    default:
      return null
  }
}

function CanvasSectionRenderer({ canvas }: { canvas: any }) {
  const rows = Array.isArray(canvas?.rows) ? canvas.rows : []
  if (rows.length === 0) return null

  return (
    <div className="space-y-6">
      {rows.map((row: any) => (
        <div key={row.id} className="grid gap-6 md:grid-cols-12">
          {row.columns?.map((column: any) => (
            <div key={column.id} className="space-y-4" style={{ gridColumn: `span ${Math.max(1, Math.round((column.width || 100) / 100 * 12))} / span ${Math.max(1, Math.round((column.width || 100) / 100 * 12))}` }}>
              {column.widgets?.map((widget: any) => (
                <CanvasWidgetRenderer key={widget.id} widget={widget} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function CanvasWidgetRenderer({ widget }: { widget: any }) {
  const props = widget.props ?? {}
  const badgeTones: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-700',
  }

  switch (widget.type) {
    case 'heading': {
      const Tag = (props.level as 'h1' | 'h2' | 'h3') || 'h2'
      return <Tag className="text-3xl font-black text-gray-900">{props.text}</Tag>
    }
    case 'text':
      return <div className="text-sm leading-relaxed text-gray-600">{props.text}</div>
    case 'image':
      return <img src={String(props.src ?? '')} alt={String(props.alt ?? '')} className="w-full rounded-2xl object-cover" />
    case 'button':
      return (
        <Link
          href={String(props.href ?? '#')}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold ${
            props.variant === 'secondary'
              ? 'border border-gray-200 bg-white text-gray-700'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white'
          }`}
        >
          {props.text || 'Learn more'}
        </Link>
      )
    case 'divider':
      return <div className="h-px w-full bg-gray-200" />
    case 'spacer':
      return <div style={{ height: `${Number(props.height ?? 32)}px` }} />
    case 'stat':
      return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-gray-900">{props.value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{props.label}</p>
        </div>
      )
    case 'badge':
      return (
        <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold ${badgeTones[String(props.tone ?? 'indigo')] ?? badgeTones.indigo}`}>
          {props.text || 'Featured'}
        </span>
      )
    case 'card':
      return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {props.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">{props.eyebrow}</p>}
          <p className="mt-2 text-lg font-black text-gray-900">{props.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{props.body}</p>
        </div>
      )
    case 'faq-item':
      return (
        <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer list-none text-sm font-bold text-gray-900">{props.question}</summary>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{props.answer}</p>
        </details>
      )
    case 'review-card':
      return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-1 text-amber-400">
            {Array.from({ length: Math.max(1, Math.min(5, Number(props.rating ?? 5))) }).map((_, index) => (
              <FiStar key={`review-star-${index}`} size={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-base font-semibold leading-relaxed text-gray-800">&ldquo;{props.quote}&rdquo;</p>
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-900">{props.author || 'Traveller'}</p>
            {props.role && <p className="text-xs text-gray-400">{props.role}</p>}
          </div>
        </div>
      )
    case 'package-teaser':
      return (
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
          <p className="text-lg font-black text-gray-900">{props.title}</p>
          {props.subtitle && <p className="mt-1 text-sm text-gray-500">{props.subtitle}</p>}
          {props.price && <p className="mt-4 text-2xl font-black text-sky-600">{props.price}</p>}
          <Link
            href={String(props.ctaLink ?? '#')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            {props.ctaText || 'Explore Package'}
          </Link>
        </div>
      )
    case 'html':
      return <TailwindHtmlBlock html={String(props.html ?? '')} minHeight={120} />
    default:
      return null
  }
}
