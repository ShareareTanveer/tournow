'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowLeft, FiArrowRight, FiCompass } from 'react-icons/fi'
import { TRAVEL_IMAGES } from '@/lib/travel-images'

const IMAGE_FALLBACKS: Record<string, string> = {
  family: TRAVEL_IMAGES.maldives,
  honeymoon: TRAVEL_IMAGES.bali,
  solo: TRAVEL_IMAGES.japan,
  squad: TRAVEL_IMAGES.turkey,
  corporate: TRAVEL_IMAGES.singapore,
  special: TRAVEL_IMAGES.dubai,
  holiday: TRAVEL_IMAGES.paris,
  culture: TRAVEL_IMAGES.japan,
}

type TravelStyle = {
  slug: string
  label: string
  desc: string
  accent: string
  imageUrl: string
}

export default function CategoryCarousel({ categories }: { categories: TravelStyle[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (paused || categories.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % categories.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [paused, categories.length])

  if (categories.length === 0) return null

  const visibleStyles = [-2, -1, 0, 1, 2].map(offset => {
    const index = (activeIndex + offset + categories.length) % categories.length
    return { style: categories[index], offset }
  })

  const move = (direction: -1 | 1) => {
    setActiveIndex(current => (current + direction + categories.length) % categories.length)
  }

  return (
    <section className="w-full overflow-hidden bg-[#f6f8f9] py-16 sm:py-20 lg:py-24">
      <div className="w-full px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#0395d5] sm:text-xs">
            <span className="h-px w-7 bg-[#39ac44]" />
            Browse by travel style
            <span className="h-px w-7 bg-[#39ac44]" />
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] text-[#14252d] sm:text-4xl lg:text-[3.25rem]">
            Find Your Perfect{' '}
            <span className="text-[#0395d5]">Travel Style</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#65747a] sm:text-base">
            Every kind of traveller has a perfect match — discover yours.
          </p>
        </div>

        <div
          className="relative mx-auto mt-9 w-full max-w-[1120px] sm:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
          }}
        >
          <button
            type="button"
            aria-label="Previous travel styles"
            onClick={() => move(-1)}
            className="absolute left-0 top-[38%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e1e8eb] bg-white text-[#263942] shadow-md transition duration-300 hover:-translate-y-[55%] hover:border-[#0395d5] hover:text-[#0395d5] sm:left-2 sm:h-11 sm:w-11 lg:-left-2"
          >
            <FiArrowLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next travel styles"
            onClick={() => move(1)}
            className="absolute right-0 top-[38%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e1e8eb] bg-white text-[#263942] shadow-md transition duration-300 hover:-translate-y-[55%] hover:border-[#0395d5] hover:text-[#0395d5] sm:right-2 sm:h-11 sm:w-11 lg:-right-2"
          >
            <FiArrowRight size={17} />
          </button>

          <div className="relative h-[390px] w-full sm:h-[430px] lg:h-[470px]">
            {visibleStyles.map(({ style, offset }) => {
              const isActive = offset === 0
              const isSide = Math.abs(offset) === 1
              const visibility = Math.abs(offset) === 2 ? 'hidden xl:flex' : isSide ? 'hidden md:flex' : 'flex'
              const width = isActive
                ? 'w-[218px] sm:w-[250px] lg:w-[270px]'
                : isSide
                  ? 'w-[190px] lg:w-[205px]'
                  : 'w-[160px] lg:w-[170px]'
              const height = isActive
                ? 'h-[250px] sm:h-[285px] lg:h-[310px]'
                : isSide
                  ? 'h-[205px] sm:h-[225px] lg:h-[245px]'
                  : 'h-[175px] lg:h-[195px]'
              const scale = isActive ? 1 : isSide ? 0.92 : 0.84

              return (
                <Link
                  key={style.slug}
                  href={`/packages-from-sri-lanka/${style.slug}`}
                  aria-label={`${style.label}: ${style.desc}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={event => {
                    if (!isActive) {
                      event.preventDefault()
                      setActiveIndex((activeIndex + offset + categories.length) % categories.length)
                    }
                  }}
                  className={`group ${visibility} absolute bottom-6 flex ${width} flex-col items-center ${isActive ? 'opacity-100' : isSide ? 'opacity-90' : 'opacity-75'}`}
                  style={{
                    left: `calc(50% + ${offset === 0 ? 0 : Math.sign(offset) * (Math.abs(offset) === 1 ? 235 : 430)}px)`,
                    zIndex: isActive ? 10 : isSide ? 5 : 1,
                    transform: `translateX(-50%) scale(${scale})`,
                    transition: 'left 650ms cubic-bezier(0.2, 0.75, 0.25, 1), transform 650ms cubic-bezier(0.2, 0.75, 0.25, 1), opacity 450ms ease',
                  }}
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-[22px] bg-[#dfe8eb] shadow-[0_14px_36px_rgba(23,48,58,0.12)] transition-[height,box-shadow,transform] duration-500 ease-[cubic-bezier(.2,.75,.25,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_42px_rgba(23,48,58,0.18)] ${height} ${isActive ? 'ring-1 ring-[#0395d5]/20' : ''}`}
                    >
                    <Image
                      fill
                      unoptimized
                      src={failedImages[style.slug] ? (IMAGE_FALLBACKS[style.slug] ?? TRAVEL_IMAGES.editorial) : style.imageUrl}
                      alt={style.label}
                      sizes="(min-width: 1024px) 270px, 220px"
                      onError={() => setFailedImages(current => ({ ...current, [style.slug]: true }))}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10232c]/65 via-transparent to-white/5 transition-opacity duration-300 group-hover:from-[#10232c]/75" />
                    {isActive && (
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/35 bg-white/20 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                        <FiCompass size={11} /> Traveller favourite
                      </div>
                    )}
                    <span className="absolute bottom-4 left-4 right-4 text-left text-xs font-semibold leading-5 text-white/90 sm:text-sm">
                      {isActive ? style.desc : 'Discover this travel style'}
                    </span>
                  </div>
                  <div className={`mt-3 text-center transition-colors duration-300 ${isActive ? 'text-[#14252d]' : 'text-[#55666d]'}`}>
                    <h3 className={`font-serif italic ${isActive ? 'text-lg font-bold sm:text-xl' : 'text-sm font-semibold sm:text-base'}`}>
                      {style.label}
                    </h3>
                    {isActive && <span className="mx-auto mt-1.5 block h-1 w-1 rounded-full bg-[#39ac44]" />}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-7 flex justify-center">
            <Link
              href="/packages-from-sri-lanka/family"
              className="inline-flex items-center gap-2 rounded-full border border-[#dbe5e9] bg-white px-5 py-2.5 text-xs font-semibold text-[#32464f] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#0395d5]/50 hover:text-[#0395d5] hover:shadow-md"
            >
              Explore travel styles <FiArrowRight size={13} className="text-[#0395d5]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
